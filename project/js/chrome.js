/* ============================================================
   AG FILMS — Shared header + footer + scroll behavior
   ============================================================ */

(function () {
  function buildHeader(activePage) {
    const pages = [
      { id: 'home', href: 'index.html', label: 'Home' },
      { id: 'galleria', href: 'galleria.html', label: 'Galleria' },
    ];

    const navLinks = pages
      .map(p => `<a href="${p.href}" class="${p.id === activePage ? 'is-active' : ''}">${p.label}</a>`)
      .join('');

    const mobileLinks = pages
      .map(p => `<a href="${p.href}" class="${p.id === activePage ? 'is-active' : ''}">${p.label}</a>`)
      .join('');

    return `
      <header class="header" id="ag-header">
        <div class="header-row">
          <a href="index.html" class="brand">
            <img src="${window.__resources?.agMark || 'assets/ag-mark.png'}" alt="AG Films" />
            <span class="brand-wm">AG&nbsp;FILMS<span class="dim"> · Andrea Galvano</span></span>
          </a>
          <nav class="nav">
            ${navLinks}
          </nav>
          <a href="galleria.html" class="btn btn-ghost nav-cta">
            <span>Sfoglia le foto</span>
            <span class="arrow"></span>
          </a>
          <button class="burger" id="ag-burger" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
        <div class="mobile-menu" id="ag-mobile-menu">
          ${mobileLinks}
          <a href="galleria.html" class="btn btn-outline" style="margin-top:16px;justify-content:center;">
            <span>Sfoglia le foto</span>
            <span class="arrow"></span>
          </a>
        </div>
      </header>
    `;
  }

  function buildFooter() {
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-top">
            <div>
              <div class="footer-brand">
                <img src="${window.__resources?.agMark || 'assets/ag-mark.png'}" alt="AG Films" class="footer-mark" />
                <span class="footer-wm">AG FILMS</span>
              </div>
              <p class="footer-tag">Fotografia sportiva, street e drone. Acquista le foto della tua gara, del tuo evento, della tua città.</p>
            </div>
            <div class="footer-col">
              <h4>Sito</h4>
              <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="galleria.html">Galleria</a></li>
                <li><a href="galleria.html?cat=sport">Sport</a></li>
                <li><a href="galleria.html?cat=street">Street</a></li>
                <li><a href="galleria.html?cat=drone">Drone</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Contatti</h4>
              <ul>
                <li><a href="mailto:andrea@agfilms.it">andrea@agfilms.it</a></li>
                <li><a href="https://instagram.com/agfilms" target="_blank" rel="noopener">Instagram</a></li>
                <li><a href="tel:+393331234567">+39 333 123 4567</a></li>
                <li><a href="admin.html">Area riservata</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© 2026 AG FILMS · Andrea Galvano · P. IVA 03456789012</span>
            <div class="footer-legal">
              <a href="#">Privacy</a>
              <a href="#">Cookie</a>
              <a href="#">Termini</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  function mount(activePage) {
    const headerSlot = document.querySelector('[data-ag-header]');
    const footerSlot = document.querySelector('[data-ag-footer]');
    if (headerSlot) headerSlot.outerHTML = buildHeader(activePage);
    if (footerSlot) footerSlot.outerHTML = buildFooter();

    // Scrolled state
    const header = document.getElementById('ag-header');
    if (header) {
      const onScroll = () => {
        if (window.scrollY > 20) header.classList.add('is-scrolled');
        else header.classList.remove('is-scrolled');
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Mobile menu
    const burger = document.getElementById('ag-burger');
    const menu = document.getElementById('ag-mobile-menu');
    if (burger && menu) {
      burger.addEventListener('click', () => {
        burger.classList.toggle('is-open');
        menu.classList.toggle('is-open');
      });
      menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        burger.classList.remove('is-open');
        menu.classList.remove('is-open');
      }));
    }
  }

  window.AGChrome = { mount };
})();
