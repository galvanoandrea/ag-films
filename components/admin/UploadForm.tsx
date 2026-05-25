'use client'

import { useState, useRef, ChangeEvent, FormEvent } from 'react'
import type { Event, PhotoWithUrl } from '@/lib/supabase/types'

interface Props {
  events: Event[]
  onPhotoAdded: (photo: PhotoWithUrl) => void
  onEventAdded: (event: Event) => void
  onDone: () => void
}

type EventMode = 'existing' | 'new'

type UploadStep = 'idle' | 'presigning' | 'uploading' | 'processing' | 'done'

const STEP_LABELS: Record<UploadStep, string> = {
  idle: 'Carica foto',
  presigning: 'Preparazione upload…',
  uploading: 'Upload in corso…',
  processing: 'Applicazione watermark…',
  done: 'Completato!',
}

export default function UploadForm({ events, onPhotoAdded, onEventAdded, onDone }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [selectedCat, setSelectedCat] = useState<string>('sport')
  const [eventMode, setEventMode] = useState<EventMode>('existing')
  const [selectedEventId, setSelectedEventId] = useState('')
  const [newEventName, setNewEventName] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [newEventDateLabel, setNewEventDateLabel] = useState('')
  const [newEventLocation, setNewEventLocation] = useState('')
  const [step, setStep] = useState<UploadStep>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const catEvents = events.filter((e) => e.category === selectedCat)
  const busy = step !== 'idle'

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const file = fileRef.current?.files?.[0]
    if (!file) { setError('Seleziona un file'); return }

    try {
      let eventId = selectedEventId

      // Create new event if needed
      if (eventMode === 'new') {
        if (!newEventName || !newEventDate || !newEventDateLabel || !newEventLocation) {
          throw new Error('Compila tutti i campi evento')
        }
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newEventName, date: newEventDate,
            date_label: newEventDateLabel, location: newEventLocation,
            category: selectedCat,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        onEventAdded(data.event)
        eventId = data.event.id
      }

      // Step 1: Get a signed upload URL from our API
      setStep('presigning')
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      })
      const presignData = await presignRes.json()
      if (!presignRes.ok) throw new Error(presignData.error)
      const { signedUrl, path, photoId } = presignData

      // Step 2: Upload file directly to Supabase — bypasses Vercel body limits
      setStep('uploading')
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file,
      })
      if (!uploadRes.ok) throw new Error(`Upload fallito (${uploadRes.status})`)
      setProgress(100)

      // Step 3: Tell the server to watermark the uploaded file and create DB record
      setStep('processing')
      const processRes = await fetch('/api/upload/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, originalPath: path, title, price, eventId }),
      })
      const processData = await processRes.json()
      if (!processRes.ok) throw new Error(processData.error)

      setStep('done')
      onPhotoAdded({
        ...processData.photo,
        watermarked_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos-watermarked/${processData.photo.storage_path_watermarked}`,
      })

      setTimeout(onDone, 800)
    } catch (err) {
      setError((err as Error).message)
      setStep('idle')
      setProgress(0)
    }
  }

  return (
    <div className="admin-card">
      <div className="admin-card-title">Carica nuova foto</div>

      {error && <div className="login-error" style={{ marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div
          className="upload-preview"
          onClick={() => !busy && fileRef.current?.click()}
          style={{ cursor: busy ? 'default' : 'pointer' }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="anteprima" />
          ) : (
            <div className="upload-preview-placeholder">
              Clicca per selezionare una foto<br />
              <span style={{ fontSize: 10, opacity: 0.6 }}>
                JPG · PNG · TIFF · max 200 MB — upload diretto a Supabase Storage
              </span>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/tiff,image/webp"
          style={{ display: 'none' }}
          onChange={handleFile}
          disabled={busy}
          required
        />

        <label className="field">
          <span className="field-label">Titolo</span>
          <input
            type="text" className="field-input" placeholder="Es. Stile Libero"
            value={title} onChange={(e) => setTitle(e.target.value)}
            disabled={busy} required
          />
        </label>

        <label className="field">
          <span className="field-label">Prezzo (€)</span>
          <input
            type="number" className="field-input" placeholder="35" min="1" step="1"
            value={price} onChange={(e) => setPrice(e.target.value)}
            disabled={busy} required
          />
        </label>

        <label className="field">
          <span className="field-label">Categoria</span>
          <select
            className="field-select" value={selectedCat}
            onChange={(e) => { setSelectedCat(e.target.value); setSelectedEventId('') }}
            disabled={busy}
          >
            <option value="sport">Sport</option>
            <option value="street">Street</option>
            <option value="drone">Drone</option>
          </select>
        </label>

        <div className="field">
          <span className="field-label">Evento</span>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {(['existing', 'new'] as EventMode[]).map((m) => (
              <button
                key={m} type="button"
                className={`chip ${eventMode === m ? 'is-active' : ''}`}
                onClick={() => setEventMode(m)} disabled={busy}
                style={{ fontSize: 10 }}
              >
                {m === 'existing' ? 'Esistente' : 'Nuovo evento'}
              </button>
            ))}
          </div>

          {eventMode === 'existing' && (
            <select
              className="field-select" value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)} disabled={busy}
            >
              <option value="">— Nessun evento —</option>
              {catEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name} · {ev.date_label}</option>
              ))}
            </select>
          )}

          {eventMode === 'new' && (
            <div className="admin-card" style={{ marginTop: 8, marginBottom: 0 }}>
              <div className="admin-card-title">Nuovo evento</div>
              <label className="field">
                <span className="field-label">Nome</span>
                <input type="text" className="field-input" placeholder="Es. Como Nuoto" value={newEventName} onChange={(e) => setNewEventName(e.target.value)} disabled={busy} />
              </label>
              <label className="field">
                <span className="field-label">Data (YYYY-MM-DD)</span>
                <input type="date" className="field-input" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} disabled={busy} />
              </label>
              <label className="field">
                <span className="field-label">Etichetta data</span>
                <input type="text" className="field-input" placeholder="Es. 12 Mag 2024" value={newEventDateLabel} onChange={(e) => setNewEventDateLabel(e.target.value)} disabled={busy} />
              </label>
              <label className="field" style={{ marginBottom: 0 }}>
                <span className="field-label">Località</span>
                <input type="text" className="field-input" placeholder="Es. Como" value={newEventLocation} onChange={(e) => setNewEventLocation(e.target.value)} disabled={busy} />
              </label>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        {busy && step !== 'done' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 0', marginBottom: 12,
            fontFamily: 'var(--font-body)', fontSize: 12,
            color: 'var(--fg-muted)', letterSpacing: '0.04em',
          }}>
            <span className="spinner" />
            {STEP_LABELS[step]}
          </div>
        )}

        <button
          type="submit" className="btn btn-gold btn-block"
          disabled={busy}
          style={{ marginTop: step === 'uploading' ? 0 : undefined }}
        >
          {STEP_LABELS[step]}
        </button>
      </form>
    </div>
  )
}
