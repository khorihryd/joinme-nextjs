'use client';

import React, { useRef } from 'react';

interface DatePickerInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  includeDayName?: boolean;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = 'misal: Senin, 21 September 2026',
  label,
  includeDayName = true,
}: DatePickerInputProps) {
  const datePickerRef = useRef<HTMLInputElement>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value; // YYYY-MM-DD
    if (!rawVal) return;

    const [yyyy, mm, dd] = rawVal.split('-').map(Number);
    if (!yyyy || !mm || !dd) return;

    const dateObj = new Date(yyyy, mm - 1, dd);
    if (isNaN(dateObj.getTime())) return;

    const options: Intl.DateTimeFormatOptions = includeDayName
      ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'long', day: 'numeric' };

    const formatted = new Intl.DateTimeFormat('id-ID', options).format(dateObj);
    onChange(formatted);
  };

  const openCalendar = () => {
    if (datePickerRef.current) {
      if (typeof datePickerRef.current.showPicker === 'function') {
        datePickerRef.current.showPicker();
      } else {
        datePickerRef.current.focus();
        datePickerRef.current.click();
      }
    }
  };

  return (
    <div>
      {label && (
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', position: 'relative' }}>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            padding: '0.45rem',
            fontSize: '0.8rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: '#fff',
          }}
        />
        <button
          type="button"
          onClick={openCalendar}
          title="Pilih tanggal dari kalender"
          style={{
            padding: '0.45rem 0.75rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            borderRadius: '8px',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--primary)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            whiteSpace: 'nowrap',
          }}
        >
          📅 Pilih Tanggal
        </button>
        <input
          ref={datePickerRef}
          type="date"
          onChange={handleDateChange}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 0,
            height: 0,
            pointerEvents: 'none',
            right: 0,
            bottom: 0,
          }}
        />
      </div>
    </div>
  );
}
