/**
 * JoinMe Studio Default Nodes & Widget Prefabs
 */

export const SAMPLE_VARIABLES = {
  'guest_name': 'Budi Santoso & Partner',
  'nama_tamu': 'Budi Santoso & Partner',
  'groom_name': 'Roni Wijaya',
  'nama_pria': 'Roni Wijaya',
  'bride_name': 'Anti Rahmawati',
  'nama_wanita': 'Anti Rahmawati',
  'couple_name': 'Roni & Anti',
  'nama_mempelai': 'Roni & Anti',
  'event_date': '21 September 2026',
  'tanggal_acara': '21 September 2026',
  'event_time': '09:00 WIB - Selesai',
  'waktu_acara': '09:00 WIB - Selesai',
  'event_location': 'Grand Ballroom Hotel Mulia, Jakarta',
  'lokasi_acara': 'Grand Ballroom Hotel Mulia, Jakarta',
  'organizer_name': 'Denny Sumargo',
  'nama_penyelenggara': 'Denny Sumargo',
  'cover_photo': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80'
};

export const DEFAULT_NODES = [
  // 1. Cover Section
  {
    id: 'container-cover',
    type: 'container',
    sectionType: 'cover',
    label: 'Section Cover (Sampul Utama)',
    style: {
      flexDirection: 'column',
      justify: 'center',
      alignItems: 'center',
      gap: 16,
      padding: '60px 24px',
      backgroundColor: '#eff2ef',
      backgroundImage: '',
      backgroundOverlayColor: 'rgba(0,0,0,0.25)',
      backgroundOverlayOpacity: 0.5,
      width: '100%',
      height: 'auto',
      borderRadius: 16,
      margin: '0px 0px 24px 0px',
    },
    children: [
      {
        id: 'heading-cover-title',
        type: 'heading',
        content: 'WALIMATUL URSY',
        style: {
          color: '#ffffff',
          fontSize: 14,
          textAlign: 'center',
          fontFamily: 'Montserrat',
          fontWeight: 'bold',
          margin: '0px 0px 4px 0px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        },
      },
      {
        id: 'heading-cover-names',
        type: 'heading',
        content: '{nama_mempelai}',
        isDynamic: true,
        binding: 'nama_mempelai',
        style: {
          color: '#ffffff',
          fontSize: 32,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
          margin: '0px 0px 8px 0px',
          lineHeight: '1.2',
        },
      },
      {
        id: 'text-cover-desc',
        type: 'text',
        content: 'Kami mengundang Anda untuk merayakan momen bahagia pernikahan kami.',
        style: {
          color: '#f3f4f6',
          fontSize: 12,
          textAlign: 'center',
          fontFamily: 'Inter',
          margin: '0px 0px 16px 0px',
        },
      },
      {
        id: 'button-cover-open',
        type: 'button',
        content: 'Buka Undangan',
        style: {
          backgroundColor: '#e36397',
          color: '#ffffff',
          fontSize: 12,
          padding: '10px 24px',
          borderRadius: 8,
          width: 'auto',
        },
      },
    ],
  },

  // 2. Hero Banner Section
  {
    id: 'container-hero',
    type: 'container',
    sectionType: 'hero',
    label: 'Section Hero Banner',
    style: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '48px 24px',
      backgroundColor: '#ffffff',
      width: '100%',
      borderRadius: 16,
      margin: '0px 0px 24px 0px',
    },
    children: [
      {
        id: 'heading-hero-title',
        type: 'heading',
        content: 'The Wedding Of {nama_mempelai}',
        style: {
          color: '#1e293b',
          fontSize: 26,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
      {
        id: 'text-hero-date',
        type: 'text',
        content: '{tanggal_acara} • {lokasi_acara}',
        style: {
          color: '#64748b',
          fontSize: 13,
          textAlign: 'center',
          fontFamily: 'Inter',
        },
      },
      {
        id: 'countdown-hero',
        type: 'countdown',
        content: '2026-09-21T09:00:00',
        style: {
          color: '#e36397',
          fontSize: 16,
          textAlign: 'center',
        },
      },
    ],
  },

  // 3. Opening Section
  {
    id: 'container-opening',
    type: 'container',
    sectionType: 'opening',
    label: 'Section Ucapan Pembuka',
    style: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      padding: '36px 24px',
      backgroundColor: '#f8fafc',
      width: '100%',
      borderRadius: 16,
      margin: '0px 0px 24px 0px',
    },
    children: [
      {
        id: 'heading-opening-title',
        type: 'heading',
        content: 'Assalamu’alaikum Warahmatullahi Wabarakatuh',
        style: {
          color: '#1e293b',
          fontSize: 18,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
      {
        id: 'text-opening-verse',
        type: 'text',
        content: 'Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Ya Allah semoga ridho-Mu tercurah mengiringi pernikahan kami.',
        style: {
          color: '#64748b',
          fontSize: 13,
          textAlign: 'center',
          fontFamily: 'Inter',
          lineHeight: '1.6',
        },
      },
      {
        id: 'text-opening-surah',
        type: 'text',
        content: '(QS. Ar-Rum: 21)',
        style: {
          color: '#e36397',
          fontSize: 12,
          textAlign: 'center',
          fontFamily: 'Inter',
          fontWeight: 'bold',
        },
      },
    ],
  },

  // 4. Bride & Groom Section
  {
    id: 'container-bride_groom',
    type: 'container',
    sectionType: 'bride_groom',
    label: 'Section Profil Mempelai',
    style: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 20,
      padding: '40px 24px',
      backgroundColor: '#ffffff',
      width: '100%',
      borderRadius: 16,
      margin: '0px 0px 24px 0px',
    },
    children: [
      {
        id: 'heading-bg-title',
        type: 'heading',
        content: 'Pasangan Mempelai',
        style: {
          color: '#e36397',
          fontSize: 24,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
      {
        id: 'image-groom-photo',
        type: 'image',
        binding: 'fotoPria',
        content: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        style: {
          width: '130px',
          height: '130px',
          borderRadius: 65,
          objectFit: 'cover',
        },
      },
      {
        id: 'heading-groom-name',
        type: 'heading',
        content: '{groom_name}',
        style: {
          color: '#1e293b',
          fontSize: 20,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
      {
        id: 'text-groom-parents',
        type: 'text',
        content: 'Putra dari Bpk. Hendra & Ibu Siska',
        style: {
          color: '#64748b',
          fontSize: 12,
          textAlign: 'center',
          fontFamily: 'Inter',
        },
      },
      {
        id: 'image-bride-photo',
        type: 'image',
        binding: 'fotoWanita',
        content: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        style: {
          width: '130px',
          height: '130px',
          borderRadius: 65,
          objectFit: 'cover',
        },
      },
      {
        id: 'heading-bride-name',
        type: 'heading',
        content: '{bride_name}',
        style: {
          color: '#1e293b',
          fontSize: 20,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
      {
        id: 'text-bride-parents',
        type: 'text',
        content: 'Putri dari Bpk. Gunawan & Ibu Maya',
        style: {
          color: '#64748b',
          fontSize: 12,
          textAlign: 'center',
          fontFamily: 'Inter',
        },
      },
    ],
  },

  // 5. Event Schedule Section
  {
    id: 'container-event_schedule',
    type: 'container',
    sectionType: 'event_schedule',
    label: 'Section Waktu & Lokasi Acara',
    style: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '40px 24px',
      backgroundColor: '#f8fafc',
      width: '100%',
      borderRadius: 16,
      margin: '0px 0px 24px 0px',
    },
    children: [
      {
        id: 'heading-schedule-title',
        type: 'heading',
        content: 'Waktu & Lokasi Acara',
        style: {
          color: '#1e293b',
          fontSize: 22,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
      {
        id: 'feed-event-list',
        type: 'container',
        isEventFeed: true,
        style: {
          flexDirection: 'column',
          gap: 16,
          width: '100%',
          backgroundColor: 'transparent',
          padding: '0px',
        },
      },
      {
        id: 'map-schedule',
        type: 'map',
        content: 'Hotel Mulia Jakarta',
        style: {
          borderRadius: 12,
          width: '100%',
          height: '200px',
        },
      },
    ],
  },

  // 6. Live Streaming Section
  {
    id: 'container-live_streaming',
    type: 'container',
    sectionType: 'live_streaming',
    label: 'Section Virtual Live Streaming',
    style: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      padding: '32px 24px',
      backgroundColor: '#ffffff',
      width: '100%',
      borderRadius: 16,
      margin: '0px 0px 24px 0px',
    },
    children: [
      {
        id: 'heading-livestream-title',
        type: 'heading',
        content: 'Siaran Langsung Acara (Virtual Event)',
        style: {
          color: '#e36397',
          fontSize: 20,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
      {
        id: 'text-livestream-desc',
        type: 'text',
        content: 'Bagi keluarga dan kerabat yang berhalangan hadir secara langsung, Anda dapat mengikuti prosesi acara secara virtual melalui siaran langsung di bawah ini.',
        style: {
          color: '#64748b',
          fontSize: 12,
          textAlign: 'center',
          fontFamily: 'Inter',
        },
      },
      {
        id: 'button-livestream-link',
        type: 'button',
        content: '🎥 Tonton Live Streaming',
        style: {
          backgroundColor: '#e36397',
          color: '#ffffff',
          fontSize: 13,
          padding: '12px 28px',
          borderRadius: 10,
          width: 'auto',
          fontWeight: 'bold',
        },
      },
    ],
  },

  // 7. Love Story Section
  {
    id: 'container-love_story',
    type: 'container',
    sectionType: 'love_story',
    label: 'Section Kisah Cinta',
    style: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '36px 24px',
      backgroundColor: '#f8fafc',
      width: '100%',
      borderRadius: 16,
      margin: '0px 0px 24px 0px',
    },
    children: [
      {
        id: 'heading-lovestory-title',
        type: 'heading',
        content: 'Perjalanan Cinta Kami',
        style: {
          color: '#1e293b',
          fontSize: 22,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
      {
        id: 'text-lovestory-desc',
        type: 'text',
        content: 'Kisah kenangan indah perjalanan kami dari awal bertemu hingga mengikat janji suci pernikahan.',
        style: {
          color: '#64748b',
          fontSize: 12,
          textAlign: 'center',
          fontFamily: 'Inter',
          margin: '0px 0px 16px 0px',
        },
      },
    ],
  },

  // 8. Gallery Section
  {
    id: 'container-gallery',
    type: 'container',
    sectionType: 'gallery',
    label: 'Section Galeri Foto',
    style: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '40px 24px',
      backgroundColor: '#ffffff',
      width: '100%',
      borderRadius: 16,
      margin: '0px 0px 24px 0px',
    },
    children: [
      {
        id: 'heading-gallery-title',
        type: 'heading',
        content: 'Galeri Momen Bahagia',
        style: {
          color: '#e36397',
          fontSize: 22,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
      {
        id: 'text-gallery-desc',
        type: 'text',
        content: 'Momen-momen indah kebersamaan kami yang terekam dalam kenangan abadi.',
        style: {
          color: '#64748b',
          fontSize: 12,
          textAlign: 'center',
          fontFamily: 'Inter',
          margin: '0px 0px 16px 0px',
        },
      },
      {
        id: 'image-gallery-sample1',
        type: 'image',
        showInGallery: true,
        content: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500',
        style: { width: '100%', height: '180px', borderRadius: 10 },
      },
      {
        id: 'image-gallery-sample2',
        type: 'image',
        showInGallery: true,
        content: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500',
        style: { width: '100%', height: '180px', borderRadius: 10 },
      },
    ],
  },

  // 9. RSVP Section
  {
    id: 'container-rsvp',
    type: 'container',
    sectionType: 'rsvp',
    label: 'Section RSVP Kehadiran',
    style: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '40px 24px',
      backgroundColor: '#f8fafc',
      width: '100%',
      borderRadius: 16,
      margin: '0px 0px 24px 0px',
    },
    children: [
      {
        id: 'heading-rsvp-title',
        type: 'heading',
        content: 'Konfirmasi Kehadiran (RSVP)',
        style: {
          color: '#1e293b',
          fontSize: 22,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
      {
        id: 'text-rsvp-desc',
        type: 'text',
        content: 'Mohon konfirmasi kehadiran Anda untuk membantu kami menyiapkan konsumsi & tempat acara.',
        style: {
          color: '#64748b',
          fontSize: 12,
          textAlign: 'center',
          fontFamily: 'Inter',
        },
      },
    ],
  },

  // 10. Wishes Section
  {
    id: 'container-wishes',
    type: 'container',
    sectionType: 'wishes',
    label: 'Section Ucapan & Doa Restu',
    style: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '40px 24px',
      backgroundColor: '#ffffff',
      width: '100%',
      borderRadius: 16,
      margin: '0px 0px 24px 0px',
    },
    children: [
      {
        id: 'heading-wishes-title',
        type: 'heading',
        content: 'Ucapan & Doa Restu Tamu',
        style: {
          color: '#e36397',
          fontSize: 22,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
      {
        id: 'text-wishes-desc',
        type: 'text',
        content: 'Tinggalkan pesan ucapan dan doa terbaik Anda untuk kedua mempelai.',
        style: {
          color: '#64748b',
          fontSize: 12,
          textAlign: 'center',
          fontFamily: 'Inter',
        },
      },
      {
        id: 'feed-wishes-list',
        type: 'container',
        isWishesFeed: true,
        style: {
          flexDirection: 'column',
          gap: 12,
          width: '100%',
          backgroundColor: 'transparent',
          padding: '0px',
        },
      },
    ],
  },

  // 11. Gift Section
  {
    id: 'container-gift',
    type: 'container',
    sectionType: 'gift',
    label: 'Section Amplop Digital & Kado',
    style: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '40px 24px',
      backgroundColor: '#f8fafc',
      width: '100%',
      borderRadius: 16,
      margin: '0px 0px 24px 0px',
    },
    children: [
      {
        id: 'heading-gift-title',
        type: 'heading',
        content: 'Amplop Digital & Kado Fisik',
        style: {
          color: '#1e293b',
          fontSize: 22,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
      {
        id: 'text-gift-desc',
        type: 'text',
        content: 'Doa restu Anda merupakan karunia terindah bagi kami. Bagi yang ingin memberikan tanda kasih, dapat mengirimkan angpao digital di bawah ini.',
        style: {
          color: '#64748b',
          fontSize: 12,
          textAlign: 'center',
          fontFamily: 'Inter',
        },
      },
    ],
  },

  // 12. IG Stories Section
  {
    id: 'container-ig_stories',
    type: 'container',
    sectionType: 'ig_stories',
    label: 'Section Instagram Stories',
    style: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      padding: '32px 24px',
      backgroundColor: '#ffffff',
      width: '100%',
      borderRadius: 16,
      margin: '0px 0px 24px 0px',
    },
    children: [
      {
        id: 'heading-ig-title',
        type: 'heading',
        content: 'Bagikan Momen di Instagram Stories',
        style: {
          color: '#e36397',
          fontSize: 20,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
      {
        id: 'text-ig-desc',
        type: 'text',
        content: 'Bagikan kebahagiaan ini ke Story Instagram Anda dengan tagar #RoniAntiWedding2026.',
        style: {
          color: '#64748b',
          fontSize: 12,
          textAlign: 'center',
          fontFamily: 'Inter',
        },
      },
    ],
  },

  // 13. Thank You Section
  {
    id: 'container-thank_you',
    type: 'container',
    sectionType: 'thank_you',
    label: 'Section Ucapan Terimakasih',
    style: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      padding: '40px 24px',
      backgroundColor: '#f8fafc',
      width: '100%',
      borderRadius: 16,
      margin: '0px 0px 24px 0px',
    },
    children: [
      {
        id: 'heading-thankyou-title',
        type: 'heading',
        content: 'Terima Kasih',
        style: {
          color: '#1e293b',
          fontSize: 24,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
      {
        id: 'text-thankyou-desc',
        type: 'text',
        content: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami atas doa restu serta kehadiran Bapak/Ibu/Saudara/i.',
        style: {
          color: '#64748b',
          fontSize: 13,
          textAlign: 'center',
          fontFamily: 'Inter',
        },
      },
      {
        id: 'heading-thankyou-family',
        type: 'heading',
        content: 'Kami yang berbahagia,\n{nama_mempelai} & Keluarga Besar',
        style: {
          color: '#e36397',
          fontSize: 16,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
        },
      },
    ],
  },

  // 14. Footer Section
  {
    id: 'container-footer',
    type: 'container',
    sectionType: 'footer',
    label: 'Section Footer & Watermark',
    style: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      padding: '24px',
      backgroundColor: '#0f172a',
      color: '#94a3b8',
      width: '100%',
      borderRadius: 16,
      margin: '0px',
    },
    children: [
      {
        id: 'text-footer-watermark',
        type: 'text',
        content: 'Digital Invitation Created with JoinMe.id',
        style: {
          color: '#94a3b8',
          fontSize: 11,
          textAlign: 'center',
          fontFamily: 'Inter',
        },
      },
    ],
  },
];

export function createDefaultWidget(nodeType) {
  const timestamp = Date.now();
  const newId = `${nodeType}-${timestamp}`;
  let newWidget = {
    id: newId,
    type: nodeType,
    style: { margin: '0px 0px 12px 0px', flexShrink: 0 }
  };

  switch (nodeType) {
    case 'container':
      newWidget.children = [];
      newWidget.style = {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        gap: 12,
        padding: '16px',
        backgroundColor: 'rgba(0,0,0,0.02)',
        width: '100%',
        margin: '0px 0px 12px 0px'
      };
      break;

    case 'heading':
      newWidget.content = 'Judul Baru';
      newWidget.style = { fontSize: 24, color: '#e36397', textAlign: 'center', fontFamily: 'Playfair Display', fontWeight: 'bold' };
      break;

    case 'text':
      newWidget.content = 'Teks responsif mengalir dinamis mengikuti grid flexbox.';
      newWidget.style = { fontSize: 13, color: '#4a5568', textAlign: 'center', fontFamily: 'Inter' };
      break;

    case 'image':
      newWidget.content = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80';
      newWidget.showInGallery = false;
      newWidget.style = { width: '100%', borderRadius: 8, height: 'auto' };
      break;

    case 'slider':
      newWidget.type = 'slider';
      newWidget.slideInterval = 4;
      newWidget.slideEffect = 'fade';
      newWidget.style = {
        width: '100%',
        height: '320px',
        borderRadius: 12,
        overflow: 'hidden',
        margin: '0px 0px 16px 0px'
      };
      break;

    case 'gallery':
      newWidget.type = 'container';
      newWidget.children = [
        {
          id: `img-gal-1-${timestamp}`,
          type: 'image',
          content: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80',
          showInGallery: true,
          style: { width: '100%', height: '180px', borderRadius: 10 }
        },
        {
          id: `img-gal-2-${timestamp}`,
          type: 'image',
          content: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&auto=format&fit=crop&q=80',
          showInGallery: true,
          style: { width: '100%', height: '180px', borderRadius: 10 }
        },
        {
          id: `img-gal-3-${timestamp}`,
          type: 'image',
          content: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500&auto=format&fit=crop&q=80',
          showInGallery: true,
          style: { width: '100%', height: '180px', borderRadius: 10 }
        }
      ];
      newWidget.style = {
        display: 'grid',
        gridCols: 3,
        gap: 12,
        padding: '16px',
        backgroundColor: 'transparent',
        width: '100%',
        margin: '0px 0px 16px 0px'
      };
      break;

    case 'event':
      newWidget.type = 'container';
      newWidget.widgetType = 'event-list';
      newWidget.style = {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 16,
        padding: '32px 20px',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        width: '100%',
        margin: '0px 0px 24px 0px'
      };
      newWidget.children = [
        {
          id: `heading-event-${timestamp}`,
          type: 'heading',
          content: 'Rangkaian Acara',
          style: { fontSize: 24, color: '#e36397', textAlign: 'center', fontFamily: 'Playfair Display', fontWeight: 'bold' }
        },
        {
          id: `text-event-${timestamp}`,
          type: 'text',
          content: 'Merupakan suatu kehormatan & kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.',
          style: { fontSize: 12, color: '#64748b', textAlign: 'center', fontFamily: 'Inter', margin: '0px 0px 12px 0px' }
        },
        {
          id: `feed-event-list-${timestamp}`,
          type: 'container',
          isEventFeed: true,
          style: {
            flexDirection: 'column',
            gap: 16,
            width: '100%',
            backgroundColor: 'transparent',
            padding: '0px'
          },
          children: [
            {
              id: `card-event-sample-1-${timestamp}`,
              type: 'container',
              style: {
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: 14,
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                width: '100%'
              },
              children: [
                {
                  id: `event-title-1-${timestamp}`,
                  type: 'heading',
                  content: 'Akad Nikah',
                  style: { fontSize: 18, color: '#1e293b', fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center' }
                },
                {
                  id: `event-date-1-${timestamp}`,
                  type: 'text',
                  content: '📅 {{event_date}} • 🕘 {{event_time}}',
                  style: { fontSize: 13, color: '#e36397', fontWeight: '600', fontFamily: 'Inter', textAlign: 'center' }
                },
                {
                  id: `event-loc-1-${timestamp}`,
                  type: 'text',
                  content: '📍 {{event_location}}',
                  style: { fontSize: 13, color: '#334155', fontWeight: 'bold', fontFamily: 'Inter', textAlign: 'center' }
                },
                {
                  id: `event-addr-1-${timestamp}`,
                  type: 'text',
                  content: 'Jl. Asia Afrika No. 8, Bandung',
                  style: { fontSize: 12, color: '#64748b', fontFamily: 'Inter', textAlign: 'center', margin: '0px 0px 8px 0px' }
                },
                {
                  id: `action-row-1-${timestamp}`,
                  type: 'container',
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                    width: '100%',
                    backgroundColor: 'transparent',
                    padding: '0px',
                    margin: '6px 0px 0px 0px'
                  },
                  children: [
                    {
                      id: `btn-map-1-${timestamp}`,
                      type: 'button',
                      buttonAction: 'google-maps',
                      buttonIcon: '📍',
                      iconPosition: 'left',
                      iconGap: 6,
                      content: 'Google Maps',
                      style: { backgroundColor: '#e36397', color: '#ffffff', fontSize: 12, fontWeight: 'bold', padding: '8px 16px', borderRadius: 20, width: 'auto' }
                    },
                    {
                      id: `btn-cal-1-${timestamp}`,
                      type: 'button',
                      buttonAction: 'save-calendar',
                      buttonIcon: '📅',
                      iconPosition: 'left',
                      iconGap: 6,
                      content: 'Simpan Kalender',
                      style: { backgroundColor: '#3b82f6', color: '#ffffff', fontSize: 12, fontWeight: 'bold', padding: '8px 16px', borderRadius: 20, width: 'auto' }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];
      break;

    case 'rsvp':
      newWidget.type = 'container';
      newWidget.widgetType = 'rsvp-form';
      newWidget.style = {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 14,
        padding: '28px 20px',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        width: '100%',
        margin: '0px 0px 24px 0px'
      };
      newWidget.children = [
        {
          id: `heading-rsvp-${timestamp}`,
          type: 'heading',
          content: 'Konfirmasi Kehadiran (RSVP)',
          style: { fontSize: 22, color: '#e36397', textAlign: 'center', fontFamily: 'Playfair Display', fontWeight: 'bold' }
        },
        {
          id: `text-rsvp-${timestamp}`,
          type: 'text',
          content: 'Mohon isi formulir di bawah ini untuk mengonfirmasi kehadiran Anda pada hari bahagia kami.',
          style: { fontSize: 12, color: '#64748b', textAlign: 'center', fontFamily: 'Inter', margin: '0px 0px 10px 0px' }
        },
        {
          id: `lbl-name-${timestamp}`,
          type: 'text',
          content: 'Nama Lengkap Tamu',
          style: { fontSize: 12, color: '#334155', fontWeight: 'bold', fontFamily: 'Inter', textAlign: 'left', margin: '0px 0px 4px 0px' }
        },
        {
          id: `inp-name-${timestamp}`,
          type: 'input',
          inputName: 'guest_name',
          placeholder: 'Masukkan nama lengkap Anda...',
          style: { width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 13, backgroundColor: '#f8fafc', color: '#1e293b', borderStyle: 'solid', borderWidth: 1, borderColor: '#cbd5e1' }
        },
        {
          id: `lbl-att-${timestamp}`,
          type: 'text',
          content: 'Konfirmasi Kehadiran',
          style: { fontSize: 12, color: '#334155', fontWeight: 'bold', fontFamily: 'Inter', textAlign: 'left', margin: '6px 0px 4px 0px' }
        },
        {
          id: `sel-att-${timestamp}`,
          type: 'select',
          inputName: 'attendance',
          selectOptions: 'Hadir, Tidak Hadir, Ragu-ragu',
          style: { width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 13, backgroundColor: '#f8fafc', color: '#1e293b', borderStyle: 'solid', borderWidth: 1, borderColor: '#cbd5e1' }
        },
        {
          id: `lbl-pax-${timestamp}`,
          type: 'text',
          content: 'Jumlah Tamu',
          style: { fontSize: 12, color: '#334155', fontWeight: 'bold', fontFamily: 'Inter', textAlign: 'left', margin: '6px 0px 4px 0px' }
        },
        {
          id: `sel-pax-${timestamp}`,
          type: 'select',
          inputName: 'pax',
          selectOptions: '1 Orang, 2 Orang, 3 Orang, 4+ Orang',
          style: { width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 13, backgroundColor: '#f8fafc', color: '#1e293b', borderStyle: 'solid', borderWidth: 1, borderColor: '#cbd5e1' }
        },
        {
          id: `lbl-msg-${timestamp}`,
          type: 'text',
          content: 'Pesan & Doa Restu',
          style: { fontSize: 12, color: '#334155', fontWeight: 'bold', fontFamily: 'Inter', textAlign: 'left', margin: '6px 0px 4px 0px' }
        },
        {
          id: `txt-msg-${timestamp}`,
          type: 'textarea',
          inputName: 'message',
          placeholder: 'Tuliskan ucapan & doa restu... (Opsional)',
          style: { width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 13, backgroundColor: '#f8fafc', color: '#1e293b', borderStyle: 'solid', borderWidth: 1, borderColor: '#cbd5e1', height: '80px' }
        },
        {
          id: `btn-submit-rsvp-${timestamp}`,
          type: 'button',
          buttonAction: 'submit-rsvp',
          buttonIcon: '✉️',
          iconPosition: 'left',
          iconGap: 8,
          content: 'Kirim Konfirmasi & Ucapan',
          style: { backgroundColor: '#e36397', color: '#ffffff', fontSize: 14, fontWeight: 'bold', padding: '12px 24px', borderRadius: 8, width: '100%', margin: '10px 0px 0px 0px' }
        }
      ];
      break;

    case 'wishes':
      newWidget.type = 'container';
      newWidget.widgetType = 'wishes-feed';
      newWidget.style = {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 16,
        padding: '28px 20px',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        width: '100%',
        margin: '0px 0px 24px 0px'
      };
      newWidget.children = [
        {
          id: `heading-wishes-${timestamp}`,
          type: 'heading',
          content: 'Doa Restu & Ucapan Tamu',
          style: { fontSize: 22, color: '#e36397', textAlign: 'center', fontFamily: 'Playfair Display', fontWeight: 'bold' }
        },
        {
          id: `text-wishes-${timestamp}`,
          type: 'text',
          content: 'Ucapan & harapan hangat dari keluarga dan sahabat tercinta.',
          style: { fontSize: 12, color: '#64748b', textAlign: 'center', fontFamily: 'Inter', margin: '0px 0px 12px 0px' }
        },
        {
          id: `feed-list-${timestamp}`,
          type: 'container',
          isWishesFeed: true,
          style: {
            flexDirection: 'column',
            gap: 12,
            width: '100%',
            backgroundColor: 'transparent',
            padding: '0px'
          },
          children: [
            {
              id: `card-sample-1-${timestamp}`,
              type: 'container',
              style: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 6,
                padding: '14px',
                backgroundColor: '#f8fafc',
                borderRadius: 12,
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                width: '100%'
              },
              children: [
                {
                  id: `header-card-1-${timestamp}`,
                  type: 'container',
                  style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', backgroundColor: 'transparent', padding: '0px' },
                  children: [
                    { id: `name-1-${timestamp}`, type: 'heading', content: 'Budi & Partner', style: { fontSize: 14, color: '#1e293b', fontWeight: 'bold', fontFamily: 'Inter' } },
                    { id: `badge-1-${timestamp}`, type: 'text', content: '✅ Hadir', style: { fontSize: 11, color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: 12, fontWeight: 'bold' } }
                  ]
                },
                { id: `msg-1-${timestamp}`, type: 'text', content: 'Selamat menempuh hidup baru Roni & Anti! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.', style: { fontSize: 13, color: '#334155', fontFamily: 'Inter', textAlign: 'left' } },
                { id: `time-1-${timestamp}`, type: 'text', content: '🕒 10 menit yang lalu', style: { fontSize: 10, color: '#94a3b8', fontFamily: 'Inter' } }
              ]
            }
          ]
        }
      ];
      break;

    case 'input':
      newWidget.placeholder = 'Ketik di sini...';
      newWidget.inputName = 'custom_input';
      newWidget.style = { width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 13, backgroundColor: '#f8fafc', color: '#1e293b', borderStyle: 'solid', borderWidth: 1, borderColor: '#cbd5e1' };
      break;

    case 'select':
      newWidget.inputName = 'custom_select';
      newWidget.selectOptions = 'Pilihan A, Pilihan B, Pilihan C';
      newWidget.style = { width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 13, backgroundColor: '#f8fafc', color: '#1e293b', borderStyle: 'solid', borderWidth: 1, borderColor: '#cbd5e1' };
      break;

    case 'textarea':
      newWidget.placeholder = 'Ketik pesan di sini...';
      newWidget.inputName = 'custom_textarea';
      newWidget.style = { width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 13, backgroundColor: '#f8fafc', color: '#1e293b', borderStyle: 'solid', borderWidth: 1, borderColor: '#cbd5e1', height: '80px' };
      break;

    case 'button':
      newWidget.content = 'Klik Di Sini';
      newWidget.style = { backgroundColor: '#e36397', color: '#ffffff', fontSize: 14, padding: '10px 20px', borderRadius: 6, width: 'auto' };
      break;
    case 'countdown':
      newWidget.content = '2026-12-31T09:00:00';
      newWidget.style = { color: '#e36397', fontSize: 18, textAlign: 'center', fontWeight: 'bold' };
      break;
    case 'map':
      newWidget.content = '{link_maps}';
      newWidget.buttonUrl = '{link_maps}';
      newWidget.style = { borderRadius: 14, width: '100%', height: '260px' };
      break;

    case 'groom-bride':
      newWidget.type = 'container';
      newWidget.widgetType = 'groom-bride';
      newWidget.style = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        padding: '28px 20px',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
      };
      newWidget.children = [
        // Section Title Header
        {
          id: `gb-header-title-${timestamp}`,
          type: 'heading',
          content: 'Mempelai Wanita & Pria',
          style: { fontSize: 22, color: '#1e293b', fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', margin: '0px 0px 4px 0px' },
        },
        {
          id: `gb-header-sub-${timestamp}`,
          type: 'text',
          content: 'Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Ya Allah semoga berkenan mempertemukan kami dalam ikatan pernikahan yang suci.',
          style: { fontSize: 13, color: '#64748b', textAlign: 'center', fontFamily: 'Inter', margin: '0px 0px 12px 0px', lineHeight: '1.6' },
        },

        // --- 1. MEMPELAI WANITA CARD (ON TOP) ---
        {
          id: `bride-card-container-${timestamp}`,
          type: 'container',
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            backgroundColor: '#fff0f5',
            padding: '22px 16px',
            borderRadius: 16,
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: '#fbcfe8',
          },
          children: [
            // Bride Photo Avatar
            {
              id: `bride-photo-${timestamp}`,
              type: 'image',
              content: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
              style: { width: '110px', height: '110px', borderRadius: '50%', borderStyle: 'solid', borderWidth: 3, borderColor: '#ffffff', boxShadow: '0 4px 12px rgba(227,99,151,0.25)' },
            },
            // Bride Full Name
            {
              id: `bride-name-${timestamp}`,
              type: 'heading',
              content: '{bride_full}',
              style: { fontSize: 20, color: '#9d174d', fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', margin: '4px 0px 0px 0px' },
            },
            // Bride Parents Text
            {
              id: `bride-parents-${timestamp}`,
              type: 'text',
              content: 'Putri dari {ortu_wanita}',
              style: { fontSize: 13, color: '#475569', textAlign: 'center', fontFamily: 'Inter', margin: '0px' },
            },
            // Bride Social Buttons Row
            {
              id: `bride-social-row-${timestamp}`,
              type: 'container',
              style: { display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: '6px', backgroundColor: 'transparent', padding: '0px' },
              children: [
                {
                  id: `bride-ig-btn-${timestamp}`,
                  type: 'button',
                  content: 'Instagram',
                  buttonAction: 'open-instagram',
                  buttonUrl: '{ig_wanita}',
                  icon: '📸',
                  iconPosition: 'left',
                  iconGap: 6,
                  style: { backgroundColor: '#e1306c', color: '#ffffff', fontSize: 12, padding: '6px 14px', borderRadius: 20, fontWeight: 'bold' },
                },
                {
                  id: `bride-tiktok-btn-${timestamp}`,
                  type: 'button',
                  content: 'TikTok',
                  buttonAction: 'open-tiktok',
                  buttonUrl: '{tiktok_wanita}',
                  icon: '🎵',
                  iconPosition: 'left',
                  iconGap: 6,
                  style: { backgroundColor: '#000000', color: '#ffffff', fontSize: 12, padding: '6px 14px', borderRadius: 20, fontWeight: 'bold' },
                },
              ],
            },
          ],
        },

        // --- ORNAMENT DIVIDER (& / 🤍) ---
        {
          id: `gb-divider-symbol-${timestamp}`,
          type: 'heading',
          content: '&',
          style: { fontSize: 28, color: '#e36397', fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', margin: '4px 0px' },
        },

        // --- 2. MEMPELAI PRIA CARD (ON BOTTOM) ---
        {
          id: `groom-card-container-${timestamp}`,
          type: 'container',
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            backgroundColor: '#f0f9ff',
            padding: '22px 16px',
            borderRadius: 16,
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: '#bae6fd',
          },
          children: [
            // Groom Photo Avatar
            {
              id: `groom-photo-${timestamp}`,
              type: 'image',
              content: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
              style: { width: '110px', height: '110px', borderRadius: '50%', borderStyle: 'solid', borderWidth: 3, borderColor: '#ffffff', boxShadow: '0 4px 12px rgba(14,165,233,0.25)' },
            },
            // Groom Full Name
            {
              id: `groom-name-${timestamp}`,
              type: 'heading',
              content: '{groom_full}',
              style: { fontSize: 20, color: '#0369a1', fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', margin: '4px 0px 0px 0px' },
            },
            // Groom Parents Text
            {
              id: `groom-parents-${timestamp}`,
              type: 'text',
              content: 'Putra dari {ortu_pria}',
              style: { fontSize: 13, color: '#475569', textAlign: 'center', fontFamily: 'Inter', margin: '0px' },
            },
            // Groom Social Buttons Row
            {
              id: `groom-social-row-${timestamp}`,
              type: 'container',
              style: { display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: '6px', backgroundColor: 'transparent', padding: '0px' },
              children: [
                {
                  id: `groom-ig-btn-${timestamp}`,
                  type: 'button',
                  content: 'Instagram',
                  buttonAction: 'open-instagram',
                  buttonUrl: '{ig_pria}',
                  icon: '📸',
                  iconPosition: 'left',
                  iconGap: 6,
                  style: { backgroundColor: '#e1306c', color: '#ffffff', fontSize: 12, padding: '6px 14px', borderRadius: 20, fontWeight: 'bold' },
                },
                {
                  id: `groom-tiktok-btn-${timestamp}`,
                  type: 'button',
                  content: 'TikTok',
                  buttonAction: 'open-tiktok',
                  buttonUrl: '{tiktok_pria}',
                  icon: '🎵',
                  iconPosition: 'left',
                  iconGap: 6,
                  style: { backgroundColor: '#000000', color: '#ffffff', fontSize: 12, padding: '6px 14px', borderRadius: 20, fontWeight: 'bold' },
                },
              ],
            },
          ],
        },
      ];
      break;


    case 'gift-widget':
      newWidget.type = 'container';
      newWidget.widgetType = 'gift-widget';
      newWidget.style = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: '24px 20px',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
      };
      newWidget.children = [
        {
          id: `gift-header-title-${timestamp}`,
          type: 'heading',
          content: 'Tanda Kasih & Hadiah Digital',
          style: { fontSize: 20, color: '#1e293b', fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', margin: '0px 0px 4px 0px' },
        },
        {
          id: `gift-header-sub-${timestamp}`,
          type: 'text',
          content: 'Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, Anda dapat mengirimi hadiah melalui:',
          style: { fontSize: 12, color: '#64748b', textAlign: 'center', fontFamily: 'Inter', margin: '0px 0px 12px 0px', lineHeight: '1.6' },
        },
        {
          id: `gift-cards-wrapper-${timestamp}`,
          type: 'container',
          style: { width: '100%', backgroundColor: 'transparent', padding: '0px' },
          children: [],
        },
      ];
      break;

    case 'gallery':
    case 'gallery-feed':
      newWidget.type = 'container';
      newWidget.widgetType = 'gallery-feed';
      newWidget.style = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: '32px 20px',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
      };
      newWidget.children = [
        {
          id: `gal-header-title-${timestamp}`,
          type: 'heading',
          content: 'Galeri Foto Bahagia',
          style: { fontSize: 22, color: '#1e293b', fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', margin: '0px 0px 4px 0px' },
        },
        {
          id: `gal-header-sub-${timestamp}`,
          type: 'text',
          content: 'Momen-momen indah kebersamaan kami yang terekam dalam kenangan abadi.',
          style: { fontSize: 13, color: '#64748b', textAlign: 'center', fontFamily: 'Inter', margin: '0px 0px 12px 0px', lineHeight: '1.6' },
        },
      ];
      break;

    case 'lovestory':
      newWidget.type = 'container';
      newWidget.widgetType = 'lovestory';
      newWidget.style = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: '32px 20px',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
      };
      newWidget.children = [
        {
          id: `ls-header-title-${timestamp}`,
          type: 'heading',
          content: 'Kisah Cinta Kami (Love Story)',
          style: { fontSize: 22, color: '#1e293b', fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', margin: '0px 0px 4px 0px' },
        },
        {
          id: `ls-header-sub-${timestamp}`,
          type: 'text',
          content: 'Setiap kisah cinta itu indah, namun kisah cinta kami adalah favorit kami.',
          style: { fontSize: 13, color: '#64748b', textAlign: 'center', fontFamily: 'Inter', margin: '0px 0px 12px 0px', lineHeight: '1.6' },
        },
      ];
      break;

    case 'opening-prayer':
      newWidget.type = 'container';
      newWidget.widgetType = 'opening-prayer';
      newWidget.style = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        padding: '32px 24px',
        backgroundColor: '#fafaf9',
        borderRadius: 20,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e7e5e4',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      };
      newWidget.children = [
        // Bismillah Calligraphy Header
        {
          id: `op-bismillah-${timestamp}`,
          type: 'heading',
          content: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ',
          style: { fontSize: 24, color: '#e36397', fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', margin: '0px 0px 4px 0px' },
        },
        // Arabic Verse Text
        {
          id: `op-arabic-verse-${timestamp}`,
          type: 'text',
          content: '{kutipan_ayat}',
          style: { fontSize: 20, color: '#1c1917', textAlign: 'center', fontFamily: 'Playfair Display', lineHeight: '2', margin: '8px 0px' },
        },
        // Translation Text
        {
          id: `op-translation-${timestamp}`,
          type: 'text',
          content: '"{terjemahan_ayat}"',
          style: { fontSize: 13, color: '#57534e', textAlign: 'center', fontFamily: 'Inter', fontStyle: 'italic', lineHeight: '1.6', margin: '4px 0px' },
        },
        // Surah Badge
        {
          id: `op-surah-badge-${timestamp}`,
          type: 'text',
          content: '{nama_surah}',
          style: { fontSize: 12, color: '#e36397', textAlign: 'center', fontFamily: 'Inter', fontWeight: 'bold', backgroundColor: '#fce7f3', padding: '4px 14px', borderRadius: 16, margin: '8px 0px 0px 0px' },
        },
      ];
      break;

    case 'thank-you':
      newWidget.type = 'thank-you';
      newWidget.content = 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami. Atas kehadiran dan doa restunya, kami ucapkan terima kasih.';
      newWidget.style = {
        width: '100%',
        padding: '0px',
        margin: '0px 0px 16px 0px',
      };
      break;

    case 'divider':
      newWidget.style = { borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', width: '100%', margin: '12px 0px' };
      break;
    case 'spacer':
      newWidget.style = { height: 24, width: '100%' };
      break;
    case 'slider':
      newWidget.type = 'slider';
      newWidget.style = {
        width: '100%',
        height: '260px',
        borderRadius: 12,
        margin: '0px 0px 16px 0px',
        sliderInterval: 5,
        sliderEffect: 'fade',
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
      };
      break;
    default:
      break;
  }
  return newWidget;
}
