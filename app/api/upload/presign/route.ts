import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

// Step 1 of upload flow:
// Returns a signed URL so the browser uploads the original file
// directly to Supabase Storage — bypasses Vercel's 4.5MB body limit entirely.
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const { filename } = await request.json()
  const photoId = crypto.randomUUID()
  const ext = filename?.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${photoId}/original.${ext}`

  const supabase = createServiceClient()
  const { data, error } = await supabase.storage
    .from('photos-original')
    .createSignedUploadUrl(path)

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Errore URL firmato' }, { status: 500 })
  }

  return NextResponse.json({ signedUrl: data.signedUrl, path, photoId })
}
