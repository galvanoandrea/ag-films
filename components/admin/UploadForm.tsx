'use client'

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react'
import type { PhotoWithUrl } from '@/lib/supabase/types'

interface Props {
  onPhotoAdded: (photo: PhotoWithUrl) => void
  onDone: () => void
}

interface EventOption {
  id: string
  name: string
  date_label: string
}

type UploadStep = 'idle' | 'presigning' | 'uploading' | 'processing' | 'done'

const STEP_LABELS: Record<UploadStep, string> = {
  idle: 'Carica foto',
  presigning: 'Preparazione…',
  uploading: 'Upload in corso…',
  processing: 'Watermark…',
  done: 'Completato!',
}

async function safeJson(res: Response, fallback: string): Promise<Record<string, unknown>> {
  try { return await res.json() }
  catch { throw new Error(res.status === 504 ? 'Timeout — riprova' : fallback) }
}

export default function UploadForm({ onPhotoAdded, onDone }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [step, setStep] = useState<UploadStep>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  // Event selection
  const [events, setEvents] = useState<EventOption[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [newEventMode, setNewEventMode] = useState(false)
  const [newEventName, setNewEventName] = useState('')
  const [newEventDate, setNewEventDate] = useState('')

  const busy = step !== 'idle'

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events ?? [])
        if ((d.events ?? []).length === 0) setNewEventMode(true)
      })
      .catch(() => setNewEventMode(true))
  }, [])

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const file = fileRef.current?.files?.[0]
    if (!file) { setError('Seleziona una foto'); return }
    if (!selectedEventId && !newEventMode) { setError('Seleziona o crea un evento'); return }
    if (newEventMode && (!newEventName || !newEventDate)) { setError('Nome e data evento obbligatori'); return }

    try {
      // Step 0: create new event if needed
      let eventId = selectedEventId
      if (newEventMode) {
        setStep('presigning')
        const dateLabel = new Date(newEventDate + 'T12:00:00').toLocaleDateString('it-IT', {
          day: 'numeric', month: 'long', year: 'numeric',
        })
        const evRes = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newEventName, date: newEventDate, date_label: dateLabel, location: '', category: 'sport' }),
        })
        const evData = await safeJson(evRes, 'Errore creazione evento')
        if (!evRes.ok) throw new Error(String(evData.error))
        eventId = evData.event ? String((evData.event as Record<string, unknown>).id) : ''
      }

      // Step 1: presign
      setStep('presigning')
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      })
      const presignData = await safeJson(presignRes, 'Presign fallito')
      if (!presignRes.ok) throw new Error(String(presignData.error))
      const { signedUrl, path, photoId } = presignData as { signedUrl: string; path: string; photoId: string }

      // Step 2: upload to Supabase Storage
      setStep('uploading')
      setProgress(0)
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file,
      })
      if (!uploadRes.ok) throw new Error(`Upload fallito (${uploadRes.status})`)
      setProgress(100)

      // Step 3: watermark + DB
      setStep('processing')
      const processRes = await fetch('/api/upload/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, originalPath: path, title, location, category: 'sport', price, eventId }),
      })
      const processData = await safeJson(processRes, 'Errore watermark — riprova')
      if (!processRes.ok) throw new Error(String(processData.error ?? `Errore server (${processRes.status})`))

      setStep('done')
      const photo = processData.photo as unknown as import('@/lib/supabase/types').PhotoWithUrl
      onPhotoAdded({
        ...photo,
        watermarked_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos-watermarked/${photo.storage_path_watermarked}`,
      })
      setTimeout(onDone, 800)
    } catch (err) {
      setError((err as Error).message)
      setStep('idle')
      setProgress(0)
    }
  }

  function reset() {
    setPreview(null); setTitle(''); setLocation(''); setPrice('')
    setStep('idle'); setProgress(0); setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const fieldStyle = { fontSize: 16 }

  return (
    <div className="admin-card" style={{ maxWidth: 520 }}>
      <div className="admin-card-title">Carica nuova foto</div>

      {error && <div className="login-error" style={{ marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Image picker */}
        <div
          onClick={() => !busy && fileRef.current?.click()}
          style={{
            width: '100%', aspectRatio: '4/3', background: 'var(--bg)',
            border: `1px solid ${preview ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: busy ? 'default' : 'pointer',
            marginBottom: 'var(--space-5)', transition: 'border-color var(--dur-fast)',
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="anteprima" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--fg-quiet)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 12px', display: 'block' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
              <div style={{ fontSize: 13, marginBottom: 4 }}>Tocca per scegliere una foto</div>
              <div style={{ fontSize: 10, opacity: 0.5, letterSpacing: '0.08em' }}>JPG · PNG · TIFF · max 200 MB</div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/tiff,image/webp"
          style={{ display: 'none' }} onChange={handleFile} disabled={busy} />

        {/* Evento */}
        <div className="field">
          <span className="field-label">Evento / Giornata</span>
          {!newEventMode && events.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <select
                className="field-input"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                disabled={busy}
                required={!newEventMode}
                style={fieldStyle}
              >
                <option value="">Seleziona un evento…</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.name} — {ev.date_label}</option>
                ))}
              </select>
              <button type="button" onClick={() => setNewEventMode(true)} disabled={busy}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                + Crea nuovo evento
              </button>
            </div>
          )}
          {newEventMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="text" className="field-input" placeholder="Es. FC Chiasso vs Varese U16"
                value={newEventName} onChange={(e) => setNewEventName(e.target.value)}
                disabled={busy} style={fieldStyle} />
              <input type="date" className="field-input"
                value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)}
                disabled={busy} style={fieldStyle} />
              {events.length > 0 && (
                <button type="button" onClick={() => setNewEventMode(false)} disabled={busy}
                  style={{ background: 'none', border: 'none', color: 'var(--fg-quiet)', fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  ← Seleziona evento esistente
                </button>
              )}
            </div>
          )}
        </div>

        {/* Titolo */}
        <label className="field">
          <span className="field-label">Titolo foto</span>
          <input type="text" className="field-input" placeholder="Es. Stile Libero 200m"
            value={title} onChange={(e) => setTitle(e.target.value)}
            disabled={busy} required style={fieldStyle} />
        </label>

        {/* Location */}
        <label className="field">
          <span className="field-label">Località (opzionale)</span>
          <input type="text" className="field-input" placeholder="Es. Como"
            value={location} onChange={(e) => setLocation(e.target.value)}
            disabled={busy} style={fieldStyle} />
        </label>

        {/* Prezzo */}
        <label className="field">
          <span className="field-label">Prezzo (€)</span>
          <input type="number" className="field-input" placeholder="35" min="1" step="1"
            value={price} onChange={(e) => setPrice(e.target.value)}
            disabled={busy} required style={fieldStyle} />
        </label>

        {/* Progress */}
        {busy && step !== 'done' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', marginBottom: 12,
            fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', letterSpacing: '0.04em' }}>
            <span className="spinner" />
            {STEP_LABELS[step]}
            {step === 'uploading' && progress > 0 && ` ${progress}%`}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-gold" disabled={busy} style={{ flex: 1, justifyContent: 'center' }}>
            {STEP_LABELS[step]}
          </button>
          {!busy && (preview || title) && (
            <button type="button" onClick={reset}
              style={{ padding: '0 16px', border: '1px solid var(--border)', background: 'none',
                color: 'var(--fg-quiet)', borderRadius: 2, cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.1em' }}>
              Reset
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
