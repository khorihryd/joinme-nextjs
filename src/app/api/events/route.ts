import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/events
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isUserAdmin = session.user.role === 'admin';

    const events = await prisma.event.findMany({
      where: isUserAdmin ? {} : { userId: session.user.id },
      include: {
        _count: {
          select: { guests: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/events
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, type, subdomain } = body;

    if (!title || !type || !subdomain) {
      return NextResponse.json({ error: 'Title, type, and subdomain are required' }, { status: 400 });
    }

    const cleanSubdomain = subdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');

    const existing = await prisma.event.findUnique({
      where: { subdomain: cleanSubdomain },
    });

    if (existing) {
      return NextResponse.json({ error: 'Subdomain already in use' }, { status: 409 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        type,
        subdomain: cleanSubdomain,
        userId: session.user.id,
        status: 'Draft',
        details: {
          schedules: [],
          story: [],
          gallery: [],
          showStory: true,
          showGallery: true,
          showDresscode: false,
        },
      },
    });

    // Update user's events count
    await prisma.user.update({
      where: { id: session.user.id },
      data: { eventsCount: { increment: 1 } },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
