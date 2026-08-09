'use client';

import React from 'react';

interface WizardLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  previewDrawer?: React.ReactNode;
}

export function WizardLayout({ sidebar, header, children, previewDrawer }: WizardLayoutProps) {
  return (
    <div className="db-container">
      {sidebar}
      <main className="db-main">
        {header}
        <div className="db-view">{children}</div>
      </main>
      {previewDrawer}
    </div>
  );
}
