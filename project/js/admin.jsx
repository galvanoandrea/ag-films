/* global React, ReactDOM, AG_PHOTOS, AGPhoto */
const { useState, useEffect, useRef, useMemo } = React;

const PASSWORD = 'andrea2026';
const STORAGE_KEY = 'ag-admin-auth-v1';
const PHOTOS_KEY = 'ag-admin-photos-v1';
const EVENTS_KEY = 'ag-admin-events-v1';

// Add cat/loc/eventName/eventDate to a photo by looking up its event
function denormalizePhoto(p, events) {
  const ev = events.find(e => e.id === p.event);
  if (!ev) return { ...p, cat: p.cat || 'sport', loc: p.loc || '', eventName: '', eventDate: '' };
  return {
    ...p,
    cat: ev.cat,
    loc: `${ev.loc} — ${ev.dateLabel}`,
    eventName: ev.name,
    eventDate: ev.dateLabel,
  };
}

// ─── Icons ───
const Icon = ({ name, size = 16 }) => {
  const paths = {
    upload: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff: <><path d="M2 2l20 20"/><path d="M6.7 6.7C4 8.5 2 12 2 12s3.5 7 10 7c2 0 3.7-.6 5.2-1.5"/><path d="M9.5 9.5a3 3 0 004.5 4.5"/></>,
    x: <><path d="M6 6l12 12M18 6L6 18"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4L16.5 3.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/><path d="M10 11v6M14 11v6"/></>,
    check: <><path d="M4 12l5 5L20 6"/></>,
    chevron: <><polyline points="6 9 12 15 18 9"/></>,
    download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></>,
    bolt: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
    info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    drone: <><circle cx="12" cy="12" r="2"/><path d="M5 5l3 3M19 5l-3 3M5 19l3-3M19 19l-3-3"/><circle cx="4" cy="4" r="2"/><circle cx="20" cy="4" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="20" r="2"/></>,
    eur: <><path d="M18 7a6 6 0 100 10"/><path d="M4 11h9M4 14h9"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

// ─── Photo preview canvas with watermark ───
function PhotoCanvas({ seed, category, className }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const c = ref.current;
    c.width = 600;
    c.height = 750;
    AGPhoto.composePhoto(c, { seed, category });
  }, [seed, category]);
  return <canvas ref={ref} className={className} />;
}

function WatermarkOverlay() {
  return (
    <div className="watermark">
      <div className="wm-grid">
        {Array.from({ length: 48 }).map((_, i) => <span key={i}>© AG FILMS</span>)}
      </div>
      <span className="wm-corner">© AG FILMS</span>
    </div>
  );
}

// ─── Login Screen ───
function LoginScreen({ onAuth }) {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const bgRef = useRef(null);

  useEffect(() => {
    if (bgRef.current) {
      AGPhoto.renderPhoto(bgRef.current, { seed: 4242, category: 'drone', width: 1600, height: 900 });
    }
  }, []);

  function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (pw === PASSWORD) {
        onAuth();
      } else {
        setError('Password non corretta');
      }
      setLoading(false);
    }, 500);
  }

  return (
    <div className="login-screen">
      <div className="login-bg" ref={bgRef}></div>
      <form className="login-card" onSubmit={submit}>
        <img src="assets/ag-mark.png" alt="AG Films" className="login-mark" />
        <h1 className="login-title">Area riservata</h1>
        <p className="login-sub">Solo per Andrea</p>

        {error && <div className="login-error">{error}</div>}

        <label className="field">
          <span className="field-label">Password</span>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              className="field-input"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              autoFocus
              autoComplete="current-password"
              style={{ paddingRight: '46px' }}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--fg-quiet)', padding: 8,
              }}
              aria-label={show ? 'Nascondi' : 'Mostra'}
            >
              <Icon name={show ? 'eyeOff' : 'eye'} size={16} />
            </button>
          </div>
        </label>

        <button type="submit" className="btn btn-gold btn-block" disabled={loading} style={{ marginTop: 4 }}>
          <span>{loading ? 'Verifica…' : 'Entra'}</span>
          {!loading && <span className="arrow"></span>}
        </button>

        <p className="login-hint">Demo · password: <strong style={{ color: 'var(--accent)' }}>andrea2026</strong></p>
      </form>
    </div>
  );
}

