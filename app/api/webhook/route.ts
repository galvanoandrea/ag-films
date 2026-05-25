import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  const stripe = getStripe()
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const photoId = session.metadata?.photoId
    const customerEmail = session.customer_details?.email ?? null

    const downloadToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 48)

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent as string,
        customer_email: customerEmail,
        download_token: downloadToken,
        download_expires_at: expiresAt.toISOString(),
      } as Record<string, unknown>)
      .eq('stripe_session_id', session.id)

    if (error) {
      console.error('Webhook DB update failed:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    console.log(`Order completed — photo: ${photoId}, token: ${downloadToken}`)
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object
    await supabase
      .from('orders')
      .update({ status: 'failed' } as Record<string, unknown>)
      .eq('stripe_session_id', session.id)
      .eq('status', 'pending')
  }

  return NextResponse.json({ received: true })
}
