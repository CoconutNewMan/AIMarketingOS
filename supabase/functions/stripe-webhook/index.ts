import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function verifyStripeSignature(body: string, signature: string): Promise<boolean> {
  const parts = signature.split(',').reduce((acc: Record<string, string>, part) => {
    const [k, v] = part.split('=')
    acc[k] = v
    return acc
  }, {})
  const timestamp = parts['t']
  const sigV1 = parts['v1']
  const payload = `${timestamp}.${body}`
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(STRIPE_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return computed === sigV1
}

serve(async (req) => {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') || ''

  const valid = await verifyStripeSignature(body, signature)
  if (!valid) return new Response('Invalid signature', { status: 400 })

  const event = JSON.parse(body)
  if (event.type !== 'checkout.session.completed') return new Response('OK', { status: 200 })

  const session = event.data.object
  const meta = session.metadata
  const userId: string = meta.user_id
  const tokens = parseInt(meta.tokens)
  const tier: string = meta.tier
  const productType: string = meta.product_type
  const amountUsd = parseInt(meta.amount_usd)
  const product: string = meta.product

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  await supabase.from('orders').insert({
    user_id: userId,
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent,
    product_type: productType,
    plan: product,
    amount_usd: amountUsd,
    status: 'paid',
    tokens_granted: tokens,
    tier_granted: tier || null,
  })

  const { data: currentUser } = await supabase.from('users').select('token_balance').eq('id', userId).single()
  const newBalance = ((currentUser as { token_balance: number } | null)?.token_balance || 0) + tokens

  const updateData: Record<string, unknown> = { token_balance: newBalance, updated_at: new Date().toISOString() }
  if (productType === 'subscription' && tier) updateData.tier = tier

  await supabase.from('users').update(updateData).eq('id', userId)

  return new Response('OK', { status: 200 })
})
