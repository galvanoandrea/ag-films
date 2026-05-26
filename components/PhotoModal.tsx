'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PhotoWithUrl } from '@/lib/supabase/types'

type ModalState = 'preview' | 'paying' | 'success'

interface SuccessData {
  token: string
  expiresAt: string
}

interface Props {
  photo: PhotoWithUrl | null
  successSessionId: string | null
  onClose: () => void
}

export default function PhotoModal({ photo, successSessionId, onClose }: Props) {
  const [state, setState] = useState<ModalState>(successSessionId ? 'success' : 'preview')
  const [buying, setBuying] = useState(false)
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [pollError, setPollError] = useState(false)

  // Poll for order completion after Stripe redirect
  useEffect(() => {
    if (!successSessionId) return
    setState('success')

    let attempts = 0
    const MAX = 15

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders?session_id=${successSessionId}`)
        const data = await res.json()
        if (data.status === 'completed' && data.download_token) {
          setSuccessData({ token: data.download_token, expiresAt: data.download_expires_at })
          return
        }
      } catch {
        // keep polling
      }
      attempts++
      if (attempts < MAX) setTimeout(poll, 2000)
      else setPollError(true)
    }

    poll()
  }, [successSessionId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  async function handleBuy() {
    if (!photo) return
    setBuying(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: photo.id }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      alert((err as Error).message ?? 'Errore checkout')
      setBuying(false)
    }
  }

  const expiresLabel = useCallback((iso: string) => {
    return new Date(iso).toLocaleString('it-IT', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  }, [])

  return (
    <div className="modal-backdrop is-open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button className="modal-close" onClick={onClose} aria-label="Chiudi">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="modal">
        {/* Photo side */}
        <div className="modal-photo">
          <div className="photo-wrap">
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.watermarked_url} alt={photo.title} />
            )}
            {photo && (
              <span className="photo-cat">{photo.events?.category ?? ''}</span>
            )}
            {state === 'success' && (
              <span className="photo-cat" style={{ background: 'rgba(212,175,55,0.15)', borderColor: 'rgba(212,175,55,0.5)' }}>
                Acquistata
              </span>
            )}
          </div>
        </div>

        {/* Content side */}
        <div className="modal-side">
          {state === 'preview' && photo && (
            <>
              <div className="modal-eyebrow">
                {photo.events?.name ?? `Foto · ${photo.id.slice(0, 8).toUpperCase()}`}
              </div>
              <h2 className="modal-title">{photo.title}</h2>
              <p className="modal-loc">
                {photo.events?.location}
                {photo.events?.date_label ? ` — ${photo.events.date_label}` : ''}
              </p>

              <dl className="modal-specs">
                <div className="modal-spec">
                  <dt>Categoria</dt>
                  <dd>{photo.events?.category ? capitalize(photo.events.category) : '—'}</dd>
                </div>
                <div className="modal-spec">
                  <dt>Evento</dt>
                  <dd>{photo.events?.date_label ?? '—'}</dd>
                </div>
                <div className="modal-spec">
                  <dt>Risoluzione</dt>
                  <dd>Alta risoluzione</dd>
                </div>
                <div className="modal-spec">
                  <dt>Formato</dt>
                  <dd>JPEG · senza watermark</dd>
                </div>
              </dl>

              <ul className="modal-features">
                <li>File originale in alta risoluzione</li>
                <li>Nessun watermark sul file scaricato</li>
                <li>Link di download valido 48 ore</li>
                <li>Ricevuta automatica via email</li>
              </ul>

              <div className="modal-price-row">
                <span className="modal-price-label">Prezzo</span>
                <span className="modal-price">€ {(photo.price / 100).toFixed(0)}</span>
              </div>

              <button className="modal-buy" onClick={handleBuy} disabled={buying}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <rect x="2" y="6" width="20" height="13" rx="2" />
                  <path d="M2 10h20M6 15h2" />
                </svg>
                <span>{buying ? 'Reindirizzamento…' : `Paga con Stripe — € ${(photo.price / 100).toFixed(0)}`}</span>
              </button>

              <div className="modal-buy-note">
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
                  </svg>
                  {' '}Pagamento sicuro
                </span>
                <span>·</span>
                <span>Carta · Apple Pay · Google Pay</span>
              </div>
            </>
          )}

          {state === 'success' && (
            <div className="modal-success">
              <div className="modal-success-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M4 12l5 5L20 6" />
                </svg>
              </div>
              <h2 className="modal-success-title">Grazie!</h2>
              <p className="modal-success-sub">
                Pagamento confermato. Il file originale in alta risoluzione è pronto.
              </p>

              {!successData && !pollError && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                  <span className="spinner" />
                  Preparazione file…
                </div>
              )}

              {pollError && (
                <p style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                  Il download sarà disponibile a breve. Controlla la tua email o ricarica la pagina.
                </p>
              )}

              {successData && (
                <>
                  <div className="dl-card">
                    <div className="dl-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                    <div className="dl-text">
                      <div className="dl-name">{photo?.title ?? 'Foto'} · originale</div>
                      <div className="dl-meta">JPEG · alta risoluzione · senza watermark</div>
                    </div>
                    <a
                      className="dl-btn"
                      href={`/api/download/${successData.token}`}
                      target="_blank"
                      rel="noopener"
                    >
                      Scarica
                    </a>
                  </div>

                  <div className="dl-expires">
                    <span className="pulse" />
                    <span>Link valido fino al {expiresLabel(successData.expiresAt)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
