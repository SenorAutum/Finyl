'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  TrendingUp, 
  Globe, 
  BarChart3, 
  Award, 
  CheckCircle, 
  Sparkles, 
  Trophy, 
  AlertTriangle, 
  ArrowRight,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

// Import our new Firebase auth tools
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const iconMap: Record<string, any> = { Wallet, TrendingUp, Globe, BarChart3, BookOpen };

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

// Inline curriculum snapshot for the dashboard micro-card highlight
const dashboardCurriculumHighlight = {
  moduleId: "mod-1",
  moduleTitle: "Smart Budgeting for Digital Borrowers",
  title: "The Golden Rule: Separating Personal and Business Cash",
  problem: "Mixing household money with business profits leads to unexpected loan defaults.",
  strategy: "Open a distinct digital wallet or secondary account solely for your business income and expenses. Pay yourself a fixed, consistent 'salary' from your business wallet to cover personal needs.",
};

export default function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase login status
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
      } else {
        setUser(currentUser);
        
        // Provide a safe empty state so the UI renders beautifully 
        // while we prep the Firestore database connection in the next phase!
        setData({
          trackProgress: [],
          recentActivity: [],
          overallPercentage: 0,
          totalCompleted: 0,
          totalLessons: 0
        });
        
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  // Extract the user's name or email prefix to greet them
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Learner';
  const trackProgress: TrackProgress[] = data?.trackProgress ?? [];
  const recentActivity: Activity[] = data?.recentActivity ?? [];
  const overallPct = data?.overallPercentage ?? 0;
  const totalCompleted = data?.totalCompleted ?? 0;
  const totalLessons = data?.totalLessons ?? 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased">
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-4 py-8">
        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, <span className="text-teal-600">{userName}</span> 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">Track your progress and read your micro-learning milestones.</p>
          </div>
          <span className="self-start md:self-center bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full border border-teal-100">
            Finyl Hub Profile Active
          </span>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, label: 'Lessons Completed', value: totalCompleted, color: '#0d9488' },
            { icon: Trophy, label: 'Overall Progress', value: `${overallPct}%`, color: '#0f766e' },
            { icon: Award, label: 'Total Lessons', value: totalLessons, color: '#14b8a6' },
            { icon: Sparkles, label: 'Tracks Available', value: trackProgress?.length ?? 0, color: '#f59e0b' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm flex items-center gap-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${stat.color}10` }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Highlight Focus Feature: Embedded Curriculum Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl bg-white border border-teal-100 shadow-sm overflow-hidden grid md:grid-cols-3"
        >
          <div className="p-6 md:col-span-2 bg-gradient-to-br from-teal-50/60 to-transparent flex flex-col justify-between space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-100/50 px-2.5 py-1 rounded-md uppercase tracking-wide mb-3">
                <Sparkles className="w-3 h-3" /> Quick Learning Milestone
              </span>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">
                {dashboardCurriculumHighlight.title}
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {dashboardCurriculumHighlight.strategy}
              </p>
            </div>
            
            <div className="pt-2">
              <Link href={`/module/${dashboardCurriculumHighlight.moduleId}`}>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 px-4 rounded-xl gap-2 shadow-sm transition-all">
                  Open Learning Modules <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="p-6 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-center space-y-3">
            <div className="flex gap-2 items-start text-amber-600">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">The Risk Alert</span>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {dashboardCurriculumHighlight.problem}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Academy Section & Sidebar */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Track progress list */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Your Learning Tracks</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {trackProgress.length === 0 && (
                <div className="col-span-2 p-6 text-center rounded-2xl bg-white border border-slate-100">
                  <p className="text-sm text-slate-500">Your custom learning tracks are being prepared.</p>
                </div>
              )}
              {trackProgress.map((track, i) => {
                const Icon = iconMap[track?.icon] ?? BookOpen;
                return (
                  <motion.div
                    key={track?.trackId ?? i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <Link href={`/academy/${track?.trackId ?? ''}`}>
                      <div className="group rounded-2xl bg-white p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-teal-100 cursor-pointer">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
                            <Icon className="h-5 w-5 text-teal-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-slate-800 truncate group-hover:text-teal-600 transition-colors">
                              {track?.trackTitle ?? 'Learning Track'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {track?.unlockedModules ?? 0}/{track?.totalModules ?? 0} modules unlocked
                            </p>
                          </div>
                        </div>
                        <Progress value={track?.percentage ?? 0} className="h-2 mb-2 bg-slate-100" />
                        <div className="flex justify-between text-xs font-medium text-slate-400">
                          <span>{track?.completedLessons ?? 0}/{track?.totalLessons ?? 0} lessons</span>
                          <span className="text-teal-600 font-bold">{track?.percentage ?? 0}%</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Activity Feed sidebar */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h2>
            <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-xs text-slate-400">No recent history logged yet.</p>
                  <Link href="/academy" className="mt-3 inline-block">
                    <Button size="sm" variant="outline" className="text-xs rounded-xl">Browse Academy</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((act, i) => (
                    <div key={`${act?.lessonId ?? ''}-${i}`} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-teal-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{act?.lessonTitle ?? 'Lesson Milestone'}</p>
                        {act?.quizScore != null && (
                          <p className="text-[11px] font-medium text-amber-600 mt-0.5">Quiz: {act?.quizScore}/{act?.quizTotal}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5">
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
