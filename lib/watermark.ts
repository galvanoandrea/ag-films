import sharp from 'sharp'

const WM_LABEL = '© AG FILMS'
// Max dimension for watermarked preview — originals are stored full-res
const PREVIEW_MAX_PX = 2400

export async function applyWatermark(inputBuffer: Buffer): Promise<Buffer> {
  // Apply EXIF rotation first — phones always encode portrait as landscape + rotation tag
  const oriented = await sharp(inputBuffer).rotate().toBuffer()

  const meta = await sharp(oriented).metadata()
  const origW = meta.width ?? 1200
  const origH = meta.height ?? 1500

  // Scale down if needed, never enlarge
  const scale = Math.min(1, PREVIEW_MAX_PX / Math.max(origW, origH))
  const w = Math.round(origW * scale)
  const h = Math.round(origH * scale)

  const svgOverlay = buildWatermarkSVG(w, h)

  return sharp(oriented)
    .resize({ width: w, height: h, fit: 'inside' })
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
}

function buildWatermarkSVG(w: number, h: number): string {
  // Font size scales with image width, clamped to readable range
  const fontSize = Math.max(16, Math.min(32, Math.round(w / 50)))
  const spacing = Math.round(fontSize * 0.5)

  // SVG pattern — librsvg requires fill/fill-opacity, NOT fill="rgba(...)"
  // patternTransform rotates the entire tile coordinate system for diagonal effect
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs>` +
    `<pattern id="wm" x="0" y="0" width="220" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(-30 ${w / 2} ${h / 2})">` +
    `<text x="110" y="60" text-anchor="middle" dominant-baseline="middle" ` +
    `font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="bold" ` +
    `letter-spacing="${spacing}" fill="white" fill-opacity="0.35">AG FILMS</text>` +
    `</pattern>` +
    `</defs>` +
    `<rect width="${w}" height="${h}" fill="url(#wm)"/>` +
    `</svg>`
  )
}
