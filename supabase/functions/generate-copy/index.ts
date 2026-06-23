import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyUser } from '../_shared/auth.ts'

const TOKEN_COST = 1500

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { supabase, user, dbUser } = await verifyUser(req)

    if (dbUser.token_balance < TOKEN_COST) {
      return new Response(JSON.stringify({ error: 'Token 余额不足，请升级套餐' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { file_id, analysis_id } = await req.json()

    // Verify file + get analysis content
    const { data: file } = await supabase
      .from('files')
      .select('id, user_id, name, industry, direction')
      .eq('id', file_id)
      .eq('user_id', user.id)
      .single()

    if (!file) {
      return new Response(JSON.stringify({ error: '无权访问该 File' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: analysisRow } = await supabase
      .from('file_data')
      .select('content')
      .eq('id', analysis_id)
      .eq('file_id', file_id)
      .single()

    if (!analysisRow) {
      return new Response(JSON.stringify({ error: '找不到分析数据' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const analysis = analysisRow.content as { analysis: string; swot: Record<string, string[]> }

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('CLAUDE_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `你是资深营销文案专家。根据以下品牌分析，生成两套营销文案。

品牌：${file.name}
行业：${file.industry ?? '未指定'}
定位：${file.direction ?? '未指定'}
分析摘要：${analysis.analysis}
优势：${(analysis.swot?.strengths ?? []).join('、')}

请生成两套风格不同的文案（版本A较专业正式，版本B较亲切活泼）。

用 JSON 格式回复：
{
  "title": ["版本A标题（20字以内）", "版本B标题（20字以内）"],
  "body": ["版本A正文（100字以内）", "版本B正文（100字以内）"],
  "cta": ["版本A行动呼吁（10字以内）", "版本B行动呼吁（10字以内）"]
}

只输出 JSON，不要其他内容。`,
        }],
      }),
    })

    if (!claudeRes.ok) throw new Error(`Claude API 错误: ${await claudeRes.text()}`)

    const claudeData = await claudeRes.json()
    const rawText = claudeData.content[0].text.trim()
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Claude 返回格式错误')
    const versions = JSON.parse(jsonMatch[0])

    const content = { analysis_id, versions }

    const { data: saved, error: saveError } = await supabase
      .from('file_data')
      .insert({ file_id, data_type: 'copy', content })
      .select()
      .single()

    if (saveError) throw new Error(saveError.message)

    await supabase
      .from('users')
      .update({ token_balance: dbUser.token_balance - TOKEN_COST })
      .eq('id', user.id)

    return new Response(JSON.stringify({ id: saved.id, versions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    if (err instanceof Response) return err
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
