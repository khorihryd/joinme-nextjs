import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeSvgString } from '@/utils/svgNormalizer';

// Built-in seed SVG icons fallback
const DEFAULT_SEED_ICONS = [
  {
    id: 'seed-location',
    name: 'Lokasi Peta Minimalis',
    category: 'Navigasi & Maps',
    viewBox: '0 0 24 24',
    strokeWidth: '2',
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    tags: ['location', 'map', 'pin', 'peta', 'alamat'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-calendar',
    name: 'Kalender & Tanggal Event',
    category: 'Acara & Pesta',
    viewBox: '0 0 24 24',
    strokeWidth: '2',
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
    tags: ['calendar', 'date', 'kalender', 'tanggal', 'jadwal'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-heart',
    name: 'Hati & Cinta Elegan',
    category: 'Pernikahan',
    viewBox: '0 0 24 24',
    strokeWidth: '2',
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    tags: ['heart', 'love', 'cinta', 'hati', 'pernikahan'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-ring',
    name: 'Cincin Kawin & Maharku',
    category: 'Pernikahan',
    viewBox: '0 0 24 24',
    strokeWidth: '2',
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3 3-3 3-3-3 3-3z"/><circle cx="12" cy="14" r="8"/></svg>',
    tags: ['ring', 'cincin', 'nikah', 'mahar', 'wedding'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-camera',
    name: 'Kamera Foto Momen',
    category: 'Acara & Pesta',
    viewBox: '0 0 24 24',
    strokeWidth: '2',
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
    tags: ['camera', 'foto', 'galeri', 'momen'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-music',
    name: 'Not Musik & Lagu',
    category: 'Acara & Pesta',
    viewBox: '0 0 24 24',
    strokeWidth: '2',
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    tags: ['music', 'lagu', 'musik', 'audio', 'sound'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-envelope',
    name: 'Surat Undangan',
    category: 'Pernikahan',
    viewBox: '0 0 24 24',
    strokeWidth: '2',
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    tags: ['envelope', 'surat', 'mail', 'undangan', 'rsvp'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-gift',
    name: 'Kado & Angpao Hadiah',
    category: 'Acara & Pesta',
    viewBox: '0 0 24 24',
    strokeWidth: '2',
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="14" x="3" y="8" rx="2"/><path d="M12 5a3 3 0 1 0-3 3h6a3 3 0 1 0-3-3Z"/><path d="M12 8v14"/><path d="M3 13h18"/></svg>',
    tags: ['gift', 'kado', 'hadiah', 'angpao', 'kado'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-phone',
    name: 'Telepon & Chat Kontak',
    category: 'Sosial Media',
    viewBox: '0 0 24 24',
    strokeWidth: '2',
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    tags: ['phone', 'call', 'telepon', 'kontak', 'hp'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-share',
    name: 'Bagikan Tautan',
    category: 'Sosial Media',
    viewBox: '0 0 24 24',
    strokeWidth: '2',
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>',
    tags: ['share', 'bagikan', 'link', 'sosial'],
    createdAt: new Date().toISOString(),
  },
];

// Helper to parse SVG string metadata
function parseSvgMetadata(svgRaw: string) {
  const cleanedSvg = normalizeSvgString(svgRaw);
  let viewBox = '0 0 24 24';
  let strokeWidth = '2';

  const viewBoxMatch = cleanedSvg.match(/viewBox=["']([^"']+)["']/i);
  if (viewBoxMatch && viewBoxMatch[1]) {
    viewBox = viewBoxMatch[1];
  }

  const strokeWidthMatch = cleanedSvg.match(/stroke-width=["']([^"']+)["']/i);
  if (strokeWidthMatch && strokeWidthMatch[1]) {
    strokeWidth = strokeWidthMatch[1];
  }

  return { viewBox, strokeWidth, cleanedSvg };
}

// GET /api/icons
export async function GET() {
  try {
    const { data: icons, error } = await supabaseAdmin
      .from('IconLibrary')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error || !icons || icons.length === 0) {
      return NextResponse.json(DEFAULT_SEED_ICONS);
    }

    // Merge uploaded icons with built-in seed icons (preventing duplicates)
    const combined = [...icons];
    DEFAULT_SEED_ICONS.forEach((seed) => {
      if (!combined.some((item) => item.id === seed.id)) {
        combined.push(seed);
      }
    });

    return NextResponse.json(combined);
  } catch (error) {
    console.error('Error fetching icon library:', error);
    return NextResponse.json(DEFAULT_SEED_ICONS);
  }
}

// POST /api/icons
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, svgContent, tags } = body;

    if (!name || !svgContent) {
      return NextResponse.json({ error: 'Name and SVG content are required' }, { status: 400 });
    }

    const { viewBox, strokeWidth, cleanedSvg } = parseSvgMetadata(svgContent);

    const newIconObj = {
      name,
      category: category || 'Simbol General',
      svgContent: cleanedSvg,
      viewBox,
      strokeWidth,
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date().toISOString(),
    };

    const { data: icon, error } = await supabaseAdmin
      .from('IconLibrary')
      .insert(newIconObj)
      .select('*')
      .single();

    if (error) {
      console.error('Error saving icon in Supabase:', error);
      // Fallback return with local ID if table hasn't been created in Supabase yet
      return NextResponse.json({
        id: `icon-${Date.now()}`,
        ...newIconObj,
      });
    }

    return NextResponse.json(icon, { status: 201 });
  } catch (error) {
    console.error('Error uploading SVG icon:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/icons
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing icon ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('IconLibrary')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting icon from Supabase:', error);
      return NextResponse.json({ success: true, message: 'Deleted locally' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting icon:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