// ─── Upload form ───
function UploadForm({ onPublish, events, onCreateEvent }) {
  const [seed, setSeed] = useState(null);
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('sport');

  // Event selection
  const [eventMode, setEventMode] = useState('existing'); // 'existing' | 'new'
  const [eventId, setEventId] = useState('');
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventLoc, setNewEventLoc] = useState('');

  const [price, setPrice] = useState(35);
  const [publish, setPublish] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const previewRef = useRef(null);

  // Filter events by selected category
  const catEvents = useMemo(
    () => events.filter(e => e.cat === cat).sort((a, b) => b.date.localeCompare(a.date)),
    [events, cat]
  );

  // When category changes, reset event selection if needed
  useEffect(() => {
    if (eventMode === 'existing') {
      if (!catEvents.find(e => e.id === eventId)) {
        setEventId(catEvents[0]?.id || '');
      }
    }
  }, [cat, catEvents, eventMode]); // eslint-disable-line

  useEffect(() => {
    if (!seed || !previewRef.current) return;
    previewRef.current.width = 600;
    previewRef.current.height = 750;
    AGPhoto.composePhoto(previewRef.current, { seed, category: cat });
  }, [seed, cat]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const s = (file.name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) + Date.now() % 1000;
    setSeed(s);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
  }

  function clear() {
    setSeed(null);
    setTitle('');
    setPrice(35);
    setEventMode(catEvents.length ? 'existing' : 'new');
    setEventId(catEvents[0]?.id || '');
    setNewEventName('');
    setNewEventDate('');
    setNewEventLoc('');
    setPublish(true);
  }

  const canSubmit = seed && title.trim() && Number(price) > 0 && (
    eventMode === 'existing'
      ? !!eventId
      : (newEventName.trim() && newEventDate && newEventLoc.trim())
  );

  function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    setTimeout(() => {
      let evId = eventId;
      if (eventMode === 'new') {
        const slug = (newEventName || 'evento').toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          + '-' + Date.now().toString(36).slice(-4);
        const dateObj = new Date(newEventDate);
        const months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
        const dateLabel = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
        const newEv = {
          id: slug, cat,
          name: newEventName.trim(),
          date: newEventDate, dateLabel,
          loc: newEventLoc.trim() || '—',
        };
        onCreateEvent(newEv);
        evId = slug;
      }

      onPublish({
        id: 'u' + Date.now().toString(36),
        title: title.trim(),
        event: evId,
        cat,
        price: Number(price),
        seed,
        published: publish,
      });
      clear();
      setSubmitting(false);
    }, 600);
  }

  return (
    <form className="upload-card" onSubmit={submit}>
      {!seed && (
        <label className="upload-zone">
          <div className="upload-zone-icon"><Icon name="upload" size={20} /></div>
          <div className="upload-zone-title">Carica una foto</div>
          <div className="upload-zone-sub">JPEG o RAW · Max 50 MB</div>
          <input type="file" accept="image/*" onChange={handleFile} />
        </label>
      )}

      {seed && (
        <>
          <div className="upload-preview">
            <canvas ref={previewRef} />
            <WatermarkOverlay />
            <button type="button" className="upload-preview-clear" onClick={clear} aria-label="Rimuovi">
              <Icon name="x" size={12} />
            </button>
          </div>

          <div className="note">
            <div className="note-icon"><Icon name="info" size={20} /></div>
            <div className="note-text">
              <strong>Watermark applicato automaticamente.</strong> Il file originale resta intatto e viene consegnato pulito agli acquirenti.
            </div>
          </div>
        </>
      )}

      <label className="field">
        <span className="field-label">Categoria</span>
        <select className="field-select" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="sport">Sport</option>
          <option value="street">Street</option>
          <option value="drone">Drone</option>
        </select>
      </label>

      <div className="field">
        <span className="field-label">Evento</span>
        <div className="seg-toggle">
          <button
            type="button"
            className={`seg ${eventMode === 'existing' ? 'is-active' : ''}`}
            onClick={() => setEventMode('existing')}
            disabled={catEvents.length === 0}
          >
            <span>Esistente</span>
            {catEvents.length > 0 && <span className="seg-count">{catEvents.length}</span>}
          </button>
          <button
            type="button"
            className={`seg ${eventMode === 'new' ? 'is-active' : ''}`}
            onClick={() => setEventMode('new')}
          >
            <Icon name="plus" size={11} />
            <span>Nuovo</span>
          </button>
        </div>

        {eventMode === 'existing' && (
          catEvents.length > 0 ? (
            <select
              className="field-select"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              style={{ marginTop: 10 }}
            >
              {catEvents.map(e => (
                <option key={e.id} value={e.id}>{e.name} · {e.dateLabel} · {e.loc}</option>
              ))}
            </select>
          ) : (
            <div className="field-hint" style={{ marginTop: 10 }}>
              Nessun evento per questa categoria. Crea un nuovo evento.
            </div>
          )
        )}

        {eventMode === 'new' && (
          <div className="new-event-card">
            <label className="field" style={{ marginBottom: 12 }}>
              <span className="field-label">Nome evento</span>
              <input
                className="field-input"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="Es. Como Nuoto"
              />
            </label>
            <div className="field-row">
              <label className="field" style={{ marginBottom: 0 }}>
                <span className="field-label">Data</span>
                <input
                  className="field-input"
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                />
              </label>
              <label className="field" style={{ marginBottom: 0 }}>
                <span className="field-label">Località</span>
                <input
                  className="field-input"
                  value={newEventLoc}
                  onChange={(e) => setNewEventLoc(e.target.value)}
                  placeholder="Es. Como"
                />
              </label>
            </div>
            <div className="field-hint" style={{ marginTop: 10 }}>
              Visibile come sotto-categoria in <strong style={{ color: 'var(--fg)' }}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</strong>.
            </div>
          </div>
        )}
      </div>

      <label className="field">
        <span className="field-label">Titolo foto</span>
        <input
          className="field-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Es. Stile Libero"
          required
        />
      </label>

      <label className="field">
        <span className="field-label">Prezzo (€)</span>
        <input
          className="field-input"
          type="number"
          min="1"
          step="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </label>

      <div className="upload-actions">
        <label className="publish-toggle">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
          <span className="toggle"></span>
          <span>{publish ? 'Pubblica subito' : 'Salva come bozza'}</span>
        </label>
      </div>

      <div className="upload-actions">
        <button type="submit" className="btn btn-gold" disabled={!canSubmit || submitting}>
          <span>{submitting ? 'Caricamento…' : (publish ? 'Pubblica foto' : 'Salva bozza')}</span>
          {!submitting && <span className="arrow"></span>}
        </button>
      </div>
    </form>
  );
}

