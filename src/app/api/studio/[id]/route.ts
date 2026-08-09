import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/studio/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const template = await prisma.template.findUnique({ where: { id } });
    if (template) {
      return NextResponse.json(template);
    }

    const event = await prisma.event.findUnique({ where: { id } });
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

    const template = await prisma.template.findUnique({ where: { id } });
    if (template) {
      const updated = await prisma.template.update({
        where: { id },
        data: { nodes, globalStyles },
      });
      return NextResponse.json(updated);
    }

    const event = await prisma.event.findUnique({ where: { id } });
    if (event) {
      const updated = await prisma.event.update({
        where: { id },
        data: { details: { ...(event.details as any), studioNodes: nodes, globalStyles } },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Error saving studio data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
