/**
 * JoinMe Studio Special/Complex Widgets Creator
 */
export function getSpecialWidget(nodeType, newWidget, timestamp) {
  switch (nodeType) {
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
      newWidget.sectionType = 'gallery';
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
        {
          id: `feed-gallery-${timestamp}`,
          type: 'container',
          isGalleryFeed: true,
          label: 'Grid Galeri Foto',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 12,
            width: '100%',
          },
          children: [
            {
              id: `image-gallery-master-${timestamp}`,
              type: 'image',
              label: 'Master Item Foto Galeri',
              showInGallery: true,
              content: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
              style: {
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 14,
                objectFit: 'cover',
                boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
              },
            },
          ],
        },
      ];
      break;


    case 'lovestory':
      newWidget.type = 'container';
      newWidget.widgetType = 'lovestory';
      newWidget.sectionType = 'love_story';
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
        {
          id: `feed-lovestory-${timestamp}`,
          type: 'container',
          isStoryFeed: true,
          label: 'Daftar Kisah Cinta',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            width: '100%',
          },
          children: [
            {
              id: `card-story-master-${timestamp}`,
              type: 'container',
              label: 'Kartu Master Cerita',
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                padding: '20px 18px',
                backgroundColor: '#ffffff',
                borderRadius: 16,
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                width: '100%',
              },
              children: [
                {
                  id: `story-badge-${timestamp}`,
                  type: 'text',
                  content: '📅 {story_year}',
                  style: {
                    fontSize: 12,
                    color: '#e36397',
                    fontWeight: 'bold',
                    fontFamily: 'Inter',
                    backgroundColor: '#fdf2f8',
                    padding: '4px 14px',
                    borderRadius: 20,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderColor: '#fbcfe8',
                    textAlign: 'center',
                  },
                },
                {
                  id: `story-title-${timestamp}`,
                  type: 'heading',
                  content: '{story_title}',
                  style: {
                    fontSize: 18,
                    color: '#1e293b',
                    fontWeight: 'bold',
                    fontFamily: 'Playfair Display',
                    textAlign: 'center',
                  },
                },
                {
                  id: `story-desc-${timestamp}`,
                  type: 'text',
                  content: '{story_description}',
                  style: {
                    fontSize: 13,
                    color: '#64748b',
                    fontFamily: 'Inter',
                    textAlign: 'center',
                    lineHeight: '1.6',
                  },
                },
                {
                  id: `story-img-${timestamp}`,
                  type: 'image',
                  content: '{story_image}',
                  style: {
                    width: '100%',
                    height: '200px',
                    borderRadius: 12,
                    objectFit: 'cover',
                    margin: '8px 0px 0px 0px',
                  },
                },
              ],
            },
          ],
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
      return null;
  }
  return newWidget;
}
