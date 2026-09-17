import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/guests?eventId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    let query = supabaseAdmin.from('Guest').select('*');

    if (eventId) {
      query = query.eq('eventId', eventId);
    }

    const { data: guests, error } = await query.order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching guests from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(guests || []);
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/guests (Add guest or public RSVP submission)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, name, group, category, phone, attendance, pax, wishes } = body;

    if (!eventId || !name) {
      return NextResponse.json({ error: 'Event ID and name are required' }, { status: 400 });
    }

    const payload: any = {
      eventId,
      name,
      group: group || 'Umum',
      category: category || 'Umum',
      phone: phone || null,
      attendance: attendance || 'Belum Konfirmasi',
      pax: pax ? parseInt(pax) : 1,
      wishes: wishes || null,
    };

    let { data: guest, error } = await supabaseAdmin
      .from('Guest')
      .insert(payload)
      .select('*')
      .single();

    // Fallback if new columns ('category' / 'group' / 'phone') don't exist yet in Supabase table
    if (error && (error.code === 'PGRST204' || error.message?.includes('column'))) {
      console.warn('Supabase missing new columns, falling back to core Guest schema:', error.message);
      const fallbackPayload = {
        eventId,
        name,
        attendance: attendance || 'Belum Konfirmasi',
        pax: pax ? parseInt(pax) : 1,
        wishes: wishes || null,
      };

      const fallbackResult = await supabaseAdmin
        .from('Guest')
        .insert(fallbackPayload)
        .select('*')
        .single();

      guest = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.error('Error submitting RSVP to Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(guest, { status: 201 });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/guests?id=...
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Guest ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('Guest').delete().eq('id', id);

    if (error) {
      console.error('Error deleting guest from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
