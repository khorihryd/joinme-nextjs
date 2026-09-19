import React, { useState, useEffect, useRef } from 'react';
import { StudioNode, SectionType } from '@/types';
import { resolveTextVariables, useStudioStore, WishItem, SAMPLE_VARIABLES, DEFAULT_SAMPLE_STORIES, DEFAULT_SAMPLE_SCHEDULES, DEFAULT_SAMPLE_BANKS, DEFAULT_SAMPLE_GALLERY } from '@/store/studio-store';
import { LightboxModal } from '@/components/studio/LightboxModal';
import { RsvpResultCard } from '@/components/studio/RsvpResultCard';
import { GiftRegistryCards } from '@/components/studio/GiftRegistryCards';
import { LoveStoryTimeline } from '@/components/studio/LoveStoryTimeline';
import { PhotoGalleryGrid } from '@/components/studio/PhotoGalleryGrid';
import { ThankYouClosing } from '@/components/studio/ThankYouClosing';
import { executeRegisteredFunction } from '@/utils/customFunctions';
import { normalizeSvgString, isSvgMarkup } from '@/utils/svgNormalizer';

export function getOrderedAndFilteredNodes(
  nodes: StudioNode[],
  eventDetails?: any
): StudioNode[] {
  if (!Array.isArray(nodes) || nodes.length === 0) return [];

  const sectionOrder: SectionType[] = eventDetails?.sectionOrder || [
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
    'footer',
  ];

  const hiddenSections: Record<string, boolean> = eventDetails?.hiddenSections || {};
  const isPublic = eventDetails?.isPublicInvitation === true;

  // 1. Filter out hidden containers (cover & footer can never be hidden)
  // and auto-hide empty optional sections for public guests
  const visibleNodes = nodes.filter((n) => {
    if (n.type === 'container' && n.sectionType) {
      if (n.sectionType === 'cover' || n.sectionType === 'footer') {
        // In Mini Studio mode, allow cover to be hidden when "opened"
        if (n.sectionType === 'cover' && eventDetails?.isCoverOpened && eventDetails?.isMiniStudioMode) {
          return false;
        }
        return true;
      }
      if (hiddenSections[n.sectionType] === true) return false;

      // Auto-hide rules for public guest invitations
      if (isPublic) {
        if (n.sectionType === 'love_story') {
          if (eventDetails?.showStory === false) return false;
          const stories = eventDetails?.story || eventDetails?.loveStories;
          if (!Array.isArray(stories) || stories.length === 0) return false;
        }
        if (n.sectionType === 'gallery') {
          if (eventDetails?.showGallery === false) return false;
          const gallery = eventDetails?.gallery;
          if (!Array.isArray(gallery) || gallery.length === 0) return false;
        }
        if (n.sectionType === 'live_streaming') {
          if (!eventDetails?.liveStreamUrl) return false;
        }
        if (n.sectionType === 'gift') {
          const hasBanks = (Array.isArray(eventDetails?.bankAccounts) && eventDetails.bankAccounts.length > 0) || Boolean(eventDetails?.bank1Nama);
          const hasAddress = Boolean(eventDetails?.giftAddress || eventDetails?.gift_address || eventDetails?.alamat_kado);
          if (!hasBanks && !hasAddress) return false;
        }
      }
    }
    return true;
  });

  // 2. Sort containers according to sectionOrder
  const sortedNodes = [...visibleNodes].sort((a, b) => {
    const secA = a.sectionType;
    const secB = b.sectionType;

    if (secA === 'cover') return -1;
    if (secB === 'cover') return 1;
    if (secA === 'footer') return 1;
    if (secB === 'footer') return -1;

    const idxA = secA ? sectionOrder.indexOf(secA) : 999;
    const idxB = secB ? sectionOrder.indexOf(secB) : 999;

    return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
  });

  return sortedNodes;
}

export function collectGalleryImageUrls(nodes: StudioNode[], eventDetails?: any): string[] {
  let list: string[] = [];

  const storeGlobal = typeof window !== 'undefined' ? useStudioStore.getState?.()?.globalStyles : undefined;
  const effectiveDetails = eventDetails || storeGlobal?.sampleEventDetails;
  const userPhotos =
    (Array.isArray(storeGlobal?.galleryImages) && storeGlobal.galleryImages.length > 0)
      ? storeGlobal.galleryImages
      : (Array.isArray(effectiveDetails?.galleryImages) && effectiveDetails.galleryImages.length > 0)
      ? effectiveDetails.galleryImages
      : (Array.isArray(effectiveDetails?.gallery) && effectiveDetails.gallery.length > 0 && effectiveDetails.gallery !== DEFAULT_SAMPLE_GALLERY)
      ? effectiveDetails.gallery
      : (Array.isArray(effectiveDetails?.photos) && effectiveDetails.photos.length > 0)
      ? effectiveDetails.photos
      : (Array.isArray(storeGlobal?.sampleEventDetails?.gallery) && storeGlobal.sampleEventDetails.gallery.length > 0)
      ? storeGlobal.sampleEventDetails.gallery
      : (Array.isArray(effectiveDetails?.gallery) && effectiveDetails.gallery.length > 0)
      ? effectiveDetails.gallery
      : [];
  const hasUserPhotos = Array.isArray(userPhotos) && userPhotos.length > 0;

  // 1. If userPhotos / custom gallery exists, populate list with all custom photos FIRST in order
  if (hasUserPhotos) {
    userPhotos.forEach((url: string) => {
      if (url && typeof url === 'string' && url.trim() && !list.includes(url.trim())) {
        list.push(url.trim());
      }
    });
  }

  // 2. Traverse nodes: skip gallery section placeholder items, only append standalone images outside gallery
  const traverse = (nodeList: StudioNode[], inGallerySection = false) => {
    if (!Array.isArray(nodeList)) return;

    nodeList.forEach((n) => {
      const currentInGallery = inGallerySection || isGallerySectionNode(n) || n.isGalleryFeed || n.sectionType === 'gallery' || String(n.id).includes('gallery') || String(n.id).includes('galeri');

      if (n.type === 'image' && n.showInGallery) {
        if (hasUserPhotos) {
          // If custom gallery exists, do NOT collect placeholder images from gallery section/feed
          if (!currentInGallery) {
            let imgUrl = n.content;
            if (n.isDynamic && n.binding && effectiveDetails) {
              const bound = (effectiveDetails as any)[n.binding];
              if (bound) imgUrl = bound;
            }
            if (imgUrl && !list.includes(imgUrl) && !DEFAULT_SAMPLE_GALLERY.includes(imgUrl)) {
              list.push(imgUrl);
            }
          }
        } else {
          // If no custom photos at all, collect template image nodes
          let imgUrl = n.content;
          if (n.isDynamic && n.binding && effectiveDetails) {
            const bound = (effectiveDetails as any)[n.binding];
            if (bound) imgUrl = bound;
          }
          if (imgUrl && !list.includes(imgUrl)) {
            list.push(imgUrl);
          }
        }
      }

      if (n.children && n.children.length > 0) {
        traverse(n.children, currentInGallery);
      }
    });
  };

  traverse(nodes);

  return list;
}

export function isGallerySectionNode(node: StudioNode): boolean {
  if (!node) return false;

  // If node is an inner feed container, let node.isGalleryFeed handle it
  if (node.isGalleryFeed) return false;

  const sType = String(node.sectionType || '').toLowerCase();
  const wType = String(node.widgetType || '').toLowerCase();
  const nType = String(node.type || '').toLowerCase();
  const nLabel = String(node.label || '').toLowerCase();
  const nId = String(node.id || '').toLowerCase();

  if (sType === 'gallery' || sType.includes('gallery') || sType.includes('galeri')) return true;
  if (wType === 'gallery' || wType === 'gallery-feed') return true;
  if (nType === 'gallery' || nType === 'gallery-feed') return true;
  if (nLabel.includes('section galeri') || nLabel === 'gallery') return true;
  if (nId.includes('container-gallery') || nId.includes('section-gallery')) return true;

  return false;
}

export function resolveSocialButtonUrl(action: string, rawUrlOrTag: string, eventDetails?: any): string | null {
  if (!rawUrlOrTag && !action) return null;

  let resolvedVal = rawUrlOrTag || '';
  if (resolvedVal.includes('{') && resolvedVal.includes('}')) {
    resolvedVal = resolveTextVariables(resolvedVal, eventDetails);
  }

  resolvedVal = resolvedVal.trim();
  if (!resolvedVal || resolvedVal.startsWith('{')) return null;

  const cleanHandle = resolvedVal.replace(/^@/, '');

  switch (action) {
    case 'open-instagram':
      return `https://instagram.com/${cleanHandle}`;
    case 'open-tiktok':
      return `https://tiktok.com/@${cleanHandle}`;
    case 'open-facebook':
      return `https://facebook.com/${cleanHandle}`;
    case 'open-whatsapp': {
      const cleanPhone = resolvedVal.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
      return `https://wa.me/${formattedPhone}`;
    }
    case 'open-youtube':
      return `https://youtube.com/${cleanHandle}`;
    case 'open-url':
      return resolvedVal.startsWith('http://') || resolvedVal.startsWith('https://') ? resolvedVal : `https://${resolvedVal}`;
    default:
      return resolvedVal;
  }
}

export function cloneAndBindEventData(templateNode: StudioNode, evtData: any, idx: number): StudioNode {
  const cloned: StudioNode = JSON.parse(JSON.stringify(templateNode));
  cloned.id = `${cloned.id}-evt-${idx}`;

  const evtTitle = evtData.title || evtData.name || 'Acara';
  const evtDate = evtData.date || evtData.event_date || '';
  const evtTime = evtData.time || evtData.event_time || '';
  const evtLocation = evtData.location || evtData.place || evtData.event_location || '';
  const evtAddress = evtData.address || evtData.event_address || '';

  const replaceEvtText = (text?: string): string => {
    if (!text) return '';
    let res = text;
    if (idx > 0 && res.includes('Akad Nikah')) {
      res = res.replace(/Akad Nikah/gi, evtTitle);
    }

    const vars: Record<string, string> = {
      event_title: evtTitle,
      nama_acara: evtTitle,
      title: evtTitle,
      event_date: evtDate,
      tanggal_acara: evtDate,
      date: evtDate,
      event_time: evtTime,
      waktu_acara: evtTime,
      time: evtTime,
      event_location: evtLocation,
      lokasi_acara: evtLocation,
      location: evtLocation,
      place: evtLocation,
      event_address: evtAddress,
      alamat_lengkap: evtAddress,
      address: evtAddress,
    };

    Object.keys(vars).forEach((k) => {
      const val = vars[k];
      res = res.replaceAll(`{{${k}}}`, val);
      res = res.replaceAll(`{${k}}`, val);
      res = res.replaceAll(`[${k}]`, val);
    });

    return res;
  };

  if (cloned.content) {
    cloned.content = replaceEvtText(cloned.content);
  }

  // If this node is a button for Google Maps and event data has custom mapsUrl, bind it!
  if (cloned.type === 'button' && (cloned.buttonAction === 'google-maps' || cloned.content?.toLowerCase().includes('google maps'))) {
    if (evtData.mapsUrl || evtData.mapUrl) {
      cloned.buttonUrl = evtData.mapsUrl || evtData.mapUrl;
    }
  }

  if (cloned.children && cloned.children.length > 0) {
    cloned.children = cloned.children.map((child) => cloneAndBindEventData(child, evtData, idx));
  }

  return cloned;
}

