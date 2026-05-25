/* ============================================================
   AG FILMS — Photo & event dataset
   ============================================================ */

// Events are the "subcategories" — a single date/event/location
// inside a top-level category. Photos point to an event via slug.
window.AG_EVENTS = [
  // ── SPORT
  { id: 'como-nuoto-mag24',  cat: 'sport',  name: 'Como Nuoto',          date: '2024-05-12', dateLabel: '12 Mag 2024', loc: 'Como' },
  { id: 'regata-interlaghi-giu24', cat: 'sport', name: 'Regata Interlaghi', date: '2024-06-08', dateLabel: '8 Giu 2024',  loc: 'Lago di Como' },
  { id: 'atletica-cantu-set24', cat: 'sport', name: 'Atletica Cantù',    date: '2024-09-22', dateLabel: '22 Set 2024', loc: 'Cantù' },
  { id: 'como-calcio-ott24', cat: 'sport',  name: 'Como Calcio',         date: '2024-10-05', dateLabel: '5 Ott 2024',  loc: 'Como — Sinigaglia' },
  { id: 'vela-cernobbio-lug24', cat: 'sport', name: 'Vela Cernobbio',    date: '2024-07-14', dateLabel: '14 Lug 2024', loc: 'Cernobbio' },

  // ── STREET
  { id: 'centro-storico-mar24', cat: 'street', name: 'Centro Storico',   date: '2024-03-03', dateLabel: '3 Mar 2024',  loc: 'Como' },
  { id: 'funicolare-brunate-apr24', cat: 'street', name: 'Funicolare',   date: '2024-04-18', dateLabel: '18 Apr 2024', loc: 'Brunate' },
  { id: 'lungolago-nov24',  cat: 'street',  name: 'Lungolago Sotto la Pioggia', date: '2024-11-11', dateLabel: '11 Nov 2024', loc: 'Como' },
  { id: 'mercato-coperto-ott24', cat: 'street', name: 'Mercato Coperto', date: '2024-10-26', dateLabel: '26 Ott 2024', loc: 'Como' },
  { id: 'tempio-voltiano-dic24', cat: 'street', name: 'Tempio Voltiano', date: '2024-12-07', dateLabel: '7 Dic 2024',  loc: 'Como' },

  // ── DRONE
  { id: 'bellagio-lug24',   cat: 'drone',   name: 'Punta Spartivento',   date: '2024-07-01', dateLabel: '1 Lug 2024',  loc: 'Bellagio' },
  { id: 'balbianello-lug24', cat: 'drone',  name: 'Villa del Balbianello', date: '2024-07-15', dateLabel: '15 Lug 2024', loc: 'Lenno' },
  { id: 'como-alto-lug24',  cat: 'drone',   name: 'Como dall\'Alto',     date: '2024-07-20', dateLabel: '20 Lug 2024', loc: 'Brunate' },
  { id: 'grigne-gen24',     cat: 'drone',   name: 'Grigne in Inverno',   date: '2024-01-12', dateLabel: '12 Gen 2024', loc: 'Mandello del Lario' },
  { id: 'comacina-ago24',   cat: 'drone',   name: 'Isola Comacina',      date: '2024-08-28', dateLabel: '28 Ago 2024', loc: 'Ossuccio' },
  { id: 'faro-brunate-ago24', cat: 'drone', name: 'Faro di Brunate',     date: '2024-08-05', dateLabel: '5 Ago 2024',  loc: 'Brunate' },
];

window.AG_PHOTOS = [
  // SPORT
  { id: 'sp01', title: 'Stile Libero',     event: 'como-nuoto-mag24',         price: 35, seed: 1011 },
  { id: 'sp06', title: 'Vasca 25m',        event: 'como-nuoto-mag24',         price: 35, seed: 1066 },
  { id: 'sp02', title: 'Regata Interlaghi',event: 'regata-interlaghi-giu24',  price: 45, seed: 1024 },
  { id: 'sp03', title: 'Salto in Alto',    event: 'atletica-cantu-set24',     price: 30, seed: 1031 },
  { id: 'sp04', title: 'Calcio d\'Angolo', event: 'como-calcio-ott24',        price: 30, seed: 1043 },
  { id: 'sp05', title: 'Vela al Tramonto', event: 'vela-cernobbio-lug24',     price: 50, seed: 1057 },

  // STREET
  { id: 'st01', title: 'Piazza Cavour',    event: 'centro-storico-mar24',     price: 40, seed: 2011 },
  { id: 'st02', title: 'Via Vitani',       event: 'centro-storico-mar24',     price: 35, seed: 2024 },
  { id: 'st03', title: 'Funicolare',       event: 'funicolare-brunate-apr24', price: 35, seed: 2031 },
  { id: 'st04', title: 'Pioggia di Sera',  event: 'lungolago-nov24',          price: 45, seed: 2048 },
  { id: 'st05', title: 'Mercato',          event: 'mercato-coperto-ott24',    price: 30, seed: 2055 },
  { id: 'st06', title: 'Tempio Voltiano',  event: 'tempio-voltiano-dic24',    price: 40, seed: 2069 },

  // DRONE
  { id: 'dr01', title: 'Punta Spartivento',event: 'bellagio-lug24',           price: 60, seed: 3011 },
  { id: 'dr02', title: 'Villa del Balbianello', event: 'balbianello-lug24',   price: 65, seed: 3024 },
  { id: 'dr03', title: 'Como dall\'Alto',  event: 'como-alto-lug24',          price: 55, seed: 3031 },
  { id: 'dr04', title: 'Grigne in Inverno',event: 'grigne-gen24',             price: 70, seed: 3045 },
  { id: 'dr05', title: 'Isola Comacina',   event: 'comacina-ago24',           price: 60, seed: 3056 },
  { id: 'dr06', title: 'Faro di Brunate',  event: 'faro-brunate-ago24',       price: 65, seed: 3067 },
];

// Derive cat + loc for each photo from its event (single source of truth)
(function denormalize() {
  const eventMap = Object.fromEntries(window.AG_EVENTS.map(e => [e.id, e]));
  window.AG_PHOTOS = window.AG_PHOTOS.map(p => {
    const ev = eventMap[p.event];
    return {
      ...p,
      cat: ev ? ev.cat : 'sport',
      loc: ev ? `${ev.loc} — ${ev.dateLabel}` : '',
      eventName: ev ? ev.name : '',
      eventDate: ev ? ev.dateLabel : '',
    };
  });
})();

window.AG_CATEGORIES = [
  { id: 'all', label: 'Tutti' },
  { id: 'sport', label: 'Sport' },
  { id: 'street', label: 'Street' },
  { id: 'drone', label: 'Drone' },
];

// Helper: events available for the given category (or all if 'all')
window.eventsForCat = function (cat) {
  return window.AG_EVENTS
    .filter(e => cat === 'all' || e.cat === cat)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
};

// Helper: count photos per event
window.photoCountInEvent = function (eventId) {
  return window.AG_PHOTOS.filter(p => p.event === eventId).length;
};
