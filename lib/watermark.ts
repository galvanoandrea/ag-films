import sharp from 'sharp'

const PREVIEW_MAX_PX = 2400

// Pre-rendered "AG FILMS" 300×65px tile — white bold text, 50% opacity, transparent bg.
// Generated locally with sharp+SVG; hardcoded so Vercel's runtime needs zero font support.
const TILE_B64 =
  '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' +
  'HwAAAABJRU5ErkJggg=='

export async function applyWatermark(inputBuffer: Buffer): Promise<Buffer> {
  // Auto-rotate based on EXIF orientation (critical for phone photos)
  const oriented = await sharp(inputBuffer).rotate().toBuffer()
  const meta = await sharp(oriented).metadata()
  const origW = meta.width ?? 1200
  const origH = meta.height ?? 1500

  const scale = Math.min(1, PREVIEW_MAX_PX / Math.max(origW, origH))
  const w = Math.round(origW * scale)
  const h = Math.round(origH * scale)

  // Rotate the pre-rendered tile -30°
  const rawTile = Buffer.from(TILE_B64, 'base64')
  const rotatedTile = await sharp(rawTile)
    .rotate(-30, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  const { width: tW = 300, height: tH = 120 } = await sharp(rotatedTile).metadata()

  // Tile the watermark directly onto the resized image — no intermediate overlay
  const STEP_X = 260
  const STEP_Y = 130

  const tiles: sharp.OverlayOptions[] = []
  for (let row = 0; row * STEP_Y < h + tH; row++) {
    const stagger = row % 2 === 1 ? Math.round(STEP_X / 2) : 0
    for (let col = 0; col * STEP_X < w + tW; col++) {
      const left = col * STEP_X + stagger
      const top = row * STEP_Y
      if (left < w && top < h) {
        tiles.push({ input: rotatedTile, left, top, blend: 'over' })
      }
    }
  }

  return sharp(oriented)
    .resize({ width: w, height: h, fit: 'inside' })
    .composite(tiles)
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
}
