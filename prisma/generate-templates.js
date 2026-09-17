const fs = require('fs');

const SECTIONS = [
  'cover',
  'hero',
  'opening',
  'bride_groom',
  'event_schedule',
  'live_streaming',
  'love_story',
  'gallery',
  'rsvp',
  'wishes',
  'gift',
  'ig_stories',
  'thank_you',
  'footer'
];

function createTemplate(idPrefix, config) {
  const {
    primaryColor, accentColor, bgLight, bgDark, bgCard,
    textPrimary, textSecondary, textMuted,
    headingFont, bodyFont, borderRadius,
    coverTitle,
    openingVerse,
    brideGroomLabel,
    brideGroomVars,
    isDark
  } = config;

  const bg = isDark ? bgDark : bgLight;
  const card = isDark ? bgCard : '#ffffff';
  const textH = isDark ? textPrimary : '#1e293b';
  const textP = isDark ? textSecondary : '#64748b';
  
  const nodes = [];

  // Generate 14 sections
  for (const section of SECTIONS) {
    const sectionId = `${idPrefix}-container-${section}`;
    
    const container = {
      id: sectionId,
      type: 'container',
      sectionType: section,
      label: section,
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: '32px 20px',
        backgroundColor: bg,
        width: '100%',
        margin: '0',
      },
      children: []
    };

    if (section === 'cover') {
      container.children.push({
        id: `${sectionId}-title`,
        type: 'heading',
        content: coverTitle,
        style: { fontFamily: headingFont, color: textH, fontSize: 32, textAlign: 'center' }
      });
      container.children.push({
        id: `${sectionId}-btn`,
        type: 'button',
        content: 'Buka Undangan',
        buttonAction: 'open-invitation',
        style: { backgroundColor: primaryColor, color: '#ffffff', borderRadius, padding: '12px 24px', fontFamily: bodyFont }
      });
    }
    else if (section === 'hero') {
      container.children.push({
        id: `${sectionId}-title`,
        type: 'heading',
        content: 'Kami Mengundang Anda',
        style: { fontFamily: headingFont, color: textH, fontSize: 24, textAlign: 'center' }
      });
    }
    else if (section === 'opening') {
      if (openingVerse) {
        container.children.push({
          id: `${sectionId}-verse`,
          type: 'text',
          content: openingVerse,
          style: { fontFamily: bodyFont, color: textP, fontSize: 16, textAlign: 'center', fontStyle: 'italic' }
        });
      } else {
        container.children.push({
          id: `${sectionId}-welcome`,
          type: 'text',
          content: 'Selamat datang di acara kami. Kami sangat berbahagia bisa berbagi momen ini bersama Anda.',
          style: { fontFamily: bodyFont, color: textP, fontSize: 16, textAlign: 'center' }
        });
      }
    }
    else if (section === 'bride_groom') {
      container.label = brideGroomLabel || 'Mempelai';
      container.children.push({
        id: `${sectionId}-vars`,
        type: 'text',
        content: brideGroomVars.join(' & '),
        style: { fontFamily: headingFont, color: accentColor, fontSize: 24, textAlign: 'center' }
      });
    }
    else if (section === 'event_schedule') {
      container.children.push({
        id: `${sectionId}-feed`,
        type: 'container',
        isEventFeed: true,
        style: { display: 'flex', flexDirection: 'column', gap: 16, width: '100%' },
        children: []
      });
    }
    else if (section === 'live_streaming') {
      container.children.push({
        id: `${sectionId}-title`,
        type: 'heading',
        content: 'Live Streaming',
        style: { fontFamily: headingFont, color: textH, fontSize: 20, textAlign: 'center' }
      });
    }
    else if (section === 'love_story') {
      container.children.push({
        id: `${sectionId}-title`,
        type: 'heading',
        content: 'Love Story',
        style: { fontFamily: headingFont, color: textH, fontSize: 20, textAlign: 'center' }
      });
    }
    else if (section === 'gallery') {
      container.children.push({
        id: `${sectionId}-img`,
        type: 'image',
        content: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
        showInGallery: true,
        style: { width: '100%', borderRadius }
      });
    }
    else if (section === 'rsvp') {
      container.children.push({
        id: `${sectionId}-title`,
        type: 'heading',
        content: 'Konfirmasi Kehadiran',
        style: { fontFamily: headingFont, color: textH, fontSize: 20, textAlign: 'center' }
      });
      container.children.push({
        id: `${sectionId}-desc`,
        type: 'text',
        content: 'Mohon konfirmasi kehadiran Anda sebelum acara.',
        style: { fontFamily: bodyFont, color: textP, fontSize: 14, textAlign: 'center' }
      });
    }
    else if (section === 'wishes') {
      container.children.push({
        id: `${sectionId}-feed`,
        type: 'container',
        isWishesFeed: true,
        style: { display: 'flex', flexDirection: 'column', gap: 16, width: '100%' },
        children: []
      });
    }
    else if (section === 'gift') {
      container.children.push({
        id: `${sectionId}-title`,
        type: 'heading',
        content: 'Wedding Gift',
        style: { fontFamily: headingFont, color: textH, fontSize: 20, textAlign: 'center' }
      });
    }
    else if (section === 'ig_stories') {
      container.children.push({
        id: `${sectionId}-title`,
        type: 'heading',
        content: 'Instagram Stories',
        style: { fontFamily: headingFont, color: textH, fontSize: 20, textAlign: 'center' }
      });
    }
    else if (section === 'thank_you') {
      container.children.push({
        id: `${sectionId}-title`,
        type: 'heading',
        content: 'Terima Kasih',
        style: { fontFamily: headingFont, color: textH, fontSize: 20, textAlign: 'center' }
      });
    }
    else if (section === 'footer') {
      container.children.push({
        id: `${sectionId}-desc`,
        type: 'text',
        content: 'Powered by JoinMe',
        style: { fontFamily: bodyFont, color: textP, fontSize: 12, textAlign: 'center' }
      });
    }

    nodes.push(container);
  }

  const globalStyles = {
    backgroundColor: bg,
    padding: '0px',
    margin: '0px',
    fontFamily: bodyFont
  };

  return { globalStyles, nodes };
}

