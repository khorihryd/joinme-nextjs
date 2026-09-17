'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/image-compression';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  folders: string[];
}

export function MediaLibraryModal({ isOpen, onClose, onSelectImage, folders }: MediaLibraryModalProps) {
  const [images, setImages] = useState<{ name: string; url: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const loadUploadedImages = async () => {
    setLoading(true);
    try {
      const allFiles: { name: string; url: string; created_at: string }[] = [];

      for (const folder of folders) {
        const { data, error } = await supabase.storage
          .from('uploads')
          .list(folder, {
            limit: 80,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (error) {
          console.error(`Error listing folder ${folder}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          data.forEach((file) => {
            // Ignore placeholder files/subfolders
            if (file.name === '.placeholder' || !file.metadata) return;

            const filePath = `${folder}/${file.name}`;
            const { data: { publicUrl } } = supabase.storage
              .from('uploads')
              .getPublicUrl(filePath);

            allFiles.push({
              name: file.name,
              url: publicUrl,
              created_at: file.created_at || new Date().toISOString()
            });
          });
        }
      }

      // Sort all combined files by creation date desc
      allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setImages(allFiles);
    } catch (err) {
      console.error('Error loading media library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUploadedImages();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setUploading(true);
    try {
      const compressedFile = await compressImage(file);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Upload to the first specified folder in list as target
      const targetFolder = folders[0] || 'images';
      const filePath = `${targetFolder}/${fileName}`;

      const { error } = await supabase.storage
        .from('uploads')
        .upload(filePath, compressedFile);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      // Instantly pass selected URL and close modal
      onSelectImage(publicUrl);
      onClose();
    } catch (err: any) {
      alert(`Gagal mengunggah gambar: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        animation: 'modalFadeIn 0.2s ease-out',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              🖼️ Pustaka Media / Galeri Upload
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>
              Pilih foto yang sudah pernah diunggah untuk menghindari upload duplikat.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}>
          {/* Quick Actions / Upload Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            border: '1px dashed #cbd5e1',
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
              Ingin menggunakan foto baru?
            </span>
            <label style={{
              padding: '8px 16px',
              background: 'var(--primary, #e36397)',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              margin: 0,
            }}>
              📁 {uploading ? 'Mengunggah...' : 'Unggah dari Komputer'}
              <input
                type="file"
                accept="image/*"
                onChange={handleLocalUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Gallery Grid */}
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.65rem' }}>
              Pilih Gambar yang Tersedia:
            </span>

            {loading ? (
              <div style={{ padding: '3rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                🔄 Memuat daftar gambar...
              </div>
            ) : images.length === 0 ? (
              <div style={{
                padding: '4rem 1rem',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.82rem',
                border: '1px dashed #e2e8f0',
                borderRadius: '12px',
              }}>
                🫙 Belum ada gambar yang diunggah di folder ini.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '0.75rem',
                maxHeight: '40vh',
                overflowY: 'auto',
                padding: '2px',
              }}>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectImage(img.url);
                      onClose();
                    }}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '2px solid #e2e8f0',
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.03)';
                      e.currentTarget.style.borderColor = 'var(--primary, #e36397)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
