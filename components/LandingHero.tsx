'use client'

import Link from 'next/link'

interface Props {
  photoUrls: string[]
}

export default function LandingHero({ photoUrls }: Props) {
  // Split photos into 3 columns
  const col1 = photoUrls.filter((_, i) => i % 3 === 0)
  const col2 = photoUrls.filter((_, i) => i % 3 === 1)
  const col3 = photoUrls.filter((_, i) => i % 3 === 2)

  return (
    <div className="landing-hero">
      {/* Animated background grid */}
      <div className="landing-bg" aria-hidden>
        <AnimCol urls={col1} duration={32} />
        <AnimCol urls={col2} duration={40} reverse />
        <AnimCol urls={col3} duration={36} />
      </div>
      <div className="landing-overlay" />

      {/* Centered content */}
      <div className="landing-content">
        <div className="landing-logo">AG&nbsp;FILMS</div>
        <div className="landing-sub">Fotografia · Andrea Galvano</div>
        <div className="landing-btns">
          <Link href="/eventi" className="btn btn-gold landing-btn">
            Sfoglia le foto
          </Link>
          <Link href="/eventi" className="btn btn-outline landing-btn">
            Scarica le tue foto
          </Link>
        </div>
      </div>
    </div>
  )
}

function AnimCol({ urls, duration, reverse }: { urls: string[]; duration: number; reverse?: boolean }) {
  if (!urls.length) return null
  // Duplicate for seamless loop
  const doubled = [...urls, ...urls]
  return (
    <div
      className="landing-col"
      style={{
        animationDuration: `${duration}s`,
        animationDirection: reverse ? 'reverse' : 'normal',
      }}
    >
      {doubled.map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={url} alt="" loading={i < 6 ? 'eager' : 'lazy'} />
      ))}
    </div>
  )
}
