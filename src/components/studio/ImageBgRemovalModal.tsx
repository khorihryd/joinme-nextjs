'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface ImageBgRemovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onComplete: (transparentImageUrl: string) => void;
  targetTitle?: string;
}

type TabMode = 'ai' | 'chroma' | 'brush';
type PreviewBg = 'checkerboard' | 'dark' | 'light' | 'custom';

export function ImageBgRemovalModal({
  isOpen,
  onClose,
  imageUrl,
  onComplete,
  targetTitle = 'Hapus Background Gambar',
}: ImageBgRemovalModalProps) {
  // Tabs and view modes
  const [activeTab, setActiveTab] = useState<TabMode>('ai');
  const [previewBg, setPreviewBg] = useState<PreviewBg>('checkerboard');
  const [customBgColor, setCustomBgColor] = useState<string>('#f43f5e');
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  // Status & Progress
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAiDone, setIsAiDone] = useState<boolean>(false);

  // Chroma Key / Color Keying settings
  const [chromaColor, setChromaColor] = useState<string>('#ffffff');
  const [chromaTolerance, setChromaTolerance] = useState<number>(18);
  const [chromaFeather, setChromaFeather] = useState<number>(4);
  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);

  // Brush settings
  const [brushMode, setBrushMode] = useState<'erase' | 'restore'>('erase');
  const [brushSize, setBrushSize] = useState<number>(25);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Canvases & Image Refs
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const aiResultCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Undo Stack (stores ImageData)
  const undoStackRef = useRef<ImageData[]>([]);
  const [canUndo, setCanUndo] = useState<boolean>(false);

  // Reset state on open
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    setIsLoadingImage(true);
    setIsProcessing(false);
    setProgressMsg('');
    setProgressPercent(0);
    setErrorMsg(null);
    setIsAiDone(false);
    setActiveTab('ai');
    setShowOriginal(false);
    undoStackRef.current = [];
    setCanUndo(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      originalImageRef.current = img;
      initCanvas(img);
      setIsLoadingImage(false);
    };

    img.onerror = () => {
      // Fallback via local proxy to bypass CORS
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = 'anonymous';

      fallbackImg.onload = () => {
        originalImageRef.current = fallbackImg;
        initCanvas(fallbackImg);
        setIsLoadingImage(false);
      };

      fallbackImg.onerror = () => {
        setIsLoadingImage(false);
        setErrorMsg('Gagal memuat gambar. Pastikan URL gambar valid dan dapat diakses.');
      };

      fallbackImg.src = proxyUrl;
    };

    img.src = imageUrl;
  }, [isOpen, imageUrl]);

  // Initialize canvas with original image
  const initCanvas = (img: HTMLImageElement) => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Save initial AI base backup
    const aiCanvas = document.createElement('canvas');
    aiCanvas.width = img.naturalWidth;
    aiCanvas.height = img.naturalHeight;
    const aiCtx = aiCanvas.getContext('2d');
    if (aiCtx) {
      aiCtx.drawImage(img, 0, 0);
      aiResultCanvasRef.current = aiCanvas;
    }
  };

  // Push current canvas state to undo stack
  const pushUndo = () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(imgData);
    if (undoStackRef.current.length > 10) {
      undoStackRef.current.shift();
    }
    setCanUndo(true);
  };

  const handleUndo = () => {
    if (undoStackRef.current.length === 0) return;
    const canvas = resultCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const prevData = undoStackRef.current.pop();
    if (prevData) {
      ctx.putImageData(prevData, 0, 0);
    }
    setCanUndo(undoStackRef.current.length > 0);
  };

  // =========================================================================
  // 1. AI BACKGROUND REMOVAL (CLIENT-SIDE WASM / ONNX)
  // =========================================================================
  const runAiRemoval = async () => {
    if (!originalImageRef.current) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setProgressMsg('Memulai inisialisasi modul AI...');
    setProgressPercent(10);

    try {
      pushUndo();

      // Dynamic import to avoid SSR issues
      const { removeBackground } = await import('@imgly/background-removal');

      setProgressMsg('Mengunduh model AI segmentasi (hanya di unduhan pertama)...');
      setProgressPercent(25);

      // Fetch image as blob via proxy to avoid any cross-origin taint
      let imageBlob: Blob;
      try {
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          imageBlob = await res.blob();
        } else {
          throw new Error('Proxy fetch failed');
        }
      } catch {
        // Fallback: draw from loaded HTMLImageElement to canvas blob
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = originalImageRef.current.naturalWidth;
        tempCanvas.height = originalImageRef.current.naturalHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(originalImageRef.current, 0, 0);
        }
        imageBlob = await new Promise<Blob>((resolve, reject) => {
          tempCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas blob failed'))), 'image/png');
        });
      }

      setProgressMsg('Memproses gambar & memotong background...');
      setProgressPercent(50);

      const resultBlob = await removeBackground(imageBlob, {
        model: 'isnet_quint8', // Fast, lightweight quantized model (~40MB)
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.min(95, Math.max(15, Math.round((current / total) * 100)));
            setProgressPercent(pct);
            if (key.includes('fetch')) {
              setProgressMsg(`Mengunduh komponen AI: ${pct}%`);
            } else if (key.includes('compute')) {
              setProgressMsg(`Menganalisis & memisahkan subjek: ${pct}%`);
            }
          }
        },
        output: {
          format: 'image/png',
          quality: 0.95,
        },
      });

      setProgressMsg('Menerapkan hasil gambar transparan...');
      setProgressPercent(98);

      const objectUrl = URL.createObjectURL(resultBlob);
      const transparentImg = new Image();
      transparentImg.onload = () => {
        const canvas = resultCanvasRef.current;
        if (!canvas) return;
        canvas.width = transparentImg.naturalWidth;
        canvas.height = transparentImg.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(transparentImg, 0, 0);

          // Save AI result as reference
          const aiCanvas = document.createElement('canvas');
          aiCanvas.width = transparentImg.naturalWidth;
          aiCanvas.height = transparentImg.naturalHeight;
          const aiCtx = aiCanvas.getContext('2d');
          if (aiCtx) {
            aiCtx.drawImage(transparentImg, 0, 0);
            aiResultCanvasRef.current = aiCanvas;
          }
        }
        URL.revokeObjectURL(objectUrl);
        setIsAiDone(true);
        setIsProcessing(false);
        setProgressPercent(100);
        setProgressMsg('Background berhasil dihapus secara otomatis!');
      };
      transparentImg.onerror = () => {
        throw new Error('Gagal merender hasil segmentasi AI ke canvas.');
      };
      transparentImg.src = objectUrl;
    } catch (err: any) {
      console.error('AI background removal error:', err);
      setIsProcessing(false);
      setErrorMsg(
        'Modul AI memerlukan koneksi internet untuk mengunduh model pada pemakaian pertama. Anda juga dapat menggunakan mode "Chroma Key / Warna Solid" atau "Kuas Penghapus" di tab atas.'
      );
    }
  };

  // =========================================================================
  // 2. CHROMA KEY / COLOR KEYING (SOLID COLOR REMOVAL)
  // =========================================================================
  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    if (clean.length === 3) {
      return {
        r: parseInt(clean[0] + clean[0], 16),
        g: parseInt(clean[1] + clean[1], 16),
        b: parseInt(clean[2] + clean[2], 16),
      };
    }
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  };

  const applyChromaKey = useCallback(() => {
    if (!originalImageRef.current || !resultCanvasRef.current) return;
    pushUndo();

    const canvas = resultCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Redraw base: use AI result if available, otherwise original
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (aiResultCanvasRef.current && isAiDone) {
      ctx.drawImage(aiResultCanvasRef.current, 0, 0);
    } else {
      ctx.drawImage(originalImageRef.current, 0, 0);
    }

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const target = hexToRgb(chromaColor);
    const tol = (chromaTolerance / 100) * 441.67; // max distance is sqrt(255^2 * 3) ~ 441.67
    const featherDist = (chromaFeather / 100) * 441.67;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a === 0) continue;

      const dr = r - target.r;
      const dg = g - target.g;
      const db = b - target.b;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      if (dist <= tol) {
        data[i + 3] = 0; // completely transparent
      } else if (dist < tol + featherDist && featherDist > 0) {
        const factor = (dist - tol) / featherDist;
        data[i + 3] = Math.round(a * factor); // smooth feather
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [chromaColor, chromaTolerance, chromaFeather, isAiDone]);

  // Click canvas for eyedropper color sampling
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEyedropperActive || !resultCanvasRef.current) return;

    const canvas = resultCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex =
      '#' +
      [pixel[0], pixel[1], pixel[2]]
        .map((c) => c.toString(16).padStart(2, '0'))
        .join('');

    setChromaColor(hex);
    setIsEyedropperActive(false);
  };

  // =========================================================================
  // 3. MANUAL REFINEMENT BRUSH (ERASER & RESTORE)
  // =========================================================================
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== 'brush') return;
    pushUndo();
    setIsDrawing(true);
    drawBrush(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Update cursor position for brush circle overlay
    if (resultCanvasRef.current) {
      const rect = resultCanvasRef.current.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    if (!isDrawing || activeTab !== 'brush') return;
    drawBrush(e);
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const drawBrush = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = resultCanvasRef.current;
    if (!canvas || !originalImageRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const radius = brushSize * scaleX;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (brushMode === 'erase') {
      // Erase mode: destination-out clears pixels to transparent
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fill();
    } else {
      // Restore mode: draw corresponding portion from original image
      ctx.clip();
      ctx.drawImage(originalImageRef.current, 0, 0);
    }
    ctx.restore();
  };

  // Reset to original image
  const resetToOriginal = () => {
    if (!originalImageRef.current) return;
    pushUndo();
    initCanvas(originalImageRef.current);
    setIsAiDone(false);
  };

  // =========================================================================
  // 4. SAVE & APPLY TRANSPARENT PNG
  // =========================================================================
  const handleApply = async () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    setProgressMsg('Menyiapkan file gambar transparan (PNG)...');

    try {
      // Convert canvas to PNG blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
      });

      if (!blob) throw new Error('Gagal mengekspor gambar transparan dari canvas.');

      // Upload to Supabase Storage
      const fileName = `bg-removed-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.png`;
      const filePath = `bg-removed/${fileName}`;

      let finalUrl = '';
      try {
        const { error: uploadErr } = await supabase.storage.from('uploads').upload(filePath, blob, {
          contentType: 'image/png',
          upsert: true,
        });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
          if (urlData?.publicUrl) {
            finalUrl = urlData.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Supabase storage upload fallback to Data URL:', err);
      }

      // Fallback to high-res base64 data URL
      if (!finalUrl) {
        finalUrl = canvas.toDataURL('image/png');
      }

      onComplete(finalUrl);
      onClose();
    } catch (err: any) {
      console.error('Save transparent image failed:', err);
      setErrorMsg(err.message || 'Gagal menyimpan hasil gambar transparan.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  // Background style helper for preview
  const getPreviewBackgroundStyle = (): React.CSSProperties => {
    switch (previewBg) {
      case 'dark':
        return { backgroundColor: '#0f172a' };
      case 'light':
        return { backgroundColor: '#ffffff' };
      case 'custom':
        return { backgroundColor: customBgColor };
      case 'checkerboard':
      default:
        return {
          backgroundColor: '#ffffff',
          backgroundImage: `
            linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
            linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
            linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        };
    }
  };

  return (
    <div className="admin-modal-overlay active" style={{ zIndex: 999999 }}>
      <div
        className="admin-modal-card"
        style={{
          maxWidth: '860px',
          width: '95vw',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '16px',
        }}
      >
        {/* Modal Header */}
        <div
          className="admin-modal-header"
          style={{
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'rgba(227, 99, 151, 0.12)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem',
              }}
            >
              🪄
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {targetTitle}
              </h3>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                Hapus background gambar menjadi transparan (PNG) dengan AI atau Chroma Key
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '4px 8px',
              borderRadius: '6px',
            }}
            title="Tutup (Batal)"
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs: AI vs Chroma vs Brush */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1.25rem',
            backgroundColor: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-color)',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'ai' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              backgroundColor: activeTab === 'ai' ? 'rgba(227, 99, 151, 0.12)' : 'transparent',
              color: activeTab === 'ai' ? 'var(--primary)' : 'var(--text-secondary)',
            }}
          >
            <span>🤖</span>
            <span>AI Otomatis (1-Klik)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chroma')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'chroma' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              backgroundColor: activeTab === 'chroma' ? 'rgba(227, 99, 151, 0.12)' : 'transparent',
              color: activeTab === 'chroma' ? 'var(--primary)' : 'var(--text-secondary)',
            }}
          >
            <span>🎯</span>
            <span>Chroma / Warna Solid</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('brush')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'brush' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              backgroundColor: activeTab === 'brush' ? 'rgba(227, 99, 151, 0.12)' : 'transparent',
              color: activeTab === 'brush' ? 'var(--primary)' : 'var(--text-secondary)',
            }}
          >
            <span>🖌️</span>
            <span>Kuas Sentuhan Akhir</span>
          </button>

          <div style={{ flex: 1 }} />

          {/* Undo Button */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo || isProcessing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-body)',
              color: canUndo ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              opacity: canUndo ? 1 : 0.5,
            }}
            title="Undo / Batalkan perubahan terakhir"
          >
            <span>↩️</span>
            <span>Undo</span>
          </button>

          {/* Reset to original */}
          <button
            type="button"
            onClick={resetToOriginal}
            disabled={isProcessing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-body)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
            title="Kembalikan ke gambar asli"
          >
            <span>🔄</span>
            <span>Reset Asli</span>
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="admin-modal-body"
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-body)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          {/* Error Banner */}
          {errorMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                fontSize: '0.76rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>⚠️</span>
              <span style={{ flex: 1 }}>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Tab Specific Controls */}
          {/* A. TAB AI */}
          {activeTab === 'ai' && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  🤖 AI Auto-Segmentasi Potong Latar
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Model AI memisahkan orang/objek dari latar belakang secara instan tanpa perlu menandai manual.
                </div>
              </div>

              <button
                type="button"
                onClick={runAiRemoval}
                disabled={isProcessing || isLoadingImage}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: isProcessing || isLoadingImage ? 'not-allowed' : 'pointer',
                  opacity: isProcessing || isLoadingImage ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(227, 99, 151, 0.25)',
                }}
              >
                <span>{isProcessing ? '⏳' : isAiDone ? '✨ Proses Ulang AI' : '✨ Mulai Hapus Background AI'}</span>
                <span>{isProcessing ? 'Memproses...' : isAiDone ? 'Proses Ulang' : 'Hapus Otomatis'}</span>
              </button>
            </div>
          )}

          {/* B. TAB CHROMA */}
          {activeTab === 'chroma' && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  🎯 Chroma Key (Hapus Warna Solid / Studio Backdrop)
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {/* Eyedropper Button */}
                  <button
                    type="button"
                    onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '4px 9px',
                      borderRadius: '6px',
                      border: isEyedropperActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: isEyedropperActive ? 'rgba(227, 99, 151, 0.15)' : 'var(--bg-body)',
                      color: isEyedropperActive ? 'var(--primary)' : 'var(--text-primary)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    title="Klik tombol ini lalu klik area warna di gambar untuk mengambil sampel warna"
                  >
                    <span>💧</span>
                    <span>{isEyedropperActive ? 'Klik area di gambar...' : 'Ambil Sampel Warna'}</span>
                  </button>

                  {/* Color Input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Warna:</span>
                    <input
                      type="color"
                      value={chromaColor}
                      onChange={(e) => setChromaColor(e.target.value)}
                      style={{ width: '28px', height: '26px', borderRadius: '4px', border: '1px solid var(--border-color)', cursor: 'pointer', padding: 0 }}
                    />
                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>{chromaColor}</span>
                  </div>
                </div>
              </div>

              {/* Sliders */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                    <span>Toleransi Warna (Tolerance)</span>
                    <span style={{ color: 'var(--primary)' }}>{chromaTolerance}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={80}
                    value={chromaTolerance}
                    onChange={(e) => setChromaTolerance(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                    <span>Kehalusan Tepi (Feather)</span>
                    <span style={{ color: 'var(--primary)' }}>{chromaFeather}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    value={chromaFeather}
                    onChange={(e) => setChromaFeather(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                <button
                  type="button"
                  onClick={applyChromaKey}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span>⚡ Terapkan Hapus Warna</span>
                </button>
              </div>
            </div>
          )}

          {/* C. TAB BRUSH */}
          {activeTab === 'brush' && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Mode Kuas:</span>
                <button
                  type="button"
                  onClick={() => setBrushMode('erase')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: brushMode === 'erase' ? '1px solid #ef4444' : '1px solid var(--border-color)',
                    backgroundColor: brushMode === 'erase' ? '#fee2e2' : 'var(--bg-body)',
                    color: brushMode === 'erase' ? '#dc2626' : 'var(--text-primary)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span>🧹</span>
                  <span>Hapus (Eraser)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBrushMode('restore')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: brushMode === 'restore' ? '1px solid #10b981' : '1px solid var(--border-color)',
                    backgroundColor: brushMode === 'restore' ? '#d1fae5' : 'var(--bg-body)',
                    color: brushMode === 'restore' ? '#059669' : 'var(--text-primary)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span>✨</span>
                  <span>Pulihkan (Restore)</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: '180px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Ukuran Kuas:</span>
                <input
                  type="range"
                  min={5}
                  max={80}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: '0.74rem', fontWeight: 700, minWidth: '32px' }}>{brushSize}px</span>
              </div>
            </div>
          )}

          {/* Processing Progress Bar */}
          {isProcessing && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(227, 99, 151, 0.08)',
                border: '1px solid rgba(227, 99, 151, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)' }}>
                <span>⏳ {progressMsg || 'Memproses gambar...'}</span>
                <span>{progressPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(227, 99, 151, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    backgroundColor: 'var(--primary)',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Interactive Preview Canvas Stage */}
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '360px',
              maxHeight: '480px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...getPreviewBackgroundStyle(),
              cursor: isEyedropperActive ? 'crosshair' : activeTab === 'brush' ? 'none' : 'default',
            }}
          >
            {isLoadingImage ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontSize: '2rem' }}>⏳</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Memuat gambar...</span>
              </div>
            ) : (
              <>
                {/* Result Canvas */}
                <canvas
                  ref={resultCanvasRef}
                  onClick={handleCanvasClick}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={() => {
                    setIsDrawing(false);
                    setCursorPos(null);
                  }}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '460px',
                    objectFit: 'contain',
                    display: showOriginal ? 'none' : 'block',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  }}
                />

                {/* Original Image comparison */}
                {showOriginal && originalImageRef.current && (
                  <img
                    src={originalImageRef.current.src}
                    alt="Original Image"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '460px',
                      objectFit: 'contain',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                    }}
                  />
                )}

                {/* Brush size cursor circle overlay */}
                {activeTab === 'brush' && cursorPos && (
                  <div
                    style={{
                      position: 'absolute',
                      top: cursorPos.y,
                      left: cursorPos.x,
                      width: `${brushSize * 2}px`,
                      height: `${brushSize * 2}px`,
                      borderRadius: '50%',
                      border: brushMode === 'erase' ? '2px solid #ef4444' : '2px solid #10b981',
                      backgroundColor: brushMode === 'erase' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      pointerEvents: 'none',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10,
                    }}
                  />
                )}
              </>
            )}
          </div>

          {/* Preview Background Switcher & Compare */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.65rem',
              padding: '0.4rem 0.25rem',
            }}
          >
            {/* Background Checker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Uji Tepi Latar:</span>
              <button
                type="button"
                onClick={() => setPreviewBg('checkerboard')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '5px',
                  border: previewBg === 'checkerboard' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Papan catur transparan"
              >
                🏁 Catur
              </button>

              <button
                type="button"
                onClick={() => setPreviewBg('dark')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '5px',
                  border: previewBg === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Latar gelap (cek halo putih)"
              >
                ⚫ Hitam
              </button>

              <button
                type="button"
                onClick={() => setPreviewBg('light')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '5px',
                  border: previewBg === 'light' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Latar putih (cek sisa bayangan)"
              >
                ⚪ Putih
              </button>

              <input
                type="color"
                value={customBgColor}
                onChange={(e) => {
                  setCustomBgColor(e.target.value);
                  setPreviewBg('custom');
                }}
                title="Pilih warna latar belakang kustom"
                style={{ width: '24px', height: '22px', borderRadius: '4px', border: '1px solid var(--border-color)', cursor: 'pointer', padding: 0 }}
              />
            </div>

            {/* Hold to compare original */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onMouseDown={() => setShowOriginal(true)}
                onMouseUp={() => setShowOriginal(false)}
                onTouchStart={() => setShowOriginal(true)}
                onTouchEnd={() => setShowOriginal(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: showOriginal ? 'var(--primary)' : 'var(--bg-card)',
                  color: showOriginal ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                title="Tahan tombol ini untuk melihat gambar asli sebelum dipotong"
              >
                <span>👁️</span>
                <span>Tahan: Lihat Asli</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="admin-modal-footer"
          style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-body)',
                border: '1px solid var(--border-color)',
              }}
            >
              <span>🖼️</span>
              <span>Format: PNG Transparan (Alpha)</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-body)',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing || isLoadingImage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '7px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: isProcessing || isLoadingImage ? 'not-allowed' : 'pointer',
                opacity: isProcessing || isLoadingImage ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(227, 99, 151, 0.35)',
              }}
            >
              <span>💾</span>
              <span>{isProcessing ? 'Menyimpan...' : 'Terapkan Hasil (PNG)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
