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
