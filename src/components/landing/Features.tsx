export function Features() {
  const features = [
    {
      icon: (
        <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      ),
      title: 'Templat Menakjubkan',
      desc: 'Pilih dari puluhan desain premium yang dibuat oleh desainer UI/UX profesional. Sesuaikan tata letak, warna, dan gaya secara instan.',
    },
    {
      icon: (
        <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      title: 'Pelacakan RSVP Pintar',
      desc: 'Tamu cukup memindai kode QR atau mengetuk tautan untuk RSVP. Lacak jawaban, kebutuhan diet khusus, dan kategori tamu secara real-time.',
    },
    {
      icon: (
        <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      ),
      title: 'Musik Latar & Galeri',
      desc: 'Bangun suasana romantis dengan musik latar pilihan Anda. Bagikan foto pertunangan atau pesta dengan korsel galeri bawaan yang indah.',
    },
    {
      icon: (
        <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      ),
      title: 'Dinding Ucapan Digital',
      desc: 'Tamu dapat meninggalkan doa restu, ucapan selamat kustom, atau melampirkan foto selfie yang langsung tampil di dinding ucapan live Anda.',
    },
    {
      icon: (
        <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
      ),
      title: 'Domain Kustom & QR',
      desc: 'Beri nama tautan acara dengan domain pribadi (misal: roniandanti.wedding) dan buat kode QR otomatis untuk dicetak di undangan fisik.',
    },
    {
      icon: (
        <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      ),
      title: 'Peta Lokasi & Kalender',
      desc: 'Bantu tamu menemukan lokasi secara instan dengan integrasi Google Maps & Waze. Dilengkapi tautan satu klik Tambah ke Kalender.',
    },
  ];

  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Semua yang Anda Butuhkan untuk Undangan Sempurna</h2>
          <p className="section-subtitle">
            Tinggalkan undangan kertas tradisional dan beralihlah ke platform web interaktif yang dirancang untuk memukau tamu Anda sekaligus menghemat waktu dan stres.
          </p>
        </div>

        <div className="features-grid">
          {features.map((item, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                {item.icon}
              </div>
              <h3 className="feature-card-title">{item.title}</h3>
              <p className="feature-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