export function generateGoogleCalendarUrl(eventDetails: any): string {
  const title = eventDetails?.title || eventDetails?.couple_name || 'Acara Pernikahan';
  const location = [eventDetails?.location, eventDetails?.address].filter(Boolean).join(', ') || 'Lokasi Acara';
  const details = `Undangan Pernikahan ${title}. Diharapkan hadir memberikan doa restu.`;

  let startDateStr = '20260921T080000Z';
  let endDateStr = '20260921T110000Z';

  if (eventDetails?.date) {
    const rawDate = String(eventDetails.date);
    const match = rawDate.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
    if (match) {
      const yyyy = match[1];
      const mm = match[2];
      const dd = match[3];
      startDateStr = `${yyyy}${mm}${dd}T080000Z`;
      endDateStr = `${yyyy}${mm}${dd}T110000Z`;
    }
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateStr}/${endDateStr}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

export function cloneAndBindWishData(templateNode: StudioNode, wishItem: WishItem, idx: number): StudioNode {
  const cloned: StudioNode = JSON.parse(JSON.stringify(templateNode));
  cloned.id = `${cloned.id}-wish-${idx}`;

  const wishName = wishItem.name || 'Tamu Undangan';
  const wishAttendance = wishItem.attendance || '✅ Hadir';
  const wishMessage = wishItem.message || (wishItem as any).wishes || '';

  const replaceWishText = (text?: string): string => {
    if (!text) return '';
    return text
      .replace(/Budi & Partner/gi, wishName)
      .replace(/\{\{wish_name\}\}/gi, wishName)
      .replace(/\{\{nama_tamu\}\}/gi, wishName)
      .replace(/✅ Hadir/gi, wishAttendance)
      .replace(/\{\{wish_attendance\}\}/gi, wishAttendance)
      .replace(/\{\{status_kehadiran\}\}/gi, wishAttendance)
      .replace(/Selamat ya Roni & Anti! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Aamiin./gi, wishMessage)
      .replace(/\{\{wish_message\}\}/gi, wishMessage)
      .replace(/\{\{pesan_ucapan\}\}/gi, wishMessage);
  };

  if (cloned.content) {
    cloned.content = replaceWishText(cloned.content);
  }

  if (cloned.children && cloned.children.length > 0) {
    cloned.children = cloned.children.map((child) => cloneAndBindWishData(child, wishItem, idx));
  }

  return cloned;
}

export function cloneAndBindStoryData(templateNode: StudioNode, storyItem: any, idx: number): StudioNode {
  const cloned: StudioNode = JSON.parse(JSON.stringify(templateNode));
  cloned.id = `${cloned.id}-story-${idx}`;

  const sYear = storyItem.year || storyItem.date || '';
  const sTitle = storyItem.title || storyItem.name || 'Momen Bahagia';
  const sDesc = storyItem.description || storyItem.story || storyItem.content || '';
  const sImage = storyItem.image || storyItem.photo || '';

  const replaceStoryText = (text?: string): string => {
    if (!text) return '';
    let res = text;

    const vars: Record<string, string> = {
      story_year: sYear,
      tahun_momen: sYear,
      year: sYear,
      date: sYear,
      story_title: sTitle,
      judul_momen: sTitle,
      title: sTitle,
      name: sTitle,
      story_description: sDesc,
      deskripsi_momen: sDesc,
      description: sDesc,
      content: sDesc,
      story: sDesc,
    };

    Object.keys(vars).forEach((k) => {
      const val = vars[k];
      res = res.replaceAll(`{{${k}}}`, val);
      res = res.replaceAll(`{${k}}`, val);
      res = res.replaceAll(`[${k}]`, val);
    });

    return res;
  };

  if (cloned.content) {
    cloned.content = replaceStoryText(cloned.content);
  }

  if (cloned.type === 'image') {
    if (sImage) {
      cloned.content = sImage;
    }
  }

  if (cloned.children && cloned.children.length > 0) {
    cloned.children = cloned.children.map((child) => cloneAndBindStoryData(child, storyItem, idx));
  }

  return cloned;
}

export function cloneAndBindGalleryData(templateNode: StudioNode, imgUrl: string, idx: number): StudioNode {
  const cloned: StudioNode = JSON.parse(JSON.stringify(templateNode));
  cloned.id = `${cloned.id}-gal-${idx}`;

  if (cloned.type === 'image') {
    cloned.content = imgUrl;
    cloned.showInGallery = true;
    delete (cloned as any).binding;
    cloned.isDynamic = false;
  }

  if (cloned.children && cloned.children.length > 0) {
    cloned.children = cloned.children.map((child) => cloneAndBindGalleryData(child, imgUrl, idx));
  }

  return cloned;
}

const DEFAULT_GALLERY_FALLBACKS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&auto=format&fit=crop&q=80',
];

function ContainerSlideshowBackground({ style, allNodes, slideIndex, eventDetails }: { style: any; allNodes?: StudioNode[]; slideIndex: number; eventDetails?: any }) {
  const storeNodes = useStudioStore.getState().nodes;
  const nodesToSearch = allNodes && allNodes.length > 0 ? allNodes : (storeNodes && storeNodes.length > 0 ? storeNodes : []);
  let galleryImages = collectGalleryImageUrls(nodesToSearch, eventDetails);

  if (galleryImages.length === 0) {
    if (style.backgroundImage) {
      galleryImages = [style.backgroundImage, ...DEFAULT_GALLERY_FALLBACKS];
    } else {
      galleryImages = DEFAULT_GALLERY_FALLBACKS;
    }
  }

  const effect = style.bgSlideshowEffect || 'fade';
  const overlayColor = style.backgroundOverlayColor || 'rgba(0, 0, 0, 0.4)';
  const activeIdx = galleryImages.length > 0 ? slideIndex % galleryImages.length : 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
        borderRadius: 'inherit',
      }}
    >
      {galleryImages.map((imgUrl, idx) => {
        const isActive = idx === activeIdx;

        let transformStyle = 'scale(1)';
        let transitionStyle = 'opacity 1.2s ease-in-out';

        if (effect === 'kenburns') {
          transformStyle = isActive ? 'scale(1.15)' : 'scale(1)';
          transitionStyle = 'opacity 1.2s ease-in-out, transform 8s ease-in-out';
        } else if (effect === 'slide') {
          transformStyle = isActive ? 'translateX(0)' : idx < activeIdx ? 'translateX(-100%)' : 'translateX(100%)';
          transitionStyle = 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out';
        }

        return (
          <div
            key={imgUrl + idx}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${imgUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: isActive ? 1 : 0,
              transform: transformStyle,
              transition: transitionStyle,
            }}
          />
        );
      })}

      {/* Overlay for legibility */}
      {overlayColor && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: overlayColor,
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
}

interface NodeRendererProps {
  node: StudioNode;
  allNodes?: StudioNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onDeleteNode?: (id: string) => void;
  onDuplicateNode?: (id: string) => void;
  eventDetails?: any;
  viewportMode?: 'desktop' | 'tablet' | 'mobile' | 'auto';
  isPreviewMode?: boolean;
  onOpenCover?: () => void;
  isMiniStudioMode?: boolean;
  onSelectMiniNode?: (nodeId: string, sectionType?: string) => void;
}

export function getResponsiveStyle(style: any, key: string, defaultValue: any, viewportMode: string = 'desktop') {
  if (!style) return defaultValue;

  let activeMode = viewportMode;
  if ((!activeMode || activeMode === 'auto') && typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width <= 640) activeMode = 'mobile';
    else if (width <= 1024) activeMode = 'tablet';
    else activeMode = 'desktop';
  }

  if (activeMode === 'mobile') {
    const mobKey = key + 'Mobile';
    if (style[mobKey] !== undefined && style[mobKey] !== '') return style[mobKey];

    const tabKey = key + 'Tablet';
    if (style[tabKey] !== undefined && style[tabKey] !== '') return style[tabKey];

    if (style[key] !== undefined && style[key] !== '') return style[key];
  } else if (activeMode === 'tablet') {
    const tabKey = key + 'Tablet';
    if (style[tabKey] !== undefined && style[tabKey] !== '') return style[tabKey];

    if (style[key] !== undefined && style[key] !== '') return style[key];
  } else {
    if (style[key] !== undefined && style[key] !== '') return style[key];
  }
  return defaultValue;
}

export function resolveStyleValue(val: any, fallback?: string): string | undefined {
  if (val === undefined || val === null || val === '') return fallback;
  const strVal = String(val).trim();

  // If already a CSS variable or special format
  if (strVal.startsWith('var(--') || strVal.startsWith('rgb') || strVal.startsWith('#') || strVal.includes('%') || strVal.includes('rem') || strVal.includes('em')) {
    return strVal;
  }

  // Token name shortcuts for Font Size
  switch (strVal.toLowerCase()) {
    case 'h1':
      return 'var(--global-size-h1)';
    case 'h2':
      return 'var(--global-size-h2)';
    case 'h3':
      return 'var(--global-size-h3)';
    case 'h4':
      return 'var(--global-size-h4)';
    case 'body-large':
    case 'body large':
      return 'var(--global-size-body-large)';
    case 'body':
      return 'var(--global-size-body)';
    case 'body-small':
    case 'body small':
      return 'var(--global-size-body-small)';
    case 'caption':
      return 'var(--global-size-caption)';
  }

  // Token name shortcuts for Font Family
  if (strVal === 'font-primary' || strVal === 'primary' || strVal === 'Font Primary' || strVal === 'global:fontPrimary') {
    return 'var(--global-font-primary)';
  }
  if (strVal === 'font-secondary' || strVal === 'secondary' || strVal === 'Font Secondary' || strVal === 'global:fontSecondary') {
    return 'var(--global-font-secondary)';
  }

  // Token name shortcuts for Colors
  switch (strVal.toLowerCase()) {
    case 'primary':
    case 'global:primary':
      return 'var(--global-primary)';
    case 'secondary':
    case 'global:secondary':
      return 'var(--global-secondary)';
    case 'background':
    case 'global:background':
      return 'var(--global-background)';
    case 'surface':
    case 'global:surface':
      return 'var(--global-surface)';
    case 'textprimary':
    case 'text-primary':
    case 'global:textprimary':
    case 'global:textPrimary':
      return 'var(--global-text-primary)';
    case 'textsecondary':
    case 'text-secondary':
    case 'global:textsecondary':
    case 'global:textSecondary':
      return 'var(--global-text-secondary)';
    case 'accentluxury':
    case 'accent-luxury':
    case 'accent':
    case 'global:accentluxury':
    case 'global:accentLuxury':
      return 'var(--global-accent-luxury)';
    case 'border':
    case 'global:border':
      return 'var(--global-border)';
  }

  // If number without unit
  if (!isNaN(Number(strVal))) {
    return `${strVal}px`;
  }

  return strVal;
}

