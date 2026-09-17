/**
 * JoinMe Studio Interactive Widgets Creator
 */
export function getInteractiveWidget(nodeType, newWidget, timestamp) {
  switch (nodeType) {
    case 'button':
      newWidget.content = 'Klik Di Sini';
      newWidget.style = { backgroundColor: '#e36397', color: '#ffffff', fontSize: 14, padding: '10px 20px', borderRadius: 6, width: 'auto' };
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
          isGuestNameInput: true,
          placeholder: '🔒 Auto dari {nama_tamu} (Terkunci dari Link Tamu)',
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
          renderAsButtons: true,
          selectOptions: '✅ Hadir, ❌ Tidak Hadir',
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

    default:
      return null;
  }
  return newWidget;
}
