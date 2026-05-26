import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Photo, Event, PhotoWithUrl } from '@/lib/supabase/types'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GalleryClient from '@/components/GalleryClient'

export const metadata: Metadata = { title: 'Galleria' }
export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    cat?: string
    event?: string
    success?: string
    session_id?: string
  }>
}

export default async function GalleriaPage({ searchParams }: Props) {
  const params = await searchParams

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <>
        <Header activePage="galleria" />
        <main style={{ padding: '4rem 2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Configurazione mancante</h2>
          <p style={{ color: '#888', marginTop: 8 }}>
            Le variabili d&apos;ambiente Supabase non sono configurate.<br />
            Aggiungi <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> nelle impostazioni Vercel.
          </p>
        </main>
        <Footer />
      </>
    )
  }

  const supabase = await createClient()

  const [photosResult, eventsResult] = await Promise.all([
    supabase
      .from('photos')
      .select('*, events(*)')
      .eq('published', true)
      .order('created_at', { ascending: false }),
    supabase.from('events').select('*').order('date', { ascending: false }),
  ])

  const rawPhotos = (photosResult.data ?? []) as (Photo & { events: Event | null })[]
  const events = (eventsResult.data ?? []) as Event[]

  const photosWithUrls: PhotoWithUrl[] = rawPhotos.map((p) => ({
    ...p,
    watermarked_url: supabase.storage
      .from('photos-watermarked')
      .getPublicUrl(p.storage_path_watermarked).data.publicUrl,
  }))

  return (
    <>
      <Header activePage="galleria" />
      <GalleryClient
        photos={photosWithUrls}
        events={events}
        initialCat={params.cat ?? 'all'}
        initialEvent={params.event ?? 'all'}
        successSessionId={params.success === 'true' ? (params.session_id ?? null) : null}
      />
      <Footer />
    </>
  )
}
