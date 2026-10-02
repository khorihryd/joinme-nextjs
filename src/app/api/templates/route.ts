import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to attach pricing information to a template object
function attachPricing(t: any) {
  if (!t) return t;
  const price =
    t.price !== undefined && t.price !== null
      ? Number(t.price)
      : t.globalStyles?.pricing?.price !== undefined
        ? Number(t.globalStyles.pricing.price)
        : (t.tier === 'Free' ? 0 : t.tier === 'Pro' ? 99000 : 199000);

  const originalPrice =
    t.originalPrice !== undefined && t.originalPrice !== null
      ? Number(t.originalPrice)
      : t.globalStyles?.pricing?.originalPrice !== undefined
        ? Number(t.globalStyles.pricing.originalPrice)
        : (price > 0 ? Math.round((price * 1.5) / 1000) * 1000 : 0);

  return {
    ...t,
    price,
    originalPrice,
  };
}

// GET /api/templates
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    const id = searchParams.get('id');
    const slug = searchParams.get('name') || searchParams.get('slug') || searchParams.get('q');

    if (id) {
      const { data: template, error } = await supabaseAdmin
        .from('Template')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      return NextResponse.json(attachPricing(template));
    }

    if (slug) {
      const decoded = decodeURIComponent(slug).trim();

      // 1. Exact or case-insensitive match on name
      let { data: template } = await supabaseAdmin
        .from('Template')
        .select('*')
        .ilike('name', decoded)
        .maybeSingle();

      // 2. If not found, try matching by id directly
      if (!template) {
        const { data: byId } = await supabaseAdmin
          .from('Template')
          .select('*')
          .eq('id', decoded)
          .maybeSingle();
        template = byId;
      }

      // 3. If still not found, fetch all and match normalized slug
      if (!template) {
        const { data: allList } = await supabaseAdmin
          .from('Template')
          .select('*');

        const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetClean = clean(decoded);
        template = (allList || []).find((t: any) => clean(t.name) === targetClean || t.id === decoded);
      }

      if (template) {
        return NextResponse.json(attachPricing(template));
      }
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    let query = supabaseAdmin.from('Template').select('*');

    if (!showAll) {
      query = query.eq('status', 'Aktif');
    }

    const { data: templates, error } = await query.order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching templates from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const withPricing = (templates || []).map(attachPricing);
    return NextResponse.json(withPricing);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/templates
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, tier, thumbnail, globalStyles, nodes, price, originalPrice } = body;

    const numPrice = price !== undefined && price !== '' ? Number(price) : (tier === 'Free' ? 0 : 99000);
    const numOriginalPrice =
      originalPrice !== undefined && originalPrice !== ''
        ? Number(originalPrice)
        : (numPrice > 0 ? Math.round((numPrice * 1.5) / 1000) * 1000 : 0);

    const updatedGlobalStyles = {
      ...(globalStyles || {}),
      pricing: { price: numPrice, originalPrice: numOriginalPrice },
    };

    let insertPayload: any = {
      name,
      category,
      tier: tier || 'Free',
      thumbnail,
      globalStyles: updatedGlobalStyles,
      nodes,
      price: numPrice,
      originalPrice: numOriginalPrice,
    };

    let { data: template, error } = await supabaseAdmin
      .from('Template')
      .insert(insertPayload)
      .select('*')
      .single();

    // If database column doesn't exist yet, retry without direct column
    if (error && (error.message?.includes('price') || error.code === '42703')) {
      delete insertPayload.price;
      delete insertPayload.originalPrice;
      const retry = await supabaseAdmin
        .from('Template')
        .insert(insertPayload)
        .select('*')
        .single();
      template = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Error creating template in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(attachPricing(template), { status: 201 });
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
    const { name, category, tier, thumbnail, status, globalStyles, nodes, price, originalPrice } = body;

    const numPrice = price !== undefined && price !== '' ? Number(price) : undefined;
    const numOriginalPrice = originalPrice !== undefined && originalPrice !== '' ? Number(originalPrice) : undefined;

    const updatedGlobalStyles = {
      ...(globalStyles || {}),
    };

    if (numPrice !== undefined || numOriginalPrice !== undefined) {
      updatedGlobalStyles.pricing = {
        price: numPrice ?? 0,
        originalPrice: numOriginalPrice ?? 0,
      };
    }

    let updatePayload: any = {
      name,
      category,
      tier,
      thumbnail,
      status,
      globalStyles: updatedGlobalStyles,
      nodes,
      updatedAt: new Date().toISOString(),
    };

    if (numPrice !== undefined) updatePayload.price = numPrice;
    if (numOriginalPrice !== undefined) updatePayload.originalPrice = numOriginalPrice;

    let { data: template, error } = await supabaseAdmin
      .from('Template')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    // If database column doesn't exist yet, retry without direct columns
    if (error && (error.message?.includes('price') || error.code === '42703')) {
      delete updatePayload.price;
      delete updatePayload.originalPrice;
      const retry = await supabaseAdmin
        .from('Template')
        .update(updatePayload)
        .eq('id', id)
        .select('*')
        .single();
      template = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Error updating template in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(attachPricing(template));
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
