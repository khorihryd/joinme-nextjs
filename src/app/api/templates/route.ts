import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/templates
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    const whereCondition = showAll ? {} : { status: 'Aktif' };

    const templates = await prisma.template.findMany({
      where: whereCondition,
      orderBy: { views: 'desc' },
    });
    return NextResponse.json(templates);
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

    const template = await prisma.template.create({
      data: {
        name,
        category,
        tier: tier || 'Free',
        thumbnail,
        globalStyles,
        nodes,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
