'use client';

import React, { useState } from 'react';
import { LoveStoryItem } from '@/types';
import { LightboxModal } from '@/components/studio/LightboxModal';

interface LoveStoryTimelineProps {
  stories?: LoveStoryItem[];
  isPreviewMode?: boolean;
}

const DEFAULT_SAMPLE_STORIES: LoveStoryItem[] = [
  {
    year: '2020',
    title: 'Pertama Bertemu',
    description: 'Pertama kali saling mengenal di kampus saat kegiatan orientasi mahasiswa baru.',
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&auto=format&fit=crop&q=80',
  },
  {
    year: '2023',
    title: 'Lamaran Khidmat',
    description: 'Momen berharga saat keluarga besar saling bertukar niat suci menuju pernikahan.',
    image: '', // Demonstrates text-only story entry without photo
  },
  {
    year: '2026',
    title: 'Menikah & Bahagia',
    description: 'Mengikat janji suci pernikahan untuk mengarungi hidup bersama selamanya.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
  },
];

export function LoveStoryTimeline({ stories, isPreviewMode }: LoveStoryTimelineProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const activeStories = Array.isArray(stories) && stories.length > 0
    ? stories
    : (!isPreviewMode ? DEFAULT_SAMPLE_STORIES : DEFAULT_SAMPLE_STORIES);

  if (activeStories.length === 0) {
    return null;
  }

  // Collect all valid photo URLs for Lightbox navigation
  const allStoryPhotos = activeStories
    .map((item) => (item.image || item.imageUrl || item.photo || item.picture || item.img || '').trim())
    .filter((url) => url.length > 0);

  const handlePhotoClick = (e: React.MouseEvent, imgUrl: string) => {
    if (isPreviewMode) {
      e.stopPropagation();
      const pIdx = allStoryPhotos.indexOf(imgUrl);
      if (pIdx >= 0) {
        setSelectedPhotoIndex(pIdx);
      }
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 4px', position: 'relative' }}>
      {activeStories.map((item, idx) => {
        const isLast = idx === activeStories.length - 1;
        const displayTime = item.year || item.date || `Momen #${idx + 1}`;
        const storyImage = (item.image || item.imageUrl || item.photo || item.picture || item.img || '').trim();

        return (
          <div key={`ls-item-${idx}-${item.title}`} style={{ display: 'flex', gap: '16px', position: 'relative', width: '100%' }}>
            {/* Left Vertical Line & Dot Container */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '28px' }}>
              {/* Glowing Dot */}
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary, #e36397)',
                  border: '3px solid #ffffff',
                  boxShadow: '0 0 0 2px var(--primary, #e36397)',
                  zIndex: 2,
                  marginTop: '4px',
                }}
              />

              {/* Connecting Vertical Line */}
              {!isLast && (
                <div
                  style={{
                    width: '2px',
                    flex: 1,
                    backgroundColor: '#f1f5f9',
                    borderLeft: '2px dashed var(--border-color, #cbd5e1)',
                    marginTop: '4px',
                    marginBottom: '-4px',
                  }}
                />
              )}
            </div>

            {/* Right Card Details */}
            <div
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                padding: '16px 18px',
                borderRadius: '14px',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderColor: '#e2e8f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {/* Year / Date Pill */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--primary, #e36397)',
                    backgroundColor: '#fff0f5',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    border: '1px solid #fbcfe8',
                  }}
                >
                  📅 {displayTime}
                </span>
              </div>

              {/* Story Title */}
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', fontFamily: 'Playfair Display, serif' }}>
                {item.title}
              </div>

              {/* Story Description */}
              <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.6', fontFamily: 'Inter, sans-serif' }}>
                {item.description}
              </div>

              {/* Conditional Story Photo Element (Rendered ONLY if photo is provided, completely hidden if empty) */}
              {storyImage ? (
                <div
                  onClick={(e) => handlePhotoClick(e, storyImage)}
                  style={{
                    position: 'relative',
                    marginTop: '6px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: isPreviewMode ? 'pointer' : 'default',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  }}
                >
                  <img
                    src={storyImage}
                    alt={item.title}
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                  {isPreviewMode && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        color: '#ffffff',
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '12px',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      🔍 Perbesar
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      {/* Lightbox Modal for Fullsize Photo Viewing */}
      {selectedPhotoIndex !== null && allStoryPhotos.length > 0 && (
        <LightboxModal
          images={allStoryPhotos}
          currentIndex={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
          onNavigate={(newIdx) => setSelectedPhotoIndex(newIdx)}
        />
      )}
    </div>
  );
}
