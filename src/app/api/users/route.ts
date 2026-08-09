import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/users (Admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        status: true,
        joinedDate: true,
        eventsCount: true,
        createdAt: true,
        events: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
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

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
    }

    const userPassword = password || 'user123';
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'user',
        plan: plan || 'Free',
        status: status || 'Aktif',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        status: true,
        joinedDate: true,
        eventsCount: true,
      },
    });

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

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(role && { role }),
        ...(plan && { plan }),
        ...(status && { status }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        status: true,
        joinedDate: true,
        eventsCount: true,
      },
    });

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

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
