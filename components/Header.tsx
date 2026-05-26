'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  activePage?: 'home' | 'eventi' | 'admin'
}

export default function Header({ activePage }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header ${scrolled || activePage !== 'home' ? 'is-scrolled' : ''}`}>
      <div className="header-row">
        <Link href="/" className="brand">
          <Image src="/assets/ag-mark.png" alt="AG Films" width={32} height={32} />
          <span className="brand-wm">
            AG&nbsp;FILMS<span className="dim"> · Andrea Galvano</span>
          </span>
        </Link>

        <nav className="nav">
          <Link href="/" className={activePage === 'home' ? 'is-active' : ''}>
            Home
          </Link>
          <Link href="/eventi" className={activePage === 'eventi' ? 'is-active' : ''}>
            Eventi
          </Link>
        </nav>

        <Link href="/eventi" className="btn btn-ghost nav-cta">
          <span>Sfoglia le foto</span>
          <span className="arrow" />
        </Link>

        <button
          className={`burger ${menuOpen ? 'is-open' : ''}`}
          aria-label="Menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}>
        <Link href="/" className={activePage === 'home' ? 'is-active' : ''} onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link href="/eventi" className={activePage === 'eventi' ? 'is-active' : ''} onClick={() => setMenuOpen(false)}>
          Galleria
        </Link>
        <Link href="/eventi" className="btn btn-outline" onClick={() => setMenuOpen(false)}
          style={{ marginTop: 16, justifyContent: 'center' }}>
          <span>Sfoglia le foto</span>
          <span className="arrow" />
        </Link>
      </div>
    </header>
  )
}
