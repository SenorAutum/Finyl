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

    const [userCount, lessonCount, completionCount, unlockCount] = await Promise.all([
      prisma.user.count(),
      prisma.lesson.count(),
      prisma.userProgress.count({ where: { completed: true } }),
      prisma.userModuleAccess.count(),
    ]);

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const recentCompletions = await prisma.userProgress.findMany({
      where: { completed: true },
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        lesson: { select: { title: true, module: { select: { title: true } } } },
      },
    });

    return NextResponse.json({
      userCount,
      lessonCount,
      completionCount,
      unlockCount,
      recentUsers,
      recentCompletions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
