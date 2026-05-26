'use client'

import { useState, useRef, ChangeEvent, FormEvent } from 'react'
import type { PhotoWithUrl } from '@/lib/supabase/types'

interface Props {
  onPhotoAdded: (photo: PhotoWithUrl) => void
  onDone: () => void
}

async function safeJson(res: Response, fallback: string): Promise<Record<string, unknown>> {
  try {
    return await res.json()
  } catch {
    throw new Error(res.status === 504 ? 'Timeout — foto troppo grande, riprova' : fallback)
  }
}

type Category = 'sport' | 'street' | 'drone'
type UploadStep = 'idle' | 'presigning' | 'uploading' | 'processing' | 'done'

const CATEGORIES: { id: Category; label: string; dot: string }[] = [
  { id: 'sport', label: 'Sport', dot: '#d9a23c' },
  { id: 'street', label: 'Street', dot: '#7fb8d8' },
  { id: 'drone', label: 'Drone', dot: '#bcd0b0' },
]

const STEP_LABELS: Record<UploadStep, string> = {
  idle: 'Carica foto',
  presigning: 'Preparazione…',
  uploading: 'Upload in corso…',
  processing: 'Watermark…',
  done: 'Completato!',
}

export default function UploadForm({ onPhotoAdded, onDone }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState<Category>('sport')
  const [price, setPrice] = useState('')
  const [step, setStep] = useState<UploadStep>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

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
    if (!file) { setError('Seleziona una foto'); return }

    try {
      // Step 1: Get signed upload URL
      setStep('presigning')
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      })
      const presignData = await safeJson(presignRes, 'Presign fallito')
      if (!presignRes.ok) throw new Error(String(presignData.error))
      const { signedUrl, path, photoId } = presignData as { signedUrl: string; path: string; photoId: string }

      // Step 2: Upload directly to Supabase Storage (bypasses Vercel body limit)
      setStep('uploading')
      setProgress(0)
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file,
      })
      if (!uploadRes.ok) throw new Error(`Upload fallito (${uploadRes.status})`)
      setProgress(100)

      // Step 3: Watermark + save to DB
      setStep('processing')
      const processRes = await fetch('/api/upload/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, originalPath: path, title, location, category, price }),
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
    setPreview(null)
    setTitle('')
    setLocation('')
    setPrice('')
    setCategory('sport')
    setStep('idle')
    setProgress(0)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="admin-card" style={{ maxWidth: 520 }}>
      <div className="admin-card-title">Carica nuova foto</div>

      {error && (
        <div className="login-error" style={{ marginBottom: 20 }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Image picker */}
        <div
          onClick={() => !busy && fileRef.current?.click()}
          style={{
            width: '100%',
            aspectRatio: '4/3',
            background: 'var(--bg)',
            border: `1px solid ${preview ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 4,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: busy ? 'default' : 'pointer',
            marginBottom: 'var(--space-5)',
            transition: 'border-color var(--dur-fast)',
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="anteprima" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--fg-quiet)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 12px', display: 'block' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <div style={{ fontSize: 13, marginBottom: 4 }}>Tocca per scegliere una foto</div>
              <div style={{ fontSize: 10, opacity: 0.5, letterSpacing: '0.08em' }}>JPG · PNG · TIFF · max 200 MB</div>
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
        />

        {/* Categoria */}
        <div className="field">
          <span className="field-label">Categoria</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                disabled={busy}
                style={{
                  flex: 1,
                  padding: '14px 8px',
                  border: `1px solid ${category === c.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: category === c.id ? 'rgba(212,175,55,0.08)' : 'transparent',
                  borderRadius: 4,
                  cursor: busy ? 'default' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all var(--dur-fast)',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, display: 'block' }} />
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: category === c.id ? 'var(--accent)' : 'var(--fg-muted)',
                }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Titolo */}
        <label className="field">
          <span className="field-label">Titolo</span>
          <input
            type="text"
            className="field-input"
            placeholder="Es. Stile Libero"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={busy}
            required
            style={{ fontSize: 16 }}
          />
        </label>

        {/* Location */}
        <label className="field">
          <span className="field-label">Località</span>
          <input
            type="text"
            className="field-input"
            placeholder="Es. Como"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={busy}
            style={{ fontSize: 16 }}
          />
        </label>

        {/* Prezzo */}
        <label className="field">
          <span className="field-label">Prezzo (€)</span>
          <input
            type="number"
            className="field-input"
            placeholder="35"
            min="1"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={busy}
            required
            style={{ fontSize: 16 }}
          />
        </label>

        {/* Progress indicator */}
        {busy && step !== 'done' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 0',
            marginBottom: 12,
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--fg-muted)',
            letterSpacing: '0.04em',
          }}>
            <span className="spinner" />
            {STEP_LABELS[step]}
            {step === 'uploading' && progress > 0 && ` ${progress}%`}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="submit"
            className="btn btn-gold"
            disabled={busy}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {STEP_LABELS[step]}
          </button>
          {!busy && (preview || title) && (
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '0 16px',
                border: '1px solid var(--border)',
                background: 'none',
                color: 'var(--fg-quiet)',
                borderRadius: 2,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                letterSpacing: '0.1em',
              }}
            >
              Reset
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
