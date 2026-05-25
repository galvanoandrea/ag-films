import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

// PATCH /api/photos/[id] — update fields (published, title, price, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('photos')
    .update(body as Record<string, unknown>)
    .eq('id', id)
    .select('*, events(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ photo: data })
}

// DELETE /api/photos/[id] — remove photo and its storage objects
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createServiceClient()

  // Fetch storage paths before deleting the row
  const { data: photo } = await supabase
    .from('photos')
    .select('storage_path_watermarked, storage_path_original')
    .eq('id', id)
    .single()

  if (photo) {
    const p = photo as { storage_path_watermarked: string; storage_path_original: string }
    await Promise.all([
      supabase.storage.from('photos-watermarked').remove([p.storage_path_watermarked]),
      supabase.storage.from('photos-original').remove([p.storage_path_original]),
    ])
  }

  const { error } = await supabase.from('photos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
