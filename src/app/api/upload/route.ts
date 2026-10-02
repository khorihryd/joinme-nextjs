import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'music';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name || 'audio.mp3';
    const fileExt = originalName.split('.').pop()?.toLowerCase() || 'mp3';
    const cleanBaseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `${cleanBaseName}-${Date.now()}.${fileExt}`;
    const storagePath = `${folder}/${uniqueFileName}`;

    let publicUrl = '';

    // 1. Try uploading to Supabase Storage bucket 'uploads'
    try {
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('uploads')
        .upload(storagePath, buffer, {
          contentType: file.type || (fileExt === 'mp3' ? 'audio/mpeg' : 'application/octet-stream'),
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabaseAdmin.storage
          .from('uploads')
          .getPublicUrl(storagePath);
        publicUrl = urlData.publicUrl;
      } else if (uploadError) {
        console.warn('Supabase storage upload failed, using local storage fallback:', uploadError.message);
      }
    } catch (err: any) {
      console.warn('Supabase upload exception:', err?.message || err);
    }

    // 2. Fallback: Save directly to public/uploads/ folder on server
    if (!publicUrl) {
      const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(publicUploadsDir, { recursive: true });
      const localFilePath = path.join(publicUploadsDir, uniqueFileName);
      await writeFile(localFilePath, buffer);
      publicUrl = `/uploads/${uniqueFileName}`;
    }

    return NextResponse.json({
      url: publicUrl,
      fileName: originalName,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Error in /api/upload:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengunggah file' }, { status: 500 });
  }
}
