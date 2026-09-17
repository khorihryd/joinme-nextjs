import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';

// GET /api/events/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: event, error } = await supabaseAdmin
      .from('Event')
      .select('*, Guest(*), Template(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching event from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Format relation structures to match Prisma's nested fields
    if (event.Guest) {
      event.guests = event.Guest.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      delete event.Guest;
    } else {
      event.guests = [];
    }

    if (event.Template) {
      event.template = event.Template;
      delete event.Template;
    } else {
      event.template = null;
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/events/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let { data: user } = session.user.id
      ? await supabaseAdmin.from('User').select('*').eq('id', session.user.id).maybeSingle()
      : { data: null };

    if (!user && session.user.email) {
      const { data } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('email', session.user.email.toLowerCase())
        .maybeSingle();
      user = data;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const { data: existing } = await supabaseAdmin
      .from('Event')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (existing.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: Record<string, any> = {};
    if (body.title) updateData.title = body.title;
    if (body.subdomain) updateData.subdomain = body.subdomain;
    if (body.type) updateData.type = body.type;
    if (body.status) updateData.status = body.status;
    if (body.date !== undefined) updateData.date = body.date;
    if (body.details) updateData.details = body.details;
    if (body.views !== undefined) updateData.views = body.views;
    updateData.updatedAt = new Date().toISOString();

    const { data: updated, error } = await supabaseAdmin
      .from('Event')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating event in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/events/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let { data: user } = session.user.id
      ? await supabaseAdmin.from('User').select('*').eq('id', session.user.id).maybeSingle()
      : { data: null };

    if (!user && session.user.email) {
      const { data } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('email', session.user.email.toLowerCase())
        .maybeSingle();
      user = data;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: existing } = await supabaseAdmin
      .from('Event')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (existing.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('Event')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting event from Supabase:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Decrement user event count
    const { data: userToUpdate } = await supabaseAdmin
      .from('User')
      .select('eventsCount')
      .eq('id', existing.userId)
      .single();

    const currentCount = userToUpdate?.eventsCount || 0;
    await supabaseAdmin
      .from('User')
      .update({ eventsCount: Math.max(0, currentCount - 1), updatedAt: new Date().toISOString() })
      .eq('id', existing.userId);

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
