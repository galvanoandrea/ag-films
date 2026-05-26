'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { PhotoWithUrl, Event } from '@/lib/supabase/types'
import PhotoModal from './PhotoModal'
import Footer from './Footer'

const CATEGORIES = [
  { id: 'all', label: 'Tutti' },
  { id: 'sport', label: 'Sport' },
  { id: 'street', label: 'Street' },
  { id: 'drone', label: 'Drone' },
]

interface Props {
  photos: PhotoWithUrl[]
  events: Event[]
  initialCat: string
  initialEvent: string
  successSessionId: string | null
}

export default function GalleryClient({
  photos,
  events,
  initialCat,
  initialEvent,
  successSessionId,
}: Props) {
  const router = useRouter()
  const [activeCat, setActiveCat] = useState(initialCat)
  const [activeEvent, setActiveEvent] = useState(initialEvent)
  const [openPhoto, setOpenPhoto] = useState<PhotoWithUrl | null>(null)
  const [successMode, setSuccessMode] = useState<string | null>(successSessionId)

  // Sync URL without hard navigation
  useEffect(() => {
    const url = new URL(window.location.href)
    if (activeCat === 'all') url.searchParams.delete('cat')
    else url.searchParams.set('cat', activeCat)
    if (activeEvent === 'all') url.searchParams.delete('event')
    else url.searchParams.set('event', activeEvent)
    window.history.replaceState({}, '', url)
  }, [activeCat, activeEvent])

  // Open success modal if redirected from Stripe
  useEffect(() => {
    if (successSessionId) setSuccessMode(successSessionId)
  }, [successSessionId])

  const visibleEvents = useMemo(
    () =>
      events
        .filter((e) => activeCat === 'all' || e.category === activeCat)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [events, activeCat]
  )

  const filteredPhotos = useMemo(() => {
    let list = photos
    if (activeCat !== 'all') list = list.filter((p) => p.category === activeCat)
    if (activeEvent !== 'all') list = list.filter((p) => p.event_id === activeEvent)
    return list
  }, [photos, activeCat, activeEvent])

  function selectCat(cat: string) {
    setActiveCat(cat)
    const ev = events.find((e) => e.id === activeEvent)
    if (!ev || (cat !== 'all' && ev.category !== cat)) setActiveEvent('all')
  }

  function selectEvent(ev: Event) {
    setActiveEvent(ev.id)
    if (activeCat === 'all') setActiveCat(ev.category)
  }

  function closeModal() {
    setOpenPhoto(null)
    setSuccessMode(null)
    // Strip success params from URL
    const url = new URL(window.location.href)
    url.searchParams.delete('success')
    url.searchParams.delete('session_id')
    window.history.replaceState({}, '', url)
  }

  return (
    <>
      <main>
        {/* Hero */}
        <section className="gallery-hero">
          <div className="container">
            <span className="eyebrow">Catalogo · 2024</span>
            <h1>Galleria.</h1>
            <p>
              Sfoglia, scegli, scarica. Ogni foto è disponibile in alta risoluzione, senza
              watermark, dopo l'acquisto. Link di download valido 48 ore.
            </p>
          </div>
        </section>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="container">
            {/* Category row */}
            <div className="filter-row">
              <span className="filter-label">Categoria</span>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={`chip ${activeCat === c.id ? 'is-active' : ''}`}
                  onClick={() => selectCat(c.id)}
                >
                  {c.label}
                </button>
              ))}
              <span className="filter-count">{filteredPhotos.length} foto</span>
            </div>

            {/* Event row */}
            {visibleEvents.length > 0 && (
              <div className="filter-row">
                <span className="filter-label">Evento</span>
                <button
                  className={`chip chip-event ${activeEvent === 'all' ? 'is-active' : ''}`}
                  onClick={() => setActiveEvent('all')}
                >
                  <span>Tutti gli eventi</span>
                  <span className="ev-date">{visibleEvents.length}</span>
                </button>
                {visibleEvents.map((ev) => (
                  <button
                    key={ev.id}
                    className={`chip chip-event ${activeEvent === ev.id ? 'is-active' : ''}`}
                    onClick={() => selectEvent(ev)}
                  >
                    {activeCat === 'all' && (
                      <span className={`ev-cat-dot cat-dot-${ev.category}`} />
                    )}
                    <span>{ev.name}</span>
                    <span className="ev-date">{ev.date_label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="container">
          {filteredPhotos.length === 0 ? (
            <div className="gallery-empty">Nessuna foto in questa categoria.</div>
          ) : (
            <div className="gallery-grid">
              {filteredPhotos.map((photo) => (
                <button
                  key={photo.id}
                  className="photo-card"
                  type="button"
                  onClick={() => setOpenPhoto(photo)}
                >
                  <div className="photo">
                    <Image
                      src={photo.watermarked_url}
                      alt={photo.title}
                      fill
                      sizes="(max-width: 560px) 100vw, (max-width: 880px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                    <span className="photo-cat">{photo.category}</span>
                    <span className="wm-corner">© AG FILMS</span>
                  </div>
                  <div className="photo-meta">
                    <div className="left">
                      <span className="photo-title">{photo.title}</span>
                      <span className="photo-loc">{photo.location}</span>
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

      {/* Modal */}
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
