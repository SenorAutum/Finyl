export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { moduleId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const mod = await prisma.module.findUnique({ where: { id: params.moduleId } });
    if (!mod) return NextResponse.json({ error: 'Module not found' }, { status: 404 });

    const existing = await prisma.userModuleAccess.findUnique({
      where: { userId_moduleId: { userId: session.user.id, moduleId: params.moduleId } },
    });
    if (existing) return NextResponse.json({ message: 'Already unlocked' });

    const access = await prisma.userModuleAccess.create({
      data: {
        userId: session.user.id,
        moduleId: params.moduleId,
        paymentStatus: 'COMPLETED',
      },
    });
    return NextResponse.json({ message: 'Module unlocked successfully', access });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to unlock module' }, { status: 500 });
  }
}
