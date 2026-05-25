import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { Order, Photo } from '@/lib/supabase/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*, photos(*)')
    .eq('download_token', token)
    .eq('status', 'completed')
    .single()

  if (error || !data) {
    return new NextResponse('Link non valido.', { status: 404 })
  }

  const order = data as Order & { photos: Photo | null }

  if (!order.download_expires_at || new Date(order.download_expires_at) < new Date()) {
    return new NextResponse('Link scaduto. Il periodo di download di 48h è terminato.', {
      status: 410,
    })
  }

  if (!order.photos?.storage_path_original) {
    return new NextResponse('File non trovato.', { status: 404 })
  }

  // Generate a short-lived signed URL (5 min) and redirect to it
  const { data: signedData, error: urlErr } = await supabase.storage
    .from('photos-original')
    .createSignedUrl(order.photos.storage_path_original, 300)

  if (urlErr || !signedData?.signedUrl) {
    return new NextResponse('Errore generazione URL.', { status: 500 })
  }

  return NextResponse.redirect(signedData.signedUrl)
}
