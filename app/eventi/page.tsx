import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/supabase/types'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = { title: 'Eventi · AG Films' }
export const dynamic = 'force-dynamic'

export default async function EventiPage() {
  const supabase = await createClient()

  const [eventsRes, photosRes] = await Promise.all([
    supabase.from('events').select('*').order('date', { ascending: false }),
    supabase.from('photos').select('event_id').eq('published', true),
  ])

  const events = (eventsRes.data ?? []) as Event[]
  const photoCounts = (photosRes.data ?? []).reduce<Record<string, number>>((acc, p) => {
    if (p.event_id) acc[p.event_id] = (acc[p.event_id] || 0) + 1
    return acc
  }, {})

  const eventsWithPhotos = events.filter((e) => (photoCounts[e.id] ?? 0) > 0)

  return (
    <>
      <Header activePage="eventi" />
      <main className="eventi-page">
        <section className="eventi-hero">
          <div className="container">
            <span className="eyebrow">Archivio · AG Films</span>
            <h1>Eventi.</h1>
            <p>Seleziona un evento per sfogliare le foto e acquistare quelle che ti interessano.</p>
          </div>
        </section>

        <div className="container">
          {eventsWithPhotos.length === 0 ? (
            <div className="gallery-empty">Nessun evento disponibile.</div>
          ) : (
            <div className="eventi-list">
              {eventsWithPhotos.map((ev) => (
                <Link key={ev.id} href={`/eventi/${ev.id}`} className="event-row">
                  <div className="event-row-main">
                    <span className="event-row-name">{ev.name}</span>
                    {ev.location && <span className="event-row-loc">{ev.location}</span>}
                  </div>
                  <div className="event-row-meta">
                    <span className="event-row-date">{ev.date_label}</span>
                    <span className="event-row-count">{photoCounts[ev.id] ?? 0} foto</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
