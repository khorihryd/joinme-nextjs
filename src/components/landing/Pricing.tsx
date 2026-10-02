import { WHATSAPP_CONFIG } from '@/config/whatsapp';

export function Pricing() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Harga Sederhana & Transparan</h2>
          <p className="section-subtitle">
            Pilih paket yang sesuai untuk hari istimewa Anda. Pemesanan dan konfirmasi pembayaran mudah via transfer manual lewat WhatsApp.
          </p>
        </div>

        <div className="pricing-grid">
          {/* Tier 1: Starter */}
          <div className="pricing-card">
            <div className="card-inner">
              <h3 className="plan-name">Paket Starter</h3>
              <p className="plan-desc">Untuk pertemuan kecil atau uji coba undangan.</p>
              <div className="plan-price">
                <span className="currency">Rp</span>
                <span className="price-val">0</span>
                <span className="price-duration">/acara</span>
              </div>

              <ul className="plan-features">
                <li>
                  <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>1 Halaman Undangan Acara</span>
                </li>
                <li>
                  <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Maksimal 30 RSVP tanggapan</span>
                </li>
                <li>
                  <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Pilihan templat standar</span>
                </li>
                <li className="disabled">
                  <svg className="cross-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  <span>Musik Latar & Galeri Foto Kustom</span>
                </li>
              </ul>

              <a
                href={WHATSAPP_CONFIG.getUrl(WHATSAPP_CONFIG.pricingMessage('Paket Starter'))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-block"
                style={{ textAlign: 'center', textDecoration: 'none' }}
              >
                💬 Pesan Paket Starter
              </a>
            </div>
          </div>

          {/* Tier 2: Pro */}
          <div className="pricing-card premium-card">
            <div className="popular-badge">Rekomendasi</div>
            <div className="card-inner">
              <h3 className="plan-name">Paket Pro</h3>
              <p className="plan-desc">Sangat cocok untuk pernikahan & ulang tahun meriah.</p>
              <div className="plan-price">
                <span className="currency">Rp</span>
                <span className="price-val">149rb</span>
                <span className="price-duration">/tahun</span>
              </div>

              <ul className="plan-features">
                <li>
                  <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Hingga 5 Situs Web Acara Kustom</span>
                </li>
                <li>
                  <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>RSVP & Daftar Tamu <strong>Tanpa Batas</strong></span>
                </li>
                <li>
                  <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Semua Pilihan Templat Premium</span>
                </li>
                <li>
                  <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Musik, Video & Galeri Slide Kustom</span>
                </li>
                <li>
                  <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Amplop Digital & Pembuat Kode QR</span>
                </li>
              </ul>

              <a
                href={WHATSAPP_CONFIG.getUrl(WHATSAPP_CONFIG.pricingMessage('Paket Pro'))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-block"
                style={{ textAlign: 'center', textDecoration: 'none' }}
              >
                💬 Pesan Paket Pro
              </a>
            </div>
          </div>

          {/* Tier 3: VIP */}
          <div className="pricing-card">
            <div className="card-inner">
              <h3 className="plan-name">VIP / Enterprise</h3>
              <p className="plan-desc">Untuk wedding organizer (WO) & kebutuhan agensi.</p>
              <div className="plan-price">
                <span className="currency">Rp</span>
                <span className="price-val">399rb</span>
                <span className="price-duration">/sekali</span>
              </div>

              <ul className="plan-features">
                <li>
                  <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Undangan Tanpa Batas</span>
                </li>
                <li>
                  <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Akses Studio Visual Builder Pro</span>
                </li>
                <li>
                  <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Domain Kustom Sendiri (.com / .id)</span>
                </li>
              </ul>

              <a
                href={WHATSAPP_CONFIG.getUrl(WHATSAPP_CONFIG.pricingMessage('Paket VIP / Enterprise'))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-block"
                style={{ textAlign: 'center', textDecoration: 'none' }}
              >
                💬 Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
