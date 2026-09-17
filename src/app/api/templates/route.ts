import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/templates
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    let query = supabaseAdmin.from('Template').select('*');

    if (!showAll) {
      query = query.eq('status', 'Aktif');
    }

    // Supabase will automatically sort. If 'views' is not a column on Supabase Table,
    // we can fallback to order by 'createdAt' desc.
    const { data: templates, error } = await query.order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching templates from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(templates || []);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/templates
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, tier, thumbnail, globalStyles, nodes } = body;

    const { data: template, error } = await supabaseAdmin
      .from('Template')
      .insert({
        name,
        category,
        tier: tier || 'Free',
        thumbnail,
        globalStyles,
        nodes,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating template in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/templates
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing template ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, category, tier, thumbnail, status, globalStyles, nodes } = body;

    const { data: template, error } = await supabaseAdmin
      .from('Template')
      .update({
        name,
        category,
        tier,
        thumbnail,
        status,
        globalStyles,
        nodes,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating template in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/templates
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing template ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('Template')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
