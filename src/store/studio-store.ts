'use client';

import { create } from 'zustand';
import { StudioNode, SAMPLE_VARIABLES, GlobalStyles, GlobalColorTokens, GlobalTypographyTokens, GlobalSpacingTokens } from '@/types';
import { DEFAULT_NODES, createDefaultWidget } from '@/studio/prefabs.js';

export { SAMPLE_VARIABLES, DEFAULT_NODES, createDefaultWidget };
export type { GlobalStyles, GlobalColorTokens, GlobalTypographyTokens, GlobalSpacingTokens };

export const DEFAULT_GLOBAL_STYLES: GlobalStyles = {
  bgColor: '#eff2ef',
  padding: '24px',
  margin: '0px',
  fontFamily: 'Playfair Display',
  colors: {
    primary: '#8B5E3C',
    secondary: '#C9A66B',
    background: '#FDFBF7',
    surface: '#FFFFFF',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    accentLuxury: '#D4AF37',
    border: '#E2E8F0',
  },
  typography: {
    fontPrimary: 'Playfair Display',
    fontSecondary: 'Plus Jakarta Sans',
    sizeH1: 36,
    sizeH2: 28,
    sizeH3: 22,
    sizeH4: 18,
    sizeBodyLarge: 16,
    sizeBody: 14,
    sizeBodySmall: 12,
    sizeCaption: 10,
  },
  spacing: {
    marginNone: '0px',
    marginXS: '4px',
    marginSM: '8px',
    marginMD: '16px',
    marginLG: '24px',
    marginXL: '40px',
    margin2XL: '60px',
    paddingNone: '0px',
    paddingXS: '8px',
    paddingSM: '12px',
    paddingMD: '16px',
    paddingLG: '24px',
    paddingXL: '40px',
    padding2XL: '60px',
  },
};

export function getGlobalCssVariables(globalStyles?: GlobalStyles): React.CSSProperties {
  const g = globalStyles || DEFAULT_GLOBAL_STYLES;
  const colors = g.colors || DEFAULT_GLOBAL_STYLES.colors!;
  const typo = g.typography || DEFAULT_GLOBAL_STYLES.typography!;
  const spacing = g.spacing || DEFAULT_GLOBAL_STYLES.spacing!;

  return {
    '--global-primary': colors.primary || '#8B5E3C',
    '--global-secondary': colors.secondary || '#C9A66B',
    '--global-background': colors.background || '#FDFBF7',
    '--global-surface': colors.surface || '#FFFFFF',
    '--global-text-primary': colors.textPrimary || '#1E293B',
    '--global-text-secondary': colors.textSecondary || '#64748B',
    '--global-accent-luxury': colors.accentLuxury || '#D4AF37',
    '--global-border': colors.border || '#E2E8F0',
    '--global-font-primary': `"${typo.fontPrimary || 'Playfair Display'}", serif`,
    '--global-font-secondary': `"${typo.fontSecondary || 'Plus Jakarta Sans'}", sans-serif`,
    '--global-size-h1': `${typo.sizeH1 || 36}px`,
    '--global-size-h2': `${typo.sizeH2 || 28}px`,
    '--global-size-h3': `${typo.sizeH3 || 22}px`,
    '--global-size-h4': `${typo.sizeH4 || 18}px`,
    '--global-size-body-large': `${typo.sizeBodyLarge || 16}px`,
    '--global-size-body': `${typo.sizeBody || 14}px`,
    '--global-size-body-small': `${typo.sizeBodySmall || 12}px`,
    '--global-size-caption': `${typo.sizeCaption || 10}px`,
    '--global-margin-none': spacing.marginNone || '0px',
    '--global-margin-xs': spacing.marginXS || '4px',
    '--global-margin-sm': spacing.marginSM || '8px',
    '--global-margin-md': spacing.marginMD || '16px',
    '--global-margin-lg': spacing.marginLG || '24px',
    '--global-margin-xl': spacing.marginXL || '40px',
    '--global-margin-2xl': spacing.margin2XL || '60px',
    '--global-padding-none': spacing.paddingNone || '0px',
    '--global-padding-xs': spacing.paddingXS || '8px',
    '--global-padding-sm': spacing.paddingSM || '12px',
    '--global-padding-md': spacing.paddingMD || '16px',
    '--global-padding-lg': spacing.paddingLG || '24px',
    '--global-padding-xl': spacing.paddingXL || '40px',
    '--global-padding-2xl': spacing.padding2XL || '60px',
  } as React.CSSProperties;
}

