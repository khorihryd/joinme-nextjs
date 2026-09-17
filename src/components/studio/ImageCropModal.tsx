'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { resolveTextVariables } from '@/store/studio-store';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedUrl: string) => void;
  targetTitle?: string;
  initialAspectRatio?: number | 'free';
}

type AspectRatioOption = {
  id: string;
  label: string;
  ratio: number | 'free';
  icon: string;
};

const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: 'free', label: 'Bebas', ratio: 'free', icon: '🔄' },
  { id: '1:1', label: '1:1 Persegi', ratio: 1, icon: '🔲' },
  { id: '4:5', label: '4:5 Portrait', ratio: 4 / 5, icon: '🖼️' },
  { id: '9:16', label: '9:16 Story', ratio: 9 / 16, icon: '📱' },
  { id: '16:9', label: '16:9 Banner', ratio: 16 / 9, icon: '🖥️' },
  { id: '3:4', label: '3:4 Klasik', ratio: 3 / 4, icon: '📐' },
];

export function ImageCropModal({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  targetTitle = 'Crop & Sesuaikan Gambar',
  initialAspectRatio = 'free',
}: ImageCropModalProps) {
  const [selectedRatio, setSelectedRatio] = useState<number | 'free'>(initialAspectRatio);
  const [rotation, setRotation] = useState<number>(0);
  const [flipX, setFlipX] = useState<boolean>(false);
  const [flipY, setFlipY] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Normalized crop coordinates in percentages [0..1]
  const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0.1,
    y: 0.1,
    width: 0.8,
    height: 0.8,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragStartRef = useRef<{
    type: 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e';
    startX: number;
    startY: number;
    initialCrop: { x: number; y: number; width: number; height: number };
  } | null>(null);

  // Load and cache the image element
  useEffect(() => {
    if (!isOpen) return;

    let targetUrl = imageUrl ? resolveTextVariables(imageUrl) || imageUrl : '';
    if (!targetUrl || targetUrl.trim() === '' || targetUrl.startsWith('{')) {
      targetUrl = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80';
    }

    setLoading(true);
    setErrorMsg(null);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setZoom(1);
    setSelectedRatio(initialAspectRatio);

    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Attempt direct load, fallback to proxy if CORS fails
    img.onload = () => {
      if (isCancelled) return;
      imageRef.current = img;
      setLoading(false);
      resetCropArea(initialAspectRatio, img.naturalWidth, img.naturalHeight);
    };

    img.onerror = () => {
      // Try through local proxy if direct CORS failed
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(targetUrl)}`;
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = 'anonymous';
      fallbackImg.onload = () => {
        if (isCancelled) return;
        imageRef.current = fallbackImg;
        setLoading(false);
        resetCropArea(initialAspectRatio, fallbackImg.naturalWidth, fallbackImg.naturalHeight);
      };
      fallbackImg.onerror = () => {
        if (isCancelled) return;
        setLoading(false);
        setErrorMsg('Gagal memuat gambar. Pastikan URL gambar valid dan dapat diakses.');
      };
      fallbackImg.src = proxyUrl;
    };

    img.src = targetUrl;

    return () => {
      isCancelled = true;
    };
  }, [isOpen, imageUrl, initialAspectRatio]);

  // Recalculate crop area when aspect ratio changes
  const resetCropArea = useCallback(
    (ratio: number | 'free', imgWidth?: number, imgHeight?: number) => {
      const w = imgWidth || imageRef.current?.naturalWidth || 800;
      const h = imgHeight || imageRef.current?.naturalHeight || 600;
      const imgRatio = w / h;

      if (ratio === 'free') {
        setCrop({ x: 0.05, y: 0.05, width: 0.9, height: 0.9 });
      } else {
        // Fit crop with target aspect ratio within the image bounds
        let cropW: number;
        let cropH: number;

        if (ratio > imgRatio) {
          // Wider than image
          cropW = 0.9;
          cropH = (0.9 * imgRatio) / ratio;
        } else {
          // Taller than image
          cropH = 0.9;
          cropW = (0.9 * ratio) / imgRatio;
        }

        const cropX = (1 - cropW) / 2;
        const cropY = (1 - cropH) / 2;

        setCrop({
          x: Math.max(0, Math.min(1 - cropW, cropX)),
          y: Math.max(0, Math.min(1 - cropH, cropY)),
          width: Math.min(1, cropW),
          height: Math.min(1, cropH),
        });
      }
    },
    []
  );

  const handleRatioChange = (ratio: number | 'free') => {
    setSelectedRatio(ratio);
    resetCropArea(ratio);
  };

  // Mouse & Touch Drag Event Handlers
  const handlePointerDown = (
    e: React.PointerEvent,
    handleType: 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    dragStartRef.current = {
      type: handleType,
      startX: e.clientX,
      startY: e.clientY,
      initialCrop: { ...crop },
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragStartRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = (moveEvent.clientX - dragStartRef.current.startX) / rect.width;
      const deltaY = (moveEvent.clientY - dragStartRef.current.startY) / rect.height;
      const { type, initialCrop } = dragStartRef.current;

      let newX = initialCrop.x;
      let newY = initialCrop.y;
      let newW = initialCrop.width;
      let newH = initialCrop.height;

      const minSize = 0.08;

      if (type === 'move') {
        newX = Math.max(0, Math.min(1 - newW, initialCrop.x + deltaX));
        newY = Math.max(0, Math.min(1 - newH, initialCrop.y + deltaY));
      } else {
        // Resizing with handle
        if (type.includes('e')) {
          newW = Math.max(minSize, Math.min(1 - initialCrop.x, initialCrop.width + deltaX));
        }
        if (type.includes('s')) {
          newH = Math.max(minSize, Math.min(1 - initialCrop.y, initialCrop.height + deltaY));
        }
        if (type.includes('w')) {
          const maxDeltaW = initialCrop.width - minSize;
          const clampedDeltaX = Math.max(-initialCrop.x, Math.min(maxDeltaW, deltaX));
          newX = initialCrop.x + clampedDeltaX;
          newW = initialCrop.width - clampedDeltaX;
        }
        if (type.includes('n')) {
          const maxDeltaH = initialCrop.height - minSize;
          const clampedDeltaY = Math.max(-initialCrop.y, Math.min(maxDeltaH, deltaY));
          newY = initialCrop.y + clampedDeltaY;
          newH = initialCrop.height - clampedDeltaY;
        }

        // Lock aspect ratio if not freeform
        if (selectedRatio !== 'free' && imageRef.current) {
          const imgAspect = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
          const targetNormalizedRatio = selectedRatio / imgAspect;

          if (type === 'e' || type === 'w' || type === 'ne' || type === 'nw') {
            newH = newW / targetNormalizedRatio;
            if (newY + newH > 1) {
              newH = 1 - newY;
              newW = newH * targetNormalizedRatio;
            }
          } else {
            newW = newH * targetNormalizedRatio;
            if (newX + newW > 1) {
              newW = 1 - newX;
              newH = newW / targetNormalizedRatio;
            }
          }
        }
      }

      setCrop({
        x: Math.max(0, Math.min(1 - minSize, newX)),
        y: Math.max(0, Math.min(1 - minSize, newY)),
        width: Math.max(minSize, Math.min(1 - newX, newW)),
        height: Math.max(minSize, Math.min(1 - newY, newH)),
      });
    };

    const handlePointerUp = () => {
      dragStartRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Perform Final High-Resolution Crop and Save
  const handleApplyCrop = async () => {
    if (!imageRef.current) return;
    setProcessing(true);

    try {
      const img = imageRef.current;
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      // Calculate source crop coordinates on the original image
      const srcX = Math.round(crop.x * naturalW);
      const srcY = Math.round(crop.y * naturalH);
      const srcW = Math.round(crop.width * naturalW);
      const srcH = Math.round(crop.height * naturalH);

      // Create high-resolution output canvas
      const outputCanvas = document.createElement('canvas');
      const isRotated90or270 = Math.abs(rotation % 180) === 90;

      outputCanvas.width = isRotated90or270 ? srcH : srcW;
      outputCanvas.height = isRotated90or270 ? srcW : srcH;

      const ctx = outputCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context tidak tersedia');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Apply transformations (rotation, flip)
      ctx.save();
      ctx.translate(outputCanvas.width / 2, outputCanvas.height / 2);

      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }
      if (flipX) {
        ctx.scale(-1, 1);
      }
      if (flipY) {
        ctx.scale(1, -1);
      }

      // Draw the cropped portion
      const drawX = -srcW / 2;
      const drawY = -srcH / 2;

      ctx.drawImage(img, srcX, srcY, srcW, srcH, drawX, drawY, srcW, srcH);
      ctx.restore();

      // Convert to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        outputCanvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
      });

      if (!blob) throw new Error('Gagal menghasilkan file gambar dari canvas');

      // Upload to Supabase Storage
      const fileName = `cropped-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
      const filePath = `cropped/${fileName}`;

      let finalUrl = '';
      try {
        const { error: uploadErr } = await supabase.storage.from('uploads').upload(filePath, blob, {
          contentType: 'image/jpeg',
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

      // Fallback to Data URL if upload failed or Supabase was not connected
      if (!finalUrl) {
        finalUrl = outputCanvas.toDataURL('image/jpeg', 0.92);
      }

      onCropComplete(finalUrl);
      onClose();
    } catch (err: any) {
      console.error('Crop failed:', err);
      setErrorMsg(err.message || 'Gagal menyimpan hasil crop gambar.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  // Compute calculated dimensions for badge
  const outputDimensions = imageRef.current
    ? {
        w: Math.round(crop.width * imageRef.current.naturalWidth),
        h: Math.round(crop.height * imageRef.current.naturalHeight),
      }
    : null;

  return (
    <div className="admin-modal-overlay active" style={{ zIndex: 999999 }}>
      <div
        className="admin-modal-card"
        style={{
          maxWidth: '780px',
          width: '95vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '16px',
        }}
      >
        {/* Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(227, 99, 151, 0.12)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
              }}
            >
              ✂️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {targetTitle}
              </h3>
              {outputDimensions && (
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  Resolusi Output: {outputDimensions.w} × {outputDimensions.h} px
                </span>
              )}
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

        {/* Modal Body: Cropper Workspace */}
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
          {errorMsg && (
            <div
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#dc2626',
                fontSize: '0.78rem',
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Aspect Ratio Selector Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '4px' }}>
              Rasio Aspek:
            </span>
            {ASPECT_RATIOS.map((item) => {
              const isActive = selectedRatio === item.ratio;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleRatioChange(item.ratio)}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '7px',
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-card)',
                    color: isActive ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Image & Interactive Crop Canvas Container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '340px',
              maxHeight: '460px',
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              touchAction: 'none',
            }}
          >
            {loading ? (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '28px', height: '28px', border: '3px solid #e36397', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span>Memuat gambar...</span>
              </div>
            ) : (
              <div
                ref={containerRef}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  maxWidth: '100%',
                  maxHeight: '440px',
                }}
              >
                {/* Displayed Image */}
                <img
                  src={imageRef.current?.src}
                  alt="Crop preview"
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: '440px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
                    transition: 'transform 0.2s ease',
                  }}
                />

                {/* Dark Vignette Overlay Outside Crop Area */}
                {/* Top */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: `${crop.y * 100}%`,
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    pointerEvents: 'none',
                  }}
                />
                {/* Bottom */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${(crop.y + crop.height) * 100}%`,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    pointerEvents: 'none',
                  }}
                />
                {/* Left */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${crop.y * 100}%`,
                    left: 0,
                    width: `${crop.x * 100}%`,
                    height: `${crop.height * 100}%`,
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    pointerEvents: 'none',
                  }}
                />
                {/* Right */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${crop.y * 100}%`,
                    left: `${(crop.x + crop.width) * 100}%`,
                    right: 0,
                    height: `${crop.height * 100}%`,
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Interactive Crop Selection Box */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'move')}
                  style={{
                    position: 'absolute',
                    top: `${crop.y * 100}%`,
                    left: `${crop.x * 100}%`,
                    width: `${crop.width * 100}%`,
                    height: `${crop.height * 100}%`,
                    border: '2px solid #ffffff',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(0,0,0,0.3)',
                    cursor: 'move',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Grid Lines (Rule of Thirds) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '33.333%',
                      left: 0,
                      right: 0,
                      height: '1px',
                      backgroundColor: 'rgba(255, 255, 255, 0.35)',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '66.666%',
                      left: 0,
                      right: 0,
                      height: '1px',
                      backgroundColor: 'rgba(255, 255, 255, 0.35)',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: '33.333%',
                      width: '1px',
                      backgroundColor: 'rgba(255, 255, 255, 0.35)',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: '66.666%',
                      width: '1px',
                      backgroundColor: 'rgba(255, 255, 255, 0.35)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* 4 Corner Handles */}
                  {/* NW */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'nw')}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      left: '-6px',
                      width: '14px',
                      height: '14px',
                      backgroundColor: 'var(--primary, #e36397)',
                      border: '2px solid #ffffff',
                      borderRadius: '2px',
                      cursor: 'nwse-resize',
                    }}
                  />
                  {/* NE */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'ne')}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      width: '14px',
                      height: '14px',
                      backgroundColor: 'var(--primary, #e36397)',
                      border: '2px solid #ffffff',
                      borderRadius: '2px',
                      cursor: 'nesw-resize',
                    }}
                  />
                  {/* SW */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'sw')}
                    style={{
                      position: 'absolute',
                      bottom: '-6px',
                      left: '-6px',
                      width: '14px',
                      height: '14px',
                      backgroundColor: 'var(--primary, #e36397)',
                      border: '2px solid #ffffff',
                      borderRadius: '2px',
                      cursor: 'nesw-resize',
                    }}
                  />
                  {/* SE */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'se')}
                    style={{
                      position: 'absolute',
                      bottom: '-6px',
                      right: '-6px',
                      width: '14px',
                      height: '14px',
                      backgroundColor: 'var(--primary, #e36397)',
                      border: '2px solid #ffffff',
                      borderRadius: '2px',
                      cursor: 'nwse-resize',
                    }}
                  />

                  {/* Edge Midpoint Handles */}
                  {/* N */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'n')}
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      left: 'calc(50% - 10px)',
                      width: '20px',
                      height: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '2px',
                      cursor: 'ns-resize',
                    }}
                  />
                  {/* S */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 's')}
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: 'calc(50% - 10px)',
                      width: '20px',
                      height: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '2px',
                      cursor: 'ns-resize',
                    }}
                  />
                  {/* W */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'w')}
                    style={{
                      position: 'absolute',
                      top: 'calc(50% - 10px)',
                      left: '-4px',
                      width: '8px',
                      height: '20px',
                      backgroundColor: '#ffffff',
                      borderRadius: '2px',
                      cursor: 'ew-resize',
                    }}
                  />
                  {/* E */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'e')}
                    style={{
                      position: 'absolute',
                      top: 'calc(50% - 10px)',
                      right: '-4px',
                      width: '8px',
                      height: '20px',
                      backgroundColor: '#ffffff',
                      borderRadius: '2px',
                      cursor: 'ew-resize',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Adjustment Tools: Rotation, Flip, Zoom, Reset */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
            }}
          >
            {/* Rotate & Flip */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev - 90) % 360)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-body)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
                title="Putar Kiri 90°"
              >
                ⟲ Putar Kiri
              </button>

              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-body)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
                title="Putar Kanan 90°"
              >
                ⟳ Putar Kanan
              </button>

              <button
                type="button"
                onClick={() => setFlipX((prev) => !prev)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: flipX ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: flipX ? 'rgba(227, 99, 151, 0.15)' : 'var(--bg-body)',
                  color: flipX ? 'var(--primary)' : 'var(--text-primary)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Balik Horizontal"
              >
                ⇄ Flip H
              </button>

              <button
                type="button"
                onClick={() => setFlipY((prev) => !prev)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: flipY ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: flipY ? 'rgba(227, 99, 151, 0.15)' : 'var(--bg-body)',
                  color: flipY ? 'var(--primary)' : 'var(--text-primary)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Balik Vertikal"
              >
                ⇅ Flip V
              </button>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={() => {
                setRotation(0);
                setFlipX(false);
                setFlipY(false);
                setZoom(1);
                resetCropArea(selectedRatio);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-body)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
              title="Kembalikan Pengaturan ke Asli"
            >
              🔄 Reset
            </button>
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
            justifyContent: 'flex-end',
            gap: '0.6rem',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={processing || loading}
            className="btn btn-primary"
            style={{
              fontSize: '0.8rem',
              padding: '0.5rem 1.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 800,
            }}
          >
            {processing ? (
              <>
                <div style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span>Memproses & Menyimpan...</span>
              </>
            ) : (
              <>
                <span>✂️</span>
                <span>Terapkan Hasil Crop</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
