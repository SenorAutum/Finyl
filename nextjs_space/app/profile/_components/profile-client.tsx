'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, BookOpen, Award, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function ProfileClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/progress')
        .then((r) => r.json())
        .then((d) => setData(d))
        .catch(() => {});
    }
  }, [status]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const user = session?.user;
  const overallPct = data?.overallPercentage ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl bg-card p-8" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight">{user?.name ?? 'User'}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {user?.email ?? ''}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Shield className="h-4 w-4" /> Role
                </div>
                <p className="font-semibold capitalize">{((user as any)?.role ?? 'LEARNER').toLowerCase()}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <BookOpen className="h-4 w-4" /> Lessons Completed
                </div>
                <p className="font-semibold">{data?.totalCompleted ?? 0} / {data?.totalLessons ?? 0}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" /> Overall Progress
                </div>
                <p className="font-semibold">{overallPct}%</p>
                <Progress value={overallPct} className="h-2 mt-2" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Track progress details */}
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold mb-4">Track Progress</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(data?.trackProgress ?? []).map((tp: any, i: number) => (
              <motion.div
                key={tp?.trackId ?? i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl bg-card p-5"
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{tp?.trackTitle ?? 'Track'}</h3>
                  <span className="text-xs font-mono" style={{ color: tp?.color ?? '#10B981' }}>{tp?.percentage ?? 0}%</span>
                </div>
                <Progress value={tp?.percentage ?? 0} className="h-2 mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{tp?.completedLessons ?? 0}/{tp?.totalLessons ?? 0} lessons</span>
                  <span>{tp?.unlockedModules ?? 0}/{tp?.totalModules ?? 0} modules unlocked</span>
                </div>
                {(tp?.percentage ?? 0) === 100 && (
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <Award className="h-3 w-3" /> Track Mastered!
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
