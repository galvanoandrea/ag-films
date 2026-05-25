'use client'

import { useState } from 'react'
import type { PhotoWithUrl, Event } from '@/lib/supabase/types'
import UploadForm from './UploadForm'
import PhotoList from './PhotoList'

interface Stats {
  total: number
  published: number
  events: number
  orders: number
}

interface Props {
  photos: PhotoWithUrl[]
  events: Event[]
  stats: Stats
}

export default function AdminDashboard({ photos: initialPhotos, events: initialEvents, stats }: Props) {
  const [tab, setTab] = useState<'upload' | 'photos'>('photos')
  const [photos, setPhotos] = useState<PhotoWithUrl[]>(initialPhotos)
  const [events, setEvents] = useState<Event[]>(initialEvents)

  function onPhotoAdded(photo: PhotoWithUrl) {
    setPhotos((prev) => [photo, ...prev])
  }

  function onEventAdded(event: Event) {
    setEvents((prev) => [event, ...prev])
  }

  function onPhotoUpdated(updated: PhotoWithUrl) {
    setPhotos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }

  function onPhotoDeleted(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <span className="admin-title">Pannello Admin</span>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 18px', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
            border: '1px solid var(--border)', color: 'var(--fg-quiet)', background: 'none',
            borderRadius: 2, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Esci
        </button>
      </div>

      <div className="admin-body">
        {/* Stats */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Foto totali</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.published}</div>
            <div className="stat-label">Pubblicate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.orders}</div>
            <div className="stat-label">Vendute</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${tab === 'photos' ? 'is-active' : ''}`}
            onClick={() => setTab('photos')}
          >
            Foto ({photos.length})
          </button>
          <button
            className={`admin-tab ${tab === 'upload' ? 'is-active' : ''}`}
            onClick={() => setTab('upload')}
          >
            Carica
          </button>
        </div>

        {tab === 'upload' && (
          <UploadForm
            events={events}
            onPhotoAdded={onPhotoAdded}
            onEventAdded={onEventAdded}
            onDone={() => setTab('photos')}
          />
        )}

        {tab === 'photos' && (
          <PhotoList
            photos={photos}
            onUpdated={onPhotoUpdated}
            onDeleted={onPhotoDeleted}
          />
        )}
      </div>
    </div>
  )
}
