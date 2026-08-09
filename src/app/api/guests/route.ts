import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/guests?eventId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    const guests = await prisma.guest.findMany({
      where: eventId ? { eventId } : {},
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/guests (Public RSVP submission)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, name, attendance, pax, wishes } = body;

    if (!eventId || !name) {
      return NextResponse.json({ error: 'Event ID and name are required' }, { status: 400 });
    }

    const guest = await prisma.guest.create({
      data: {
        eventId,
        name,
        attendance: attendance || 'Hadir',
        pax: pax ? parseInt(pax) : 1,
        wishes,
      },
    });

    return NextResponse.json(guest, { status: 201 });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
