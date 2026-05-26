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
  const fontSize = Math.max(14, Math.min(24, Math.round(w / 55)))
  const letterSpacing = Math.round(fontSize * 0.4)

  // Dense grid — enough rows/cols to cover image fully even after -25° rotation
  const cols = 6
  const rows = 10
  const cellW = (w * 1.6) / cols
  const cellH = (h * 1.4) / rows
  const offsetX = -w * 0.2
  const offsetY = -h * 0.15

  const texts: string[] = []
  for (let r = 0; r <= rows + 2; r++) {
    for (let c = 0; c <= cols + 2; c++) {
      const x = (offsetX + c * cellW).toFixed(1)
      const y = (offsetY + r * cellH).toFixed(1)
      // Dark stroke makes text readable on both light and dark photos
      texts.push(
        `<text x="${x}" y="${y}" ` +
        `transform="rotate(-25 ${x} ${y})" ` +
        `fill="rgba(255,255,255,0.55)" ` +
        `stroke="rgba(0,0,0,0.35)" stroke-width="0.6" paint-order="stroke" ` +
        `font-family="Arial,Helvetica,sans-serif" ` +
        `font-size="${fontSize}" font-weight="700" ` +
        `letter-spacing="${letterSpacing}">${WM_LABEL}</text>`
      )
    }
  }

  // Bold corner badge
  const badgeW = fontSize * 11
  const badgeH = fontSize * 2.2
  const bx = (w - badgeW - 20).toFixed(1)
  const by = (h - badgeH - 20).toFixed(1)
  const tx = (w - badgeW / 2 - 20).toFixed(1)
  const ty = (h - 20 - badgeH / 2 + fontSize * 0.38).toFixed(1)

  const cornerBadge =
    `<rect x="${bx}" y="${by}" width="${badgeW}" height="${badgeH}" fill="rgba(0,0,0,0.72)" rx="2"/>` +
    `<text x="${tx}" y="${ty}" fill="rgba(255,255,255,0.95)" ` +
    `font-family="Arial,Helvetica,sans-serif" ` +
    `font-size="${(fontSize * 0.75).toFixed(1)}" font-weight="700" ` +
    `letter-spacing="${Math.round(letterSpacing * 0.9)}" ` +
    `text-anchor="middle">${WM_LABEL}</text>`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    texts.join('') +
    cornerBadge +
    `</svg>`
  )
}
