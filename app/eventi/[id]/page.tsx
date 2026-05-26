import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Photo, Event, PhotoWithUrl } from '@/lib/supabase/types'
import Header from '@/components/Header'
import EventGalleryClient from '@/components/EventGalleryClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string; session_id?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('events').select('name').eq('id', id).single()
  return { title: data ? `${data.name} · AG Films` : 'Evento · AG Films' }
}

export default async function EventPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams
  const supabase = await createClient()

  const [eventRes, photosRes] = await Promise.all([
    supabase.from('events').select('*').eq('id', id).single(),
    supabase
      .from('photos')
      .select('*, events(*)')
      .eq('event_id', id)
      .eq('published', true)
      .order('created_at', { ascending: false }),
  ])

  if (!eventRes.data) notFound()

  const event = eventRes.data as Event
  const rawPhotos = (photosRes.data ?? []) as (Photo & { events: Event | null })[]

  const photos: PhotoWithUrl[] = rawPhotos.map((p) => ({
    ...p,
    watermarked_url: supabase.storage
      .from('photos-watermarked')
      .getPublicUrl(p.storage_path_watermarked).data.publicUrl,
  }))

  return (
    <>
      <Header activePage="eventi" />
      <EventGalleryClient
        event={event}
        photos={photos}
        successSessionId={sp.success === 'true' ? (sp.session_id ?? null) : null}
      />
    </>
  )
}
