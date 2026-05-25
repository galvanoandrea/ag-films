'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { PhotoWithUrl } from '@/lib/supabase/types'

interface Props {
  photos: PhotoWithUrl[]
  onUpdated: (photo: PhotoWithUrl) => void
  onDeleted: (id: string) => void
}

export default function PhotoList({ photos, onUpdated, onDeleted }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null)

  async function togglePublished(photo: PhotoWithUrl) {
    setBusyId(photo.id)
    try {
      const res = await fetch(`/api/photos/${photo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !photo.published }),
      })
      const { photo: updated } = await res.json()
      onUpdated({ ...updated, watermarked_url: photo.watermarked_url })
    } finally {
      setBusyId(null)
    }
  }

  async function deletePhoto(photo: PhotoWithUrl) {
    if (!confirm(`Eliminare "${photo.title}"? L'azione è irreversibile.`)) return
    setBusyId(photo.id)
    try {
      await fetch(`/api/photos/${photo.id}`, { method: 'DELETE' })
      onDeleted(photo.id)
    } finally {
      setBusyId(null)
    }
  }

  if (photos.length === 0) {
    return (
      <div className="admin-card">
        <p style={{ color: 'var(--fg-quiet)', fontFamily: 'var(--font-body)', fontSize: 14, margin: 0 }}>
          Nessuna foto caricata. Usa il tab "Carica" per aggiungere la prima foto.
        </p>
      </div>
    )
  }

  return (
    <div className="admin-card">
      {photos.map((photo) => {
        const isBusy = busyId === photo.id
        return (
          <div key={photo.id} className="photo-row" style={{ opacity: isBusy ? 0.5 : 1 }}>
            <Image
              src={photo.watermarked_url}
              alt={photo.title}
              width={56}
              height={70}
              className="photo-row-thumb"
              style={{ objectFit: 'cover' }}
            />
            <div className="photo-row-info">
              <div className="photo-row-title">{photo.title}</div>
              <div className="photo-row-meta">
                {photo.events?.name && `${photo.events.name} · `}
                {photo.events?.category} · € {(photo.price / 100).toFixed(0)}
              </div>
            </div>
            <div className="photo-row-actions">
              <span className={`badge ${photo.published ? 'badge-pub' : 'badge-draft'}`}>
                {photo.published ? 'Pubblicata' : 'Bozza'}
              </span>
              <button
                className={`toggle ${photo.published ? 'is-on' : ''}`}
                onClick={() => togglePublished(photo)}
                disabled={isBusy}
                aria-label={photo.published ? 'Nascondi' : 'Pubblica'}
              />
              <button
                className="btn-danger"
                onClick={() => deletePhoto(photo)}
                disabled={isBusy}
                aria-label="Elimina"
              >
                ✕
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
