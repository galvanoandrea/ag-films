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
  const [events] = useState<Event[]>(initialEvents)
  const [migrating, setMigrating] = useState(false)
  const [migrateMsg, setMigrateMsg] = useState('')

  function onPhotoAdded(photo: PhotoWithUrl) {
    setPhotos((prev) => [photo, ...prev])
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

  async function runMigration() {
    setMigrating(true)
    setMigrateMsg('')
    try {
      const res = await fetch('/api/admin/migrate', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setMigrateMsg('✓ Migrazione completata — ricarica la pagina')
      } else {
        setMigrateMsg('Errore: ' + (data.error ?? JSON.stringify(data.results)))
      }
    } catch {
      setMigrateMsg('Errore di rete')
    } finally {
      setMigrating(false)
    }
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
            onPhotoAdded={onPhotoAdded}
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

        {/* Migration helper */}
        <div style={{
          marginTop: 'var(--space-9)',
          borderTop: '1px solid var(--border-quiet)',
          paddingTop: 'var(--space-5)',
        }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-quiet)', marginBottom: 12 }}>
            Strumenti DB
          </div>
          <button
            onClick={runMigration}
            disabled={migrating}
            style={{
              padding: '10px 18px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
              border: '1px solid var(--border)', color: 'var(--fg-muted)', background: 'none',
              borderRadius: 2, cursor: migrating ? 'wait' : 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            {migrating ? 'Esecuzione…' : 'Aggiungi colonne location/category'}
          </button>
          {migrateMsg && (
            <div style={{
              marginTop: 10, fontFamily: 'var(--font-body)', fontSize: 12,
              color: migrateMsg.startsWith('✓') ? 'var(--accent)' : '#e05c5c',
            }}>
              {migrateMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

