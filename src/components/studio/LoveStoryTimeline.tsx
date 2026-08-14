'use client';

import React from 'react';
import { LoveStoryItem } from '@/types';

interface LoveStoryTimelineProps {
  stories?: LoveStoryItem[];
  isPreviewMode?: boolean;
}

const DEFAULT_SAMPLE_STORIES: LoveStoryItem[] = [
  {
    year: '2020',
    title: 'Pertama Bertemu',
    description: 'Pertama kali saling mengenal di kampus saat kegiatan orientasi mahasiswa.',
  },
  {
    year: '2023',
    title: 'Lamaran Khidmat',
    description: 'Momen berharga saat keluarga besar saling bertukar niat suci menuju pernikahan.',
  },
  {
    year: '2026',
    title: 'Menikah & Bahagia',
    description: 'Mengikat janji suci pernikahan untuk mengarungi hidup bersama selamanya.',
  },
];

export function LoveStoryTimeline({ stories, isPreviewMode }: LoveStoryTimelineProps) {
  const activeStories = Array.isArray(stories) && stories.length > 0
    ? stories
    : (!isPreviewMode ? DEFAULT_SAMPLE_STORIES : DEFAULT_SAMPLE_STORIES);

  if (activeStories.length === 0) {
    return null;
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 4px', position: 'relative' }}>
      {activeStories.map((item, idx) => {
        const isLast = idx === activeStories.length - 1;
        const displayTime = item.year || item.date || `Momen #${idx + 1}`;

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
                gap: '6px',
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

              {/* Optional Photo */}
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', marginTop: '6px' }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
