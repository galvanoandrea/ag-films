/* ============================================================
   AG FILMS — Procedural photo generator
   Produces cinematic abstract images per category as canvas
   data URLs. Each photo has a stable seed so it looks the same
   on every render. Output is meant as a placeholder for real
   photography — color grading inspired by sport/street/drone.
   ============================================================ */

(function () {
  function mulberry32(seed) {
    return function () {
      var t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Palette per category — color graded for AG Films cinematic mood
  const PALETTES = {
    sport: [
      ['#0a0e14', '#1a2530', '#3a5a78', '#d9a23c', '#e8d9a8'], // golden hour stadium
      ['#04060a', '#0e2030', '#1a4860', '#7fb8d8', '#f0e6c8'], // pool / cyan
      ['#0a0908', '#1a1410', '#5a3a20', '#d4661f', '#f5d9a0'], // sunset trail
      ['#080808', '#1a1a1a', '#3a3a3a', '#a8a8a8', '#e6e6e6'], // BW
    ],
    street: [
      ['#06070a', '#181818', '#2a2622', '#c89060', '#e8c878'], // tungsten lamp
      ['#0a0a0a', '#1a1a1a', '#2d2d2d', '#6b6b6b', '#d4af37'], // gold accent moody
      ['#040404', '#101418', '#1c2632', '#3a5878', '#9bbcd8'], // blue hour
      ['#0a0805', '#1a1410', '#3a2820', '#7a5a3a', '#d8b078'], // amber neon
    ],
    drone: [
      ['#0a1018', '#1a2838', '#2c4258', '#6890b0', '#c8d8e8'], // alpine
      ['#0a0e0a', '#142018', '#284838', '#6a8870', '#bcd0b0'], // forest
      ['#0a0c0e', '#1a2028', '#384858', '#7898b8', '#d4c890'], // mountain ridge
      ['#0a0808', '#181410', '#382818', '#a06038', '#e8c068'], // desert / sunset
    ],
  };

  // ─── Photo composer: layered light + color + grain ───
  function composePhoto(canvas, opts) {
    const { seed, category } = opts;
    const rand = mulberry32(seed);
    const palettes = PALETTES[category] || PALETTES.sport;
    const palette = palettes[Math.floor(rand() * palettes.length)];
    const w = canvas.width, h = canvas.height;
    const ctx = canvas.getContext('2d');

    // base gradient
    const baseStyle = Math.floor(rand() * 3);
    if (baseStyle === 0) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, palette[1]);
      g.addColorStop(1, palette[0]);
      ctx.fillStyle = g;
    } else if (baseStyle === 1) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, palette[2]);
      g.addColorStop(1, palette[0]);
      ctx.fillStyle = g;
    } else {
      const g = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.8);
      g.addColorStop(0, palette[2]);
      g.addColorStop(1, palette[0]);
      ctx.fillStyle = g;
    }
    ctx.fillRect(0, 0, w, h);

    // light blobs — 3-6 soft elliptical highlights
    const blobs = 3 + Math.floor(rand() * 4);
    for (let i = 0; i < blobs; i++) {
      const cx = rand() * w;
      const cy = rand() * h;
      const r = (0.15 + rand() * 0.5) * Math.max(w, h);
      const colorIdx = 2 + Math.floor(rand() * 3);
      const color = palette[colorIdx];
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, color + 'cc');
      g.addColorStop(0.4, color + '40');
      g.addColorStop(1, color + '00');
      ctx.fillStyle = g;
      ctx.globalCompositeOperation = i % 2 === 0 ? 'screen' : 'lighter';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.globalCompositeOperation = 'source-over';

    // dark vignette
    const vg = ctx.createRadialGradient(w * 0.5, h * 0.55, w * 0.3, w * 0.5, h * 0.5, w * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);

    // subject silhouette per category
    drawSubject(ctx, w, h, category, rand, palette);

    // grain
    const grain = ctx.getImageData(0, 0, w, h);
    const data = grain.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 18;
      data[i] = clamp(data[i] + n);
      data[i+1] = clamp(data[i+1] + n);
      data[i+2] = clamp(data[i+2] + n);
    }
    ctx.putImageData(grain, 0, 0);

    // bottom shadow gradient (cinematic crush)
    const bg = ctx.createLinearGradient(0, h * 0.5, 0, h);
    bg.addColorStop(0, 'rgba(0,0,0,0)');
    bg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }

  function clamp(v) { return v < 0 ? 0 : (v > 255 ? 255 : v); }

  function drawSubject(ctx, w, h, category, rand, palette) {
    ctx.save();
    if (category === 'drone') {
      // horizon line + mountain silhouettes
      const horizon = h * (0.45 + rand() * 0.2);
      ctx.fillStyle = palette[0];
      const peaks = 3 + Math.floor(rand() * 3);
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, horizon);
      for (let i = 0; i <= peaks; i++) {
        const x = (i / peaks) * w;
        const y = horizon - rand() * h * 0.18;
        if (i === 0) ctx.lineTo(x, y);
        else {
          const cx = x - w / (peaks * 2);
          ctx.quadraticCurveTo(cx, horizon - rand() * h * 0.05, x, y);
        }
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = palette[0] + 'cc';
      ctx.fill();
      // foreground darker
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, horizon + h * 0.12);
      for (let i = 0; i <= 4; i++) {
        const x = (i / 4) * w;
        const y = horizon + h * 0.12 + rand() * h * 0.08;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = '#000000aa';
      ctx.fill();
    } else if (category === 'sport') {
      // motion-blur streaks suggesting an athlete in action
      const streaks = 4 + Math.floor(rand() * 3);
      for (let i = 0; i < streaks; i++) {
        const y = (0.3 + rand() * 0.5) * h;
        const len = (0.3 + rand() * 0.5) * w;
        const x = rand() * (w - len);
        const grad = ctx.createLinearGradient(x, y, x + len, y);
        grad.addColorStop(0, palette[4] + '00');
        grad.addColorStop(0.5, palette[4] + '50');
        grad.addColorStop(1, palette[4] + '00');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y - (1 + rand() * 4), len, 2 + rand() * 6);
      }
      // a faint silhouette
      const cx = w * (0.3 + rand() * 0.4);
      const cy = h * (0.55 + rand() * 0.2);
      ctx.fillStyle = '#00000099';
      ctx.beginPath();
      ctx.ellipse(cx, cy + h * 0.15, w * 0.12, h * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - w * 0.04, cy - h * 0.12, w * 0.08, h * 0.18);
    } else if (category === 'street') {
      // architectural verticals + glow window
      const cols = 2 + Math.floor(rand() * 3);
      for (let i = 0; i < cols; i++) {
        const x = (i / cols) * w + rand() * w * 0.15;
        const wid = w * (0.04 + rand() * 0.1);
        ctx.fillStyle = '#000000' + Math.floor(60 + rand() * 80).toString(16);
        ctx.fillRect(x, 0, wid, h);
      }
      // window glow
      const wx = w * (0.4 + rand() * 0.4);
      const wy = h * (0.25 + rand() * 0.2);
      const ww = w * 0.08;
      const wh = h * 0.12;
      const wg = ctx.createRadialGradient(wx + ww/2, wy + wh/2, 0, wx + ww/2, wy + wh/2, ww * 2);
      wg.addColorStop(0, palette[3] + 'cc');
      wg.addColorStop(1, palette[3] + '00');
      ctx.fillStyle = wg;
      ctx.fillRect(wx - ww, wy - wh, ww * 3, wh * 3);
      ctx.fillStyle = palette[4] + 'aa';
      ctx.fillRect(wx, wy, ww, wh);
    }
    ctx.restore();
  }

  // Render into a target element (replaces inner)
  function renderPhoto(target, opts) {
    const w = opts.width || 600;
    const h = opts.height || 750;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.setAttribute('aria-hidden', 'true');
    composePhoto(canvas, opts);
    target.innerHTML = '';
    target.appendChild(canvas);
    return canvas;
  }

  window.AGPhoto = { renderPhoto, composePhoto };
})();
