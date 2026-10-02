-- SQL Migration: Tambahkan kolom price dan originalPrice pada tabel Template
-- Jalankan query ini di SQL Editor Supabase Dashboard Anda:

ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "price" INTEGER DEFAULT 0;
ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "originalPrice" INTEGER DEFAULT 0;

-- Optional: Notifikasi PostgREST untuk mereload cache schema
NOTIFY pgrst, 'reload schema';
