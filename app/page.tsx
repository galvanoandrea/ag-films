import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = { title: 'AG Films · Andrea Galvano' }

const CATEGORIES = [
  {
    slug: 'sport',
    label: 'Sport',
    desc: 'Nuoto, atletica, sport acquatici. Ogni gara fermata nel suo istante decisivo.',
    dot: '#d9a23c',
  },
  {
    slug: 'street',
    label: 'Street',
    desc: 'Vita urbana, persone, luce naturale. La città come palcoscenico.',
    dot: '#7fb8d8',
  },
  {
    slug: 'drone',
    label: 'Drone',
    desc: 'Prospettive aeree che ribaltano lo sguardo e rivelano nuove geometrie.',
    dot: '#bcd0b0',
  },
]

export default function HomePage() {
  return (
    <>
      <Header activePage="home" />

      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '120px var(--gutter) var(--space-10)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }} />
        <div aria-hidden style={{
          position: 'absolute', top: '30%', left: '60%',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 'var(--container-max)', margin: '0 auto', width: '100%' }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-6)' }}>
            Fotografia · Sport · Street · Drone
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 200,
            fontSize: 'clamp(64px, 11vw, 160px)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--fg-strong)',
            lineHeight: 0.9,
            margin: '0 0 var(--space-7)',
          }}>
            AG<br />
            <span style={{ color: 'var(--accent)' }}>Films</span>
          </h1>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            lineHeight: 1.7,
            color: 'var(--fg-muted)',
            maxWidth: 520,
            margin: '0 0 var(--space-8)',
          }}>
            Fotografia professionale di Andrea Galvano.<br />
            Acquista le foto originali, senza watermark, in alta risoluzione.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Link href="/galleria" className="btn btn-gold">
              <span>Sfoglia la galleria</span>
              <span className="arrow" />
            </Link>
            <Link href="/galleria?cat=sport" className="btn btn-outline">
              <span>Sport</span>
              <span className="arrow" />
            </Link>
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: 'var(--space-7)', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          color: 'var(--fg-quiet)',
          fontFamily: 'var(--font-body)', fontSize: 9,
          letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase',
          zIndex: 1,
        }}>
          <span>Scorri</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="1" y="1" width="14" height="22" rx="7" />
            <circle cx="8" cy="7" r="2" fill="currentColor" stroke="none" />
          </svg>
        </div>
      </section>

      {/* Categories */}
      <section style={{
        padding: 'var(--space-10) var(--gutter)',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
      }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-7)' }}>Categorie</div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-5)',
          }}>
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/galleria?cat=${cat.slug}`}
                className="home-cat-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-5)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.dot, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{
                    fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10,
                    letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase',
                    color: 'var(--fg-muted)',
                  }}>{cat.label}</span>
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 300,
                  fontSize: 28, letterSpacing: 'var(--tracking-wider)',
                  textTransform: 'uppercase', color: 'var(--fg-strong)',
                  marginBottom: 'var(--space-4)',
                }}>{cat.label}</h3>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  lineHeight: 1.65, color: 'var(--fg-muted)', margin: 0,
                }}>{cat.desc}</p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginTop: 'var(--space-6)',
                  fontFamily: 'var(--font-body)', fontSize: 11,
                  letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase',
                  color: 'var(--accent)',
                }}>
                  <span>Esplora</span>
                  <svg width="20" height="8" viewBox="0 0 20 8" fill="none" stroke="currentColor" strokeWidth="1">
                    <line x1="0" y1="4" x2="16" y2="4" />
                    <polyline points="12,1 17,4 12,7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: 'var(--space-10) var(--gutter)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-7)' }}>Come funziona</div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-5)',
          }}>
            {[
              { n: '01', title: 'Sfoglia', desc: 'Esplora la galleria e trova la foto che ti ha emozionato.' },
              { n: '02', title: 'Acquista', desc: 'Pagamento sicuro via Stripe. Nessun abbonamento, paghi solo ciò che vuoi.' },
              { n: '03', title: 'Scarica', desc: 'Ricevi subito il link di download. Originale in alta risoluzione, senza watermark, per 48 ore.' },
            ].map((step) => (
              <div key={step.n} style={{ padding: 'var(--space-6) 0', borderTop: '1px solid var(--border)' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 200,
                  fontSize: 48, color: 'var(--accent)', opacity: 0.4,
                  letterSpacing: '0.04em', lineHeight: 1, marginBottom: 'var(--space-4)',
                }}>{step.n}</div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 20,
                  letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
                  color: 'var(--fg-strong)', marginBottom: 'var(--space-3)',
                }}>{step.title}</h3>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  lineHeight: 1.65, color: 'var(--fg-muted)', margin: 0,
                }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: 'var(--space-10) var(--gutter)',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <Image src="/assets/ag-mark.png" alt="AG Films" width={56} height={56} style={{ margin: '0 auto var(--space-6)' }} />
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 200,
            fontSize: 'clamp(32px, 5vw, 56px)',
            letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
            color: 'var(--fg-strong)', marginBottom: 'var(--space-5)',
          }}>
            Trova la tua foto
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 16,
            lineHeight: 1.7, color: 'var(--fg-muted)',
            marginBottom: 'var(--space-7)',
          }}>
            Ogni scatto racconta un momento unico. Acquista l&apos;originale in alta risoluzione.
          </p>
          <Link href="/galleria" className="btn btn-gold" style={{ display: 'inline-flex' }}>
            <span>Apri la galleria</span>
            <span className="arrow" />
          </Link>
        </div>
      </section>

      <Footer />

      <style>{`
        .home-cat-card {
          display: block;
          border: 1px solid var(--border);
          padding: var(--space-7);
          background: var(--bg);
          border-radius: 4px;
          transition: border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
          color: inherit;
          text-decoration: none;
        }
        .home-cat-card:hover {
          border-color: var(--accent);
          background: rgba(212,175,55,0.03);
        }
      `}</style>
    </>
  )
}
