import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

const PROJECT_REF = 'knfaaugskiwcpkjkrnip'

const MIGRATIONS = [
  `ALTER TABLE photos ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE photos ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'sport'`,
]

export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const token = process.env.SUPABASE_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'SUPABASE_ACCESS_TOKEN non configurato' }, { status: 500 })
  }

  const results: { sql: string; ok: boolean; error?: string }[] = []

  for (const sql of MIGRATIONS) {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      }
    )
    const body = await res.json().catch(() => ({}))
    results.push({ sql: sql.slice(0, 60), ok: res.ok, error: body?.message })
  }

  const allOk = results.every((r) => r.ok)
  return NextResponse.json({ ok: allOk, results }, { status: allOk ? 200 : 500 })
}
