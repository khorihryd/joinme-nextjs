import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';

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
      return NextResponse.json(template);
    }

    const { data: event } = await supabaseAdmin
      .from('Event')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (event) {
      return NextResponse.json(event);
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching studio data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/studio/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nodes, globalStyles } = body;

    const { data: template } = await supabaseAdmin
      .from('Template')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (template) {
      const { data: updated, error } = await supabaseAdmin
        .from('Template')
        .update({ nodes, globalStyles, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(updated);
    }

    const { data: event } = await supabaseAdmin
      .from('Event')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (event) {
      const updatedDetails = {
        ...(event.details as any),
        studioNodes: nodes,
        globalStyles
      };

      const { data: updated, error } = await supabaseAdmin
        .from('Event')
        .update({ details: updatedDetails, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Error saving studio data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
