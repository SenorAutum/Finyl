export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { lessonId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      include: { module: { include: { track: { select: { id: true, title: true, color: true } } } } },
    });
    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    // Check module access
    const mod = lesson?.module;
    if (!mod?.isFree) {
      const access = await prisma.userModuleAccess.findUnique({
        where: { userId_moduleId: { userId: session.user.id, moduleId: mod?.id ?? '' } },
      });
      if (!access) return NextResponse.json({ error: 'Module locked' }, { status: 403 });
    }

    const progress = await prisma.userProgress.findUnique({
      where: { userId_lessonId: { userId: session.user.id, lessonId: params.lessonId } },
    });

    // Get sibling lessons for navigation
    const siblings = await prisma.lesson.findMany({
      where: { moduleId: mod?.id },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, title: true, sortOrder: true },
    });

    return NextResponse.json({
      ...lesson,
      progress: progress ?? null,
      siblings: siblings ?? [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 });
  }
}
