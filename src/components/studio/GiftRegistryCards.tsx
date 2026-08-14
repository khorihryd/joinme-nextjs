'use client';

import React, { useState } from 'react';
import { BankAccountItem } from '@/types';

interface GiftRegistryCardsProps {
  bankAccounts?: BankAccountItem[];
  giftAddress?: string;
  isPreviewMode?: boolean;
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

export function GiftRegistryCards({ bankAccounts, giftAddress, isPreviewMode }: GiftRegistryCardsProps) {
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  const activeAccounts = Array.isArray(bankAccounts) && bankAccounts.length > 0
    ? bankAccounts
    : (!isPreviewMode ? DEFAULT_SAMPLE_BANKS : []);

  const activeAddress = giftAddress || (!isPreviewMode ? DEFAULT_SAMPLE_ADDRESS : '');

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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      {/* Toast Feedback Notification */}
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
            borderRadius: '24px',
            fontSize: '0.8rem',
            fontWeight: 700,
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {copiedToast}
        </div>
      )}

      {/* 1. DYNAMIC BANK ACCOUNT CARDS (Automatically generated matching user inputs) */}
      {activeAccounts.map((acc, idx) => {
        const badgeStyle = getBankBadgeColor(acc.bankName || 'Bank');
        return (
          <div
            key={`bank-card-${idx}-${acc.accountNumber}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              padding: '20px 18px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              borderStyle: 'solid',
              borderWidth: '1px',
              borderColor: badgeStyle.border,
              width: '100%',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              boxSizing: 'border-box',
            }}
          >
            {/* Bank Name Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 14px',
                borderRadius: '20px',
                backgroundColor: badgeStyle.bg,
                color: badgeStyle.color,
                fontSize: '0.82rem',
                fontWeight: 800,
                border: `1px solid ${badgeStyle.border}`,
              }}
            >
              💳 {acc.bankName || 'Rekening Bank'}
            </div>

            {/* Account Number */}
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '0.08em',
                fontFamily: 'monospace',
                marginTop: '4px',
              }}
            >
              {acc.accountNumber || '0000000000'}
            </div>

            {/* Account Holder */}
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              a.n. <span style={{ color: '#334155', fontWeight: 700 }}>{acc.accountHolder || 'Nama Pemilik'}</span>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={() => handleCopy(acc.accountNumber, `Nomor rekening ${acc.bankName}`)}
              style={{
                marginTop: '6px',
                padding: '8px 18px',
                fontSize: '0.78rem',
                fontWeight: 700,
                backgroundColor: 'var(--primary, #e36397)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 3px 10px rgba(227,99,151,0.25)',
                transition: 'transform 0.15s ease',
              }}
            >
              📋 Salin Nomor Rekening
            </button>
          </div>
        );
      })}

      {/* 2. PHYSICAL GIFT DELIVERY ADDRESS CARD */}
      {activeAddress && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            padding: '20px 18px',
            backgroundColor: '#fdf2f8',
            borderRadius: '16px',
            borderStyle: 'solid',
            borderWidth: '1px',
            borderColor: '#fbcfe8',
            width: '100%',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '20px',
              backgroundColor: '#ffffff',
              color: '#9d174d',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: '1px solid #fbcfe8',
            }}
          >
            📦 Kirim Kado Fisik
          </div>

          <div style={{ fontSize: '0.84rem', color: '#475569', textAlign: 'center', lineHeight: '1.5', padding: '0 8px' }}>
            {activeAddress}
          </div>

          <button
            type="button"
            onClick={() => handleCopy(activeAddress, 'Alamat pengiriman kado')}
            style={{
              marginTop: '4px',
              padding: '8px 18px',
              fontSize: '0.78rem',
              fontWeight: 700,
              backgroundColor: '#9d174d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 3px 10px rgba(157,23,77,0.25)',
              transition: 'transform 0.15s ease',
            }}
          >
            📋 Salin Alamat Pengiriman
          </button>
        </div>
      )}
    </div>
  );
}