export function ensureGoogleFontLoaded(fontFamily: string) {
  if (typeof document === 'undefined' || !fontFamily || fontFamily === 'inherit' || fontFamily.trim() === '') return;
  const linkId = `gfont-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@300;400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

export function loadNodeFonts(nodeList: StudioNode[]) {
  if (!nodeList) return;
  nodeList.forEach((node) => {
    const style = node.style || {};
    if (typeof style.fontFamily === 'string') ensureGoogleFontLoaded(style.fontFamily);
    if (typeof style.fontFamilyTablet === 'string') ensureGoogleFontLoaded(style.fontFamilyTablet);
    if (typeof style.fontFamilyMobile === 'string') ensureGoogleFontLoaded(style.fontFamilyMobile);

    if (node.children && node.children.length > 0) {
      loadNodeFonts(node.children);
    }
  });
}

export function resolveTextVariables(text: string, eventDetails?: any): string {
  if (!text) return '';
  let res = text;

  const vars: Record<string, string> = { ...SAMPLE_VARIABLES };

  if (eventDetails) {
    if (eventDetails.guestName || eventDetails.guest_name) vars.guest_name = eventDetails.guestName || eventDetails.guest_name;
    if (eventDetails.guestName || eventDetails.guest_name) vars.nama_tamu = eventDetails.guestName || eventDetails.guest_name;
    if (eventDetails.mempelaiPria) {
      vars.groom_name = eventDetails.mempelaiPria;
      vars.groom_full = eventDetails.mempelaiPria;
    }
    if (eventDetails.panggilanPria) vars.nama_pria = eventDetails.panggilanPria;
    if (eventDetails.mempelaiWanita) {
      vars.bride_name = eventDetails.mempelaiWanita;
      vars.bride_full = eventDetails.mempelaiWanita;
    }
    if (eventDetails.panggilanWanita) vars.nama_wanita = eventDetails.panggilanWanita;
    if (eventDetails.panggilanPria && eventDetails.panggilanWanita) {
      vars.couple_name = `${eventDetails.panggilanPria} & ${eventDetails.panggilanWanita}`;
      vars.nama_mempelai = `${eventDetails.panggilanPria} & ${eventDetails.panggilanWanita}`;
    }
    if (eventDetails.ortuPria) vars.ortu_pria = eventDetails.ortuPria;
    if (eventDetails.ortuWanita) vars.ortu_wanita = eventDetails.ortuWanita;

    if (eventDetails.event_title || eventDetails.eventTitle || eventDetails.nama_acara || eventDetails.title) {
      const eTitle = eventDetails.event_title || eventDetails.eventTitle || eventDetails.nama_acara || eventDetails.title;
      vars.event_title = eTitle;
      vars.nama_acara = eTitle;
      vars.title = eTitle;
    }
    if (eventDetails.event_date || eventDetails.tanggal_acara) {
      const eDate = eventDetails.event_date || eventDetails.tanggal_acara;
      vars.event_date = eDate;
      vars.tanggal_acara = eDate;
    }
    if (eventDetails.event_time || eventDetails.waktu_acara) {
      const eTime = eventDetails.event_time || eventDetails.waktu_acara;
      vars.event_time = eTime;
      vars.waktu_acara = eTime;
    }
    if (eventDetails.event_location || eventDetails.lokasi_acara || eventDetails.place) {
      const eLoc = eventDetails.event_location || eventDetails.lokasi_acara || eventDetails.place;
      vars.event_location = eLoc;
      vars.lokasi_acara = eLoc;
      vars.nama_lokasi = eLoc;
    }
    if (eventDetails.address || eventDetails.event_address || eventDetails.alamat_lengkap) {
      const eAddr = eventDetails.address || eventDetails.event_address || eventDetails.alamat_lengkap;
      vars.event_address = eAddr;
      vars.alamat_lengkap = eAddr;
    }
    if (eventDetails.city) vars.kota_acara = eventDetails.city;

    if (eventDetails.coverTitle) {
      vars.cover_title = eventDetails.coverTitle;
      vars.judul_sampul = eventDetails.coverTitle;
    }
    if (eventDetails.coverCoupleName) {
      vars.cover_couple_name = eventDetails.coverCoupleName;
      vars.nama_mempelai_cover = eventDetails.coverCoupleName;
      vars.nama_mempelai = eventDetails.coverCoupleName;
      vars.couple_name = eventDetails.coverCoupleName;
    }

    if (eventDetails.childName) vars.nama_anak = eventDetails.childName;
    if (eventDetails.birthdayName) vars.nama_yang_ultah = eventDetails.birthdayName;
    if (eventDetails.age) vars.umur = eventDetails.age;
    if (eventDetails.eventName) vars.nama_event = eventDetails.eventName;
    if (eventDetails.speakerName) vars.nama_narasumber = eventDetails.speakerName;

    // Instagram usernames
    if (eventDetails.igPria) {
      vars.ig_pria = eventDetails.igPria;
      vars.instagram_pria = eventDetails.igPria;
    }
    if (eventDetails.igWanita) {
      vars.ig_wanita = eventDetails.igWanita;
      vars.instagram_wanita = eventDetails.igWanita;
    }

    // Gift address
    if (eventDetails.giftAddress || eventDetails.gift_address || eventDetails.alamat_kado) {
      const gAddr = eventDetails.giftAddress || eventDetails.gift_address || eventDetails.alamat_kado;
      vars.gift_address = gAddr;
      vars.alamat_kado = gAddr;
    }

    // Opening prayer / verse
    if (eventDetails.kutipanAyat || eventDetails.kutipan_ayat) {
      const ayat = eventDetails.kutipanAyat || eventDetails.kutipan_ayat;
      vars.kutipan_ayat = ayat;
      vars.opening_verse = ayat;
    }
    if (eventDetails.namaSurah || eventDetails.nama_surah) {
      const surah = eventDetails.namaSurah || eventDetails.nama_surah;
      vars.nama_surah = surah;
      vars.surah_name = surah;
    }
    if (eventDetails.terjemahanAyat || eventDetails.terjemahan_ayat) {
      const terj = eventDetails.terjemahanAyat || eventDetails.terjemahan_ayat;
      vars.terjemahan_ayat = terj;
      vars.verse_translation = terj;
    }

    // Hashtag
    if (eventDetails.hashtag) {
      vars.hashtag = eventDetails.hashtag;
    }

    // Opening greeting
    if (eventDetails.salamPembuka || eventDetails.salam_pembuka) {
      const salam = eventDetails.salamPembuka || eventDetails.salam_pembuka;
      vars.salam_pembuka = salam;
      vars.opening_greeting = salam;
    }

    // Closing message & family name
    if (eventDetails.pesanPenutup || eventDetails.pesan_penutup) {
      const pesan = eventDetails.pesanPenutup || eventDetails.pesan_penutup;
      vars.pesan_penutup = pesan;
      vars.closing_message = pesan;
    }
    if (eventDetails.namaKeluargaPenutup || eventDetails.nama_keluarga_penutup) {
      const keluarga = eventDetails.namaKeluargaPenutup || eventDetails.nama_keluarga_penutup;
      vars.nama_keluarga_penutup = keluarga;
      vars.closing_family = keluarga;
    }

    // Music URL
    if (eventDetails.musicUrl || eventDetails.music_url) {
      vars.music_url = eventDetails.musicUrl || eventDetails.music_url;
    }

    if (eventDetails.story_year || eventDetails.year) {
      const sYear = eventDetails.story_year || eventDetails.year;
      vars.story_year = sYear;
      vars.tahun_momen = sYear;
    }
    if (eventDetails.story_title || eventDetails.storyTitle) {
      const sTitle = eventDetails.story_title || eventDetails.storyTitle;
      vars.story_title = sTitle;
      vars.judul_momen = sTitle;
    }
    if (eventDetails.story_description || eventDetails.storyDescription || eventDetails.description) {
      const sDesc = eventDetails.story_description || eventDetails.storyDescription || eventDetails.description;
      vars.story_description = sDesc;
      vars.deskripsi_momen = sDesc;
    }
    if (eventDetails.story_image || eventDetails.photo || eventDetails.image) {
      vars.story_image = eventDetails.story_image || eventDetails.photo || eventDetails.image;
    }
  }

  Object.keys(vars).forEach((k) => {
    const val = vars[k];
    res = res.replaceAll(`{{${k}}}`, val);
    res = res.replaceAll(`{${k}}`, val);
    res = res.replaceAll(`[${k}]`, val);
  });

  return res;
}

export function findNodeById(nodes: StudioNode[], targetId: string): StudioNode | null {
  if (targetId === 'canvas') return null;
  for (const n of nodes) {
    if (n.id === targetId) return n;
    if (n.children) {
      const found = findNodeById(n.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

export function findParentNode(nodes: StudioNode[], targetId: string): StudioNode | null {
  for (const n of nodes) {
    if (n.children?.some((child) => child.id === targetId)) {
      return n;
    }
    if (n.children) {
      const found = findParentNode(n.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

export interface WishItem {
  id: string;
  name: string;
  attendance: string;
  message: string;
  createdAt: string;
}

export const DEFAULT_SAMPLE_STORIES = [
  {
    year: '2020',
    date: '12 Jan 2020',
    title: 'Pertama Kali Bertemu',
    description: 'Pertama kali saling mengenal di kampus saat kegiatan orientasi mahasiswa dan mulai menjadi teman dekat.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500',
  },
  {
    year: '2023',
    date: '20 Ags 2023',
    title: 'Momen Lamaran Khidmat',
    description: 'Momen berharga saat kedua keluarga besar saling bertemu dan bertukar niat suci menuju jenjang pernikahan.',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500',
  },
  {
    year: '2026',
    date: '21 Sept 2026',
    title: 'Mengikat Janji Suci',
    description: 'Hari bahagia yang dinantikan untuk mengikat janji suci dan mengarungi hidup bersama selamanya.',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500',
  },
];

export const DEFAULT_SAMPLE_SCHEDULES = [
  {
    title: 'Akad Nikah',
    name: 'Akad Nikah',
    date: '21 September 2026',
    time: '08:00 - 10:00 WIB',
    place: 'Grand Ballroom Hotel Mulia, Jakarta',
    address: 'Jl. Asia Afrika No. 8, Gelora, Senayan, Jakarta Pusat',
    mapsUrl: 'https://maps.google.com',
  },
  {
    title: 'Resepsi Pernikahan',
    name: 'Resepsi Pernikahan',
    date: '21 September 2026',
    time: '11:00 - 14:00 WIB',
    place: 'Grand Ballroom Hotel Mulia, Jakarta',
    address: 'Jl. Asia Afrika No. 8, Gelora, Senayan, Jakarta Pusat',
    mapsUrl: 'https://maps.google.com',
  },
];

export const DEFAULT_SAMPLE_BANKS = [
  {
    bankName: 'BCA',
    accountNumber: '1234567890',
    accountHolder: 'Roni Wijaya',
  },
  {
    bankName: 'Bank Mandiri',
    accountNumber: '0987654321',
    accountHolder: 'Anti Kartika',
  },
];

export const DEFAULT_SAMPLE_GALLERY = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
  'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=600',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600',
];

const DEFAULT_SAMPLE_WISHES: WishItem[] = [
  {
    id: 'sample-1',
    name: 'Budi & Partner',
    attendance: '✅ Hadir',
    message: 'Selamat ya Roni & Anti! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Aamiin.',
    createdAt: '10 menit lalu',
  },
  {
    id: 'sample-2',
    name: 'Siti & Keluarga',
    attendance: '✅ Hadir',
    message: 'Selamat menempuh hidup baru! Semoga bahagia dan diberikan keturunan yang soleh & solehah.',
    createdAt: '1 jam lalu',
  },
  {
    id: 'sample-3',
    name: 'Andi Pratama',
    attendance: '🙏 Maaf Tidak Bisa Hadir',
    message: 'Selamat bro! Maaf belum bisa hadir langsung karena tugas, doa terbaik untuk kalian berdua.',
    createdAt: '3 jam lalu',
  },
];

export interface SubmittedRsvpData {
  name: string;
  attendance: string;
  pax?: string;
  message?: string;
}

interface StudioStore {
  nodes: StudioNode[];
  globalStyles: GlobalStyles;
  selectedNodeId: string | null;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  sidebarTab: 'widgets' | 'navigator' | 'global' | 'properties';
  activeInspectorTab: 'layout' | 'style' | 'advanced';
  lastFocusedInput: HTMLInputElement | HTMLTextAreaElement | null;
  wishes: WishItem[];
  submittedRsvp: SubmittedRsvpData | null;
  setSubmittedRsvp: (data: SubmittedRsvpData | null) => void;
  addWish: (wish: Omit<WishItem, 'id' | 'createdAt'>) => void;
  setNodes: (nodes: StudioNode[]) => void;
  setGlobalStyles: (styles: GlobalStyles) => void;
  updateGlobalStyles: (updatedStyles: Partial<GlobalStyles>) => void;
  selectNode: (id: string | null) => void;
  setViewportMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  setSidebarTab: (tab: 'widgets' | 'navigator' | 'global' | 'properties') => void;
  setActiveInspectorTab: (tab: 'layout' | 'style' | 'advanced') => void;
  setLastFocusedInput: (input: HTMLInputElement | HTMLTextAreaElement | null) => void;
  updateNode: (updatedNode: StudioNode) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  moveNode: (id: string, direction: 'up' | 'down') => void;
  nestNodeIntoContainer: (nodeId: string, targetContainerId: string | null) => void;
  resetNodes: () => void;
}

export const useStudioStore = create<StudioStore>((set, get) => ({
  nodes: DEFAULT_NODES as unknown as StudioNode[],
  globalStyles: { ...DEFAULT_GLOBAL_STYLES },
  selectedNodeId: 'container-1',
  viewportMode: 'desktop',
  sidebarTab: 'widgets',
  activeInspectorTab: 'layout',
  lastFocusedInput: null,
  wishes: DEFAULT_SAMPLE_WISHES,
  submittedRsvp: null,
  setSubmittedRsvp: (submittedRsvp) => set({ submittedRsvp }),
  addWish: (newWish) =>
    set((state) => ({
      wishes: [
        {
          id: `wish-${Date.now()}`,
          name: newWish.name,
          attendance: newWish.attendance,
          message: newWish.message,
          createdAt: 'Baru saja',
        },
        ...state.wishes,
      ],
    })),
  setNodes: (nodes: StudioNode[]) => {
    loadNodeFonts(nodes);
    set({ nodes });
  },
  setGlobalStyles: (globalStyles: GlobalStyles) => {
    if (globalStyles.fontFamily) ensureGoogleFontLoaded(globalStyles.fontFamily);
    if (globalStyles.typography?.fontPrimary) ensureGoogleFontLoaded(globalStyles.typography.fontPrimary);
    if (globalStyles.typography?.fontSecondary) ensureGoogleFontLoaded(globalStyles.typography.fontSecondary);
    
    // Deep merge with defaults so that missing properties are safely populated
    const merged: GlobalStyles = {
      ...DEFAULT_GLOBAL_STYLES,
      ...globalStyles,
      colors: {
        ...DEFAULT_GLOBAL_STYLES.colors!,
        ...(globalStyles.colors || {}),
      },
      typography: {
        ...DEFAULT_GLOBAL_STYLES.typography!,
        ...(globalStyles.typography || {}),
      },
      spacing: {
        ...DEFAULT_GLOBAL_STYLES.spacing!,
        ...(globalStyles.spacing || {}),
      },
    };
    set({ globalStyles: merged });
  },
  updateGlobalStyles: (updated: Partial<GlobalStyles>) => {
    if (updated.fontFamily) ensureGoogleFontLoaded(updated.fontFamily);
    if (updated.typography?.fontPrimary) ensureGoogleFontLoaded(updated.typography.fontPrimary);
    if (updated.typography?.fontSecondary) ensureGoogleFontLoaded(updated.typography.fontSecondary);

    const prev = get().globalStyles || DEFAULT_GLOBAL_STYLES;
    const nextStyles: GlobalStyles = {
      ...prev,
      ...updated,
      colors: updated.colors ? { ...(prev.colors || DEFAULT_GLOBAL_STYLES.colors!), ...updated.colors } : prev.colors,
      typography: updated.typography ? { ...(prev.typography || DEFAULT_GLOBAL_STYLES.typography!), ...updated.typography } : prev.typography,
      spacing: updated.spacing ? { ...(prev.spacing || DEFAULT_GLOBAL_STYLES.spacing!), ...updated.spacing } : prev.spacing,
    };
    set({ globalStyles: nextStyles });
  },
  selectNode: (selectedNodeId: string | null) => set({ selectedNodeId }),
  setViewportMode: (viewportMode: 'desktop' | 'tablet' | 'mobile') => set({ viewportMode }),
  setSidebarTab: (sidebarTab: 'widgets' | 'navigator' | 'global' | 'properties') => set({ sidebarTab }),
  setActiveInspectorTab: (activeInspectorTab: 'layout' | 'style' | 'advanced') => set({ activeInspectorTab }),
  setLastFocusedInput: (lastFocusedInput: HTMLInputElement | HTMLTextAreaElement | null) => set({ lastFocusedInput }),
  updateNode: (updatedNode: StudioNode) => {
    loadNodeFonts([updatedNode]);
    const modifyNode = (list: StudioNode[]): StudioNode[] =>
      list.map((n) => {
        if (n.id === updatedNode.id) return updatedNode;
        if (n.children) return { ...n, children: modifyNode(n.children) };
        return n;
      });
    set({ nodes: modifyNode(get().nodes) });
  },
  deleteNode: (nodeId: string) => {
    const filterNodes = (list: StudioNode[]): StudioNode[] =>
      list
        .filter((n) => n.id !== nodeId)
        .map((n) => (n.children ? { ...n, children: filterNodes(n.children) } : n));

    const currentSelected = get().selectedNodeId;
    set({
      nodes: filterNodes(get().nodes),
      selectedNodeId: currentSelected === nodeId ? null : currentSelected,
    });
  },
  duplicateNode: (nodeId: string) => {
    const generateUniqueId = (type: string) =>
      `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const duplicate = (n: StudioNode): StudioNode => ({
      ...n,
      id: generateUniqueId(n.type),
      content: n.content ? (n.type === 'container' || Boolean(n.sectionType) ? n.content : `${n.content} (Duplikat)`) : undefined,
      children: n.children ? n.children.map(duplicate) : undefined,
    });

    const duplicateInList = (list: StudioNode[]): StudioNode[] => {
      const result: StudioNode[] = [];
      for (const n of list) {
        if (n.id === nodeId) {
          result.push(n);
          result.push(duplicate(n));
        } else if (n.children && n.children.length > 0) {
          result.push({
            ...n,
            children: duplicateInList(n.children),
          });
        } else {
          result.push(n);
        }
      }
      return result;
    };

    set({ nodes: duplicateInList(get().nodes) });
  },
  moveNode: (nodeId: string, direction: 'up' | 'down') => {
    const moveInList = (list: StudioNode[]): StudioNode[] => {
      const idx = list.findIndex((n) => n.id === nodeId);
      if (idx !== -1) {
        const copy = [...list];
        if (direction === 'up' && idx > 0) {
          const temp = copy[idx];
          copy[idx] = copy[idx - 1];
          copy[idx - 1] = temp;
        } else if (direction === 'down' && idx < copy.length - 1) {
          const temp = copy[idx];
          copy[idx] = copy[idx + 1];
          copy[idx + 1] = temp;
        }
        return copy;
      }
      return list.map((n) => (n.children ? { ...n, children: moveInList(n.children) } : n));
    };

    set({ nodes: moveInList(get().nodes) });
  },
  nestNodeIntoContainer: (nodeId: string, targetContainerId: string | null) => {
    const currentNodes = get().nodes;

    let movedNode: StudioNode | null = null;

    const extractNode = (list: StudioNode[]): StudioNode[] => {
      const result: StudioNode[] = [];
      for (const item of list) {
        if (item.id === nodeId) {
          movedNode = item;
        } else {
          if (item.children) {
            result.push({ ...item, children: extractNode(item.children) });
          } else {
            result.push(item);
          }
        }
      }
      return result;
    };

    const treeWithoutNode = extractNode(currentNodes);
    if (!movedNode) return;

    if (targetContainerId === null) {
      set({ nodes: [...treeWithoutNode, movedNode], selectedNodeId: nodeId });
      return;
    }

    const insertIntoTarget = (list: StudioNode[]): StudioNode[] => {
      return list.map((item) => {
        if (item.id === targetContainerId) {
          const currentChildren = Array.isArray(item.children) ? item.children : [];
          return { ...item, children: [...currentChildren, movedNode!] };
        }
        if (item.children) {
          return { ...item, children: insertIntoTarget(item.children) };
        }
        return item;
      });
    };

    set({ nodes: insertIntoTarget(treeWithoutNode), selectedNodeId: nodeId });
  },
  resetNodes: () =>
    set({
      nodes: DEFAULT_NODES as unknown as StudioNode[],
      selectedNodeId: 'container-1',
      globalStyles: {
        bgColor: '#eff2ef',
        padding: '24px',
        margin: '0px',
        fontFamily: 'Playfair Display',
      },
    }),
}));