function CountdownTimer({ node, eventDetails, style, viewportMode = 'desktop' }: { node: StudioNode; eventDetails: any; style: any; viewportMode?: string }) {
  // Resolve target date
  const finalTargetDate = React.useMemo(() => {
    let targetStr = (node.countdownTargetDate || '{event_date}').trim();
    if (targetStr.startsWith('{') && targetStr.endsWith('}')) {
      const tagName = targetStr.slice(1, -1);
      targetStr = eventDetails?.[tagName] || eventDetails?.event_date || '';
    }
    if (targetStr) {
      const t = new Date(targetStr).getTime();
      if (!isNaN(t)) return t;
    }
    // Fallback target date: 30 days from now
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.getTime();
  }, [node.countdownTargetDate, eventDetails]);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const diff = finalTargetDate - now;

      if (isNaN(diff) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [finalTargetDate]);

  // Styles
  const boxBg = String(getResponsiveStyle(style, 'countdownBgColor', 'rgba(0,0,0,0.05)', viewportMode));
  const numColor = String(getResponsiveStyle(style, 'countdownTextColor', 'inherit', viewportMode));
  const labelColor = String(getResponsiveStyle(style, 'countdownLabelColor', 'inherit', viewportMode));
  const numSize = String(getResponsiveStyle(style, 'countdownFontSize', '1.2rem', viewportMode));
  const labelSize = String(getResponsiveStyle(style, 'countdownLabelSize', '0.65rem', viewportMode));
  const boxPadding = String(getResponsiveStyle(style, 'countdownPadding', '8px 12px', viewportMode));
  const boxRadiusRaw = getResponsiveStyle(style, 'countdownBorderRadius', 8, viewportMode);
  const boxRadius = boxRadiusRaw !== undefined ? `${boxRadiusRaw}px` : '8px';
  const boxGapRaw = getResponsiveStyle(style, 'countdownGap', 8, viewportMode);
  const boxGap = boxGapRaw !== undefined ? `${boxGapRaw}px` : '8px';
  const showSeconds = getResponsiveStyle(style, 'countdownShowSeconds', true, viewportMode) !== false;

  const padZero = (n: number) => String(n).padStart(2, '0');

  const items = [
    { value: padZero(timeLeft.days), label: 'Hari' },
    { value: padZero(timeLeft.hours), label: 'Jam' },
    { value: padZero(timeLeft.minutes), label: 'Menit' }
  ];

  if (showSeconds) {
    items.push({ value: padZero(timeLeft.seconds), label: 'Detik' });
  }

  return (
    <div style={{ display: 'flex', gap: boxGap, justifyContent: 'center' }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            background: boxBg,
            padding: boxPadding,
            borderRadius: boxRadius,
            textAlign: 'center',
            minWidth: '60px'
          }}
        >
          <span style={{ fontWeight: 800, fontSize: numSize, color: numColor, display: 'block', lineHeight: '1.2' }}>
            {item.value}
          </span>
          <span style={{ fontSize: labelSize, color: labelColor, textTransform: 'uppercase', display: 'block', marginTop: '0.2rem' }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function NodeRenderer({
  node,
  allNodes,
  selectedNodeId,
  onSelectNode,
  onDeleteNode,
  onDuplicateNode,
  eventDetails,
  viewportMode = 'desktop',
  isPreviewMode = false,
  onOpenCover,
  isMiniStudioMode = false,
  onSelectMiniNode,
}: NodeRendererProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const submittedRsvp = useStudioStore((s) => s.submittedRsvp);

  const style = node.style || {};
  const isSlideshowBg = node.type === 'container' && style.bgType === 'gallery-slideshow';
  const isSliderWidget = node.type === 'slider';

  // Animation configuration
  const animType = getResponsiveStyle(style, 'animationType', style.animationType || style.animationName, viewportMode);
  const loopAnimType = getResponsiveStyle(style, 'loopAnimation', style.loopAnimation, viewportMode);
  const hasAnimation = Boolean(animType && animType !== 'none');
  const hasLoopAnimation = Boolean(loopAnimType && loopAnimType !== 'none');

  const [isAnimated, setIsAnimated] = useState(!isPreviewMode);
  const isCoverSection = node.sectionType === 'cover';
  const prevAnimRef = useRef<string | undefined>(undefined);
  const isFirstMountRef = useRef(true);

  // In Preview / Live Mode: Scroll Intersection Observer for entrance animations
  useEffect(() => {
    if (!isPreviewMode || !hasAnimation) {
      setIsAnimated(true);
      return;
    }

    // If not in cover section and cover is not yet opened, wait for cover to open
    if (!isCoverSection && eventDetails?.isCoverOpened === false) {
      setIsAnimated(false);
      return;
    }

    const domId = `node-dom-${node.id}`;
    const el = document.getElementById(domId);
    if (!el) {
      setIsAnimated(true);
      return;
    }

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsAnimated(true);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -40px 0px',
        }
      );

      observer.observe(el);
      return () => observer.disconnect();
    } else {
      setIsAnimated(true);
    }
  }, [node.id, hasAnimation, isPreviewMode, isCoverSection, eventDetails?.isCoverOpened]);

  // Replay animation helper in Studio Editor
  const replayAnimation = () => {
    const domId = `node-dom-${node.id}`;
    const el = document.getElementById(domId);
    if (!el) return;
    el.classList.remove('animated');
    el.classList.remove('has-loop-anim');
    void el.offsetWidth; // Force CSS reflow
    el.classList.add('animated');
    if (hasLoopAnimation) {
      el.classList.add('has-loop-anim');
    }
  };

  // Auto-replay in Studio Editor when animation properties change
  useEffect(() => {
    if (isPreviewMode) return;
    const currentAnimKey = `${animType || ''}_${style.animationDuration || ''}_${style.animationDelay || ''}_${style.animationIteration || ''}_${loopAnimType || ''}_${style.loopAnimationDuration || ''}`;

    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      prevAnimRef.current = currentAnimKey;
      return;
    }

    if (prevAnimRef.current !== currentAnimKey) {
      prevAnimRef.current = currentAnimKey;
      if (hasAnimation || hasLoopAnimation) {
        replayAnimation();
      }
    }
  }, [animType, loopAnimType, style.animationDuration, style.animationDelay, style.animationIteration, style.loopAnimationDuration, isPreviewMode, hasAnimation, hasLoopAnimation]);

  // Listen for explicit replay requests (e.g. from InspectorPanel "Putar Animasi" button)
  useEffect(() => {
    if (isPreviewMode) return;
    const handleReplayEvent = (e: any) => {
      const targetId = e?.detail?.nodeId;
      if (!targetId || targetId === node.id) {
        replayAnimation();
      }
    };
    window.addEventListener('studio:replay-animation', handleReplayEvent);
    return () => window.removeEventListener('studio:replay-animation', handleReplayEvent);
  }, [node.id, isPreviewMode]);

  const rawInterval = isSliderWidget
    ? style.sliderInterval
    : style.bgSlideshowInterval;

  const intervalSec = typeof rawInterval === 'number'
    ? rawInterval
    : (rawInterval ? parseInt(String(rawInterval), 10) : 5);

  useEffect(() => {
    if (!isSlideshowBg && !isSliderWidget) return;
    const storeNodes = useStudioStore.getState().nodes;
    const nodesToSearch = allNodes && allNodes.length > 0 ? allNodes : (storeNodes && storeNodes.length > 0 ? storeNodes : []);
    let gImages = collectGalleryImageUrls(nodesToSearch, eventDetails);

    if (gImages.length === 0) {
      if (style.backgroundImage || node.content) {
        gImages = [style.backgroundImage || node.content || '', ...DEFAULT_GALLERY_FALLBACKS].filter(Boolean);
      } else {
        gImages = DEFAULT_GALLERY_FALLBACKS;
      }
    }

    if (gImages.length <= 1) return;

    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % gImages.length);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [isSlideshowBg, isSliderWidget, allNodes, intervalSec, style.backgroundImage, node.content]);

  const isSelected = !isPreviewMode && selectedNodeId === node.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMiniStudioMode && onSelectMiniNode) {
      onSelectMiniNode(node.id, node.sectionType);
      return;
    }
    if (isPreviewMode) {
      const actionId = node.customAction || (node.type !== 'button' ? node.buttonAction : undefined);
      if (actionId) {
        const executed = executeRegisteredFunction(actionId, node.customActionParam || node.buttonUrl, {
          eventDetails,
          onOpenCover,
          node,
          event: e,
        });
        if (executed) return;
      }
      return;
    }
    onSelectNode(node.id);
  };

  const contentText = resolveTextVariables(node.content || '', eventDetails);

  // Compute CSS Style object for the node container wrapper
  const posVal = getResponsiveStyle(style, 'position', undefined, viewportMode);
  const displayVal = getResponsiveStyle(style, 'display', undefined, viewportMode);
  const isHiddenDisplay = displayVal === 'none' || style.display === 'none';

  const rawLineHeight = getResponsiveStyle(style, 'lineHeight', style.lineHeight || undefined, viewportMode);
  let resolvedLineHeight: string | number | undefined = undefined;
  if (rawLineHeight !== undefined && rawLineHeight !== null && String(rawLineHeight).trim() !== '') {
    const lhStr = String(rawLineHeight).trim();
    if (!isNaN(Number(lhStr))) {
      const num = Number(lhStr);
      resolvedLineHeight = num > 4 ? `${num}px` : num;
    } else {
      resolvedLineHeight = lhStr;
    }
  }

  const computedStyle: React.CSSProperties = {
    display: isHiddenDisplay ? 'none' : undefined,
    width: getResponsiveStyle(style, 'width', '100%', viewportMode),
    height: getResponsiveStyle(style, 'height', 'auto', viewportMode),
    minHeight: getResponsiveStyle(style, 'minHeight', undefined, viewportMode),
    padding: getResponsiveStyle(style, 'padding', '0px', viewportMode),
    margin: getResponsiveStyle(style, 'margin', '0px', viewportMode),
    color: resolveStyleValue(style.color),
    backgroundColor: resolveStyleValue(style.backgroundColor),
    borderWidth: style.borderWidth ? (typeof style.borderWidth === 'number' ? `${style.borderWidth}px` : style.borderWidth) : undefined,
    borderStyle: style.borderStyle || undefined,
    borderColor: resolveStyleValue(style.borderColor),
    fontSize: style.fontSize ? resolveStyleValue(getResponsiveStyle(style, 'fontSize', style.fontSize, viewportMode)) : undefined,
    fontFamily: resolveStyleValue(style.fontFamily),
    fontWeight: getResponsiveStyle(style, 'fontWeight', style.fontWeight || undefined, viewportMode),
    fontStyle: getResponsiveStyle(style, 'fontStyle', style.fontStyle || undefined, viewportMode) as any,
    textAlign: getResponsiveStyle(style, 'textAlign', undefined, viewportMode) as any,
    letterSpacing: getResponsiveStyle(style, 'letterSpacing', style.letterSpacing || undefined, viewportMode),
    lineHeight: resolvedLineHeight,
    textTransform: style.textTransform as any || undefined,
    borderTopLeftRadius: style.useIndividualRadius && style.borderTopLeftRadius !== undefined ? (typeof style.borderTopLeftRadius === 'number' ? `${style.borderTopLeftRadius}px` : style.borderTopLeftRadius) : (style.borderRadius ? `${style.borderRadius}px` : undefined),
    borderTopRightRadius: style.useIndividualRadius && style.borderTopRightRadius !== undefined ? (typeof style.borderTopRightRadius === 'number' ? `${style.borderTopRightRadius}px` : style.borderTopRightRadius) : (style.borderRadius ? `${style.borderRadius}px` : undefined),
    borderBottomRightRadius: style.useIndividualRadius && style.borderBottomRightRadius !== undefined ? (typeof style.borderBottomRightRadius === 'number' ? `${style.borderBottomRightRadius}px` : style.borderBottomRightRadius) : (style.borderRadius ? `${style.borderRadius}px` : undefined),
    borderBottomLeftRadius: style.useIndividualRadius && style.borderBottomLeftRadius !== undefined ? (typeof style.borderBottomLeftRadius === 'number' ? `${style.borderBottomLeftRadius}px` : style.borderBottomLeftRadius) : (style.borderRadius ? `${style.borderRadius}px` : undefined),
    opacity: style.opacity ? parseFloat(String(style.opacity)) : undefined,
    boxShadow: getResponsiveStyle(style, 'boxShadow', undefined, viewportMode),
    position: (posVal || undefined) as any,
    top: posVal && posVal !== 'static' ? getResponsiveStyle(style, 'top', undefined, viewportMode) : undefined,
    right: posVal && posVal !== 'static' ? getResponsiveStyle(style, 'right', undefined, viewportMode) : undefined,
    bottom: posVal && posVal !== 'static' ? getResponsiveStyle(style, 'bottom', undefined, viewportMode) : undefined,
    left: posVal && posVal !== 'static' ? getResponsiveStyle(style, 'left', undefined, viewportMode) : undefined,
    zIndex: posVal && posVal !== 'static' && style.zIndex ? (parseInt(String(style.zIndex), 10) || style.zIndex) : undefined,
    scrollbarWidth: style.hideScrollbar ? 'none' : undefined,
    msOverflowStyle: style.hideScrollbar ? 'none' : undefined,
  };

  // Transform Rotation Angle
  const rotateVal = style.transformRotate !== undefined ? style.transformRotate : (style.rotate !== undefined ? style.rotate : undefined);
  if (rotateVal !== undefined && rotateVal !== 0 && rotateVal !== '0' && rotateVal !== '0deg') {
    const rotDeg = typeof rotateVal === 'number' ? `${rotateVal}deg` : String(rotateVal).endsWith('deg') ? rotateVal : `${rotateVal}deg`;
    computedStyle.transform = computedStyle.transform ? `${computedStyle.transform} rotate(${rotDeg})` : `rotate(${rotDeg})`;
  }

  const backdropFilterVal = getResponsiveStyle(style, 'backdropFilter', undefined, viewportMode);
  if (backdropFilterVal) {
    computedStyle.backdropFilter = backdropFilterVal;
    computedStyle.WebkitBackdropFilter = backdropFilterVal;
  }

  const overflowVal = getResponsiveStyle(style, 'overflow', undefined, viewportMode);
  const overflowXVal = getResponsiveStyle(style, 'overflowX', undefined, viewportMode);
  const overflowYVal = getResponsiveStyle(style, 'overflowY', undefined, viewportMode);

  if (overflowVal) {
    computedStyle.overflow = overflowVal as any;
  } else {
    if (overflowXVal) computedStyle.overflowX = overflowXVal as any;
    if (overflowYVal) computedStyle.overflowY = overflowYVal as any;
  }

  const flexShrinkVal = getResponsiveStyle(style, 'flexShrink', style.flexShrink !== undefined ? style.flexShrink : 0, viewportMode);
  if (flexShrinkVal !== undefined) {
    computedStyle.flexShrink = Number(flexShrinkVal);
  }

  const flexGrowVal = getResponsiveStyle(style, 'flexGrow', style.flexGrow !== undefined ? style.flexGrow : undefined, viewportMode);
  if (flexGrowVal !== undefined) {
    computedStyle.flexGrow = Number(flexGrowVal);
  }

  const orderVal = getResponsiveStyle(style, 'order', undefined, viewportMode);
  if (orderVal !== undefined && orderVal !== '') {
    computedStyle.order = Number(orderVal);
  }

  // Animation duration, delay, and iteration CSS properties
  if (style.animationDuration) {
    const durStr = String(style.animationDuration).trim();
    const formattedDur = /^\d+(\.\d+)?$/.test(durStr) ? `${durStr}s` : durStr;
    (computedStyle as any)['--anim-duration'] = formattedDur;
  }
  if (style.animationDelay) {
    const delayStr = String(style.animationDelay).trim();
    const formattedDelay = /^\d+(\.\d+)?$/.test(delayStr) ? `${delayStr}s` : delayStr;
    (computedStyle as any)['--anim-delay'] = formattedDelay;
  }
  if (style.animationIteration === 'infinite') {
    computedStyle.animationIterationCount = 'infinite';
    (computedStyle as any)['--anim-iteration'] = 'infinite';
  } else {
    (computedStyle as any)['--anim-iteration'] = '1';
  }

  // Loop Animation duration CSS property
  if (style.loopAnimationDuration) {
    const loopDurStr = String(style.loopAnimationDuration).trim();
    const formattedLoopDur = /^\d+(\.\d+)?$/.test(loopDurStr) ? `${loopDurStr}s` : loopDurStr;
    (computedStyle as any)['--loop-duration'] = formattedLoopDur;
  }

  const entranceAnimationClasses = hasAnimation ? `has-anim ${animType} ${isAnimated ? 'animated' : ''}` : '';
  const loopAnimationClasses = hasLoopAnimation ? `${loopAnimType} has-loop-anim` : '';
  const animationClasses = `${entranceAnimationClasses} ${loopAnimationClasses}`.trim();
  const nodeClassName = `canvas-node-item ${isSelected ? 'selected' : ''} ${isPreviewMode ? 'is-preview-mode preview-mode' : ''} ${style.hideScrollbar ? 'no-scrollbar' : ''} ${animationClasses}`.trim();

  if (isMiniStudioMode && selectedNodeId === node.id) {
    computedStyle.outline = '2.5px solid var(--primary, #e36397)';
    computedStyle.outlineOffset = '2px';
  }

  if (style.bgType === 'gradient') {
    const dir = getResponsiveStyle(style, 'gradientDirection', 'to right', viewportMode);
    let colorStops: string[] = [];

    if (Array.isArray(style.gradientColors) && style.gradientColors.length > 0) {
      colorStops = style.gradientColors;
    } else {
      const c1 = style.gradientColor1 || '#8B5E3C';
      const c2 = style.gradientColor2 || '#C9A66B';
      colorStops = [c1, c2];
    }

    const stopsStr = colorStops.join(', ');
    computedStyle.backgroundImage = dir === 'radial' || dir === 'circle' ? `radial-gradient(circle, ${stopsStr})` : `linear-gradient(${dir}, ${stopsStr})`;
  } else if (style.bgType !== 'gallery-slideshow') {
    if (style.backgroundColor) computedStyle.backgroundColor = style.backgroundColor;
    let bgImg = getResponsiveStyle(style, 'backgroundImage', '', viewportMode);
    if (style.isBgDynamic && style.backgroundImageBinding && eventDetails) {
      const bindingKey = style.backgroundImageBinding as string;
      const boundVal = (eventDetails as any)[bindingKey];
      if (boundVal && typeof boundVal === 'string' && boundVal.trim() !== '') {
        bgImg = boundVal;
      }
    }
    if (bgImg) {
      computedStyle.backgroundImage = `url(${bgImg})`;
      computedStyle.backgroundSize = getResponsiveStyle(style, 'backgroundSize', 'cover', viewportMode);
      computedStyle.backgroundPosition = getResponsiveStyle(style, 'backgroundPosition', 'center', viewportMode);
      computedStyle.backgroundRepeat = getResponsiveStyle(style, 'backgroundRepeat', 'no-repeat', viewportMode);
    }
  }

  // Action Overlay Handles
  const actionOverlay = !isPreviewMode && isSelected && (
    <div className="node-action-overlay">
      <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 800, paddingRight: '4px' }}>
        {node.type}
      </span>
      {onDuplicateNode && (
        <button
          type="button"
          className="btn-node-action"
          title="Duplikat Elemen"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicateNode(node.id);
          }}
        >
          📋
        </button>
      )}
      {onDeleteNode && (
        <button
          type="button"
          className="btn-node-action"
          title="Hapus Elemen"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteNode(node.id);
          }}
        >
          🗑️
        </button>
      )}
    </div>
  );

  // Container Rendering
  if (node.type === 'container') {
    const displayMode = getResponsiveStyle(style, 'display', 'flex', viewportMode);
    const containerInnerStyle: React.CSSProperties = {
      display: displayMode as any,
      width: '100%',
      height: '100%',
      minHeight: 'inherit',
      position: 'relative',
      zIndex: 1,
    };

    const containerGapVal = getResponsiveStyle(style, 'gap', 12, viewportMode);

    if (displayMode === 'grid') {
      const cols = getResponsiveStyle(style, 'gridCols', 2, viewportMode);
      containerInnerStyle.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
      containerInnerStyle.alignItems = getResponsiveStyle(style, 'alignItems', 'stretch', viewportMode);
      containerInnerStyle.justifyContent = getResponsiveStyle(style, 'justifyContent', 'stretch', viewportMode);
      containerInnerStyle.gap = `${containerGapVal}px`;
    } else {
      containerInnerStyle.flexDirection = getResponsiveStyle(style, 'flexDirection', 'column', viewportMode);
      containerInnerStyle.justifyContent = getResponsiveStyle(style, 'justifyContent', 'center', viewportMode);
      containerInnerStyle.alignItems = getResponsiveStyle(style, 'alignItems', 'center', viewportMode);
      containerInnerStyle.textAlign = getResponsiveStyle(style, 'textAlign', undefined, viewportMode) as any;
      containerInnerStyle.flexWrap = getResponsiveStyle(style, 'flexWrap', undefined, viewportMode) as any;
      containerInnerStyle.gap = `${containerGapVal}px`;
    }

    const containerStyle: React.CSSProperties = {
      ...computedStyle,
      position: computedStyle.position || 'relative',
      overflow: computedStyle.overflow || 'hidden',
    };

    // Apply sectionVisuals overrides from Mini Editor Visual tab
    if (node.sectionType && eventDetails?.sectionVisuals?.[node.sectionType]) {
      const sv = eventDetails.sectionVisuals[node.sectionType];
      if (sv.backgroundImage) {
        containerStyle.backgroundImage = `url(${sv.backgroundImage})`;
        containerStyle.backgroundSize = 'cover';
        containerStyle.backgroundPosition = 'center';
        containerStyle.backgroundRepeat = 'no-repeat';
      }
      if (sv.backgroundColor) {
        if (sv.backgroundImage) {
          // If both image and tint are set, layer them
          containerStyle.backgroundImage = `linear-gradient(${sv.backgroundColor}, ${sv.backgroundColor}), url(${sv.backgroundImage})`;
        } else {
          containerStyle.backgroundColor = sv.backgroundColor;
        }
      }
    }

    // Dynamic Photo Gallery Feed Container Rendering & Auto-Hiding
    const isGalleryContainer = isGallerySectionNode(node);

    if (isGalleryContainer) {
      const isPublic = eventDetails?.isPublicInvitation === true;
      const isMiniStudio = isMiniStudioMode || eventDetails?.isMiniStudioMode === true;
      const isCatalogPreview = eventDetails?.isCatalogPreview === true || (!isPublic && !isMiniStudio && isPreviewMode);

      const storeGlobal = typeof window !== 'undefined' ? useStudioStore.getState?.()?.globalStyles : undefined;
      const effectiveDetails = eventDetails || storeGlobal?.sampleEventDetails;
      const userPhotos =
        (Array.isArray(storeGlobal?.galleryImages) && storeGlobal.galleryImages.length > 0)
          ? storeGlobal.galleryImages
          : (Array.isArray(effectiveDetails?.galleryImages) && effectiveDetails.galleryImages.length > 0)
          ? effectiveDetails.galleryImages
          : (Array.isArray(effectiveDetails?.gallery) && effectiveDetails.gallery.length > 0 && effectiveDetails.gallery !== DEFAULT_SAMPLE_GALLERY)
          ? effectiveDetails.gallery
          : (Array.isArray(effectiveDetails?.photos) && effectiveDetails.photos.length > 0)
          ? effectiveDetails.photos
          : (Array.isArray(storeGlobal?.sampleEventDetails?.gallery) && storeGlobal.sampleEventDetails.gallery.length > 0)
          ? storeGlobal.sampleEventDetails.gallery
          : (Array.isArray(effectiveDetails?.gallery) && effectiveDetails.gallery.length > 0)
          ? effectiveDetails.gallery
          : isCatalogPreview
          ? DEFAULT_SAMPLE_GALLERY
          : [];

      const hasUserPhotos = Array.isArray(userPhotos) && userPhotos.length > 0;
      const isExplicitlyDisabled =
        eventDetails?.enableGallery === false ||
        eventDetails?.enable_gallery === false ||
        eventDetails?.hasGallery === false ||
        eventDetails?.showGallery === false;

      // In Public Live Mode, if user uploaded NO photos or explicitly disabled gallery, AUTOMATICALLY HIDE ENTIRE CONTAINER (Return Null)
      if (isPublic && (!hasUserPhotos || isExplicitlyDisabled)) {
        return null;
      }

      // Check if node has an inner feed container (isGalleryFeed)
      const hasInnerFeed = Array.isArray(node.children) && node.children.some((c) => c.isGalleryFeed || String(c.widgetType).includes('gallery'));

      // If it already has an inner feed container, or in Studio Admin Editor mode (!isPreviewMode && !isMiniStudio), render children directly!
      if (hasInnerFeed || (!isPreviewMode && !isMiniStudio)) {
        return (
          <div
            id={`node-dom-${node.id}`}
            onClick={handleClick}
            style={containerStyle}
            className={nodeClassName}
          >
            {actionOverlay}

            <div style={containerInnerStyle} className="container-inner-wrapper">
              {node.children && node.children.length > 0 ? (
                node.children.map((child) => (
                  <NodeRenderer
                    key={child.id}
                    node={child}
                    allNodes={allNodes}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={onSelectNode}
                    onDeleteNode={onDeleteNode}
                    onDuplicateNode={onDuplicateNode}
                    eventDetails={eventDetails}
                    viewportMode={viewportMode}
                    isPreviewMode={isPreviewMode}
                    onOpenCover={onOpenCover}
                    isMiniStudioMode={isMiniStudioMode}
                    onSelectMiniNode={onSelectMiniNode}
                  />
                ))
              ) : (
                <PhotoGalleryGrid
                  images={userPhotos}
                  isPreviewMode={isPreviewMode}
                  showHeadline={false}
                />
              )}
            </div>
          </div>
        );
      }

      // If legacy node structure (no inner isGalleryFeed child) in Preview / MiniStudio / Live mode:
      // Separate non-image children (headings, descriptions) and image templates
      const nonImageChildren = (node.children || []).filter((c) => c.type !== 'image');
      const sampleImageTemplate = (node.children || []).find((c) => c.type === 'image');

      return (
        <div
          id={`node-dom-${node.id}`}
          onClick={handleClick}
          style={containerStyle}
          className={nodeClassName}
        >
          {actionOverlay}

          <div style={containerInnerStyle} className="container-inner-wrapper">
            {/* Render any heading & text children */}
            {nonImageChildren.map((child) => (
              <NodeRenderer
                key={child.id}
                node={child}
                allNodes={allNodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
                onDeleteNode={onDeleteNode}
                onDuplicateNode={onDuplicateNode}
                eventDetails={eventDetails}
                viewportMode={viewportMode}
                isPreviewMode={isPreviewMode}
                onOpenCover={onOpenCover}
                isMiniStudioMode={isMiniStudioMode}
                onSelectMiniNode={onSelectMiniNode}
              />
            ))}

            {/* Render dynamic gallery grid */}
            {!hasUserPhotos ? (
              isMiniStudio ? (
                <div style={{ padding: '1.25rem 1rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.8rem', width: '100%' }}>
                  🖼️ Belum ada foto galeri. Unggah foto di panel Media sebelah kiri.
                </div>
              ) : null
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 12,
                  width: '100%',
                }}
              >
                {userPhotos.map((imgUrl: string, gIdx: number) => {
                  if (sampleImageTemplate) {
                    const boundCard = cloneAndBindGalleryData(sampleImageTemplate, imgUrl, gIdx);
                    return (
                      <NodeRenderer
                        key={`gal-img-${gIdx}-${boundCard.id}`}
                        node={boundCard}
                        allNodes={allNodes}
                        selectedNodeId={selectedNodeId}
                        onSelectNode={onSelectNode}
                        onDeleteNode={onDeleteNode}
                        onDuplicateNode={onDuplicateNode}
                        eventDetails={eventDetails}
                        viewportMode={viewportMode}
                        isPreviewMode={isPreviewMode}
                        onOpenCover={onOpenCover}
                        isMiniStudioMode={isMiniStudioMode}
                        onSelectMiniNode={onSelectMiniNode}
                      />
                    );
                  }

                  return (
                    <div
                      key={`dyn-gal-img-${gIdx}`}
                      onClick={(e) => {
                        if (isPreviewMode) {
                          e.stopPropagation();
                          const allGallery = collectGalleryImageUrls(allNodes || [node], eventDetails);
                          const gList = allGallery.length > 0 ? allGallery : userPhotos;
                          let idx = gList.indexOf(imgUrl);
                          if (idx === -1) idx = gList.findIndex((u: string) => (u || '').trim() === (imgUrl || '').trim());
                          setGalleryImages(gList);
                          setLightboxIndex(idx >= 0 ? idx : gIdx);
                        }
                      }}
                      style={{
                        position: 'relative',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        aspectRatio: '1 / 1',
                        backgroundColor: '#f1f5f9',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                        cursor: isPreviewMode ? 'pointer' : 'default',
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt={`Foto Galeri #${gIdx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {lightboxIndex !== null && (
            <LightboxModal
              images={galleryImages.length > 0 ? galleryImages : userPhotos}
              currentIndex={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onNavigate={(idx) => setLightboxIndex(idx)}
            />
          )}
        </div>
      );
    }

    // Dynamic Love Story Widget Container Rendering & Auto-Hiding
    if (node.widgetType === 'lovestory') {
      const isExplicitlyDisabled =
        eventDetails?.enableLoveStory === false ||
        eventDetails?.enable_love_story === false ||
        eventDetails?.hasLoveStory === false ||
        eventDetails?.isLoveStoryEnabled === false;

      // In Preview Mode, if explicitly disabled by user in wizard, automatically hide section
      if (isPreviewMode && isExplicitlyDisabled) {
        return null;
      }

      const activeStories = eventDetails?.loveStories || eventDetails?.stories || undefined;

      return (
        <div
          id={`node-dom-${node.id}`}
          onClick={handleClick}
          style={containerStyle}
          className={nodeClassName}
        >
          {actionOverlay}

          <div style={containerInnerStyle} className="container-inner-wrapper">
            {node.children && node.children.length > 0 ? (
              node.children.map((child) => (
                <NodeRenderer
                  key={child.id}
                  node={child}
                  allNodes={allNodes}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  onDeleteNode={onDeleteNode}
                  onDuplicateNode={onDuplicateNode}
                  eventDetails={eventDetails}
                  viewportMode={viewportMode}
                  isPreviewMode={isPreviewMode}
                  onOpenCover={onOpenCover}
                  isMiniStudioMode={isMiniStudioMode}
                  onSelectMiniNode={onSelectMiniNode}
                />
              ))
            ) : (
              <LoveStoryTimeline
                stories={activeStories}
                isPreviewMode={isPreviewMode}
              />
            )}
          </div>
        </div>
      );
    }

    // Dynamic Gift Registry Widget Container Rendering
    if (node.widgetType === 'gift-widget') {
      const activeBanks = eventDetails?.bankAccounts || eventDetails?.rekening || undefined;
      const activeGiftAddr = eventDetails?.giftAddress || eventDetails?.gift_address || eventDetails?.alamat_kado || undefined;

      return (
        <div
          id={`node-dom-${node.id}`}
          onClick={handleClick}
          style={containerStyle}
          className={nodeClassName}
        >
          {actionOverlay}

          <div style={containerInnerStyle} className="container-inner-wrapper">
            {node.children?.map((child) => (
              <NodeRenderer
                key={child.id}
                node={child}
                allNodes={allNodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
                onDeleteNode={onDeleteNode}
                onDuplicateNode={onDuplicateNode}
                eventDetails={eventDetails}
                viewportMode={viewportMode}
                isPreviewMode={isPreviewMode}
                onOpenCover={onOpenCover}
                isMiniStudioMode={isMiniStudioMode}
                onSelectMiniNode={onSelectMiniNode}
              />
            ))}

            <GiftRegistryCards
              bankAccounts={activeBanks}
              giftAddress={activeGiftAddr}
              isPreviewMode={isPreviewMode}
            />
          </div>
        </div>
      );
    }

    // Dynamic RSVP Form Container Transformation to QR Code E-Ticket / Decision Card
    if (node.widgetType === 'rsvp-form' && isPreviewMode && submittedRsvp) {
      return (
        <div
          id={`node-dom-${node.id}`}
          onClick={handleClick}
          style={containerStyle}
          className={nodeClassName}
        >
          {actionOverlay}
          <RsvpResultCard
            data={submittedRsvp}
            onReset={() => useStudioStore.getState().setSubmittedRsvp(null)}
          />
        </div>
      );
    }

    // Dynamic Event Feed Container (isEventFeed) Rendering
    if (node.isEventFeed) {
      const isPublic = eventDetails?.isPublicInvitation === true;
      const isMiniStudio = isMiniStudioMode || eventDetails?.isMiniStudioMode === true;
      const isCatalogPreview = eventDetails?.isCatalogPreview === true || (!isPublic && !isMiniStudio);

      const rawEvents = (Array.isArray(eventDetails?.schedules) && eventDetails.schedules.length > 0)
        ? eventDetails.schedules
        : (Array.isArray(eventDetails?.events) && eventDetails.events.length > 0)
        ? eventDetails.events
        : isCatalogPreview
        ? DEFAULT_SAMPLE_SCHEDULES
        : [];

      const sampleCardTemplate = node.children && node.children.length > 0 ? node.children[0] : null;

      // In Studio Editor Canvas (non-preview mode), render node.children directly so Admin can click, select, and style every part of the Master Card
      if (!isPreviewMode && !isMiniStudio) {
        return (
          <div
            id={`node-dom-${node.id}`}
            onClick={handleClick}
            style={containerStyle}
            className={nodeClassName}
          >
            {actionOverlay}

            <div style={containerInnerStyle} className="container-inner-wrapper">
              {node.children && node.children.length > 0 ? (
                node.children.map((child) => (
                  <NodeRenderer
                    key={child.id}
                    node={child}
                    allNodes={allNodes}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={onSelectNode}
                    onDeleteNode={onDeleteNode}
                    onDuplicateNode={onDuplicateNode}
                    eventDetails={eventDetails}
                    viewportMode={viewportMode}
                    isPreviewMode={isPreviewMode}
                    onOpenCover={onOpenCover}
                    isMiniStudioMode={isMiniStudioMode}
                    onSelectMiniNode={onSelectMiniNode}
                  />
                ))
              ) : (
                <div style={{ padding: '1.25rem 1rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.8rem', width: '100%' }}>
                  📅 Daftar Acara (Belum ada Master Card)
                </div>
              )}
            </div>
          </div>
        );
      }

      // In Preview / Live Mode, clone the master card template for each schedule entry
      return (
        <div
          id={`node-dom-${node.id}`}
          onClick={handleClick}
          style={containerStyle}
          className={nodeClassName}
        >
          {actionOverlay}

          <div style={containerInnerStyle} className="container-inner-wrapper">
            {rawEvents.length === 0 ? (
              isMiniStudio ? (
                <div style={{ padding: '1.25rem 1rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.8rem', width: '100%' }}>
                  📅 Belum ada rincian acara. Tambahkan jadwal acara di panel Form Data sebelah kiri.
                </div>
              ) : null
            ) : (
              rawEvents.map((evt: any, evtIdx: number) => {
                if (sampleCardTemplate) {
                  const boundCard = cloneAndBindEventData(sampleCardTemplate, evt, evtIdx);
                  return (
                    <NodeRenderer
                      key={`evt-card-${evtIdx}-${boundCard.id}`}
                      node={boundCard}
                      allNodes={allNodes}
                      selectedNodeId={selectedNodeId}
                      onSelectNode={onSelectNode}
                      onDeleteNode={onDeleteNode}
                      onDuplicateNode={onDuplicateNode}
                      eventDetails={{ ...eventDetails, ...evt, mapUrl: evt.mapUrl || evt.mapsUrl || eventDetails?.mapUrl }}
                      viewportMode={viewportMode}
                      isPreviewMode={isPreviewMode}
                      onOpenCover={onOpenCover}
                      isMiniStudioMode={isMiniStudioMode}
                      onSelectMiniNode={onSelectMiniNode}
                    />
                  );
                }

                // Fallback default card if no master template card was defined in node.children
                return (
                  <div
                    key={`dyn-evt-card-${evtIdx}`}
                    style={{
                      padding: '1.25rem 1.5rem',
                      borderRadius: '16px',
                      border: '1px solid rgba(0,0,0,0.08)',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.65rem',
                      width: '100%',
                      margin: '8px 0',
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary, #e36397)', fontFamily: 'var(--global-font-primary)', textAlign: 'center' }}>
                      {evt.title || evt.name || 'Nama Acara'}
                    </h4>
                    {(evt.date || evt.time) && (
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {evt.date && <span>🗓️ {evt.date}</span>}
                        {evt.time && <span>⏰ {evt.time}</span>}
                      </div>
                    )}
                    {(evt.location || evt.place) && (
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', textAlign: 'center' }}>
                        📍 {evt.location || evt.place}
                      </div>
                    )}
                    {evt.address && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>
                        {evt.address}
                      </div>
                    )}
                    {(evt.mapsUrl || evt.mapUrl) && (
                      <a
                        href={evt.mapsUrl || evt.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          marginTop: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 16px',
                          borderRadius: '20px',
                          backgroundColor: 'var(--primary, #e36397)',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        🗺️ Buka Google Maps
                      </a>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // Dynamic Love Story Feed Container (isStoryFeed) Rendering
    if (node.isStoryFeed) {
      const isPublic = eventDetails?.isPublicInvitation === true;
      const isMiniStudio = isMiniStudioMode || eventDetails?.isMiniStudioMode === true;
      const isCatalogPreview = eventDetails?.isCatalogPreview === true || (!isPublic && !isMiniStudio);

      const rawStories = (Array.isArray(eventDetails?.story) && eventDetails.story.length > 0)
        ? eventDetails.story
        : (Array.isArray(eventDetails?.loveStories) && eventDetails.loveStories.length > 0)
        ? eventDetails.loveStories
        : isCatalogPreview
        ? DEFAULT_SAMPLE_STORIES
        : [];

      const sampleCardTemplate = node.children && node.children.length > 0 ? node.children[0] : null;

      // In Studio Editor Canvas (non-preview mode), render node.children directly so Admin can click, select, and style every part of the Master Card
      if (!isPreviewMode && !isMiniStudio) {
        return (
          <div
            id={`node-dom-${node.id}`}
            onClick={handleClick}
            style={containerStyle}
            className={nodeClassName}
          >
            {actionOverlay}

            <div style={containerInnerStyle} className="container-inner-wrapper">
              {node.children && node.children.length > 0 ? (
                node.children.map((child) => (
                  <NodeRenderer
                    key={child.id}
                    node={child}
                    allNodes={allNodes}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={onSelectNode}
                    onDeleteNode={onDeleteNode}
                    onDuplicateNode={onDuplicateNode}
                    eventDetails={eventDetails}
                    viewportMode={viewportMode}
                    isPreviewMode={isPreviewMode}
                    onOpenCover={onOpenCover}
                    isMiniStudioMode={isMiniStudioMode}
                    onSelectMiniNode={onSelectMiniNode}
                  />
                ))
              ) : (
                <div style={{ padding: '1.25rem 1rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.8rem', width: '100%' }}>
                  📖 Daftar Kisah Cinta (Belum ada Master Card)
                </div>
              )}
            </div>
          </div>
        );
      }

      // In Preview / Live Mode, clone the master card template for each story entry
      return (
        <div
          id={`node-dom-${node.id}`}
          onClick={handleClick}
          style={containerStyle}
          className={nodeClassName}
        >
          {actionOverlay}

          <div style={containerInnerStyle} className="container-inner-wrapper">
            {rawStories.length === 0 ? (
              isMiniStudio ? (
                <div style={{ padding: '1.25rem 1rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.8rem', width: '100%' }}>
                  📖 Belum ada kisah cinta. Tambahkan cerita di panel Form Data sebelah kiri.
                </div>
              ) : null
            ) : (
              rawStories.map((st: any, stIdx: number) => {
                const cardTemplate = (node.children && node.children.length > 1)
                  ? (stIdx % 2 === 0 ? node.children[0] : node.children[1])
                  : (node.children && node.children.length > 0 ? node.children[0] : null);

                if (cardTemplate) {
                  const boundCard = cloneAndBindStoryData(cardTemplate, st, stIdx);
                  return (
                    <NodeRenderer
                      key={`story-card-${stIdx}-${boundCard.id}`}
                      node={boundCard}
                      allNodes={allNodes}
                      selectedNodeId={selectedNodeId}
                      onSelectNode={onSelectNode}
                      onDeleteNode={onDeleteNode}
                      onDuplicateNode={onDuplicateNode}
                      eventDetails={eventDetails}
                      viewportMode={viewportMode}
                      isPreviewMode={isPreviewMode}
                      onOpenCover={onOpenCover}
                      isMiniStudioMode={isMiniStudioMode}
                      onSelectMiniNode={onSelectMiniNode}
                    />
                  );
                }

                // Fallback card if no template was provided in children
                return (
                  <div
                    key={`dyn-story-card-${stIdx}`}
                    style={{
                      padding: '1.25rem 1.5rem',
                      borderRadius: '16px',
                      border: '1px solid rgba(0,0,0,0.08)',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.65rem',
                      width: '100%',
                      margin: '10px 0',
                    }}
                  >
                    {(st.year || st.date) && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 12px',
                          borderRadius: '20px',
                          backgroundColor: 'var(--primary-light, #fff0f5)',
                          color: 'var(--primary, #e36397)',
                          border: '1px solid var(--primary, #e36397)',
                        }}
                      >
                        {st.year || st.date}
                      </span>
                    )}
                    {st.title && (
                      <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary, #1e293b)', fontFamily: 'var(--global-font-primary)', textAlign: 'center' }}>
                        {st.title}
                      </h4>
                    )}
                    {(st.description || st.story || st.content) && (
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', textAlign: 'center', lineHeight: 1.6 }}>
                        {st.description || st.story || st.content}
                      </p>
                    )}
                    {(st.image || st.photo) && (
                      <img
                        src={st.image || st.photo}
                        alt={st.title || 'Foto Momen'}
                        style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '12px', marginTop: '0.35rem' }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // Dynamic Gallery Grid Container (isGalleryFeed) Rendering
    if (node.isGalleryFeed) {
      const isPublic = eventDetails?.isPublicInvitation === true;
      const isMiniStudio = isMiniStudioMode || eventDetails?.isMiniStudioMode === true;
      const isCatalogPreview = eventDetails?.isCatalogPreview === true || (!isPublic && !isMiniStudio);

      const storeGlobal = typeof window !== 'undefined' ? useStudioStore.getState?.()?.globalStyles : undefined;
      const effectiveDetails = eventDetails || storeGlobal?.sampleEventDetails;
      const rawGallery =
        (Array.isArray(storeGlobal?.galleryImages) && storeGlobal.galleryImages.length > 0)
          ? storeGlobal.galleryImages
          : (Array.isArray(effectiveDetails?.galleryImages) && effectiveDetails.galleryImages.length > 0)
          ? effectiveDetails.galleryImages
          : (Array.isArray(effectiveDetails?.gallery) && effectiveDetails.gallery.length > 0 && effectiveDetails.gallery !== DEFAULT_SAMPLE_GALLERY)
          ? effectiveDetails.gallery
          : (Array.isArray(effectiveDetails?.photos) && effectiveDetails.photos.length > 0)
          ? effectiveDetails.photos
          : (Array.isArray(storeGlobal?.sampleEventDetails?.gallery) && storeGlobal.sampleEventDetails.gallery.length > 0)
          ? storeGlobal.sampleEventDetails.gallery
          : (Array.isArray(effectiveDetails?.gallery) && effectiveDetails.gallery.length > 0)
          ? effectiveDetails.gallery
          : isCatalogPreview
          ? DEFAULT_SAMPLE_GALLERY
          : [];

      const sampleCardTemplate = node.children && node.children.length > 0 ? node.children[0] : null;

      // In Studio Editor Canvas (non-preview mode), render node.children directly so Admin can click, select, and style every part of the Master Gallery Item
      if (!isPreviewMode && !isMiniStudio) {
        return (
          <div
            id={`node-dom-${node.id}`}
            onClick={handleClick}
            style={containerStyle}
            className={nodeClassName}
          >
            {actionOverlay}

            <div style={containerInnerStyle} className="container-inner-wrapper">
              {node.children && node.children.length > 0 ? (
                node.children.map((child) => (
                  <NodeRenderer
                    key={child.id}
                    node={child}
                    allNodes={allNodes}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={onSelectNode}
                    onDeleteNode={onDeleteNode}
                    onDuplicateNode={onDuplicateNode}
                    eventDetails={eventDetails}
                    viewportMode={viewportMode}
                    isPreviewMode={isPreviewMode}
                    onOpenCover={onOpenCover}
                    isMiniStudioMode={isMiniStudioMode}
                    onSelectMiniNode={onSelectMiniNode}
                  />
                ))
              ) : (
                <div style={{ padding: '1.25rem 1rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.8rem', width: '100%' }}>
                  🖼️ Grid Galeri Foto (Belum ada Master Item)
                </div>
              )}
            </div>
          </div>
        );
      }

      // In Preview / Live Mode, clone the master image template for each gallery photo
      return (
        <div
          id={`node-dom-${node.id}`}
          onClick={handleClick}
          style={containerStyle}
          className={nodeClassName}
        >
          {actionOverlay}

          <div style={containerInnerStyle} className="container-inner-wrapper">
            {rawGallery.length === 0 ? (
              isMiniStudio ? (
                <div style={{ padding: '1.25rem 1rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.8rem', width: '100%' }}>
                  🖼️ Belum ada foto galeri. Tambahkan foto di panel Form Data sebelah kiri.
                </div>
              ) : null
            ) : (
              rawGallery.map((imgUrl: string, gIdx: number) => {
                if (sampleCardTemplate) {
                  const boundCard = cloneAndBindGalleryData(sampleCardTemplate, imgUrl, gIdx);
                  return (
                    <NodeRenderer
                      key={`gal-img-${gIdx}-${boundCard.id}`}
                      node={boundCard}
                      allNodes={allNodes}
                      selectedNodeId={selectedNodeId}
                      onSelectNode={onSelectNode}
                      onDeleteNode={onDeleteNode}
                      onDuplicateNode={onDuplicateNode}
                      eventDetails={eventDetails}
                      viewportMode={viewportMode}
                      isPreviewMode={isPreviewMode}
                      onOpenCover={onOpenCover}
                      isMiniStudioMode={isMiniStudioMode}
                      onSelectMiniNode={onSelectMiniNode}
                    />
                  );
                }

                // Fallback default image item
                return (
                  <div
                    key={`dyn-gal-img-${gIdx}`}
                    onClick={(e) => {
                      if (isPreviewMode) {
                        e.stopPropagation();
                        const allGallery = collectGalleryImageUrls(allNodes || [node], eventDetails);
                        const gList = allGallery.length > 0 ? allGallery : rawGallery;
                        let idx = gList.indexOf(imgUrl);
                        if (idx === -1) idx = gList.findIndex((u: string) => (u || '').trim() === (imgUrl || '').trim());
                        setGalleryImages(gList);
                        setLightboxIndex(idx >= 0 ? idx : gIdx);
                      }
                    }}
                    style={{
                      position: 'relative',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      aspectRatio: '1 / 1',
                      backgroundColor: '#f1f5f9',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                      cursor: isPreviewMode ? 'pointer' : 'default',
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Foto Galeri #${gIdx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                );
              })
            )}
          </div>

          {lightboxIndex !== null && (
            <LightboxModal
              images={galleryImages.length > 0 ? galleryImages : rawGallery}
              currentIndex={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onNavigate={(idx) => setLightboxIndex(idx)}
            />
          )}
        </div>
      );
    }

    if (node.isWishesFeed && isPreviewMode) {
      const activeWishes = (eventDetails?.isPublicInvitation && Array.isArray(eventDetails.wishesList))
        ? eventDetails.wishesList
        : useStudioStore.getState().wishes;
      const sampleCardTemplate = node.children && node.children.length > 0 ? node.children[0] : null;

      return (
        <div
          id={`node-dom-${node.id}`}
          onClick={handleClick}
          style={containerStyle}
          className={nodeClassName}
        >
          {actionOverlay}

          <div style={containerInnerStyle} className="container-inner-wrapper">
            {activeWishes.map((wish: WishItem, wishIdx: number) => {
              if (sampleCardTemplate) {
                const boundCard = cloneAndBindWishData(sampleCardTemplate, wish, wishIdx);
                return (
                  <NodeRenderer
                    key={`wish-card-${wishIdx}-${boundCard.id}`}
                    node={boundCard}
                    allNodes={allNodes}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={onSelectNode}
                    onDeleteNode={onDeleteNode}
                    onDuplicateNode={onDuplicateNode}
                    eventDetails={eventDetails}
                    viewportMode={viewportMode}
                    isPreviewMode={isPreviewMode}
                    onOpenCover={onOpenCover}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={containerStyle}
        className={nodeClassName}
      >
        {actionOverlay}

        {isSlideshowBg ? (
          <ContainerSlideshowBackground style={style} allNodes={allNodes} slideIndex={slideIndex} eventDetails={eventDetails} />
        ) : (
          style.backgroundOverlayColor && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: style.backgroundOverlayColor,
                opacity: style.backgroundOverlayOpacity ?? 0.5,
                pointerEvents: 'none',
                borderRadius: 'inherit',
                zIndex: 0,
              }}
            />
          )
        )}

        <div style={containerInnerStyle} className="container-inner-wrapper">
          {node.children?.map((child, childIdx) => (
            <NodeRenderer
              key={`${child.id}-${childIdx}`}
              node={child}
              allNodes={allNodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              onDeleteNode={onDeleteNode}
              onDuplicateNode={onDuplicateNode}
              eventDetails={eventDetails}
              viewportMode={viewportMode}
              isPreviewMode={isPreviewMode}
              onOpenCover={onOpenCover}
              isMiniStudioMode={isMiniStudioMode}
              onSelectMiniNode={onSelectMiniNode}
            />
          ))}
        </div>
      </div>
    );
  }

  // Heading
  if (node.type === 'heading') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={computedStyle}
        className={nodeClassName}
      >
        {actionOverlay}
        {style.isCurvedText ? (
          <CurvedTextRenderer
            nodeId={node.id}
            text={contentText}
            computedStyle={computedStyle}
            style={style}
          />
        ) : (
          <span style={{ lineHeight: resolvedLineHeight || 'inherit' }}>{contentText}</span>
        )}
      </div>
    );
  }

  // Text Block
  if (node.type === 'text') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={computedStyle}
        className={nodeClassName}
      >
        {actionOverlay}
        {style.isCurvedText ? (
          <CurvedTextRenderer
            nodeId={node.id}
            text={contentText}
            computedStyle={computedStyle}
            style={style}
          />
        ) : (
          <p style={{ margin: 0, lineHeight: resolvedLineHeight || 'inherit' }}>{contentText}</p>
        )}
      </div>
    );
  }

  // Button
  if (node.type === 'button') {
    const isCoverButton = node.buttonAction === 'open-cover' || contentText.toLowerCase().includes('buka undangan');
    const isMapsButton = node.buttonAction === 'google-maps' || contentText.toLowerCase().includes('google maps');
    const isCalendarButton = node.buttonAction === 'save-calendar' || contentText.toLowerCase().includes('simpan kalender') || contentText.toLowerCase().includes('save the date');
    const isRsvpButton = node.buttonAction === 'submit-rsvp' || contentText.toLowerCase().includes('kirim rsvp') || contentText.toLowerCase().includes('kirim konfirmasi');

    const isSocialAction = ['open-instagram', 'open-tiktok', 'open-facebook', 'open-whatsapp', 'open-youtube', 'open-url'].includes(node.buttonAction || '');
    const resolvedSocialUrl = isSocialAction ? resolveSocialButtonUrl(node.buttonAction || '', node.buttonUrl || '', eventDetails) : null;

    // In Preview Mode, automatically hide the button if the social account handle is empty!
    if (isPreviewMode && isSocialAction && !resolvedSocialUrl) {
      return null;
    }

    const handleButtonClick = (e: React.MouseEvent) => {
      if (isPreviewMode) {
        const actionId = node.customAction || node.buttonAction;
        if (actionId) {
          const executed = executeRegisteredFunction(actionId, node.customActionParam || node.buttonUrl, {
            eventDetails,
            onOpenCover,
            node,
            event: e,
          });
          if (executed) return;
        }
        if (isSocialAction) {
          e.stopPropagation();
          if (resolvedSocialUrl) {
            window.open(resolvedSocialUrl, '_blank');
          }
          return;
        }
        if (isCoverButton && onOpenCover) {
          onOpenCover();
          return;
        }
        if (isMapsButton) {
          const mapUrl = eventDetails?.mapUrl || `https://maps.google.com/?q=${encodeURIComponent((eventDetails?.location || eventDetails?.event_location || '') + ' ' + (eventDetails?.address || eventDetails?.event_address || ''))}`;
          window.open(mapUrl, '_blank');
          return;
        }
        if (isCalendarButton) {
          const calUrl = generateGoogleCalendarUrl(eventDetails);
          window.open(calUrl, '_blank');
          return;
        }
        if (isRsvpButton) {
          e.stopPropagation();
          const btnEl = document.getElementById(`node-dom-${node.id}`);
          const formWrapper = btnEl?.closest('.container-inner-wrapper') || btnEl?.parentElement;

          const nameInp = (formWrapper?.querySelector('input[name="guest_name"], input[placeholder*="nama" i], input[type="text"]') || document.querySelector('input[name="guest_name"], input[placeholder*="nama" i]')) as HTMLInputElement;
          const selectInp = (formWrapper?.querySelector('select[name="attendance"], select') || document.querySelector('select[name="attendance"], select')) as HTMLSelectElement;
          const msgInp = (formWrapper?.querySelector('textarea[name="message"], textarea[placeholder*="ucapan" i], textarea') || document.querySelector('textarea[name="message"], textarea')) as HTMLTextAreaElement;

          const nameVal = nameInp?.value?.trim() || 'Tamu Undangan';
          const attendanceVal = selectInp?.value || '✅ Hadir';
          const msgVal = msgInp?.value?.trim();

          if (msgVal) {
            useStudioStore.getState().addWish({
              name: nameVal,
              attendance: attendanceVal.startsWith('✅') || attendanceVal.startsWith('🙏') || attendanceVal.startsWith('🕊️') ? attendanceVal : `✅ ${attendanceVal}`,
              message: msgVal,
            });
          }

          if (eventDetails?.isPublicInvitation && eventDetails?.eventId) {
            fetch('/api/guests', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventId: eventDetails.eventId,
                name: nameVal,
                attendance: attendanceVal,
                pax: 1,
                wishes: msgVal || null,
              }),
            })
            .then((res) => {
              if (res.ok && typeof (window as any).refreshWishes === 'function') {
                (window as any).refreshWishes();
              }
            })
            .catch((err) => console.error('Error submitting RSVP:', err));
          }

          if (nameInp) nameInp.value = '';
          if (msgInp) msgInp.value = '';

          useStudioStore.getState().setSubmittedRsvp({
            name: nameVal,
            attendance: attendanceVal,
            message: msgVal,
          });
          return;
        }
      }
      handleClick(e);
    };

    const buttonIcon = node.icon?.trim();
    const iconPos = node.iconPosition || 'left';
    const gapPx = node.iconGap ?? 6;
    const iconSizePx = node.iconSize ? `${node.iconSize}px` : '1.25em';
    const customIconStyle: React.CSSProperties = {
      width: iconSizePx,
      height: iconSizePx,
      color: node.iconColor || 'inherit',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const buttonFlexStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: computedStyle.justifyContent || 'center',
      cursor: 'pointer',
      ...computedStyle,
    };

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleButtonClick}
        style={buttonFlexStyle}
        className={`btn btn-primary ${nodeClassName}`}
        role="button"
        tabIndex={0}
      >
        {actionOverlay}
        {buttonIcon && iconPos === 'left' && (
          <span style={{ marginRight: `${gapPx}px`, display: 'inline-flex', alignItems: 'center' }}>
            {isSvgMarkup(buttonIcon) ? (
              <span
                className="studio-btn-svg-icon"
                dangerouslySetInnerHTML={{ __html: normalizeSvgString(buttonIcon) }}
                style={customIconStyle}
              />
            ) : buttonIcon.startsWith('http') || buttonIcon.startsWith('data:') ? (
              <img src={buttonIcon} alt="icon" style={{ ...customIconStyle, objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: iconSizePx, color: node.iconColor || 'inherit' }}>{buttonIcon}</span>
            )}
          </span>
        )}
        <span>{contentText}</span>
        {buttonIcon && iconPos === 'right' && (
          <span style={{ marginLeft: `${gapPx}px`, display: 'inline-flex', alignItems: 'center' }}>
            {isSvgMarkup(buttonIcon) ? (
              <span
                className="studio-btn-svg-icon"
                dangerouslySetInnerHTML={{ __html: normalizeSvgString(buttonIcon) }}
                style={customIconStyle}
              />
            ) : buttonIcon.startsWith('http') || buttonIcon.startsWith('data:') ? (
              <img src={buttonIcon} alt="icon" style={{ ...customIconStyle, objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: iconSizePx, color: node.iconColor || 'inherit' }}>{buttonIcon}</span>
            )}
          </span>
        )}
      </div>
    );
  }

  // Image
  if (node.type === 'image') {
    const isGalleryImage = !!node.showInGallery;
    let imageUrl = node.content || (node as any).src || '';

    if (imageUrl) {
      imageUrl = resolveTextVariables(imageUrl, eventDetails);
    }

    if (node.binding && eventDetails) {
      const boundVal = (eventDetails as any)[node.binding];
      if (boundVal && boundVal.trim() !== '') {
        imageUrl = boundVal;
      } else if (node.content && node.content.trim() !== '' && node.content !== (SAMPLE_VARIABLES as any)[node.binding]) {
        imageUrl = resolveTextVariables(node.content, eventDetails);
      } else if ((SAMPLE_VARIABLES as any)[node.binding]) {
        imageUrl = (SAMPLE_VARIABLES as any)[node.binding];
      }
    }

    // Fallback if imageUrl is still empty or contains unresolved variable braces
    if (!imageUrl || imageUrl.trim() === '' || imageUrl.startsWith('{') || imageUrl.startsWith('[')) {
      imageUrl = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80';
    }

    const handleImageClick = (e: React.MouseEvent) => {
      if (isPreviewMode && isGalleryImage) {
        e.stopPropagation();
        const nodesToSearch = allNodes && allNodes.length > 0 ? allNodes : useStudioStore.getState().nodes;
        const allGallery = collectGalleryImageUrls(nodesToSearch.length > 0 ? nodesToSearch : [node], eventDetails);
        if (allGallery.length > 0) {
          const trimmedUrl = (imageUrl || '').trim();
          let idx = allGallery.indexOf(imageUrl);
          if (idx === -1) {
            idx = allGallery.indexOf(trimmedUrl);
          }
          if (idx === -1) {
            idx = allGallery.findIndex((u) => (u || '').trim() === trimmedUrl);
          }
          setGalleryImages(allGallery);
          setLightboxIndex(idx >= 0 ? idx : 0);
          return;
        }
      }
      handleClick(e);
    };

    return (
      <>
        <div
          id={`node-dom-${node.id}`}
          onClick={handleImageClick}
          style={{
            ...computedStyle,
            cursor: isPreviewMode && isGalleryImage ? 'pointer' : computedStyle.cursor,
            position: computedStyle.position || 'relative',
          }}
          className={nodeClassName}
        >
          {actionOverlay}
          <img
            src={imageUrl}
            alt="Node Image"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80';
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
          />

          {/* Badge Icon on Canvas (Editor Mode only) when showInGallery is enabled */}
          {!isPreviewMode && isGalleryImage && (
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                backgroundColor: 'var(--primary, #e36397)',
                color: '#ffffff',
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '10px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                zIndex: 10,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              🖼️ Lightbox
            </span>
          )}
        </div>

        {lightboxIndex !== null && (
          <LightboxModal
            images={galleryImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={(idx) => setLightboxIndex(idx)}
          />
        )}
      </>
    );
  }

  // Standalone Gallery Widget (node.type === 'gallery')
  if (node.type === 'gallery') {
    const storeGlobal = typeof window !== 'undefined' ? useStudioStore.getState?.()?.globalStyles : undefined;
    const effectiveDetails = eventDetails || storeGlobal?.sampleEventDetails;
    const userPhotos =
      (Array.isArray(storeGlobal?.galleryImages) && storeGlobal.galleryImages.length > 0)
        ? storeGlobal.galleryImages
        : (Array.isArray(effectiveDetails?.galleryImages) && effectiveDetails.galleryImages.length > 0)
        ? effectiveDetails.galleryImages
        : (Array.isArray(effectiveDetails?.gallery) && effectiveDetails.gallery.length > 0 && effectiveDetails.gallery !== DEFAULT_SAMPLE_GALLERY)
        ? effectiveDetails.gallery
        : (Array.isArray(effectiveDetails?.photos) && effectiveDetails.photos.length > 0)
        ? effectiveDetails.photos
        : (Array.isArray(storeGlobal?.sampleEventDetails?.gallery) && storeGlobal.sampleEventDetails.gallery.length > 0)
        ? storeGlobal.sampleEventDetails.gallery
        : (Array.isArray(effectiveDetails?.gallery) && effectiveDetails.gallery.length > 0)
        ? effectiveDetails.gallery
        : undefined;

    const hasUserPhotos = Array.isArray(userPhotos) && userPhotos.length > 0;

    if (isPreviewMode && !hasUserPhotos) {
      return null;
    }

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{
          ...computedStyle,
          width: '100%',
          position: computedStyle.position || 'relative',
        }}
        className={nodeClassName}
      >
        {actionOverlay}
        <PhotoGalleryGrid
          images={userPhotos}
          isPreviewMode={isPreviewMode}
          title={node.content || undefined}
        />
      </div>
    );
  }

  // Closing Thank You Widget (node.type === 'thank-you' || node.widgetType === 'thank-you')
  if (node.type === 'thank-you' || node.widgetType === 'thank-you') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{
          ...computedStyle,
          width: '100%',
          position: computedStyle.position || 'relative',
        }}
        className={nodeClassName}
      >
        {actionOverlay}
        <ThankYouClosing
          content={contentText}
          eventDetails={eventDetails}
          isPreviewMode={isPreviewMode}
        />
      </div>
    );
  }

  // Slider Widget (Slide Gambar - Auto Rotating Gallery Images)
  if (node.type === 'slider') {
    const storeNodes = useStudioStore.getState().nodes;
    const nodesToSearch = allNodes && allNodes.length > 0 ? allNodes : (storeNodes && storeNodes.length > 0 ? storeNodes : []);
    let gImages = collectGalleryImageUrls(nodesToSearch, eventDetails);

    if (gImages.length === 0) {
      if (node.content) {
        gImages = [node.content, ...DEFAULT_GALLERY_FALLBACKS];
      } else {
        gImages = DEFAULT_GALLERY_FALLBACKS;
      }
    }

    const sliderEffect = style.sliderEffect || 'fade';
    const activeIdx = gImages.length > 0 ? slideIndex % gImages.length : 0;

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{
          ...computedStyle,
          position: computedStyle.position || 'relative',
          overflow: 'hidden',
          minHeight: computedStyle.height && computedStyle.height !== 'auto' ? computedStyle.height : '240px',
        }}
        className={nodeClassName}
      >
        {actionOverlay}

        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit' }}>
          {gImages.map((imgUrl, idx) => {
            const isActive = idx === activeIdx;

            let transformStyle = 'scale(1)';
            let transitionStyle = 'opacity 1.2s ease-in-out';

            if (sliderEffect === 'kenburns') {
              transformStyle = isActive ? 'scale(1.15)' : 'scale(1)';
              transitionStyle = 'opacity 1.2s ease-in-out, transform 8s ease-in-out';
            } else if (sliderEffect === 'slide') {
              transformStyle = isActive ? 'translateX(0)' : idx < activeIdx ? 'translateX(-100%)' : 'translateX(100%)';
              transitionStyle = 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out';
            }

            return (
              <div
                key={imgUrl + idx}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${imgUrl})`,
                  backgroundSize: style.objectFit === 'contain' ? 'contain' : 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  opacity: isActive ? 1 : 0,
                  transform: transformStyle,
                  transition: transitionStyle,
                }}
              />
            );
          })}
        </div>

        {/* Small badge in editor indicating slider */}
        {!isPreviewMode && (
          <span
            style={{
              position: 'absolute',
              top: '6px',
              left: '6px',
              backgroundColor: 'rgba(0,0,0,0.65)',
              color: '#fff',
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              pointerEvents: 'none',
              zIndex: 3,
              backdropFilter: 'blur(4px)',
            }}
          >
            🎠 Slide Gambar ({gImages.length} Foto Galeri)
          </span>
        )}
      </div>
    );
  }

  // Countdown
  if (node.type === 'countdown') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={computedStyle}
        className={nodeClassName}
      >
        {actionOverlay}
        <CountdownTimer node={node} eventDetails={eventDetails} style={style} viewportMode={viewportMode} />
      </div>
    );
  }

  // Map Widget (Interactive Google Map Embed + Direct Navigation Button)
  if (node.type === 'map') {
    let rawUrl = (
      eventDetails?.maps_url ||
      eventDetails?.location_maps_url ||
      eventDetails?.map_url ||
      eventDetails?.link_maps ||
      node.buttonUrl ||
      node.content ||
      ''
    ).trim();

    if (rawUrl.startsWith('{') && rawUrl.endsWith('}')) {
      const tagName = rawUrl.slice(1, -1);
      rawUrl = (eventDetails?.[tagName] || eventDetails?.maps_url || eventDetails?.location_maps_url || '').trim();
    }

    const defaultSampleEmbed = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2736423974415!2d106.8016462749903!3d-6.227608293760431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f14d34b3f885%3A0xb35a0f2b2319208a!2sGelora%20Bung%20Karno%20Main%20Stadium!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid';

    let embedUrl = defaultSampleEmbed;
    let directUrl = 'https://maps.google.com/?q=Gelora+Bung+Karno+Main+Stadium+Jakarta';

    if (rawUrl) {
      if (rawUrl.includes('google.com/maps/embed')) {
        embedUrl = rawUrl;
        directUrl = rawUrl;
      } else {
        const query = encodeURIComponent(eventDetails?.nama_lokasi || eventDetails?.alamat_lengkap || rawUrl);
        embedUrl = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        directUrl = rawUrl.startsWith('http') ? rawUrl : `https://maps.google.com/?q=${query}`;
      }
    } else if (eventDetails?.nama_lokasi || eventDetails?.alamat_lengkap) {
      const query = encodeURIComponent(`${eventDetails?.nama_lokasi || ''} ${eventDetails?.alamat_lengkap || ''}`.trim());
      embedUrl = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      directUrl = `https://maps.google.com/?q=${query}`;
    }

    const showIframe = getResponsiveStyle(style, 'mapShowIframe', true, viewportMode) !== false;
    const showButton = getResponsiveStyle(style, 'mapShowButton', true, viewportMode) !== false;

    // Iframe styles
    const iframeHeight = String(getResponsiveStyle(style, 'mapIframeHeight', '260px', viewportMode));
    const iframeBorderRadiusRaw = getResponsiveStyle(style, 'mapIframeBorderRadius', 14, viewportMode);
    const iframeBorderRadius = iframeBorderRadiusRaw !== undefined ? `${iframeBorderRadiusRaw}px` : '14px';

    // Button styles
    const buttonText = String(getResponsiveStyle(style, 'mapButtonText', '🗺️ Buka di Google Maps', viewportMode));
    const buttonBgColor = String(getResponsiveStyle(style, 'mapButtonBgColor', '#0284c7', viewportMode));
    const buttonTextColor = String(getResponsiveStyle(style, 'mapButtonTextColor', '#ffffff', viewportMode));
    const buttonPadding = String(getResponsiveStyle(style, 'mapButtonPadding', '10px 16px', viewportMode));
    const buttonBorderRadiusRaw = getResponsiveStyle(style, 'mapButtonBorderRadius', 12, viewportMode);
    const buttonBorderRadius = buttonBorderRadiusRaw !== undefined ? `${buttonBorderRadiusRaw}px` : '12px';
    const buttonFontSize = String(getResponsiveStyle(style, 'mapButtonFontSize', '0.8rem', viewportMode));

    // Gap style
    const gapRaw = getResponsiveStyle(style, 'mapGap', 8, viewportMode);
    const gapVal = gapRaw !== undefined ? `${gapRaw}px` : '8px';

    const handleOpenDirectMap = (e: React.MouseEvent) => {
      if (isPreviewMode) {
        e.stopPropagation();
        window.open(directUrl, '_blank', 'noopener,noreferrer');
      }
    };

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{
          ...computedStyle,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: gapVal,
          overflow: 'hidden',
          width: '100%',
        }}
        className={nodeClassName}
      >
        {actionOverlay}

        {/* Interactive Google Map Iframe Container */}
        {showIframe && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: iframeHeight,
              borderRadius: iframeBorderRadius,
              overflow: 'hidden',
              boxShadow: computedStyle.boxShadow || '0 4px 14px rgba(0,0,0,0.06)',
              border: computedStyle.border || '1px solid var(--border-color, #e2e8f0)',
            }}
          >
            <iframe
              title="Google Map Location"
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, width: '100%', height: '100%' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Pointer blocker overlay in Studio Edit mode so desainer can drag/select the widget easily */}
            {!isPreviewMode && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 2,
                  cursor: 'pointer',
                  backgroundColor: 'rgba(0,0,0,0.01)',
                }}
              />
            )}
          </div>
        )}

        {/* Action Button: Buka di Google Maps */}
        {showButton && (
          <button
            type="button"
            onClick={handleOpenDirectMap}
            style={{
              width: '100%',
              padding: buttonPadding,
              fontSize: buttonFontSize,
              fontWeight: 700,
              backgroundColor: buttonBgColor,
              color: buttonTextColor,
              border: 'none',
              borderRadius: buttonBorderRadius,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: `0 3px 10px ${buttonBgColor}40`,
            }}
          >
            {buttonText}
          </button>
        )}
      </div>
    );
  }

  // Form Input Field
  if (node.type === 'input') {
    const isGuestNameField = node.inputName === 'guest_name' || node.inputName === 'nama_tamu' || node.isGuestNameInput === true;
    const boundGuestName = isGuestNameField && eventDetails ? (eventDetails.guestName || eventDetails.guest_name || eventDetails.nama_tamu || '') : '';
    const shouldLockName = isGuestNameField || node.isGuestNameInput === true;
    const inputVal = isPreviewMode && shouldLockName && boundGuestName ? boundGuestName : undefined;
    const displayPlaceholder = !isPreviewMode && shouldLockName ? '🔒 Auto dari {nama_tamu} (Terkunci dari Link Tamu)' : (node.placeholder || 'Ketik nama Anda...');

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{ width: computedStyle.width || '100%', position: computedStyle.position || 'relative' }}
        className={nodeClassName}
      >
        {actionOverlay}
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            defaultValue={inputVal}
            value={inputVal}
            placeholder={displayPlaceholder}
            name={node.inputName || 'custom_input'}
            style={{
              ...computedStyle,
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: isPreviewMode && shouldLockName && boundGuestName ? 'rgba(0,0,0,0.03)' : computedStyle.backgroundColor,
              cursor: isPreviewMode && shouldLockName && boundGuestName ? 'not-allowed' : undefined,
              paddingRight: isPreviewMode && shouldLockName && boundGuestName ? '2.5rem' : computedStyle.paddingRight,
            }}
            readOnly={!isPreviewMode || (shouldLockName && !!boundGuestName)}
          />
          {isPreviewMode && shouldLockName && boundGuestName && (
            <span
              title="Nama lengkap terisi otomatis dari link khusus tamu dan terkunci"
              style={{
                position: 'absolute',
                right: '12px',
                fontSize: '0.85rem',
                opacity: 0.7,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              🔒
            </span>
          )}
        </div>
      </div>
    );
  }

  // Select Field
  if (node.type === 'select') {
    const rawOptions = node.selectOptions || '✅ Hadir, ❌ Tidak Hadir';
    const optionsList = rawOptions.split(',').map((opt) => opt.trim()).filter(Boolean);
    const useButtons = node.renderAsButtons !== false;

    if (useButtons) {
      return (
        <SelectButtonsField
          node={node}
          optionsList={optionsList}
          computedStyle={computedStyle}
          nodeClassName={nodeClassName}
          actionOverlay={actionOverlay}
          handleClick={handleClick}
          isPreviewMode={isPreviewMode}
        />
      );
    }

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{ width: computedStyle.width || '100%', position: computedStyle.position || 'relative' }}
        className={nodeClassName}
      >
        {actionOverlay}
        <select
          name={node.inputName || 'custom_select'}
          style={{
            ...computedStyle,
            outline: 'none',
            boxSizing: 'border-box',
            cursor: 'pointer',
          }}
          disabled={!isPreviewMode}
        >
          {optionsList.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Textarea Field
  if (node.type === 'textarea') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{ width: computedStyle.width || '100%', position: computedStyle.position || 'relative' }}
        className={nodeClassName}
      >
        {actionOverlay}
        <textarea
          placeholder={node.placeholder || 'Tuliskan ucapan & doa restu...'}
          name={node.inputName || 'custom_textarea'}
          style={{
            ...computedStyle,
            outline: 'none',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
          readOnly={!isPreviewMode}
        />
      </div>
    );
  }

  // Divider
  if (node.type === 'divider') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={computedStyle}
        className={nodeClassName}
      >
        {actionOverlay}
        {(() => {
          const divType = String(style.dividerType || 'solid');
          const color = resolveStyleValue(style.dividerColor) || '#cbd5e1';
          const thickness = style.dividerHeight !== undefined ? Number(style.dividerHeight) : 1;
          const widthVal = style.dividerWidth !== undefined ? `${style.dividerWidth}%` : '100%';

          if (divType === 'icon') {
            const rawIcon = String(style.dividerIconSymbol || node.icon || '✨');
            const iconColor = resolveStyleValue(style.dividerIconColor) || color;
            const rawSize = style.dividerIconSize || '20px';
            const iconSizePx = typeof rawSize === 'number' ? `${rawSize}px` : (!isNaN(Number(rawSize)) ? `${rawSize}px` : String(rawSize));
            const lineStyle = String(style.dividerLineStyle || 'solid');

            const iconShape = String(style.dividerIconShape || 'none');
            const iconBg = resolveStyleValue(style.dividerIconBg) || (iconShape !== 'none' ? 'rgba(227, 99, 151, 0.08)' : 'transparent');
            const iconPadding = style.dividerIconPadding !== undefined ? Number(style.dividerIconPadding) : (iconShape !== 'none' ? 6 : 0);
            const iconBorderColor = resolveStyleValue(style.dividerIconBorderColor) || 'transparent';
            const iconBorderWidth = iconBorderColor !== 'transparent' ? (Number(style.dividerIconBorderWidth) || 1) : 0;
            const iconRadius = iconShape === 'circle' ? '50%' : iconShape === 'rounded' ? '8px' : '0px';

            const isSvg = isSvgMarkup(rawIcon);
            const isUrl = rawIcon.startsWith('http://') || rawIcon.startsWith('https://') || rawIcon.startsWith('data:');

            const iconElement = isSvg ? (
              <span
                className="studio-btn-svg-icon"
                style={{
                  width: iconSizePx,
                  height: iconSizePx,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: iconColor,
                  lineHeight: 1,
                  flexShrink: 0,
                }}
                dangerouslySetInnerHTML={{ __html: normalizeSvgString(rawIcon) }}
              />
            ) : isUrl ? (
              <img
                src={rawIcon}
                alt="divider-icon"
                style={{
                  width: iconSizePx,
                  height: iconSizePx,
                  objectFit: 'contain',
                  display: 'block',
                  flexShrink: 0,
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: iconSizePx,
                  lineHeight: 1,
                  color: iconColor,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {rawIcon}
              </span>
            );

            const badgeStyle: React.CSSProperties = {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: iconShape !== 'none' ? `${iconPadding}px` : '0 0.85rem',
              margin: iconShape !== 'none' ? '0 0.75rem' : undefined,
              borderRadius: iconRadius,
              backgroundColor: iconBg,
              border: iconBorderWidth > 0 ? `${iconBorderWidth}px solid ${iconBorderColor}` : undefined,
              boxSizing: 'border-box',
              lineHeight: 1,
              flexShrink: 0,
            };

            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: widthVal, margin: '12px auto' }}>
                <div style={{ flex: 1, borderTop: `${thickness}px ${lineStyle} ${color}` }} />
                <div style={badgeStyle}>
                  {iconElement}
                </div>
                <div style={{ flex: 1, borderTop: `${thickness}px ${lineStyle} ${color}` }} />
              </div>
            );
          }

          return (
            <div style={{ width: widthVal, margin: '12px auto' }}>
              <hr
                style={{
                  border: 'none',
                  borderTop: `${thickness}px ${divType} ${color}`,
                  margin: 0,
                  width: '100%'
                }}
              />
            </div>
          );
        })()}
      </div>
    );
  }

  // Spacer
  if (node.type === 'spacer') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{ height: style.height ? `${style.height}px` : '30px', ...computedStyle }}
        className={nodeClassName}
      >
        {actionOverlay}
      </div>
    );
  }

  return (
    <div
      id={`node-dom-${node.id}`}
      onClick={handleClick}
      style={computedStyle}
      className={nodeClassName}
    >
      {actionOverlay}
      <span>[{node.type}] {contentText}</span>
    </div>
  );
}