const templates = {
  SAGE_GREEN: {
    primaryColor: '#6b7c5e', accentColor: '#b8860b', bgLight: '#f5f0e8', bgDark: '#1a1a1a', bgCard: '#ffffff',
    textPrimary: '#1e293b', textSecondary: '#64748b', textMuted: '#94a3b8',
    headingFont: 'Cormorant Garamond', bodyFont: 'Lora', borderRadius: 20,
    coverTitle: 'THE WEDDING OF',
    openingVerse: '"Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri..." (QS. Ar-Rum: 21)',
    brideGroomLabel: 'Mempelai',
    brideGroomVars: ['{nama_mempelai_pria}', '{nama_mempelai_wanita}'],
    isDark: false
  },
  NEON_PARTY: {
    primaryColor: '#ff2d95', accentColor: '#00d4ff', bgLight: '#f5f0e8', bgDark: '#0f0f1a', bgCard: '#1a1a2e',
    textPrimary: '#f0f0f0', textSecondary: '#a0a0b0', textMuted: '#94a3b8',
    headingFont: 'Space Grotesk', bodyFont: 'Inter', borderRadius: 16,
    coverTitle: '🎉 HAPPY BIRTHDAY',
    openingVerse: null,
    brideGroomLabel: 'Section Profil Yang Berulang Tahun',
    brideGroomVars: ['{nama_yang_ultah}'],
    isDark: true
  },
  WARM_BOTANICAL: {
    primaryColor: '#8b5e3c', accentColor: '#c4775a', bgLight: '#faf6f0', bgDark: '#1a1a1a', bgCard: '#ffffff',
    textPrimary: '#1e293b', textSecondary: '#64748b', textMuted: '#94a3b8',
    headingFont: 'Lora', bodyFont: 'Nunito', borderRadius: 24,
    coverTitle: 'SYUKURAN',
    openingVerse: '"Sesungguhnya jika kamu bersyukur, niscaya Aku akan menambah (nikmat) kepadamu..." (QS. Ibrahim: 7)',
    brideGroomLabel: 'Penyelenggara',
    brideGroomVars: ['{penyelenggara}'],
    isDark: false
  },
  CORPORATE_GALA: {
    primaryColor: '#1a365d', accentColor: '#c4a35a', bgLight: '#ffffff', bgDark: '#1a1a1a', bgCard: '#f8fafc',
    textPrimary: '#1e293b', textSecondary: '#64748b', textMuted: '#94a3b8',
    headingFont: 'Montserrat', bodyFont: 'Open Sans', borderRadius: 12,
    coverTitle: 'YOU\'RE INVITED',
    openingVerse: null,
    brideGroomLabel: 'Speaker & Organizer',
    brideGroomVars: ['{nama_narasumber}', '{nama_event}'],
    isDark: false
  }
};

let output = `export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  bgLight: string;
  bgDark: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: number;
}
\n`;

for (const [name, config] of Object.entries(templates)) {
  const { globalStyles, nodes } = createTemplate(name.toLowerCase(), config);
  
  output += `export const ${name}_GLOBAL_STYLES = ${JSON.stringify(globalStyles, null, 2)};\n\n`;
  output += `export const ${name}_NODES = ${JSON.stringify(nodes, null, 2)};\n\n`;
}

fs.writeFileSync('/home/khori/projects/new/undangan/joinme-nextjs/prisma/template-designs.ts', output);
console.log('Generated successfully');
