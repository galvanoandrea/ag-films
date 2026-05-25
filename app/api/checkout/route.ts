import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Photo, Event } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  const { photoId } = await request.json()
  if (!photoId) return NextResponse.json({ error: 'photoId richiesto' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('photos')
    .select('*, events(*)')
    .eq('id', photoId)
    .eq('published', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Foto non trovata' }, { status: 404 })
  }

  const photo = data as Photo & { events: Event | null }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const eventName = photo.events?.name ?? ''
  const stripe = getStripe()

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: photo.title,
            description: `AG Films${eventName ? ' · ' + eventName : ''} — Alta risoluzione senza watermark`,
            images: [
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos-watermarked/${photo.storage_path_watermarked}`,
            ],
          },
          unit_amount: photo.price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${baseUrl}/galleria?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/galleria`,
    metadata: { photoId },
    customer_creation: 'always',
  })

  // Create pending order (service client bypasses RLS)
  const service = createServiceClient()
  await service.from('orders').insert({
    photo_id: photoId,
    stripe_session_id: session.id,
    amount: photo.price,
    status: 'pending',
  })

  return NextResponse.json({ url: session.url })
}
