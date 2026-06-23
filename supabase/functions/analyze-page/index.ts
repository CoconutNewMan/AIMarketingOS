import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyUser } from '../_shared/auth.ts'

const TOKEN_COST = 2000

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

    const { file_id, text, source, input_url } = await req.json()

    // Verify file belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('id, user_id')
      .eq('id', file_id)
      .eq('user_id', user.id)
      .single()

    if (fileError || !file) {
      return new Response(JSON.stringify({ error: '无权访问该 File' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Call Claude
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
          content: `你是一位资深营销策略师。请分析以下 Facebook Page 内容，给出营销洞察和 SWOT 分析。

内容：
${text}

请用 JSON 格式回复，结构如下：
{
  "analysis": "200字以内的整体营销分析",
  "swot": {
    "strengths": ["优势1", "优势2", "优势3"],
    "weaknesses": ["劣势1", "劣势2"],
    "opportunities": ["机会1", "机会2"],
    "threats": ["威胁1", "威胁2"]
  }
}

只输出 JSON，不要其他内容。`,
        }],
      }),
    })

    if (!claudeRes.ok) {
      const err = await claudeRes.text()
      throw new Error(`Claude API 错误: ${err}`)
    }

    const claudeData = await claudeRes.json()
    const rawText = claudeData.content[0].text.trim()
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Claude 返回格式错误')
    const parsed = JSON.parse(jsonMatch[0])

    // Save to file_data
    const content = {
      source,
      input_url: input_url ?? null,
      raw_text: text.slice(0, 2000),
      analysis: parsed.analysis,
      swot: parsed.swot,
    }

    const { data: saved, error: saveError } = await supabase
      .from('file_data')
      .insert({ file_id, data_type: 'page_analysis', content })
      .select()
      .single()

    if (saveError) throw new Error(saveError.message)

    // Deduct tokens
    await supabase
      .from('users')
      .update({ token_balance: dbUser.token_balance - TOKEN_COST })
      .eq('id', user.id)

    return new Response(JSON.stringify({ id: saved.id, ...content }), {
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
