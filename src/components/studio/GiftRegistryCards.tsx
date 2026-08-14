'use client';

import React, { useState } from 'react';
import { BankAccountItem } from '@/types';

interface GiftRegistryCardsProps {
  bankAccounts?: BankAccountItem[];
  giftAddress?: string;
  isPreviewMode?: boolean;
  isStudioContext?: boolean;
}

const DEFAULT_SAMPLE_BANKS: BankAccountItem[] = [
  { bankName: 'Bank BCA', accountNumber: '8820912345', accountHolder: 'Anti Kartika' },
  { bankName: 'Bank Mandiri', accountNumber: '1310009823411', accountHolder: 'Roni Wijaya' },
];

const DEFAULT_SAMPLE_ADDRESS = 'Jl. Asia Afrika No. 8, Gelora, Senayan, Jakarta Pusat (u.p. Anti Kartika & Roni)';

function getBankBadgeColor(bankName: string): { bg: string; color: string; border: string } {
  const name = bankName.toLowerCase();
  if (name.includes('bca')) return { bg: '#ebf5ff', color: '#005caa', border: '#bfdbfe' };
  if (name.includes('mandiri')) return { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' };
  if (name.includes('bni')) return { bg: '#fff7ed', color: '#ea580c', border: '#ffedd5' };
  if (name.includes('bri')) return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
  if (name.includes('qris')) return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
  if (name.includes('jago')) return { bg: '#fff0f5', color: '#db2777', border: '#fbcfe8' };
  return { bg: '#f8fafc', color: '#334155', border: '#e2e8f0' };
}

export function GiftRegistryCards({
  bankAccounts,
  giftAddress,
  isPreviewMode,
  isStudioContext = true,
}: GiftRegistryCardsProps) {
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // In Studio Context (both editor & studio preview), fallback to sample mock cards if user bank data is empty
  const hasRealAccounts = Array.isArray(bankAccounts) && bankAccounts.length > 0;
  const activeAccounts = hasRealAccounts
    ? bankAccounts!
    : (isStudioContext ? DEFAULT_SAMPLE_BANKS : []);

  const activeAddress = giftAddress || (isStudioContext ? DEFAULT_SAMPLE_ADDRESS : '');

  const showToast = (message: string) => {
    setCopiedToast(message);
    setTimeout(() => {
      setCopiedToast(null);
    }, 2800);
  };

  const handleCopy = (textToCopy: string, label: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`✅ ${label} berhasil disalin!`);
      }).catch(() => {
        showToast(`✅ ${label} berhasil disalin!`);
      });
    } else {
      showToast(`✅ ${label} berhasil disalin!`);
    }
  };

  if (activeAccounts.length === 0 && !activeAddress) {
    return null;
  }

  return (
    <div style={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toast Notification Banner */}
      {copiedToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '30px',
            fontSize: '0.82rem',
            fontWeight: 700,
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {copiedToast}
        </div>
      )}

      {/* Grid Cards Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px',
          width: '100%',
        }}
      >
        {/* Bank Account Cards */}
        {activeAccounts.map((item, idx) => {
          const badgeStyle = getBankBadgeColor(item.bankName);

          return (
            <div
              key={`bank-card-${idx}-${item.accountNumber}`}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 6px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
              }}
            >
              {/* Top Row: Bank Badge & Copy Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    backgroundColor: badgeStyle.bg,
                    color: badgeStyle.color,
                    border: `1px solid ${badgeStyle.border}`,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  💳 {item.bankName}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(item.accountNumber, `Nomor Rekening ${item.bankName}`)}
                  style={{
                    backgroundColor: 'var(--primary-light, #fff0f5)',
                    color: 'var(--primary, #e36397)',
                    border: '1px solid #fbcfe8',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  📋 Salin Rekening
                </button>
              </div>

              {/* Account Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', letterSpacing: '1px', fontFamily: 'monospace' }}>
                  {item.accountNumber}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  a.n. <strong style={{ color: '#334155' }}>{item.accountHolder}</strong>
                </span>
              </div>
            </div>
          );
        })}

        {/* Physical Gift Delivery Card (Optional) */}
        {activeAddress && (
          <div
            style={{
              backgroundColor: '#fafafa',
              borderRadius: '16px',
              padding: '20px',
              border: '1px dashed #cbd5e1',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                }}
              >
                📦 Alamat Pengiriman Kado Fisik
              </span>

              <button
                type="button"
                onClick={() => handleCopy(activeAddress, 'Alamat Pengiriman')}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                📋 Salin Alamat
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.6', margin: 0, textAlign: 'left', fontWeight: 500 }}>
              {activeAddress}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
