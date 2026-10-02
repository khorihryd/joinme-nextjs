'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MediaLibraryModal } from './MediaLibraryModal';
import { DatePickerInput } from '@/components/ui/DatePickerInput';
import { TimePickerInput } from '@/components/ui/TimePickerInput';

interface DataPropertiesPanelProps {
  details: any;
  setDetails: React.Dispatch<React.SetStateAction<any>>;
  eventTitle?: string;
  setEventTitle?: (title: string) => void;
  eventSubdomain?: string;
  setEventSubdomain?: (subdomain: string) => void;
  eventStatus?: 'Draft' | 'Aktif';
  setEventStatus?: (status: 'Draft' | 'Aktif') => void;
  isEvent?: boolean;
}

export function DataPropertiesPanel({
  details,
  setDetails,
  eventTitle = '',
  setEventTitle,
  eventSubdomain = '',
  setEventSubdomain,
  eventStatus = 'Draft',
  setEventStatus,
  isEvent = false,
}: DataPropertiesPanelProps) {
  const [dataTab, setDataTab] = useState<
    'bride_groom' | 'event_schedule' | 'love_story' | 'gallery' | 'cover' | 'opening' | 'gift' | 'music' | 'closing' | 'general'
  >('bride_groom');

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [onMediaSelectCallback, setOnMediaSelectCallback] = useState<((url: string) => void) | null>(null);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 25 * 1024 * 1024) {
      alert('Ukuran file musik terlalu besar! Maksimal 25MB.');
      return;
    }

    setIsUploadingMusic(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'music');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal mengunggah file musik');
      }

      const data = await res.json();
      const publicUrl = data.url;

      setDetails((prev: any) => ({
        ...prev,
        musicUrl: publicUrl,
        music_url: publicUrl,
      }));
    } catch (err: any) {
      alert(`Gagal mengunggah file musik: ${err.message || err}`);
    } finally {
      setIsUploadingMusic(false);
      e.target.value = '';
    }
  };

  const openMediaPicker = (callback: (url: string) => void) => {
    setOnMediaSelectCallback(() => callback);
    setIsMediaModalOpen(true);
  };

  const schedulesList: any[] = Array.isArray(details.schedules) ? details.schedules : [];

  const handleUpdateSchedule = (index: number, field: string, val: string) => {
    const updated = [...schedulesList];
    updated[index] = { ...updated[index], [field]: val };
    setDetails((prev: any) => ({ ...prev, schedules: updated }));
  };

  const handleCopyLocationFrom = (currentIndex: number, sourceIndex: number) => {
    const targetSch = schedulesList[sourceIndex];
    if (!targetSch) return;

    const updated = [...schedulesList];
    updated[currentIndex] = {
      ...updated[currentIndex],
      place: targetSch.place || targetSch.location || '',
      address: targetSch.address || '',
      mapsUrl: targetSch.mapsUrl || targetSch.mapUrl || '',
    };
    setDetails((prev: any) => ({ ...prev, schedules: updated }));
  };

  const handleAddSchedule = () => {
    const lastSch = schedulesList.length > 0 ? schedulesList[schedulesList.length - 1] : null;
    const isFirst = schedulesList.length === 0;
    const updated = [
      ...schedulesList,
      {
        title: isFirst ? 'Akad Nikah' : 'Resepsi Pernikahan',
        date: lastSch?.date || '21 September 2026',
        time: isFirst ? '08:00 - 10:00 WIB' : '11:00 - 14:00 WIB',
        place: lastSch?.place || lastSch?.location || 'Grand Ballroom Hotel Mulia, Jakarta',
        address: lastSch?.address || 'Jl. Asia Afrika No. 8, Gelora, Senayan, Jakarta Pusat',
        mapsUrl: lastSch?.mapsUrl || lastSch?.mapUrl || 'https://maps.google.com',
      },
    ];
    setDetails((prev: any) => ({ ...prev, schedules: updated }));
  };

  const handleRemoveSchedule = (index: number) => {
    const updated = schedulesList.filter((_: any, idx: number) => idx !== index);
    setDetails((prev: any) => ({ ...prev, schedules: updated }));
  };

  const storyList: any[] = Array.isArray(details.story) ? details.story : [];

  const handleUpdateStory = (index: number, field: string, val: string) => {
    const updated = [...storyList];
    updated[index] = { ...updated[index], [field]: val };
    setDetails((prev: any) => ({ ...prev, story: updated }));
  };

  const handleAddStory = () => {
    const updated = [
      ...storyList,
      {
        year: '2026',
        title: 'Momen Bahagia',
        description: 'Kisah indah perjalanan cinta kami hingga mengikat janji suci.',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500',
      },
    ];
    setDetails((prev: any) => ({ ...prev, story: updated }));
  };

  const handleRemoveStory = (index: number) => {
    const updated = storyList.filter((_: any, idx: number) => idx !== index);
    setDetails((prev: any) => ({ ...prev, story: updated }));
  };

  const galleryList: string[] = Array.isArray(details.gallery) ? details.gallery : [];

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    const updated = [...galleryList, newGalleryUrl.trim()];
    setDetails((prev: any) => ({ ...prev, gallery: updated }));
    setNewGalleryUrl('');
  };

  const handleRemoveGallery = (index: number) => {
    const updated = galleryList.filter((_, idx) => idx !== index);
    setDetails((prev: any) => ({ ...prev, gallery: updated }));
  };

  const handleMoveGallery = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= galleryList.length) return;
    const updated = [...galleryList];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    setDetails((prev: any) => ({ ...prev, gallery: updated }));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.65rem',
    fontSize: '0.8rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-body, #ffffff)',
    color: 'var(--text-primary, #1e293b)',
    fontFamily: 'inherit',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--text-secondary, #64748b)',
    display: 'block',
    marginBottom: '0.25rem',
  };

  const cardSectionStyle: React.CSSProperties = {
    padding: '0.85rem',
    borderRadius: '10px',
    border: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-card, #ffffff)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Sub-Tabs Selector */}
      <div
        style={{
          display: 'flex',
          gap: '0.35rem',
          overflowX: 'auto',
          padding: '0.75rem 0.85rem',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          backgroundColor: 'var(--bg-body, #f8fafc)',
          scrollbarWidth: 'none',
          flexShrink: 0,
        }}
      >
        {[
          { id: 'bride_groom', label: '👩‍❤️‍👨 Mempelai' },
          { id: 'event_schedule', label: '📅 Acara' },
          { id: 'love_story', label: '📖 Cerita' },
          { id: 'gallery', label: '🖼️ Galeri' },
          { id: 'cover', label: '💌 Cover' },
          { id: 'opening', label: '🕌 Pembuka' },
          { id: 'gift', label: '💳 Hadiah' },
          { id: 'music', label: '🎵 Musik & Video' },
          { id: 'closing', label: '🙏 Penutup' },
          { id: 'general', label: '⚙️ Pengaturan' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setDataTab(tab.id as any)}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              borderRadius: '20px',
              border: `1px solid ${dataTab === tab.id ? 'var(--primary, #db2777)' : 'var(--border-color, #e2e8f0)'}`,
              backgroundColor: dataTab === tab.id ? 'var(--primary, #db2777)' : 'var(--bg-surface, #ffffff)',
              color: dataTab === tab.id ? '#ffffff' : 'var(--text-secondary, #64748b)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Form Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* TAB 1: MEMPELAI */}
        {dataTab === 'bride_groom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              👩‍❤️‍👨 Data Mempelai Pria & Wanita
            </div>

            {/* Mempelai Pria */}
            <div style={cardSectionStyle}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>🤵 Mempelai Pria</div>
              <div>
                <label style={labelStyle}>Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  placeholder="Jonathan Wijaya, S.Kom."
                  value={details.mempelaiPria || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, mempelaiPria: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={labelStyle}>Nama Panggilan</label>
                  <input
                    type="text"
                    placeholder="Jonathan"
                    value={details.panggilanPria || ''}
                    onChange={(e) => setDetails((prev: any) => ({ ...prev, panggilanPria: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Inisial</label>
                  <input
                    type="text"
                    placeholder="J"
                    maxLength={3}
                    value={details.inisialPria || ''}
                    onChange={(e) => setDetails((prev: any) => ({ ...prev, inisialPria: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Nama Orang Tua</label>
                <input
                  type="text"
                  placeholder="Putra dari Bp. Hendra & Ibu Maria"
                  value={details.ortuPria || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, ortuPria: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Akun Instagram Pria</label>
                <input
                  type="text"
                  placeholder="@jonathanwijaya"
                  value={details.igPria || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, igPria: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Foto Profil Mempelai Pria</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={details.fotoPria || ''}
                    onChange={(e) => setDetails((prev: any) => ({ ...prev, fotoPria: e.target.value }))}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => openMediaPicker((url) => setDetails((prev: any) => ({ ...prev, fotoPria: url })))}
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.72rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    📁 Galeri
                  </button>
                </div>
              </div>
            </div>

            {/* Mempelai Wanita */}
            <div style={cardSectionStyle}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>👰 Mempelai Wanita</div>
              <div>
                <label style={labelStyle}>Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  placeholder="Anti Rahmawati, S.T."
                  value={details.mempelaiWanita || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, mempelaiWanita: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={labelStyle}>Nama Panggilan</label>
                  <input
                    type="text"
                    placeholder="Anti"
                    value={details.panggilanWanita || ''}
                    onChange={(e) => setDetails((prev: any) => ({ ...prev, panggilanWanita: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Inisial</label>
                  <input
                    type="text"
                    placeholder="A"
                    maxLength={3}
                    value={details.inisialWanita || ''}
                    onChange={(e) => setDetails((prev: any) => ({ ...prev, inisialWanita: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Nama Orang Tua</label>
                <input
                  type="text"
                  placeholder="Putri dari Bp. Bambang & Ibu Sri"
                  value={details.ortuWanita || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, ortuWanita: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Akun Instagram Wanita</label>
                <input
                  type="text"
                  placeholder="@antirahmawati"
                  value={details.igWanita || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, igWanita: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Foto Profil Mempelai Wanita</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={details.fotoWanita || ''}
                    onChange={(e) => setDetails((prev: any) => ({ ...prev, fotoWanita: e.target.value }))}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => openMediaPicker((url) => setDetails((prev: any) => ({ ...prev, fotoWanita: url })))}
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.72rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    📁 Galeri
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACARA / SCHEDULE */}
        {dataTab === 'event_schedule' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📅 Rangkaian Acara & Lokasi
              </div>
              <button
                type="button"
                onClick={handleAddSchedule}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary, #db2777)', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
              >
                + Tambah Acara
              </button>
            </div>

            {schedulesList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'var(--bg-body)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Belum ada rangkaian acara. Klik tombol &quot;+ Tambah Acara&quot; di atas.
              </div>
            ) : (
              schedulesList.map((sch, idx) => (
                <div key={idx} style={cardSectionStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Acara #{idx + 1}: {sch.title || 'Nama Acara'}
                    </div>
                    {schedulesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSchedule(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                      >
                        🗑️ Hapus
                      </button>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>Nama Acara</label>
                    <input
                      type="text"
                      placeholder="Akad Nikah / Resepsi Pernikahan"
                      value={sch.title || ''}
                      onChange={(e) => handleUpdateSchedule(idx, 'title', e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <DatePickerInput
                    label="Tanggal Acara"
                    value={sch.date || ''}
                    onChange={(val) => handleUpdateSchedule(idx, 'date', val)}
                  />

                  <TimePickerInput
                    label="Waktu Acara"
                    value={sch.time || ''}
                    onChange={(val) => handleUpdateSchedule(idx, 'time', val)}
                  />

                  <div>
                    <label style={labelStyle}>Nama Gedung / Tempat</label>
                    <input
                      type="text"
                      placeholder="Grand Ballroom Hotel Mulia, Jakarta"
                      value={sch.place || sch.location || ''}
                      onChange={(e) => handleUpdateSchedule(idx, 'place', e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Alamat Lengkap</label>
                    <textarea
                      placeholder="Jl. Asia Afrika No. 8, Gelora, Senayan, Jakarta Pusat"
                      value={sch.address || ''}
                      onChange={(e) => handleUpdateSchedule(idx, 'address', e.target.value)}
                      rows={2}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Tautan Google Maps</label>
                    <input
                      type="text"
                      placeholder="https://maps.app.goo.gl/..."
                      value={sch.mapsUrl || sch.mapUrl || ''}
                      onChange={(e) => handleUpdateSchedule(idx, 'mapsUrl', e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleCopyLocationFrom(idx, 0)}
                      style={{ padding: '0.35rem', fontSize: '0.7rem', borderRadius: '6px', border: '1px dashed var(--border-color)', backgroundColor: 'transparent', color: 'var(--primary)', cursor: 'pointer', textAlign: 'center' }}
                    >
                      📍 Salin Lokasi dari Acara #1
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: KISAH CINTA */}
        {dataTab === 'love_story' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📖 Section Kisah Cinta (Love Story)
              </div>
              <button
                type="button"
                onClick={handleAddStory}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary, #db2777)', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
              >
                + Tambah Momen
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="toggle-show-story"
                checked={details.showStory !== false}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, showStory: e.target.checked }))}
              />
              <label htmlFor="toggle-show-story" style={{ fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                Tampilkan Section Kisah Cinta di Undangan
              </label>
            </div>

            {storyList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'var(--bg-body)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Belum ada momen kisah cinta. Klik &quot;+ Tambah Momen&quot; di atas.
              </div>
            ) : (
              storyList.map((st, sIdx) => (
                <div key={sIdx} style={cardSectionStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Momen #{sIdx + 1}: {st.title || 'Momen'}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStory(sIdx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={labelStyle}>Tahun</label>
                      <input
                        type="text"
                        placeholder="2020"
                        value={st.year || ''}
                        onChange={(e) => handleUpdateStory(sIdx, 'year', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Judul Momen</label>
                      <input
                        type="text"
                        placeholder="Pertama Kali Bertemu"
                        value={st.title || ''}
                        onChange={(e) => handleUpdateStory(sIdx, 'title', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Cerita / Deskripsi</label>
                    <textarea
                      placeholder="Ceritakan momen indah Anda..."
                      value={st.description || st.story || ''}
                      onChange={(e) => handleUpdateStory(sIdx, 'description', e.target.value)}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Foto Momen</label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={st.image || ''}
                        onChange={(e) => handleUpdateStory(sIdx, 'image', e.target.value)}
                        style={inputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => openMediaPicker((url) => handleUpdateStory(sIdx, 'image', url))}
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.72rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        📁 Galeri
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: GALERI FOTO */}
        {dataTab === 'gallery' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🖼️ Album Galeri Foto Undangan
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="toggle-show-gallery"
                checked={details.showGallery !== false}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, showGallery: e.target.checked }))}
              />
              <label htmlFor="toggle-show-gallery" style={{ fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                Tampilkan Section Galeri di Undangan
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Masukkan URL foto baru..."
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={handleAddGalleryUrl}
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#ffffff', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                + Tambah
              </button>
              <button
                type="button"
                onClick={() => openMediaPicker((url) => setDetails((prev: any) => ({ ...prev, gallery: [...galleryList, url] })))}
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                📁 Upload/Pilih
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
              {galleryList.map((url, gIdx) => (
                <div key={gIdx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', aspectRatio: '1/1' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`gallery-${gIdx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 2, right: 2, display: 'flex', gap: '2px' }}>
                    {gIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveGallery(gIdx, 'up')}
                        style={{ padding: '2px 4px', fontSize: '0.65rem', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        ◀
                      </button>
                    )}
                    {gIdx < galleryList.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveGallery(gIdx, 'down')}
                        style={{ padding: '2px 4px', fontSize: '0.65rem', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        ▶
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveGallery(gIdx)}
                      style={{ padding: '2px 4px', fontSize: '0.65rem', background: 'rgba(239,68,68,0.85)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: COVER */}
        {dataTab === 'cover' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              💌 Sampul &amp; Cover Undangan
            </div>
            <div>
              <label style={labelStyle}>Judul Sampul</label>
              <input
                type="text"
                placeholder="The Wedding of"
                value={details.coverTitle || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, coverTitle: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Nama Pasangan di Cover</label>
              <input
                type="text"
                placeholder="Jonathan & Anti"
                value={details.coverCoupleName || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, coverCoupleName: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Foto Background Cover</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  placeholder="https://..."
                  value={details.cover_photo || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, cover_photo: e.target.value }))}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => openMediaPicker((url) => setDetails((prev: any) => ({ ...prev, cover_photo: url })))}
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.72rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  📁 Galeri
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PEMBUKA & AYAT */}
        {dataTab === 'opening' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🕌 Ucapan Pembuka &amp; Kutipan Ayat
            </div>
            <div>
              <label style={labelStyle}>Salam Pembuka</label>
              <input
                type="text"
                placeholder="Assalamu'alaikum Warahmatullahi Wabarakatuh"
                value={details.salamPembuka || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, salamPembuka: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Kutipan Ayat / Doa</label>
              <textarea
                placeholder="Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan..."
                value={details.kutipanAyat || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, kutipanAyat: e.target.value }))}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Nama Surah / Sumber</label>
              <input
                type="text"
                placeholder="(QS. Ar-Rum: 21)"
                value={details.namaSurah || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, namaSurah: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* TAB 7: HADIAH & REKENING */}
        {dataTab === 'gift' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              💳 Hadiah &amp; Rekening Bank
            </div>

            {/* Bank 1 */}
            <div style={cardSectionStyle}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>🏦 Rekening Bank #1</div>
              <div>
                <label style={labelStyle}>Nama Bank / Dompet Digital</label>
                <input
                  type="text"
                  placeholder="BCA / Mandiri / BNI / Gopay"
                  value={details.bank1Nama || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, bank1Nama: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Nomor Rekening</label>
                <input
                  type="text"
                  placeholder="1234567890"
                  value={details.bank1Rek || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, bank1Rek: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Atas Nama</label>
                <input
                  type="text"
                  placeholder="Jonathan Wijaya"
                  value={details.bank1An || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, bank1An: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Bank 2 */}
            <div style={cardSectionStyle}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>🏦 Rekening Bank #2 (Opsional)</div>
              <div>
                <label style={labelStyle}>Nama Bank / Dompet Digital</label>
                <input
                  type="text"
                  placeholder="BRI / Jago / DANA"
                  value={details.bank2Nama || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, bank2Nama: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Nomor Rekening</label>
                <input
                  type="text"
                  placeholder="0987654321"
                  value={details.bank2Rek || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, bank2Rek: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Atas Nama</label>
                <input
                  type="text"
                  placeholder="Anti Rahmawati"
                  value={details.bank2An || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, bank2An: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Alamat Kado Fisik */}
            <div style={cardSectionStyle}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>📦 Alamat Kirim Kado Fisik</div>
              <div>
                <label style={labelStyle}>Alamat Lengkap Penerima</label>
                <textarea
                  placeholder="Jl. Mawar No. 123, RT 01/RW 02, Jakarta Selatan (Penerima: Jonathan & Anti)"
                  value={details.giftAddress || details.gift_address || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, giftAddress: e.target.value, gift_address: e.target.value }))}
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: MUSIK & VIDEO */}
        {dataTab === 'music' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🎵 Musik Latar &amp; Video Undangan
            </div>
            <div>
              <label style={labelStyle}>File / URL Musik Latar (.MP3)</label>
              <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.35rem' }}>
                <input
                  type="text"
                  placeholder="https://example.com/wedding-song.mp3"
                  value={details.musicUrl || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, musicUrl: e.target.value }))}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <label
                  style={{
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    cursor: isUploadingMusic ? 'wait' : 'pointer',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--primary)',
                  }}
                  title="Unggah file .mp3 dari komputer"
                >
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.m4a"
                    onChange={handleMusicUpload}
                    style={{ display: 'none' }}
                    disabled={isUploadingMusic}
                  />
                  <span>📁 {isUploadingMusic ? 'Mengunggah...' : 'Upload MP3'}</span>
                </label>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                Admin dapat mengunggah file .mp3 langsung atau memasukkan link URL musik. Musik otomatis diputar saat tamu membuka undangan.
              </div>
            </div>

            {/* Video Prewedding / Teaser YouTube */}
            <div style={cardSectionStyle}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>🎥 Video Prewedding / Teaser (YouTube)</div>
              <div>
                <label style={labelStyle}>URL Video YouTube</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                  value={details.videoUrl || details.video_url || details.youtubeUrl || details.youtube_url || ''}
                  onChange={(e) => setDetails((prev: any) => ({
                    ...prev,
                    videoUrl: e.target.value,
                    video_url: e.target.value,
                    youtubeUrl: e.target.value,
                    youtube_url: e.target.value,
                  }))}
                  style={inputStyle}
                />
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  Video YouTube ini otomatis terhubung ke widget Video Prewedding di undangan.
                </div>
              </div>
            </div>

            <div style={cardSectionStyle}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>📺 Virtual Live Streaming (Opsional)</div>
              <div>
                <label style={labelStyle}>URL Live Streaming</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/live/..."
                  value={details.liveStreamUrl || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, liveStreamUrl: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Platform</label>
                <select
                  value={details.liveStreamPlatform || 'YouTube Live'}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, liveStreamPlatform: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="YouTube Live">YouTube Live</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="Instagram Live">Instagram Live</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: PENUTUP */}
        {dataTab === 'closing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🙏 Ucapan Penutup &amp; Hashtag
            </div>
            <div>
              <label style={labelStyle}>Pesan Penutup</label>
              <textarea
                placeholder="Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir..."
                value={details.pesanPenutup || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, pesanPenutup: e.target.value }))}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Nama Keluarga di Penutup</label>
              <input
                type="text"
                placeholder="Kami yang berbahagia, Jonathan & Anti beserta Keluarga Besar"
                value={details.namaKeluargaPenutup || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, namaKeluargaPenutup: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Hashtag Instagram</label>
              <input
                type="text"
                placeholder="#JonathanAntiWedding"
                value={details.hashtag || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, hashtag: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* TAB 10: PENGATURAN UMUM */}
        {dataTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚙️ Pengaturan Undangan
            </div>
            {setEventTitle && (
              <div>
                <label style={labelStyle}>Judul Undangan Website</label>
                <input
                  type="text"
                  placeholder="Pernikahan Jonathan & Anti"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}
            {setEventSubdomain && (
              <div>
                <label style={labelStyle}>Subdomain URL Undangan</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>joinme.id/v/</span>
                  <input
                    type="text"
                    placeholder="jonathan-anti"
                    value={eventSubdomain}
                    onChange={(e) => setEventSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  Tautan publik undangan yang akan disebar kepada para tamu.
                </div>
              </div>
            )}
            {setEventStatus && (
              <div>
                <label style={labelStyle}>Status Publikasi</label>
                <select
                  value={eventStatus}
                  onChange={(e) => setEventStatus(e.target.value as 'Draft' | 'Aktif')}
                  style={inputStyle}
                >
                  <option value="Draft">Draft (Belum Siap Disebar)</option>
                  <option value="Aktif">Aktif (Dapat Diakses Tamu)</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Library Modal for image pickers */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setOnMediaSelectCallback(null);
        }}
        onSelectImage={(url) => {
          if (onMediaSelectCallback) onMediaSelectCallback(url);
          setIsMediaModalOpen(false);
          setOnMediaSelectCallback(null);
        }}
        folders={['images', 'gallery', 'studio']}
      />
    </div>
  );
}