// ─── Photo list row ───
function PhotoRow({ photo, onTogglePublish, onDelete }) {
  const thumbRef = useRef(null);
  useEffect(() => {
    if (!thumbRef.current) return;
    thumbRef.current.width = 128;
    thumbRef.current.height = 128;
    AGPhoto.composePhoto(thumbRef.current, { seed: photo.seed, category: photo.cat });
  }, [photo.seed, photo.cat]);

  return (
    <div className="admin-row-wrap">
      <div className="admin-photo-row">
        <div className="admin-photo-thumb">
          <canvas ref={thumbRef} />
          <div className="wm-mini">©</div>
        </div>
        <div className="admin-photo-info">
          <div className="admin-photo-title">{photo.title}</div>
          <div className="admin-photo-meta">
            <span className="cat-tag">{photo.cat}</span>
            {photo.eventName && <>
              <span className="sep">·</span>
              <span>{photo.eventName}</span>
            </>}
            <span className="sep">·</span>
            <span>{photo.eventDate || photo.loc}</span>
          </div>
        </div>
        <div className="admin-photo-side">
          <span className="admin-photo-price">€ {photo.price}</span>
          <span className={`status-badge ${photo.published ? 'status-pub' : 'status-draft'}`}>
            {photo.published ? 'Pubblicata' : 'Bozza'}
          </span>
        </div>
      </div>
      <div className="admin-photo-row-actions">
        <button
          className="btn btn-ghost"
          style={{ padding: '8px 14px', fontSize: 10 }}
          onClick={() => onTogglePublish(photo.id)}
        >
          {photo.published ? 'Nascondi' : 'Pubblica'}
        </button>
        <button
          className="icon-btn"
          onClick={() => onDelete(photo.id)}
          aria-label="Elimina"
          title="Elimina"
        >
          <Icon name="trash" size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Toast ───
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2400);
    return () => clearTimeout(t);
  }, [message, onClose]);

  return (
    <div className={`toast ${message ? 'is-visible' : ''}`}>
      <span className="tick"><Icon name="check" size={11} /></span>
      <span>{message}</span>
    </div>
  );
}

