export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tracks = await prisma.track.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { lessons: true } } },
        },
      },
    });
    return NextResponse.json(tracks);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }
}
