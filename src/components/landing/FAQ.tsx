'use client';

import { useState } from 'react';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Bagaimana cara memesan undangan digital di JoinMe?',
      a: 'Sangat mudah! Pilih template yang Anda sukai di katalog kami, lalu klik tombol "Pesan" atau hubungi kami langsung via WhatsApp. Kirimkan detail acara (nama mempelai/penyelenggara, tanggal, lokasi, foto, dan lagu pilihan), dan tim kami yang akan merancang undangan hingga siap dibagikan.',
    },
    {
      q: 'Berapa lama proses pembuatan undangan?',
      a: 'Proses pengerjaan biasanya memakan waktu 1x24 jam setelah data acara lengkap dan konfirmasi pembayaran kami terima.',
    },
    {
      q: 'Bagaimana metode pembayarannya?',
      a: 'Pembayaran dilakukan secara mudah melalui transfer bank manual. Nomor rekening dan rincian tagihan akan diinfokan langsung oleh admin via chat WhatsApp.',
    },
    {
      q: 'Apakah bisa revisi jika ada kesalahan data acara?',
      a: 'Tentu saja! Kami menyediakan garansi revisi untuk teks, foto, peta lokasi, maupun lagu latar agar undangan Anda benar-benar sempurna sebelum disebarkan ke para tamu.',
    },
    {
      q: 'Bagaimana cara kerja musik latar dan buku tamu RSVP?',
      a: 'Undangan web dilengkapi tombol kontrol pemutar musik latar interaktif dan formulir RSVP digital sehingga tamu dapat mengonfirmasi kehadiran dan mengirimkan ucapan doa restu secara langsung.',
    },
  ];

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Pertanyaan Sering Diajukan</h2>
          <p className="section-subtitle">
            Punya pertanyaan seputar platform JoinMe? Berikut adalah beberapa pertanyaan paling umum dari calon penyelenggara acara.
          </p>
        </div>

        <div className="faq-accordion">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className={`faq-item ${isOpen ? 'active' : ''}`}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="faq-question"
                >
                  <span>{faq.q}</span>
                  <svg
                    className="faq-chevron"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {isOpen && (
                  <div className="faq-answer" style={{ display: 'block' }}>
                    <div className="faq-answer-content">{faq.a}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
