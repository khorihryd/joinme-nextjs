'use client';

export function Testimonials() {
  const testimonials = [
    {
      quote: 'JoinMe benar-benar mengubah cara kami menyebarkan undangan. Tamu-tamu sangat terkesan dengan desain dan lagu latar yang elegan!',
      name: 'Randi & Clarissa',
      event: 'Pernikahan di Jakarta',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      quote: 'Fitur RSVP online dan amplop digitalnya sangat membantu kami merekap jumlah kehadiran dan hadiah dengan cepat.',
      name: 'Bima & Anisa',
      event: 'Pernikahan di Bandung',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      quote: 'Studio visual builder-nya sangat mudah digunakan bahkan untuk pemula seperti saya. Hasilnya terlihat profesional!',
      name: 'Dion & Maya',
      event: 'Resepsi di Bali',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">💬 Testimoni Klien</span>
          <h2 className="section-title">Kisah Bahagia Bersama JoinMe</h2>
          <p className="section-subtitle">
            Ribuan pasangan telah mempercayakan momen spesial mereka menggunakan platform undangan digital JoinMe.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((item, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-quote">
                <span className="testimonial-quote-mark">"</span>
                <p>{item.quote}</p>
              </div>
              <div className="testimonial-author">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="testimonial-avatar"
                />
                <div>
                  <h4 className="testimonial-name">{item.name}</h4>
                  <span className="testimonial-event">{item.event}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
