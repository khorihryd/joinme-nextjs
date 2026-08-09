'use client';

import { useState } from 'react';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Berapa lama proses pembuatan undangan digital di JoinMe?',
      a: 'Sangat cepat! Anda hanya perlu mendaftar, memilih templat, mengisi data acara pada Wizard 6-Tab, dan undangan Anda siap dibagikan dalam waktu kurang dari 5 menit.',
    },
    {
      q: 'Apakah bisa mengganti musik dan foto galeri sendiri?',
      a: 'Tentu saja! Pada paket Pro dan VIP, Anda dapat mengonfigurasi domain kustom sendiri (misal: www.roniandanti.wedding) untuk langsung mengarah ke undangan digital Anda.',
    },
    {
      q: 'Apakah tamu bisa mengunggah foto ke situs web undangan?',
      a: 'Ya! Anda dapat mengaktifkan fitur Galeri Tamu atau Dinding Ucapan di mana tamu dapat mengunggah foto selfie atau foto keseruan selama acara berlangsung.',
    },
    {
      q: 'Bagaimana cara kerja musik latar belakang?',
      a: 'Anda dapat mengunggah trek lagu MP3 favorit Anda. Untuk mematuhi kebijakan pemutaran otomatis browser modern, tamu akan melihat ikon melayang berbentuk catatan musik.',
    },
    {
      q: 'Apakah ada batas jumlah tamu untuk jawaban RSVP?',
      a: 'Paket Starter kami mencakup maksimal hingga 30 jawaban RSVP. Sementara untuk paket Pro dan VIP, Anda mendapatkan kapasitas daftar tamu dan pengiriman jawaban RSVP tanpa batas.',
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
