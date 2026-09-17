import React from 'react';
import { resolveTextVariables } from '@/store/studio-store';

export interface FunctionContext {
  eventDetails?: any;
  onOpenCover?: () => void;
  node?: any;
  event?: React.MouseEvent;
}

export interface RegisteredFunction {
  id: string;
  name: string;
  category: 'navigation' | 'action' | 'utility' | 'media';
  description: string;
  requiresParam?: boolean;
  paramLabel?: string;
  paramPlaceholder?: string;
  execute: (param?: string, context?: FunctionContext) => void | Promise<void>;
}

/**
 * Pure Canvas Confetti Particle Launcher
 * Creates a 3.5s explosion of colorful confetti without external npm packages.
 */
function runConfettiAnimation() {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.id = 'custom-confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#e36397', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e', '#fbbf24'];
  const particles = Array.from({ length: 90 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * (canvas.height * 0.5) - canvas.height * 0.3,
    size: Math.random() * 8 + 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: Math.random() * 4 + 3,
    speedX: Math.random() * 4 - 2,
    rotation: Math.random() * 360,
    rotSpeed: Math.random() * 12 - 6,
  }));

  let animationFrame: number;
  const startTime = Date.now();

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();

      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;
    });

    if (Date.now() - startTime < 3500) {
      animationFrame = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrame);
      canvas.remove();
    }
  };

  render();
}

/**
 * Toast Notification Popup UI Helper
 */
