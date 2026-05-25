import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import type { Photo, Event, PhotoWithUrl } from '@/lib/supabase/types'
import Header from '@/components/Header'
import AdminDashboard from '@/components/admin/AdminDashboard'

export const metadata: Metadata = { title: 'Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = createServiceClient()

  const [photosResult, eventsResult, ordersResult] = await Promise.all([
    supabase
      .from('photos')
      .select('*, events(*)')
      .order('created_at', { ascending: false }),
    supabase.from('events').select('*').order('date', { ascending: false }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
  ])

  const rawPhotos = (photosResult.data ?? []) as (Photo & { events: Event | null })[]
  const events = (eventsResult.data ?? []) as Event[]

  const photosWithUrls: PhotoWithUrl[] = rawPhotos.map((p) => ({
    ...p,
    watermarked_url: supabase.storage
      .from('photos-watermarked')
      .getPublicUrl(p.storage_path_watermarked).data.publicUrl,
  }))

  const stats = {
    total: rawPhotos.length,
    published: rawPhotos.filter((p) => p.published).length,
    events: events.length,
    orders: ordersResult.count ?? 0,
  }

  return (
    <>
      <Header activePage="admin" />
      <AdminDashboard photos={photosWithUrls} events={events} stats={stats} />
    </>
  )
}
