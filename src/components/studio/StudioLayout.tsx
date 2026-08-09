'use client';

import React from 'react';

interface StudioLayoutProps {
  topBar: React.ReactNode;
  leftPanel: React.ReactNode;
  canvas: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function StudioLayout({ topBar, leftPanel, canvas, rightPanel }: StudioLayoutProps) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#090d16' }}>
      {topBar}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {leftPanel}
        {canvas}
        {rightPanel}
      </div>
    </div>
  );
}
