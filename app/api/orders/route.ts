import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { Order } from '@/lib/supabase/types'

// Poll endpoint: GET /api/orders?session_id=cs_xxx
// Used by the success modal to fetch the download token after payment
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'session_id richiesto' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('orders')
    .select('status, download_token, download_expires_at')
    .eq('stripe_session_id', sessionId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
  }

  const order = data as Pick<Order, 'status' | 'download_token' | 'download_expires_at'>

  return NextResponse.json({
    status: order.status,
    download_token: order.status === 'completed' ? order.download_token : null,
    download_expires_at: order.status === 'completed' ? order.download_expires_at : null,
  })
}
