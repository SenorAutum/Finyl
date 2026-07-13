'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, BookOpen, Award, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

// Import Firebase auth tools
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProfileClient() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
      } else {
        setUser(currentUser);
        setAuthChecking(false);
        loadMockProgressData();
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadMockProgressData = () => {
    // Safe fallback data since the old Prisma API was removed
    setData({
      overallPercentage: 45,
      totalCompleted: 9,
      totalLessons: 20,
      trackProgress: [
        {
          trackId: 'personal-finance',
          trackTitle: 'Personal Finance',
          color: '#10B981',
          percentage: 75,
          completedLessons: 3,
          totalLessons: 4,
          unlockedModules: 1,
          totalModules: 2
        },
        {
          trackId: 'investing',
          trackTitle: 'Investing Fundamentals',
          color: '#3B82F6',
          percentage: 0,
          completedLessons: 0,
          totalLessons: 6,
          unlockedModules: 0,
          totalModules: 3
        }
      ]
    });
  };

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const overallPct = data?.overallPercentage ?? 0;
  const role = user?.email === 'brandonmwanzia@gmail.com' ? 'ADMIN' : 'LEARNER';
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

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
                <h1 className="font-display text-2xl font-bold tracking-tight">{userName}</h1>
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
                <p className="font-semibold capitalize">{role.toLowerCase()}</p>
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