// ─── Main Admin App ───
function AdminApp() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState('upload');
  const [photos, setPhotos] = useState([]);
  const [events, setEvents] = useState([]);
  const [toast, setToast] = useState('');

  // Hydrate from storage
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === '1') setAuthed(true);

    // Events
    const storedEvents = localStorage.getItem(EVENTS_KEY);
    let evs;
    if (storedEvents) {
      try { evs = JSON.parse(storedEvents); }
      catch { evs = AG_EVENTS.slice(); }
    } else {
      evs = AG_EVENTS.slice();
      localStorage.setItem(EVENTS_KEY, JSON.stringify(evs));
    }
    setEvents(evs);

    // Photos — store raw (no denormalized fields), denormalize on display
    const storedPhotos = localStorage.getItem(PHOTOS_KEY);
    if (storedPhotos) {
      try { setPhotos(JSON.parse(storedPhotos)); }
      catch { initializePhotos(); }
    } else {
      initializePhotos();
    }
  }, []);

  function initializePhotos() {
    const seeded = AG_PHOTOS.map(p => ({
      // strip denormalized fields — keep only raw
      id: p.id, title: p.title, event: p.event, price: p.price, seed: p.seed,
      published: true,
    }));
    seeded[seeded.length - 1].published = false;
    seeded[seeded.length - 3].published = false;
    setPhotos(seeded);
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(seeded));
  }

  function savePhotos(next) {
    setPhotos(next);
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(next));
  }

  function saveEvents(next) {
    setEvents(next);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
  }

  function handleAuth() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setAuthed(true);
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
  }

  function handleCreateEvent(ev) {
    saveEvents([ev, ...events]);
  }

  function handlePublish(photo) {
    const next = [photo, ...photos];
    savePhotos(next);
    setTab('list');
    setToast(photo.published ? 'Foto pubblicata' : 'Bozza salvata');
  }

  function togglePublish(id) {
    const next = photos.map(p => p.id === id ? { ...p, published: !p.published } : p);
    savePhotos(next);
    const photo = next.find(p => p.id === id);
    setToast(photo.published ? 'Foto pubblicata' : 'Foto nascosta');
  }

  function deletePhoto(id) {
    if (!confirm('Eliminare questa foto?')) return;
    const next = photos.filter(p => p.id !== id);
    savePhotos(next);
    setToast('Foto eliminata');
  }

  // Photos with event metadata resolved
  const enrichedPhotos = useMemo(
    () => photos.map(p => denormalizePhoto(p, events)),
    [photos, events]
  );

  const stats = useMemo(() => {
    return {
      total: photos.length,
      published: photos.filter(p => p.published).length,
      revenue: photos.filter(p => p.published).reduce((s, p) => s + (p.price || 0), 0),
      events: new Set(photos.map(p => p.event)).size,
    };
  }, [photos]);

  if (!authed) {
    return <LoginScreen onAuth={handleAuth} />;
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <a href="index.html" className="admin-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src="assets/ag-mark.png" alt="AG Films" />
          <div className="admin-brand-text">
            <span className="name">AG FILMS</span>
            <span className="role">Admin</span>
          </div>
        </a>
        <button className="admin-logout" onClick={handleLogout}>
          Esci
        </button>
      </header>

      <div className="admin-body">
        <div className="admin-section-head">
          <div className="eyebrow">Pannello</div>
          <h2>Ciao, Andrea.</h2>
        </div>

        <div className="stats-strip">
          <div className="stat-tile">
            <div className="stat-tile-n">{stats.total}</div>
            <div className="stat-tile-l">Foto</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-n">{stats.events}</div>
            <div className="stat-tile-l">Eventi</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-n">{stats.published}</div>
            <div className="stat-tile-l"><span className="gold">●</span> Pubblicate</div>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${tab === 'upload' ? 'is-active' : ''}`}
            onClick={() => setTab('upload')}
          >
            <Icon name="upload" size={13} />
            <span>Carica</span>
          </button>
          <button
            className={`admin-tab ${tab === 'list' ? 'is-active' : ''}`}
            onClick={() => setTab('list')}
          >
            <Icon name="list" size={13} />
            <span>Foto</span>
            <span className="badge">{photos.length}</span>
          </button>
        </div>

        {tab === 'upload' && <UploadForm onPublish={handlePublish} events={events} onCreateEvent={handleCreateEvent} />}

        {tab === 'list' && (
          enrichedPhotos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--fg-quiet)', fontSize: 13, letterSpacing: '0.04em' }}>
              Nessuna foto caricata. <a href="#" onClick={(e) => { e.preventDefault(); setTab('upload'); }} style={{ color: 'var(--accent)', borderBottom: '1px solid currentColor' }}>Carica la prima</a>.
            </div>
          ) : (
            <div className="admin-list">
              {enrichedPhotos.map(p => (
                <PhotoRow
                  key={p.id}
                  photo={p}
                  onTogglePublish={togglePublish}
                  onDelete={deletePhoto}
                />
              ))}
            </div>
          )
        )}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('admin-root')).render(<AdminApp />);
