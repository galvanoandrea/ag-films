'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { PhotoWithUrl, Event } from '@/lib/supabase/types'
import PhotoModal from './PhotoModal'
import Footer from './Footer'

interface Props {
  event: Event
  photos: PhotoWithUrl[]
  successSessionId: string | null
}

export default function EventGalleryClient({ event, photos, successSessionId }: Props) {
  const [openPhoto, setOpenPhoto] = useState<PhotoWithUrl | null>(null)
  const [successMode, setSuccessMode] = useState<string | null>(successSessionId)

  useEffect(() => {
    if (successSessionId) setSuccessMode(successSessionId)
  }, [successSessionId])

  function closeModal() {
    setOpenPhoto(null)
    setSuccessMode(null)
    const url = new URL(window.location.href)
    url.searchParams.delete('success')
    url.searchParams.delete('session_id')
    window.history.replaceState({}, '', url)
  }

  return (
    <>
      <main>
        {/* Event hero */}
        <section className="gallery-hero">
          <div className="container">
            <Link href="/eventi" className="eyebrow" style={{ textDecoration: 'none', opacity: 0.6 }}>
              ← Tutti gli eventi
            </Link>
            <h1>{event.name}</h1>
            <p>
              {event.date_label}
              {event.location ? ` · ${event.location}` : ''}
              {' '}· {photos.length} foto disponibili
            </p>
          </div>
        </section>

        {/* Grid */}
        <div className="container">
          {photos.length === 0 ? (
            <div className="gallery-empty">Nessuna foto per questo evento.</div>
          ) : (
            <div className="gallery-grid">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  className="photo-card"
                  type="button"
                  onClick={() => setOpenPhoto(photo)}
                >
                  <div className="photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.watermarked_url} alt={photo.title} loading="lazy" />
                    <span className="wm-corner">© AG FILMS</span>
                  </div>
                  <div className="photo-meta">
                    <div className="left">
                      <span className="photo-title">{photo.title}</span>
                      {photo.location && <span className="photo-loc">{photo.location}</span>}
                    </div>
                    <span className="photo-price">€ {(photo.price / 100).toFixed(0)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {(openPhoto || successMode) && (
        <PhotoModal
          photo={openPhoto}
          successSessionId={successMode}
          onClose={closeModal}
        />
      )}
    </>
  )
}
