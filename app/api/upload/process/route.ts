import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { applyWatermark } from '@/lib/watermark'

// Vercel: allow up to 60s for Sharp processing + Supabase round-trips
export const maxDuration = 60

// Step 3 of upload flow (after browser uploads original directly to Supabase):
// Download original, apply watermark + resize, upload preview, insert DB record.
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const { photoId, originalPath, title, price, eventId } = await request.json()

  if (!photoId || !originalPath || !title || !price) {
    return NextResponse.json({ error: 'Campi mancanti' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Download the original that was uploaded directly by the browser
  const { data: fileBlob, error: dlErr } = await supabase.storage
    .from('photos-original')
    .download(originalPath)

  if (dlErr || !fileBlob) {
    return NextResponse.json({ error: `Download originale fallito: ${dlErr?.message}` }, { status: 500 })
  }

  const originalBuffer = Buffer.from(await fileBlob.arrayBuffer())
  const watermarkedBuffer = await applyWatermark(originalBuffer)

  const wmPath = `${photoId}/watermarked.jpg`
  const { error: wmErr } = await supabase.storage
    .from('photos-watermarked')
    .upload(wmPath, watermarkedBuffer, { contentType: 'image/jpeg', upsert: false })

  if (wmErr) {
    return NextResponse.json({ error: wmErr.message }, { status: 500 })
  }

  const { data: photo, error: dbErr } = await supabase
    .from('photos')
    .insert({
      id: photoId,
      title,
      event_id: eventId || null,
      price: Math.round(Number(price) * 100),
      storage_path_watermarked: wmPath,
      storage_path_original: originalPath,
      published: false,
    } as Record<string, unknown>)
    .select('*, events(*)')
    .single()

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 })
  }

  return NextResponse.json({ photo }, { status: 201 })
}
