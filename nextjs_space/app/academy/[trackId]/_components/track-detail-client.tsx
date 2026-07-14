'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Globe, BarChart3, Lock, Unlock, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { toast } from 'sonner';

// Import Firebase auth tools
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

// 🚨 IMPORT YOUR CHECKOUT BUTTON
import CheckoutButton from '@/app/_components/CheckoutButton';

const iconMap: Record<string, any> = { Wallet: BookOpen, TrendingUp, Globe, BarChart3, BookOpen };

export default function TrackDetailClient() {
  const router = useRouter();
  const params = useParams();
  const trackId = params?.trackId as string;
  
  const [track, setTrack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  
  // Track the logged in user
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
      } else {
        setCurrentUser(user);
        setAuthChecking(false);
        loadMockTrackData();
      }
    });

    return () => unsubscribe();
  }, [router, trackId]);

  // Updated to include the comprehensive Finlit Curriculum
  const loadMockTrackData = () => {
    setLoading(true);
    
    // Simulating a fast network request
    setTimeout(() => {
      setTrack({
        id: trackId,
        title: 'Digital Credit & Financial Mastery',
        description: 'Master smart budgeting, responsible borrowing, and digital security to build your business resilience.',
        color: '#10B981',
        icon: 'Wallet',
        modules: [
          {
            id: 'mod-1',
            title: 'Module 1: Smart Budgeting for Digital Borrowers',
            description: 'Learn the golden rule of cash separation and the mobile-friendly 50/30/20 matrix.',
            isFree: true,
            isUnlocked: true,
            totalLessons: 3,
            completedLessons: 0,
            lessons: [
              { id: 'les-1-1', title: 'The Golden Rule: Separating Personal and Business Cash' },
              { id: 'les-1-2', title: 'The Mobile-Friendly 50/30/20 Budgeting Matrix' },
              { id: 'les-1-3', title: 'In-App Tool Suggestion: The Daily Cash Tracker' }
            ]
          },
          {
            id: 'mod-2',
            title: 'Module 2: Intentional Saving & Building Your Cushion',
            description: 'Move away from constant reactive borrowing by automating your savings.',
            isFree: false,
            isUnlocked: false,
            price: 100,
            totalLessons: 2,
            completedLessons: 0,
            lessons: [
              { id: 'les-2-1', title: 'The "Emergency Fund" Shield' },
              { id: 'les-2-2', title: 'Automating Your Savings Goals' }
            ]
          },
          {
            id: 'mod-3',
            title: 'Module 3: Responsible Borrowing & Your Rights',
            description: 'Understand the Key Facts Statement (KFS) and your protection boundaries.',
            isFree: false,
            isUnlocked: false,
            price: 100,
            totalLessons: 3,
            completedLessons: 0,
            lessons: [
              { id: 'les-3-1', title: 'Demystifying the Key Facts Statement (KFS)' },
              { id: 'les-3-2', title: 'Safe Spaces: Proactive Support for Repayment Distress' },
              { id: 'les-3-3', title: 'Knowing Your Protection Boundaries Against Harsh Debt Collection' }
            ]
          },
          {
            id: 'mod-4',
            title: 'Module 4: Digital Security & Beating the Scammers',
            description: 'Interactive safety checklists to minimize digital asset loss.',
            isFree: false,
            isUnlocked: false,
            price: 100,
            totalLessons: 2,
            completedLessons: 0,
            lessons: [
              { id: 'les-4-1', title: 'Securing Your Digital Wallet' },
              { id: 'les-4-2', title: 'Reversing Mistaken Transactions' }
            ]
          },
          {
            id: 'mod-5',
            title: 'Module 5: Strategic Investing for Growth',
            description: 'Transitioning from basic micro-savings into asset-building tools.',
            isFree: false,
            isUnlocked: false,
            price: 100,
            totalLessons: 2,
            completedLessons: 0,
            lessons: [
              { id: 'les-5-1', title: 'Understanding Risk vs. Return' },
              { id: 'les-5-2', title: 'Accessible Digital Investment Vehicles in Kenya' }
            ]
          },
          {
            id: 'mod-6',
            title: 'Module 6: Insurance for Business Continuity',
            description: 'Moving beyond mandatory packages to mitigate real-world entrepreneurial shocks.',
            isFree: false,
            isUnlocked: false,
            price: 100,
            totalLessons: 3,
            completedLessons: 0,
            lessons: [
              { id: 'les-6-1', title: 'Demystifying Commercial Insurance Tying' },
              { id: 'les-6-2', title: 'Key Insurance Coverages Every Business Needs' },
              { id: 'les-6-3', title: 'The Digital Claim-Handling Standard' }
            ]
          },
          {
            id: 'mod-7',
            title: 'Module 7: Resolving Disputes & Escalation Pathways',
            description: 'Closing the training by reinforcing consumer agency and official legal resources.',
            isFree: false,
            isUnlocked: false,
            price: 100,
            totalLessons: 2,
            completedLessons: 0,
            lessons: [
              { id: 'les-7-1', title: 'Navigating the App Complaints Panel' },
              { id: 'les-7-2', title: 'Your Legal Right to External Redress' }
            ]
          }
        ]
      });
      setLoading(false);
    }, 400);
  };

  if (authChecking || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-[1200px] px-4 py-12 text-center">
          <p className="text-muted-foreground">Track not found</p>
          <Link href="/academy"><Button className="mt-4">Back to Academy</Button></Link>
        </div>
      </div>
    );
  }

  const Icon = iconMap[track?.icon ?? ''] ?? BookOpen;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8">
        <Link href="/academy" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Academy
        </Link>

        {/* Track header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="grid gap-6 md:grid-cols-3 rounded-xl bg-card p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
            {track?.imageUrl && (
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                <Image src={track.imageUrl} alt={track?.title ?? 'Track'} fill className="object-cover" />
              </div>
            )}
            <div className={track?.imageUrl ? 'md:col-span-2' : 'md:col-span-3'}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: `${track?.color ?? '#10B981'}15` }}>
                  <Icon className="h-6 w-6" style={{ color: track?.color ?? '#10B981' }} />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight">{track?.title ?? 'Track'}</h1>
                  <p className="text-sm text-muted-foreground">{track?.modules?.length ?? 0} modules</p>
                </div>
              </div>
              <p className="text-muted-foreground">{track?.description ?? ''}</p>
            </div>
          </div>
        </motion.div>

        {/* Modules */}
        <div className="space-y-4">
          {(track?.modules ?? []).map((mod: any, i: number) => {
            const isUnlocked = mod?.isUnlocked ?? false;
            const pct = (mod?.totalLessons ?? 0) > 0 ? Math.round(((mod?.completedLessons ?? 0) / (mod?.totalLessons ?? 1)) * 100) : 0;

            return (
              <motion.div
                key={mod?.id ?? i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl bg-card p-6 transition-all"
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isUnlocked ? (
                        <Unlock className="h-4 w-4 text-primary" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <h3 className="font-display text-lg font-semibold">{mod?.title ?? 'Module'}</h3>
                      {mod?.isFree && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Free</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{mod?.description ?? ''}</p>
                    
                    {isUnlocked && (
                      <div className="max-w-sm">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{mod?.completedLessons ?? 0}/{mod?.totalLessons ?? 0} lessons</span>
                          <span className="font-medium" style={{ color: track?.color ?? '#10B981' }}>{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(mod?.lessons ?? []).map((les: any) => (
                            <Link key={les?.id ?? Math.random()} href={`/lesson/${les?.id ?? ''}`}>
                              <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors cursor-pointer">
                                <BookOpen className="h-3 w-3" /> {les?.title ?? 'Lesson'}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 mt-4 sm:mt-0">
                    {isUnlocked ? (
                      <Link href={`/module/${mod?.id ?? ''}`}>
                        <Button className="gap-2 w-full sm:w-auto">
                          Continue <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      // 🚨 LIVE MPESA CHECKOUT COMPONENT 🚨
                      // This replaces the old mock "Unlock" button
                      <CheckoutButton 
                        moduleId={mod?.id ?? 'unknown-module'} 
                        userId={currentUser?.uid || 'anonymous'} 
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}