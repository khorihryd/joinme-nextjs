import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET /api/studio/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: template } = await supabaseAdmin
      .from('Template')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (template) {
      return NextResponse.json({
        ...template,
        isTemplate: true,
      });
    }

    const { data: event } = await supabaseAdmin
      .from('Event')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (event) {
      let studioNodes = event.details?.studioNodes || event.nodes || null;
      let globalStyles = event.details?.globalStyles || event.globalStyles || null;

      // If studioNodes is missing, fallback to template nodes if templateId is set
      if ((!studioNodes || !Array.isArray(studioNodes) || studioNodes.length === 0) && event.templateId) {
        const { data: tpl } = await supabaseAdmin
          .from('Template')
          .select('nodes, globalStyles')
          .eq('id', event.templateId)
          .maybeSingle();
        if (tpl) {
          studioNodes = tpl.nodes;
          if (!globalStyles) globalStyles = tpl.globalStyles;
        }
      }

      return NextResponse.json({
        ...event,
        isEvent: true,
        nodes: studioNodes,
        globalStyles: globalStyles,
      });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching studio data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function sanitizeBase64Audio(data: any): Promise<any> {
  if (!data) return data;
  if (typeof data === 'string') {
    if (data.startsWith('data:audio') || (data.startsWith('data:') && data.includes('base64,') && data.length > 50000)) {
      try {
        const matches = data.match(/^data:([A-Za-z-+/0-9]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1].split('/')[1]?.replace('mpeg', 'mp3') || 'mp3';
          const buffer = Buffer.from(matches[2], 'base64');
          const fileName = `music-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
          const dir = path.join(process.cwd(), 'public', 'uploads');
          await mkdir(dir, { recursive: true });
          await writeFile(path.join(dir, fileName), buffer);
          return `/uploads/${fileName}`;
        }
      } catch (e) {
        console.warn('Failed to sanitize base64 audio:', e);
      }
    }
    return data;
  }
  if (Array.isArray(data)) {
    const list: any[] = [];
    for (const item of data) {
      list.push(await sanitizeBase64Audio(item));
    }
    return list;
  }
  if (typeof data === 'object') {
    const obj: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      obj[k] = await sanitizeBase64Audio(v);
    }
    return obj;
  }
  return data;
}

// PATCH /api/studio/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const rawBody = await request.json();
    const body = await sanitizeBase64Audio(rawBody);
    const { nodes, globalStyles, details, title, subdomain, status } = body;

    // 1. Check if updating a Template
    const { data: template } = await supabaseAdmin
      .from('Template')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (template) {
      if (session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Hanya admin yang dapat mengedit template' }, { status: 403 });
      }

      const templateUpdate: any = {
        nodes,
        globalStyles,
        updatedAt: new Date().toISOString(),
      };
      if (body.price !== undefined) templateUpdate.price = Number(body.price);
      if (body.originalPrice !== undefined) templateUpdate.originalPrice = Number(body.originalPrice);

      let { data: updated, error } = await supabaseAdmin
        .from('Template')
        .update(templateUpdate)
        .eq('id', id)
        .select('*')
        .single();

      if (error && (error.message?.includes('price') || error.code === '42703')) {
        delete templateUpdate.price;
        delete templateUpdate.originalPrice;
        const retry = await supabaseAdmin
          .from('Template')
          .update(templateUpdate)
          .eq('id', id)
          .select('*')
          .single();
        updated = retry.data;
        error = retry.error;
      }

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ...updated, isTemplate: true });
    }

    // 2. Check if updating an Event
    const { data: event } = await supabaseAdmin
      .from('Event')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (event) {
      if (event.userId !== session.user.id && session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const updates: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };

      if (title && typeof title === 'string') updates.title = title;
      if (status && ['Draft', 'Aktif'].includes(status)) updates.status = status;

      if (subdomain && typeof subdomain === 'string') {
        const cleanSubdomain = subdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
        if (cleanSubdomain && cleanSubdomain !== event.subdomain) {
          const { data: existing } = await supabaseAdmin
            .from('Event')
            .select('id')
            .eq('subdomain', cleanSubdomain)
            .neq('id', id)
            .maybeSingle();
          if (existing) {
            return NextResponse.json({ error: 'Subdomain sudah digunakan oleh undangan lain' }, { status: 409 });
          }
          updates.subdomain = cleanSubdomain;
        }
      }

      const existingDetails = (event.details as any) || {};
      const mergedDetails = {
        ...existingDetails,
        ...(details || {}),
        studioNodes: nodes !== undefined ? nodes : existingDetails.studioNodes,
        globalStyles: globalStyles !== undefined ? globalStyles : existingDetails.globalStyles,
      };

      updates.details = mergedDetails;

      const { data: updated, error } = await supabaseAdmin
        .from('Event')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        ...updated,
        isEvent: true,
        nodes: updated.details?.studioNodes,
        globalStyles: updated.details?.globalStyles,
      });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Error saving studio data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
