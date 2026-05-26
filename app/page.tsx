import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import LandingHero from '@/components/LandingHero'
import Footer from '@/components/Footer'

export const metadata: Metadata = { title: 'AG Films · Andrea Galvano' }

export default async function HomePage() {
  let photoUrls: string[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('photos')
      .select('storage_path_watermarked')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(24)

    photoUrls = (data ?? []).map(
      (p) =>
        supabase.storage
          .from('photos-watermarked')
          .getPublicUrl(p.storage_path_watermarked).data.publicUrl
    )
  } catch {
    // show hero with empty background
  }

  return (
    <>
      <LandingHero photoUrls={photoUrls} />
      <Footer />
    </>
  )
}
