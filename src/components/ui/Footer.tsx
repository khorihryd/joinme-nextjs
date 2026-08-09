import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <Link href="/" className="logo footer-logo">
            <svg className="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="M3 8L10.89 13.26C11.56 13.71 12.44 13.71 13.11 13.26L21 8" />
            </svg>
            <span>Join<span className="logo-accent">Me</span></span>
          </Link>
          <p className="footer-desc">
            Merancang cara baru yang berkesan untuk membagikan undangan pernikahan, hari jadi, ulang tahun, dan seminar korporat.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Twitter">🌐</a>
            <a href="#" aria-label="Instagram">📸</a>
            <a href="#" aria-label="LinkedIn">💼</a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-title">Produk</h4>
          <ul className="footer-links">
            <li><a href="#features">Fitur Utama</a></li>
            <li><a href="#templates">Pilihan Templat</a></li>
            <li><a href="#pricing">Paket Harga</a></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-title">Templat</h4>
          <ul className="footer-links">
            <li><Link href="/register">Undangan Pernikahan</Link></li>
            <li><Link href="/register">Pesta Ulang Tahun</Link></li>
            <li><Link href="/register">Seminar Perusahaan</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-title">Bantuan</h4>
          <ul className="footer-links">
            <li><a href="#faq">Tanya Jawab</a></li>
            <li><a href="#">Pusat Panduan</a></li>
            <li><a href="#">Hubungi Kami</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p>&copy; 2026 JoinMe SaaS. Hak Cipta Dilindungi Undang-Undang.</p>
          <p>Dibuat dengan ❤️ untuk para pencipta momen di seluruh dunia.</p>
        </div>
      </div>
    </footer>
  );
}
