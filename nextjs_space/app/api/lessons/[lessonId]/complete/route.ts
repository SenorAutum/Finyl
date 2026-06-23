export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { lessonId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { quizScore, quizTotal } = await req.json().catch(() => ({ quizScore: null, quizTotal: null }));

    const progress = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId: params.lessonId } },
      update: {
        completed: true,
        quizScore: quizScore ?? undefined,
        quizTotal: quizTotal ?? undefined,
        completedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId: params.lessonId,
        completed: true,
        quizScore,
        quizTotal,
        completedAt: new Date(),
      },
    });
    return NextResponse.json(progress);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to complete lesson' }, { status: 500 });
  }
}
