'use client';

import React, { useState } from 'react';

interface TimePickerInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}

export function TimePickerInput({
  value,
  onChange,
  placeholder = 'misal: 08:00 - 10:00 WIB',
  label = 'Waktu / Jam',
}: TimePickerInputProps) {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('11:00');
  const [isUntilFinished, setIsUntilFinished] = useState(false);
  const [timezone, setTimezone] = useState<'WIB' | 'WITA' | 'WIT'>('WIB');
  const [showHelper, setShowHelper] = useState(false);

  const updateFormattedTime = (start: string, end: string, untilEnd: boolean, tz: string) => {
    let result = '';
    if (untilEnd) {
      result = `${start} ${tz} - Selesai`;
    } else if (end) {
      result = `${start} - ${end} ${tz}`;
    } else {
      result = `${start} ${tz}`;
    }
    onChange(result);
  };

  const handleApplyHelper = (start: string, end: string, untilEnd: boolean, tz: 'WIB' | 'WITA' | 'WIT') => {
    setStartTime(start);
    setEndTime(end);
    setIsUntilFinished(untilEnd);
    setTimezone(tz);
    updateFormattedTime(start, end, untilEnd, tz);
  };

  return (
    <div>
      {label && (
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
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
          onClick={() => setShowHelper(!showHelper)}
          style={{
            padding: '0.45rem 0.75rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            borderRadius: '8px',
            backgroundColor: showHelper ? 'var(--primary)' : 'var(--bg-card)',
            color: showHelper ? '#fff' : 'var(--primary)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          ⏰ {showHelper ? 'Tutup Jam' : 'Pilih Jam'}
        </button>
      </div>

      {showHelper && (
        <div style={{ marginTop: '0.5rem', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Jam Mulai</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleApplyHelper(e.target.value, endTime, isUntilFinished, timezone)}
                style={{ padding: '0.3rem', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Jam Selesai</span>
              <input
                type="time"
                disabled={isUntilFinished}
                value={endTime}
                onChange={(e) => handleApplyHelper(startTime, e.target.value, isUntilFinished, timezone)}
                style={{ padding: '0.3rem', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid var(--border-color)', opacity: isUntilFinished ? 0.5 : 1 }}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Zona Waktu</span>
              <select
                value={timezone}
                onChange={(e) => handleApplyHelper(startTime, endTime, isUntilFinished, e.target.value as any)}
                style={{ padding: '0.35rem', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: 700 }}
              >
                <option value="WIB">WIB (WIB)</option>
                <option value="WITA">WITA (WITA)</option>
                <option value="WIT">WIT (WIT)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="checkbox"
              id="until-finished-check"
              checked={isUntilFinished}
              onChange={(e) => handleApplyHelper(startTime, endTime, e.target.checked, timezone)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="until-finished-check" style={{ fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', color: 'var(--text-secondary)' }}>
              Sampai Selesai (misal: 08:00 WIB - Selesai)
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
