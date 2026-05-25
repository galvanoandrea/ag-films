/* ============================================================
   AG FILMS — Galleria & Modal logic (vanilla JS)
   ============================================================ */

(function () {
  let activeCat = 'all';
  let activeEvent = 'all';   // event id or 'all'
  let modalState = 'preview'; // 'preview' | 'paying' | 'success'
  let currentPhoto = null;

  AGChrome.mount('galleria');

  // Parse query
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('cat')) activeCat = urlParams.get('cat');
  if (urlParams.get('event')) activeEvent = urlParams.get('event');
  const openId = urlParams.get('id');

  function syncURL() {
    const url = new URL(window.location);
    if (activeCat === 'all') url.searchParams.delete('cat');
    else url.searchParams.set('cat', activeCat);
    if (activeEvent === 'all') url.searchParams.delete('event');
    else url.searchParams.set('event', activeEvent);
    window.history.replaceState({}, '', url);
  }

  // ─── Filter bar ───
  const catRow = document.getElementById('filter-cat-row');
  const eventRow = document.getElementById('filter-event-row');

  function renderCatRow() {
    catRow.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'filter-label';
    label.textContent = 'Categoria';
    catRow.appendChild(label);

    AG_CATEGORIES.forEach(c => {
      const btn = document.createElement('button');
      btn.className = `chip ${c.id === activeCat ? 'is-active' : ''}`;
      btn.textContent = c.label;
      btn.addEventListener('click', () => {
        activeCat = c.id;
        // Reset event when category changes — unless the active event still belongs
        const ev = AG_EVENTS.find(e => e.id === activeEvent);
        if (!ev || (c.id !== 'all' && ev.cat !== c.id)) activeEvent = 'all';
        syncURL();
        renderAll();
      });
      catRow.appendChild(btn);
    });

    const count = document.createElement('div');
    count.className = 'filter-count';
    const n = filteredPhotos().length;
    count.textContent = `${n} foto`;
    catRow.appendChild(count);
  }

  function renderEventRow() {
    eventRow.innerHTML = '';
    const events = window.eventsForCat(activeCat);

    const label = document.createElement('span');
    label.className = 'filter-label';
    label.textContent = 'Evento';
    eventRow.appendChild(label);

    // "Tutti gli eventi" chip
    const all = document.createElement('button');
    all.className = `chip chip-event ${activeEvent === 'all' ? 'is-active' : ''}`;
    all.innerHTML = `<span>Tutti gli eventi</span><span class="ev-date">${events.length}</span>`;
    all.addEventListener('click', () => {
      activeEvent = 'all';
      syncURL();
      renderAll();
    });
    eventRow.appendChild(all);

    events.forEach(ev => {
      const btn = document.createElement('button');
      btn.className = `chip chip-event ${ev.id === activeEvent ? 'is-active' : ''}`;
      const showDot = activeCat === 'all';
      btn.innerHTML = `
        ${showDot ? `<span class="ev-cat-dot cat-dot-${ev.cat}"></span>` : ''}
        <span>${ev.name}</span>
        <span class="ev-date">${ev.dateLabel}</span>
      `;
      btn.addEventListener('click', () => {
        activeEvent = ev.id;
        // If a category is "all" but we picked an event, narrow the category for clarity
        if (activeCat === 'all') activeCat = ev.cat;
        syncURL();
        renderAll();
      });
      eventRow.appendChild(btn);
    });
  }

  function filteredPhotos() {
    let list = AG_PHOTOS;
    if (activeCat !== 'all') list = list.filter(p => p.cat === activeCat);
    if (activeEvent !== 'all') list = list.filter(p => p.event === activeEvent);
    return list;
  }

  function renderAll() {
    renderCatRow();
    renderEventRow();
    renderGrid();
  }

  // ─── Grid ───
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');

  function renderGrid() {
    const photos = filteredPhotos();
    grid.innerHTML = '';
    empty.style.display = photos.length ? 'none' : 'block';

    photos.forEach(p => {
      const card = document.createElement('button');
      card.className = 'photo-card';
      card.type = 'button';
      card.setAttribute('data-id', p.id);
      card.innerHTML = `
        <div class="photo">
          <span class="photo-cat">${p.cat}</span>
          <div class="watermark">
            <div class="wm-grid">
              ${'<span>© AG FILMS</span>'.repeat(48)}
            </div>
            <span class="wm-corner">© AG FILMS</span>
          </div>
        </div>
        <div class="photo-meta">
          <div class="left">
            <span class="photo-title">${p.title}</span>
            <span class="photo-loc">${p.loc}</span>
          </div>
          <span class="photo-price">€ ${p.price}</span>
        </div>
      `;
      const photoEl = card.querySelector('.photo');
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 750;
      AGPhoto.composePhoto(canvas, { seed: p.seed, category: p.cat });
      photoEl.insertBefore(canvas, photoEl.firstChild);

      card.addEventListener('click', () => openModal(p));
      grid.appendChild(card);
    });
  }

  // ─── Modal ───
  const modal = document.getElementById('modal');
  const modalInner = document.getElementById('modal-inner');
  const modalCloseBtn = document.getElementById('modal-close');

  function openModal(p) {
    currentPhoto = p;
    modalState = 'preview';
    renderModal();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      modalInner.innerHTML = '';
      currentPhoto = null;
    }, 320);
  }

  modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  function renderModal() {
    if (!currentPhoto) return;
    const p = currentPhoto;

    if (modalState === 'preview') {
      modalInner.innerHTML = `
        <div class="modal-photo">
          <div class="photo-wrap">
            <span class="photo-cat">${p.cat}</span>
            <div class="watermark">
              <div class="wm-grid">
                ${'<span>© AG FILMS</span>'.repeat(64)}
              </div>
              <span class="wm-corner">© AG FILMS</span>
            </div>
          </div>
        </div>
        <div class="modal-side">
          <div class="modal-eyebrow">${p.eventName ? p.eventName : 'Foto · ' + p.id.toUpperCase()}</div>
          <h2 class="modal-title">${p.title}</h2>
          <p class="modal-loc">${p.loc}</p>

          <dl class="modal-specs">
            <div class="modal-spec">
              <dt>Categoria</dt>
              <dd>${p.cat.charAt(0).toUpperCase() + p.cat.slice(1)}</dd>
            </div>
            <div class="modal-spec">
              <dt>Evento</dt>
              <dd>${p.eventDate || '—'}</dd>
            </div>
            <div class="modal-spec">
              <dt>Risoluzione</dt>
              <dd>6000 × 4000 px</dd>
            </div>
            <div class="modal-spec">
              <dt>Formato</dt>
              <dd>JPEG · 300 DPI</dd>
            </div>
          </dl>

          <ul class="modal-features">
            <li>File originale in alta risoluzione</li>
            <li>Nessun watermark sul file scaricato</li>
            <li>Link di download valido 48 ore</li>
            <li>Ricevuta automatica via email</li>
          </ul>

          <div class="modal-price-row">
            <span class="modal-price-label">Prezzo</span>
            <span class="modal-price">€ ${p.price}</span>
          </div>

          <button class="modal-buy" id="btn-buy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="2" y="6" width="20" height="13" rx="2"/>
              <path d="M2 10h20"/>
              <path d="M6 15h2"/>
            </svg>
            <span>Paga con Stripe — € ${p.price}</span>
          </button>
          <div class="modal-buy-note">
            <span class="badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg>
              Pagamento sicuro
            </span>
            <span>·</span>
            <span>Carta · Apple Pay · Google Pay</span>
          </div>
        </div>
      `;

      // Render the large preview canvas
      const wrap = modalInner.querySelector('.photo-wrap');
      const c = document.createElement('canvas');
      c.width = 1200;
      c.height = 1500;
      AGPhoto.composePhoto(c, { seed: p.seed, category: p.cat });
      wrap.insertBefore(c, wrap.firstChild);

      document.getElementById('btn-buy').addEventListener('click', startPayment);
    }

    if (modalState === 'paying') {
      modalInner.innerHTML = `
        <div class="modal-photo">
          <div class="photo-wrap">
            <div class="watermark">
              <div class="wm-grid">
                ${'<span>© AG FILMS</span>'.repeat(64)}
              </div>
              <span class="wm-corner">© AG FILMS</span>
            </div>
          </div>
        </div>
        <div class="modal-side">
          <div class="modal-pay-overlay">
            <div class="modal-pay-status">
              <span class="spinner"></span>
              <span>Reindirizzamento a Stripe…</span>
            </div>
            <div class="stripe-mock">
              <div class="stripe-mock-head">
                <span class="stripe-mock-logo">stripe</span>
                <span class="stripe-mock-secure">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Connessione sicura
                </span>
              </div>
              <div class="stripe-mock-row is-selected">
                <svg viewBox="0 0 32 22" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="30" height="20" rx="3"/><rect x="4" y="14" width="9" height="3" fill="currentColor"/></svg>
                <span>•••• 4242</span>
                <span class="pill">Visa</span>
              </div>
              <div class="stripe-mock-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 5h-1.5a3.5 3.5 0 00-3.5 3.5V17"/><path d="M8 5h1a3 3 0 013 3v0"/></svg>
                <span>Apple Pay</span>
              </div>
              <div class="stripe-mock-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                <span>Elaborazione € ${p.price}…</span>
              </div>
            </div>
          </div>
        </div>
      `;
      const wrap = modalInner.querySelector('.photo-wrap');
      const c = document.createElement('canvas');
      c.width = 1200;
      c.height = 1500;
      AGPhoto.composePhoto(c, { seed: p.seed, category: p.cat });
      wrap.insertBefore(c, wrap.firstChild);

      // simulate payment completion
      setTimeout(() => {
        modalState = 'success';
        renderModal();
      }, 2200);
    }

    if (modalState === 'success') {
      const filename = `AG-FILMS_${p.id.toUpperCase()}_${p.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.jpg`;
      modalInner.innerHTML = `
        <div class="modal-photo">
          <div class="photo-wrap">
            <span class="photo-cat" style="background:rgba(212,175,55,0.15);border-color:rgba(212,175,55,0.5);">Acquistata</span>
          </div>
        </div>
        <div class="modal-side">
          <div class="modal-success">
            <div class="modal-success-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 12l5 5L20 6"/>
              </svg>
            </div>
            <h2 class="modal-success-title">Grazie!</h2>
            <p class="modal-success-sub">Pagamento confermato. La ricevuta è stata inviata via email. Il file originale è pronto qui sotto.</p>

            <div class="dl-card">
              <div class="dl-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
              <div class="dl-text">
                <div class="dl-name">${filename}</div>
                <div class="dl-meta">JPEG · 24 MB · 6000×4000</div>
              </div>
              <button class="dl-btn" onclick="alert('Demo · download del file ad alta risoluzione')">
                Scarica
              </button>
            </div>

            <div class="dl-expires">
              <span class="pulse"></span>
              <span id="dl-expires">Link valido per 48 ore — Scade il <span id="expires-when"></span></span>
            </div>
          </div>
        </div>
      `;
      const wrap = modalInner.querySelector('.photo-wrap');
      const c = document.createElement('canvas');
      c.width = 1200;
      c.height = 1500;
      AGPhoto.composePhoto(c, { seed: p.seed, category: p.cat });
      wrap.insertBefore(c, wrap.firstChild);

      // Compute expiration
      const d = new Date();
      d.setHours(d.getHours() + 48);
      const fmt = d.toLocaleString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      document.getElementById('expires-when').textContent = fmt;
    }
  }

  function startPayment() {
    modalState = 'paying';
    renderModal();
  }

  // ─── Init ───
  renderAll();
  if (openId) {
    const p = AG_PHOTOS.find(x => x.id === openId);
    if (p) {
      setTimeout(() => openModal(p), 150);
    }
  }
})();
