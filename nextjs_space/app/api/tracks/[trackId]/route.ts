export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { trackId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const track = await prisma.track.findUnique({
      where: { id: params.trackId },
      include: {
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: { orderBy: { sortOrder: 'asc' }, select: { id: true, title: true, sortOrder: true } },
            _count: { select: { lessons: true } },
          },
        },
      },
    });
    if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 });

    let userAccess: any[] = [];
    let userProgress: any[] = [];
    if (session?.user?.id) {
      userAccess = await prisma.userModuleAccess.findMany({
        where: { userId: session.user.id },
        select: { moduleId: true },
      });
      userProgress = await prisma.userProgress.findMany({
        where: { userId: session.user.id, completed: true },
        select: { lessonId: true },
      });
    }

    const unlockedModuleIds = new Set(userAccess?.map((a: any) => a?.moduleId) ?? []);
    const completedLessonIds = new Set(userProgress?.map((p: any) => p?.lessonId) ?? []);

    const enriched = {
      ...track,
      modules: (track?.modules ?? []).map((m: any) => ({
        ...m,
        isUnlocked: m?.isFree || unlockedModuleIds.has(m?.id),
        completedLessons: (m?.lessons ?? []).filter((l: any) => completedLessonIds.has(l?.id))?.length ?? 0,
        totalLessons: m?._count?.lessons ?? 0,
      })),
    };
    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch track' }, { status: 500 });
  }
}
