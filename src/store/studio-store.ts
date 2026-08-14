'use client';

import { create } from 'zustand';
import { StudioNode, SAMPLE_VARIABLES } from '@/types';
import { DEFAULT_NODES, createDefaultWidget } from '@/studio/prefabs.js';

export { SAMPLE_VARIABLES, DEFAULT_NODES, createDefaultWidget };

export interface GlobalStyles {
  bgColor?: string;
  padding?: string;
  margin?: string;
  fontFamily?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  hideScrollbar?: boolean;
  viewportWidthDesktop?: string;
  viewportWidthTablet?: string;
  viewportWidthMobile?: string;
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

    if (eventDetails.event_date) {
      vars.event_date = eventDetails.event_date;
      vars.tanggal_acara = eventDetails.event_date;
    }
    if (eventDetails.event_time) {
      vars.event_time = eventDetails.event_time;
      vars.waktu_acara = eventDetails.event_time;
    }
    if (eventDetails.event_location) {
      vars.event_location = eventDetails.event_location;
      vars.lokasi_acara = eventDetails.event_location;
      vars.nama_lokasi = eventDetails.event_location;
    }
    if (eventDetails.address) vars.alamat_lengkap = eventDetails.address;
    if (eventDetails.city) vars.kota_acara = eventDetails.city;

    if (eventDetails.childName) vars.nama_anak = eventDetails.childName;
    if (eventDetails.birthdayName) vars.nama_yang_ultah = eventDetails.birthdayName;
    if (eventDetails.age) vars.umur = eventDetails.age;
    if (eventDetails.eventName) vars.nama_event = eventDetails.eventName;
    if (eventDetails.speakerName) vars.nama_narasumber = eventDetails.speakerName;
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
  sidebarTab: 'widgets' | 'navigator' | 'properties';
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
  setSidebarTab: (tab: 'widgets' | 'navigator' | 'properties') => void;
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
  globalStyles: {
    bgColor: '#eff2ef',
    padding: '24px',
    margin: '0px',
    fontFamily: 'Playfair Display',
  },
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
    set({ globalStyles });
  },
  updateGlobalStyles: (updated: Partial<GlobalStyles>) => {
    if (updated.fontFamily) ensureGoogleFontLoaded(updated.fontFamily);
    set({ globalStyles: { ...get().globalStyles, ...updated } });
  },
  selectNode: (selectedNodeId: string | null) => set({ selectedNodeId }),
  setViewportMode: (viewportMode: 'desktop' | 'tablet' | 'mobile') => set({ viewportMode }),
  setSidebarTab: (sidebarTab: 'widgets' | 'navigator' | 'properties') => set({ sidebarTab }),
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
    const duplicate = (n: StudioNode): StudioNode => ({
      ...n,
      id: `${n.type}-${Date.now()}`,
      content: n.content ? `${n.content} (Duplikat)` : undefined,
      children: n.children ? n.children.map(duplicate) : undefined,
    });

    const duplicateInList = (list: StudioNode[]): StudioNode[] => {
      const result: StudioNode[] = [];
      for (const n of list) {
        result.push(n);
        if (n.id === nodeId) {
          result.push(duplicate(n));
        } else if (n.children) {
          n.children = duplicateInList(n.children);
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
