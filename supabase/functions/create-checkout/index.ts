import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyUser } from '../_shared/auth.ts'

const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY')!
const APP_URL = Deno.env.get('APP_URL') || 'https://ai-marketing-os-mauve.vercel.app'

const PRODUCTS = {
  starter: { type: 'subscription', price_usd: 1900, tokens: 50000, tier: 'pro', name: 'Starter Plan - $19/month' },
  pro: { type: 'subscription', price_usd: 4900, tokens: 200000, tier: 'pro', name: 'Pro Plan - $49/month' },
  token_small: { type: 'token_pack', price_usd: 900, tokens: 20000, tier: '', name: 'Token Pack - 20,000 tokens' },
  token_medium: { type: 'token_pack', price_usd: 1900, tokens: 50000, tier: '', name: 'Token Pack - 50,000 tokens' },
  token_large: { type: 'token_pack', price_usd: 3900, tokens: 120000, tier: '', name: 'Token Pack - 120,000 tokens' },
} as const

type ProductKey = keyof typeof PRODUCTS

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const user = await verifyUser(req)
    const { product } = await req.json() as { product: ProductKey }
    const productInfo = PRODUCTS[product]
    if (!productInfo) {
      return new Response(JSON.stringify({ error: 'Invalid product' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const stripeBody = new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': String(productInfo.price_usd),
      'line_items[0][price_data][product_data][name]': productInfo.name,
      'line_items[0][quantity]': '1',
      mode: 'payment',
      success_url: `${APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/#pricing`,
      'metadata[user_id]': user.id,
      'metadata[product]': product,
      'metadata[tokens]': String(productInfo.tokens),
      'metadata[tier]': productInfo.tier,
      'metadata[product_type]': productInfo.type,
      'metadata[amount_usd]': String(productInfo.price_usd),
    })

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stripeBody,
    })

    const session = await stripeRes.json()
    if (!stripeRes.ok) throw new Error(session.error?.message || 'Stripe error')

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const status = msg === 'Unauthorized' ? 401 : 500
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
