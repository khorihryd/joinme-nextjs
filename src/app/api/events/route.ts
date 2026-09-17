import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';

// GET /api/events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');

    if (subdomain) {
      const { data: event, error } = await supabaseAdmin
        .from('Event')
        .select('*, Guest(count)')
        .eq('subdomain', subdomain.toLowerCase().trim())
        .maybeSingle();

      if (error) {
        console.error('Error fetching public event:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      const guestCount = event.Guest && event.Guest[0] ? event.Guest[0].count : 0;
      const { Guest, ...rest } = event;
      return NextResponse.json({
        ...rest,
        _count: {
          guests: guestCount,
        },
      });
    }

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

    const isUserAdmin = user.role === 'admin';

    // Fetch Events and include Guest relation count.
    // In Supabase, we can use a select query to fetch relation counts, like `*, Guest(count)`
    let query = supabaseAdmin
      .from('Event')
      .select('*, Guest(count)');

    if (!isUserAdmin) {
      query = query.eq('userId', user.id);
    }

    const { data: events, error } = await query.order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching events from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format output to match Prisma count shape `_count: { guests: X }`
    const formattedEvents = (events || []).map((ev: any) => {
      const guestCount = ev.Guest && ev.Guest[0] ? ev.Guest[0].count : 0;
      const { Guest, ...rest } = ev;
      return {
        ...rest,
        _count: {
          guests: guestCount,
        },
      };
    });

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/events
export async function POST(request: Request) {
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
      return NextResponse.json(
        { error: 'Sesi pengguna sudah tidak valid. Silakan keluar (logout) dan login kembali.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, type, subdomain, templateId } = body;

    if (!title || !type || !subdomain) {
      return NextResponse.json({ error: 'Title, type, and subdomain are required' }, { status: 400 });
    }

    const cleanSubdomain = subdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');

    const { data: existing } = await supabaseAdmin
      .from('Event')
      .select('id')
      .eq('subdomain', cleanSubdomain)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Subdomain already in use' }, { status: 409 });
    }

    let studioNodes = null;
    let globalStyles = null;

    const TIER_ACCESS: Record<string, string[]> = {
      'Free': ['Free'],
      'Pro': ['Free', 'Pro'],
      'Enterprise': ['Free', 'Pro', 'Enterprise'],
    };

    if (templateId) {
      const { data: selectedTemplate } = await supabaseAdmin
        .from('Template')
        .select('*')
        .eq('id', templateId)
        .maybeSingle();

      if (selectedTemplate) {
        const userPlan = user.plan || 'Free';
        const allowedTiers = TIER_ACCESS[userPlan] || TIER_ACCESS['Free'];
        if (!allowedTiers.includes(selectedTemplate.tier)) {
          return NextResponse.json(
            { error: 'Paket Anda tidak mendukung template tier ini. Silakan upgrade paket Anda.' },
            { status: 403 }
          );
        }

        studioNodes = selectedTemplate.nodes;
        globalStyles = selectedTemplate.globalStyles;

        // Increment template view count
        const currentViews = selectedTemplate.views || 0;
        await supabaseAdmin
          .from('Template')
          .update({ views: currentViews + 1, updatedAt: new Date().toISOString() })
          .eq('id', templateId);
      }
    }

    const { data: event, error } = await supabaseAdmin
      .from('Event')
      .insert({
        title,
        type,
        subdomain: cleanSubdomain,
        userId: user.id,
        status: 'Draft',
        details: {
          schedules: [],
          story: [],
          gallery: [],
          showStory: true,
          showGallery: true,
          showDresscode: false,
          studioNodes,
          globalStyles,
        },
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating event in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update user's events count
    const currentEventsCount = user.eventsCount || 0;
    await supabaseAdmin
      .from('User')
      .update({ eventsCount: currentEventsCount + 1, updatedAt: new Date().toISOString() })
      .eq('id', user.id);

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