function showToastNotification(message: string) {
  if (typeof window === 'undefined') return;

  const existingToast = document.getElementById('custom-func-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'custom-func-toast';
  toast.innerText = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '30px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = '#0f172a';
  toast.style.color = '#ffffff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '20px';
  toast.style.fontSize = '0.82rem';
  toast.style.fontWeight = '700';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
  toast.style.zIndex = '999999';
  toast.style.transition = 'all 0.3s ease';
  toast.style.opacity = '0';

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * SYSTEM FUNCTION REGISTRY MAP
 */
export const FUNCTION_REGISTRY: Record<string, RegisteredFunction> = {
  scrollToSection: {
    id: 'scrollToSection',
    name: '📜 Scroll ke Section (Id)',
    category: 'navigation',
    description: 'Menggulung layar secara halus ke seksi/elemen target yang ditentukan',
    requiresParam: true,
    paramLabel: 'ID Seksi Target',
    paramPlaceholder: 'Contoh: section-event_schedule atau hero',
    execute: (param) => {
      if (!param || typeof window === 'undefined') return;
      const targetId = param.startsWith('#') ? param.slice(1) : param;
      
      // Look for DOM element by ID or data-section-id attribute
      const el =
        document.getElementById(targetId) ||
        document.getElementById(`node-dom-${targetId}`) ||
        document.querySelector(`[data-section-id="${targetId}"]`) ||
        document.querySelector(`.${targetId}`);

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.warn(`[FunctionRegistry] Section with ID '${targetId}' not found.`);
      }
    },
  },

  triggerConfetti: {
    id: 'triggerConfetti',
    name: '🎉 Efek Confetti (Pesta)',
    category: 'action',
    description: 'Menampilkan efek animasi letupan kertas pesta di layar',
    execute: () => {
      runConfettiAnimation();
    },
  },

  copyTextToClipboard: {
    id: 'copyTextToClipboard',
    name: '📋 Salin Teks ke Clipboard',
    category: 'utility',
    description: 'Menyalin nomor rekening, alamat, atau teks ke clipboard pengunjung',
    requiresParam: true,
    paramLabel: 'Teks / Variabel yang Disalin',
    paramPlaceholder: 'Contoh: 1234567890 atau {rekening_pria}',
    execute: async (param, context) => {
      if (!param || typeof window === 'undefined') return;
      const resolvedText = resolveTextVariables(param, context?.eventDetails);
      try {
        await navigator.clipboard.writeText(resolvedText);
        showToastNotification(`✓ Berhasil disalin: ${resolvedText}`);
      } catch (err) {
        console.error('[FunctionRegistry] Failed to copy:', err);
      }
    },
  },

  toggleMusicPlay: {
    id: 'toggleMusicPlay',
    name: '🎵 Putar / Hentikan Musik',
    category: 'media',
    description: 'Memutar atau menghentikan musik latar belakang undangan',
    execute: () => {
      if (typeof window === 'undefined') return;
      const audioEl = document.querySelector('audio') as HTMLAudioElement;
      if (audioEl) {
        if (audioEl.paused) {
          audioEl.play().catch(console.error);
          showToastNotification('🎵 Musik Diputar');
        } else {
          audioEl.pause();
          showToastNotification('⏸️ Musik Dihentikan');
        }
      } else {
        showToastNotification('⚠️ Audio pemutar musik tidak ditemukan');
      }
    },
  },

  openCover: {
    id: 'openCover',
    name: '💌 Buka Sampul Undangan',
    category: 'navigation',
    description: 'Membuka sampul utama undangan',
    execute: (_, context) => {
      if (context?.onOpenCover) {
        context.onOpenCover();
      }
    },
  },

  googleMaps: {
    id: 'googleMaps',
    name: '📍 Buka Google Maps',
    category: 'navigation',
    description: 'Membuka link petunjuk arah Google Maps di tab baru',
    requiresParam: false,
    paramLabel: 'URL Custom (Opsional)',
    paramPlaceholder: 'Contoh: {link_maps} atau https://maps.google.com/...',
    execute: (param, context) => {
      if (typeof window === 'undefined') return;
      let rawUrl = (param || context?.eventDetails?.link_maps || context?.eventDetails?.maps_url || context?.eventDetails?.mapUrl || '').trim();
      if (rawUrl.startsWith('{') && rawUrl.endsWith('}')) {
        const tag = rawUrl.slice(1, -1);
        rawUrl = context?.eventDetails?.[tag] || '';
      }
      const mapUrl = rawUrl || `https://maps.google.com/?q=${encodeURIComponent((context?.eventDetails?.nama_lokasi || '') + ' ' + (context?.eventDetails?.alamat_lengkap || ''))}`;
      window.open(mapUrl, '_blank', 'noopener,noreferrer');
    },
  },

  saveCalendar: {
    id: 'saveCalendar',
    name: '📅 Simpan ke Google Calendar',
    category: 'navigation',
    description: 'Membuka pembuatan jadwal acara otomatis di Google Calendar',
    execute: (_, context) => {
      if (typeof window === 'undefined') return;
      const eventName = encodeURIComponent(context?.eventDetails?.title || 'Acara Pernikahan');
      const eventDetailsText = encodeURIComponent(context?.eventDetails?.alamat_lengkap || 'Undangan Pernikahan');
      const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventName}&details=${eventDetailsText}`;
      window.open(calUrl, '_blank', 'noopener,noreferrer');
    },
  },

  openUrl: {
    id: 'openUrl',
    name: '🔗 Buka Tautan / Media Sosial',
    category: 'navigation',
    description: 'Membuka link website atau profil sosial media di tab baru',
    requiresParam: true,
    paramLabel: 'URL / Username Sosial Media',
    paramPlaceholder: 'Contoh: https://instagram.com/... atau {ig_wanita}',
    execute: (param, context) => {
      if (!param || typeof window === 'undefined') return;
      const resolved = resolveTextVariables(param, context?.eventDetails);
      if (resolved) {
        const finalUrl = resolved.startsWith('http') ? resolved : `https://${resolved}`;
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
      }
    },
  },
};

export const getRegisteredFunctionsList = (): RegisteredFunction[] => {
  return Object.values(FUNCTION_REGISTRY);
};

export const executeRegisteredFunction = (
  functionId: string,
  param?: string,
  context?: FunctionContext
): boolean => {
  const regFn = FUNCTION_REGISTRY[functionId];
  if (regFn) {
    regFn.execute(param, context);
    return true;
  }
  return false;
};
