import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyUser } from '../_shared/auth.ts'

const TOKEN_COST = 3000

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

    const { file_id, copy_id, version = 0 } = await req.json()

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

    const { data: copyRow } = await supabase
      .from('file_data')
      .select('content')
      .eq('id', copy_id)
      .eq('file_id', file_id)
      .single()

    if (!copyRow) {
      return new Response(JSON.stringify({ error: '找不到文案数据' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { versions } = copyRow.content as { versions: { title: string[]; body: string[]; cta: string[] } }
    const v = version as number
    const title = versions.title[v] ?? versions.title[0]
    const body = versions.body[v] ?? versions.body[0]
    const cta = versions.cta[v] ?? versions.cta[0]

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('CLAUDE_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `你是专业的落地页设计师和前端工程师。请根据以下内容生成一个完整的 HTML 落地页。

品牌：${file.name}
行业：${file.industry ?? ''}
标题：${title}
正文：${body}
行动呼吁：${cta}

要求：
- 完整的单页 HTML，包含内联 CSS（不用外部依赖）
- 现代美观的设计，响应式布局
- 颜色方案专业，符合行业调性
- 包含：Hero 区域、特点介绍、CTA 按钮
- 中文内容
- 只输出 HTML 代码，从 <!DOCTYPE html> 开始，不要加其他说明`,
        }],
      }),
    })

    if (!claudeRes.ok) throw new Error(`Claude API 错误: ${await claudeRes.text()}`)

    const claudeData = await claudeRes.json()
    const html = claudeData.content[0].text.trim()

    const content = { copy_id, html }

    const { data: saved, error: saveError } = await supabase
      .from('file_data')
      .insert({ file_id, data_type: 'landing_page', content })
      .select()
      .single()

    if (saveError) throw new Error(saveError.message)

    await supabase
      .from('users')
      .update({ token_balance: dbUser.token_balance - TOKEN_COST })
      .eq('id', user.id)

    return new Response(JSON.stringify({ id: saved.id, html }), {
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
