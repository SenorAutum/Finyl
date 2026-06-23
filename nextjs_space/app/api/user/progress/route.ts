export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [progress, access, tracks] = await Promise.all([
      prisma.userProgress.findMany({
        where: { userId: session.user.id, completed: true },
        include: { lesson: { select: { id: true, moduleId: true, title: true } } },
        orderBy: { completedAt: 'desc' },
      }),
      prisma.userModuleAccess.findMany({
        where: { userId: session.user.id },
        include: { module: { select: { id: true, trackId: true, title: true } } },
      }),
      prisma.track.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          modules: {
            orderBy: { sortOrder: 'asc' },
            include: { _count: { select: { lessons: true } }, lessons: { select: { id: true } } },
          },
        },
      }),
    ]);

    const completedLessonIds = new Set((progress ?? []).map((p: any) => p?.lessonId));
    const unlockedModuleIds = new Set((access ?? []).map((a: any) => a?.moduleId));

    const trackProgress = (tracks ?? []).map((track: any) => {
      const totalLessons = (track?.modules ?? []).reduce((sum: number, m: any) => sum + (m?._count?.lessons ?? 0), 0);
      const completedLessons = (track?.modules ?? []).reduce((sum: number, m: any) => {
        return sum + ((m?.lessons ?? []).filter((l: any) => completedLessonIds.has(l?.id))?.length ?? 0);
      }, 0);
      const unlockedModules = (track?.modules ?? []).filter((m: any) => m?.isFree || unlockedModuleIds.has(m?.id))?.length ?? 0;
      return {
        trackId: track?.id,
        trackTitle: track?.title,
        color: track?.color,
        icon: track?.icon,
        totalLessons,
        completedLessons,
        totalModules: track?.modules?.length ?? 0,
        unlockedModules,
        percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      };
    });

    const recentActivity = (progress ?? []).slice(0, 5).map((p: any) => ({
      lessonId: p?.lessonId,
      lessonTitle: p?.lesson?.title ?? 'Unknown',
      completedAt: p?.completedAt,
      quizScore: p?.quizScore,
      quizTotal: p?.quizTotal,
    }));

    const totalCompleted = completedLessonIds.size;
    const totalLessonsAll = (tracks ?? []).reduce((sum: number, t: any) =>
      sum + (t?.modules ?? []).reduce((s: number, m: any) => s + (m?._count?.lessons ?? 0), 0), 0);

    return NextResponse.json({
      trackProgress,
      recentActivity,
      totalCompleted,
      totalLessons: totalLessonsAll,
      overallPercentage: totalLessonsAll > 0 ? Math.round((totalCompleted / totalLessonsAll) * 100) : 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
