import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="footer-brand">
              <Image src="/assets/ag-mark.png" alt="AG Films" width={44} height={44} className="footer-mark" />
              <span className="footer-wm">AG FILMS</span>
            </div>
            <p className="footer-tag">
              Fotografia sportiva, street e drone. Acquista le foto della tua gara, del tuo evento, della tua città.
            </p>
          </div>

          <div className="footer-col">
            <h4>Sito</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/galleria">Galleria</Link></li>
              <li><Link href="/galleria?cat=sport">Sport</Link></li>
              <li><Link href="/galleria?cat=street">Street</Link></li>
              <li><Link href="/galleria?cat=drone">Drone</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contatti</h4>
            <ul>
              <li><a href="mailto:andrea@agfilms.it">andrea@agfilms.it</a></li>
              <li><a href="https://instagram.com/agfilms" target="_blank" rel="noopener">Instagram</a></li>
              <li><Link href="/admin">Area riservata</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 AG FILMS · Andrea Galvano · P. IVA 03456789012</span>
          <div className="footer-legal">
            <Link href="#">Privacy</Link>
            <Link href="#">Cookie</Link>
            <Link href="#">Termini</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
