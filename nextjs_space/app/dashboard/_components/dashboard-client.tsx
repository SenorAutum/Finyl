'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Globe, BarChart3, Award, Clock, CheckCircle, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const iconMap: Record<string, any> = { Wallet: BookOpen, TrendingUp, Globe, BarChart3, BookOpen };

interface TrackProgress {
  trackId: string;
  trackTitle: string;
  color: string;
  icon: string;
  totalLessons: number;
  completedLessons: number;
  totalModules: number;
  unlockedModules: number;
  percentage: number;
}

interface Activity {
  lessonId: string;
  lessonTitle: string;
  completedAt: string | null;
  quizScore: number | null;
  quizTotal: number | null;
}

export default function DashboardClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/progress')
        .then((r) => r.json())
        .then((d) => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const userName = session?.user?.name ?? 'Learner';
  const trackProgress: TrackProgress[] = data?.trackProgress ?? [];
  const recentActivity: Activity[] = data?.recentActivity ?? [];
  const overallPct = data?.overallPercentage ?? 0;
  const totalCompleted = data?.totalCompleted ?? 0;
  const totalLessons = data?.totalLessons ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-4 py-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-primary">{userName?.split(' ')?.[0] ?? 'Learner'}</span> 👋
          </h1>
          <p className="mt-1 text-muted-foreground">Continue building your financial knowledge</p>
        </motion.div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, label: 'Lessons Completed', value: totalCompleted, color: '#10B981' },
            { icon: Trophy, label: 'Overall Progress', value: `${overallPct}%`, color: '#3B82F6' },
            { icon: Award, label: 'Total Lessons', value: totalLessons, color: '#8B5CF6' },
            { icon: Sparkles, label: 'Tracks Available', value: trackProgress?.length ?? 0, color: '#F59E0B' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl bg-card p-5"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 rounded-xl bg-card p-6"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">Overall Academy Progress</h2>
            <span className="font-mono text-sm font-bold text-primary">{overallPct}%</span>
          </div>
          <Progress value={overallPct} className="h-3" />
          <p className="mt-2 text-sm text-muted-foreground">{totalCompleted} of {totalLessons} lessons completed</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Track progress */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-xl font-semibold mb-4">Learning Tracks</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {(trackProgress ?? []).map((track: TrackProgress, i: number) => {
                const Icon = iconMap[track?.icon ?? ''] ?? BookOpen;
                return (
                  <motion.div
                    key={track?.trackId ?? i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <Link href={`/academy/${track?.trackId ?? ''}`}>
                      <div className="group rounded-xl bg-card p-5 transition-all hover:scale-[1.02] cursor-pointer" style={{ boxShadow: 'var(--shadow-md)' }}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${track?.color ?? '#10B981'}15` }}>
                            <Icon className="h-5 w-5" style={{ color: track?.color ?? '#10B981' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{track?.trackTitle ?? 'Track'}</h3>
                            <p className="text-xs text-muted-foreground">
                              {track?.unlockedModules ?? 0}/{track?.totalModules ?? 0} modules unlocked
                            </p>
                          </div>
                        </div>
                        <Progress value={track?.percentage ?? 0} className="h-2 mb-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{track?.completedLessons ?? 0}/{track?.totalLessons ?? 0} lessons</span>
                          <span className="font-medium" style={{ color: track?.color ?? '#10B981' }}>{track?.percentage ?? 0}%</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            <Link href="/academy" className="mt-4 inline-block">
              <Button variant="outline" className="gap-2">
                View All Tracks <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="font-display text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="rounded-xl bg-card p-5" style={{ boxShadow: 'var(--shadow-md)' }}>
              {(recentActivity ?? []).length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">No activity yet. Start a lesson!</p>
                  <Link href="/academy">
                    <Button size="sm" className="mt-3">Browse Academy</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {(recentActivity ?? []).map((act: Activity, i: number) => (
                    <div key={`${act?.lessonId ?? ''}-${i}`} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{act?.lessonTitle ?? 'Lesson'}</p>
                        {act?.quizScore != null && (
                          <p className="text-xs text-muted-foreground">Quiz: {act?.quizScore}/{act?.quizTotal}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {act?.completedAt ? new Date(act.completedAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
