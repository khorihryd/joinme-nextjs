'use client';

import React, { useEffect, useCallback } from 'react';

interface LightboxModalProps {
  images: string[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function LightboxModal({ images, currentIndex, onClose, onNavigate }: LightboxModalProps) {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < images.length;

  const handleNext = useCallback(() => {
    if (currentIndex === null) return;
    const nextIndex = (currentIndex + 1) % images.length;
    onNavigate(nextIndex);
  }, [currentIndex, images.length, onNavigate]);

  const handlePrev = useCallback(() => {
    if (currentIndex === null) return;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    onNavigate(prevIndex);
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || currentIndex === null) return null;

  const currentImageUrl = images[currentIndex];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* Top Header Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '1.25rem',
          left: '1.5rem',
          right: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '4px 12px',
            borderRadius: '20px',
            backdropFilter: 'blur(5px)',
          }}
        >
          📷 Foto {currentIndex + 1} dari {images.length}
        </span>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            color: '#ffffff',
            fontSize: '1.25rem',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease',
          }}
          title="Tutup (Esc)"
        >
          ✕
        </button>
      </div>

      {/* Main Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '80vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          src={currentImageUrl}
          alt={`Gallery image ${currentIndex + 1}`}
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            transition: 'transform 0.3s ease',
          }}
        />
      </div>

      {/* Left & Right Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            style={{
              position: 'absolute',
              left: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.18)',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.5rem',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(5px)',
              transition: 'background 0.2s ease, transform 0.2s ease',
            }}
            title="Foto Sebelumnya (Panah Kiri)"
          >
            ❮
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            style={{
              position: 'absolute',
              right: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.18)',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.5rem',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(5px)',
              transition: 'background 0.2s ease, transform 0.2s ease',
            }}
            title="Foto Selanjutnya (Panah Kanan)"
          >
            ❯
          </button>
        </>
      )}
    </div>
  );
}
