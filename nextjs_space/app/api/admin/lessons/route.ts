export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const lessons = await prisma.lesson.findMany({
      orderBy: [{ moduleId: 'asc' }, { sortOrder: 'asc' }],
      include: { module: { select: { title: true, track: { select: { title: true } } } } },
    });
    return NextResponse.json(lessons);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const data = await req.json();
    const lesson = await prisma.lesson.create({ data });
    return NextResponse.json(lesson, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
}
