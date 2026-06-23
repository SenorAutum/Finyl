export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { moduleId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const mod = await prisma.module.findUnique({
      where: { id: params.moduleId },
      include: {
        lessons: { orderBy: { sortOrder: 'asc' } },
        track: { select: { id: true, title: true, color: true } },
      },
    });
    if (!mod) return NextResponse.json({ error: 'Module not found' }, { status: 404 });

    const access = mod?.isFree ? true : !!(await prisma.userModuleAccess.findUnique({
      where: { userId_moduleId: { userId: session.user.id, moduleId: params.moduleId } },
    }));

    if (!access) return NextResponse.json({ error: 'Module locked', locked: true }, { status: 403 });

    const progress = await prisma.userProgress.findMany({
      where: { userId: session.user.id, lessonId: { in: (mod?.lessons ?? []).map((l: any) => l?.id) } },
    });

    const progressMap = new Map((progress ?? []).map((p: any) => [p?.lessonId, p]));

    const enrichedLessons = (mod?.lessons ?? []).map((l: any) => {
      const p = progressMap.get(l?.id);
      return { ...l, completed: p?.completed ?? false, quizScore: p?.quizScore ?? null, quizTotal: p?.quizTotal ?? null };
    });

    return NextResponse.json({ ...mod, lessons: enrichedLessons, isUnlocked: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch module' }, { status: 500 });
  }
}
