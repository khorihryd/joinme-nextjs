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
  {
    id: 'container-1',
    type: 'container',
    style: {
      flexDirection: 'column',
      justify: 'center',
      alignItems: 'center',
      gap: 16,
      padding: '60px 24px',
      backgroundColor: '#eff2ef',
      backgroundImage: '',
      backgroundVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-under-an-umbrella-40344-large.mp4',
      backgroundOverlayColor: 'rgba(0,0,0,0.25)',
      backgroundOverlayOpacity: 0.5,
      width: '100%',
      height: 'auto',
      borderRadius: 16,
      margin: '0px 0px 24px 0px',
      shapeDividerBottomType: 'wave',
      shapeDividerBottomColor: '#ffffff',
      shapeDividerBottomHeight: 70,
      shapeDividerBottomAnimate: true
    },
    children: [
      {
        id: 'heading-1',
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
          textTransform: 'uppercase'
        }
      },
      {
        id: 'heading-2',
        type: 'heading',
        content: '{{groom_name}} & {{bride_name}}',
        isDynamic: true,
        binding: 'groom_name',
        style: {
          color: '#ffffff',
          fontSize: 32,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
          margin: '0px 0px 8px 0px',
          lineHeight: '1.2'
        }
      },
      {
        id: 'text-1',
        type: 'text',
        content: 'Kami mengundang Anda untuk merayakan momen bahagia pernikahan kami.',
        style: {
          color: '#f3f4f6',
          fontSize: 12,
          textAlign: 'center',
          fontFamily: 'Inter',
          margin: '0px 0px 16px 0px'
        }
      },
      {
        id: 'button-1',
        type: 'button',
        content: 'Buka Undangan',
        style: {
          backgroundColor: '#e36397',
          color: '#ffffff',
          fontSize: 12,
          padding: '10px 24px',
          borderRadius: 8,
          width: 'auto'
        }
      }
    ]
  },
  {
    id: 'container-2',
    type: 'container',
    style: {
      flexDirection: 'column',
      justify: 'center',
      alignItems: 'center',
      gap: 16,
      padding: '40px 24px',
      backgroundColor: '#ffffff',
      width: '100%',
      borderRadius: 16,
      margin: '0px 0px 24px 0px'
    },
    children: [
      {
        id: 'heading-3',
        type: 'heading',
        content: 'Acara & Resepsi',
        style: {
          color: '#333333',
          fontSize: 22,
          textAlign: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold'
        }
      },
      {
        id: 'text-2',
        type: 'text',
        content: 'Senin, {{event_date}} • {{event_location}}',
        isDynamic: true,
        binding: 'event_date',
        style: {
          color: '#666666',
          fontSize: 13,
          textAlign: 'center',
          fontFamily: 'Inter'
        }
      },
      {
        id: 'countdown-1',
        type: 'countdown',
        content: '2026-09-21T09:00:00',
        style: {
          color: '#e36397',
          fontSize: 16,
          textAlign: 'center'
        }
      },
      {
        id: 'map-1',
        type: 'map',
        content: 'Hotel Mulia Jakarta',
        style: {
          borderRadius: 12,
          width: '100%',
          height: '200px'
        }
      }
    ]
  }
];

export function createDefaultWidget(nodeType) {
  const timestamp = Date.now();
  const newId = `${nodeType}-${timestamp}`;
  let newWidget = {
    id: newId,
    type: nodeType,
    style: { margin: '0px 0px 12px 0px' }
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
          placeholder: 'Tuliskan ucapan & doa restu untuk kedua mempelai...',
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
      newWidget.content = 'Bandung, Indonesia';
      newWidget.style = { borderRadius: 8, width: '100%', height: '200px' };
      break;
    case 'divider':
      newWidget.style = { borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', width: '100%', margin: '12px 0px' };
      break;
    case 'spacer':
      newWidget.style = { height: 24, width: '100%' };
      break;
    default:
      break;
  }
  return newWidget;
}
