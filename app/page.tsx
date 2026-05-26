import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import LandingHero from '@/components/LandingHero'
import Footer from '@/components/Footer'

export const metadata: Metadata = { title: 'AG Films · Andrea Galvano' }

export default async function HomePage() {
  let photoUrls: string[] = []

  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('photos')
      .select('storage_path_original')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(24)

    const paths = (data ?? []).map((p) => p.storage_path_original)
    if (paths.length > 0) {
      const { data: signed } = await supabase.storage
        .from('photos-original')
        .createSignedUrls(paths, 21600) // 6h expiry — background only
      photoUrls = (signed ?? []).map((s) => s.signedUrl).filter((u): u is string => !!u)
    }
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
