'use client';

import React, { useState } from 'react';
import { LightboxModal } from '@/components/studio/LightboxModal';

interface PhotoGalleryGridProps {
  images?: string[];
  isPreviewMode?: boolean;
}

const DEFAULT_SAMPLE_GALLERY: string[] = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
];

export function PhotoGalleryGrid({ images, isPreviewMode }: PhotoGalleryGridProps) {
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number | null>(null);

  const rawImages = Array.isArray(images) && images.length > 0
    ? images
    : (!isPreviewMode ? DEFAULT_SAMPLE_GALLERY : []);

  // Filter valid image strings
  const activePhotos = rawImages.filter((img) => typeof img === 'string' && img.trim().length > 0);

  // In Preview Mode, if user uploaded 0 gallery photos, return null (entire section hidden)
  if (isPreviewMode && activePhotos.length === 0) {
    return null;
  }

  const handleImageClick = (e: React.MouseEvent, idx: number) => {
    if (isPreviewMode) {
      e.stopPropagation();
      setSelectedPhotoIdx(idx);
    }
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* 2-3 Column Responsive Image Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '12px',
          width: '100%',
        }}
      >
        {activePhotos.map((imgUrl, idx) => (
          <div
            key={`gallery-item-${idx}-${imgUrl}`}
            onClick={(e) => handleImageClick(e, idx)}
            style={{
              position: 'relative',
              borderRadius: '14px',
              overflow: 'hidden',
              aspectRatio: '1 / 1',
              backgroundColor: '#f1f5f9',
              cursor: isPreviewMode ? 'pointer' : 'default',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
            }}
          >
            <img
              src={imgUrl}
              alt={`Galeri Foto #${idx + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.35s ease',
              }}
            />

            {isPreviewMode && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '1.2rem',
                }}
                className="gallery-hover-overlay"
              >
                🔍
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal for Fullsize Photo Navigation */}
      {selectedPhotoIdx !== null && activePhotos.length > 0 && (
        <LightboxModal
          images={activePhotos}
          currentIndex={selectedPhotoIdx}
          onClose={() => setSelectedPhotoIdx(null)}
          onNavigate={(newIdx) => setSelectedPhotoIdx(newIdx)}
        />
      )}
    </div>
  );
}