function SelectButtonsField({
  node,
  optionsList,
  computedStyle,
  nodeClassName,
  actionOverlay,
  handleClick,
  isPreviewMode,
}: {
  node: StudioNode;
  optionsList: string[];
  computedStyle: React.CSSProperties;
  nodeClassName: string;
  actionOverlay: React.ReactNode;
  handleClick: (e: React.MouseEvent) => void;
  isPreviewMode?: boolean;
}) {
  const [selectedVal, setSelectedVal] = useState<string>(optionsList[0] || '✅ Hadir');

  return (
    <div
      id={`node-dom-${node.id}`}
      onClick={handleClick}
      style={{ width: computedStyle.width || '100%', position: computedStyle.position || 'relative' }}
      className={nodeClassName}
    >
      {actionOverlay}
      <input type="hidden" name={node.inputName || 'attendance'} value={selectedVal} />
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          width: '100%',
          flexWrap: 'wrap',
        }}
      >
        {optionsList.map((opt, idx) => {
          const isSelected = selectedVal === opt;
          const isPositive = opt.toLowerCase().includes('hadir') && !opt.toLowerCase().includes('tidak');
          const isNegative = opt.toLowerCase().includes('tidak hadir');

          let activeBorder = '2px solid var(--primary, #e36397)';
          let activeBg = 'var(--primary-light, #fdf2f8)';
          let activeColor = 'var(--primary, #db2777)';

          if (isPositive) {
            activeBorder = '2px solid #10b981';
            activeBg = '#ecfdf5';
            activeColor = '#047857';
          } else if (isNegative) {
            activeBorder = '2px solid #ef4444';
            activeBg = '#fef2f2';
            activeColor = '#b91c1c';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                if (isPreviewMode) {
                  e.stopPropagation();
                  setSelectedVal(opt);
                }
              }}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: computedStyle.padding || '12px 16px',
                borderRadius: computedStyle.borderRadius ? `${computedStyle.borderRadius}px` : '10px',
                fontSize: computedStyle.fontSize || '0.85rem',
                fontFamily: computedStyle.fontFamily || 'inherit',
                fontWeight: isSelected ? 800 : 600,
                border: isSelected ? activeBorder : '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: isSelected ? activeBg : 'var(--bg-card, #ffffff)',
                color: isSelected ? activeColor : 'var(--text-main, #334155)',
                cursor: isPreviewMode ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <span>{opt}</span>
              {isSelected && <span style={{ fontSize: '0.8rem' }}>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CurvedTextRenderer({
  nodeId,
  text,
  computedStyle,
  style,
}: {
  nodeId: string;
  text: string;
  computedStyle: React.CSSProperties;
  style: any;
}) {
  const radius = Number(style.textCurveRadius !== undefined ? style.textCurveRadius : 120);
  const pathId = `curved-path-${nodeId}`;

  const absRadius = Math.max(Math.abs(radius), 20);
  const sweep = radius >= 0 ? 1 : 0;
  const svgWidth = Math.max(absRadius * 2 + 40, 240);
  const svgHeight = Math.max(absRadius + 40, 70);

  const startX = 20;
  const startY = radius >= 0 ? absRadius + 20 : 20;
  const endX = svgWidth - 20;
  const endY = startY;
  const pathD = `M ${startX},${startY} A ${absRadius},${absRadius} 0 0,${sweep} ${endX},${endY}`;

  const textColor = computedStyle.color || 'inherit';
  const fontFamily = computedStyle.fontFamily || 'inherit';
  const fontSize = computedStyle.fontSize || '1.2rem';
  const fontWeight = computedStyle.fontWeight || '700';
  const letterSpacing = computedStyle.letterSpacing || 'normal';

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', overflow: 'visible' }}>
      <svg
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ overflow: 'visible' }}
      >
        <path id={pathId} d={pathD} fill="none" stroke="none" />
        <text
          fill={textColor}
          style={{
            fontFamily,
            fontSize,
            fontWeight: fontWeight as any,
            letterSpacing,
          }}
        >
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
