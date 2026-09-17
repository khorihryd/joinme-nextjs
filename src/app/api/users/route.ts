import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';

// GET /api/users (Admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: users, error } = await supabaseAdmin
      .from('User')
      .select('id, name, email, role, plan, status, joinedDate, eventsCount, createdAt, Event(id)')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching users from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format output to match Prisma nested relation 'events'
    const formattedUsers = (users || []).map((u: any) => {
      const { Event, ...rest } = u;
      return {
        ...rest,
        events: Event || [],
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/users (Registration or Admin Add User)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, plan, status } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Nama dan email wajib diisi' }, { status: 400 });
    }

    const { data: existingUser } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
    }

    const userPassword = password || 'user123';
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const { data: user, error } = await supabaseAdmin
      .from('User')
      .insert({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'user',
        plan: plan || 'Free',
        status: status || 'Aktif',
      })
      .select('id, name, email, role, plan, status, joinedDate, eventsCount')
      .single();

    if (error) {
      console.error('Error creating user in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/users (Admin Edit User)
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, email, role, plan, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (plan) updateData.plan = plan;
    if (status) updateData.status = status;
    updateData.updatedAt = new Date().toISOString();

    const { data: updated, error } = await supabaseAdmin
      .from('User')
      .update(updateData)
      .eq('id', id)
      .select('id, name, email, role, plan, status, joinedDate, eventsCount')
      .single();

    if (error) {
      console.error('Error updating user in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/users (Admin Delete User)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('User')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
