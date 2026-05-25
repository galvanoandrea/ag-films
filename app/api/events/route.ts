import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

// POST /api/events — create a new event
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const body = await request.json()
  const { name, date, date_label, location, category } = body

  if (!name || !date || !date_label || !location || !category) {
    return NextResponse.json({ error: 'Campi mancanti' }, { status: 400 })
  }

  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .concat('-', date.replace(/-/g, '').slice(2)) // append YYMMDD

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('events')
    .insert({ slug, name, date, date_label, location, category })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ event: data }, { status: 201 })
}
