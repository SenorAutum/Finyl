'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Globe, BarChart3, Lock, Unlock, CheckCircle, ChevronRight, ArrowLeft, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { toast } from 'sonner';

// Import Firebase auth tools
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const iconMap: Record<string, any> = { Wallet: BookOpen, TrendingUp, Globe, BarChart3, BookOpen };

export default function TrackDetailClient() {
  const router = useRouter();
  const params = useParams();
  const trackId = params?.trackId as string;
  
  const [track, setTrack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [unlocking, setUnlocking] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
      } else {
        setAuthChecking(false);
        loadMockTrackData();
      }
    });

    return () => unsubscribe();
  }, [router, trackId]);

  // Safe fallback data since the old Prisma API was removed
  const loadMockTrackData = () => {
    setLoading(true);
    
    // Simulating a fast network request
    setTimeout(() => {
      setTrack({
        id: trackId,
        title: trackId === 'investing' ? 'Investing Fundamentals' : 'Personal Finance',
        description: 'Master the basics of managing your money and building wealth for the future.',
        color: trackId === 'investing' ? '#3B82F6' : '#10B981',
        icon: trackId === 'investing' ? 'TrendingUp' : 'Wallet',
        modules: [
          {
            id: 'mod-1',
            title: 'Module 1: The Basics',
            description: 'Learn the fundamental rules of budgeting and saving.',
            isFree: true,
            isUnlocked: true,
            totalLessons: 4,
            completedLessons: 1,
            lessons: [{ id: 'les-1', title: 'What is a Budget?' }, { id: 'les-2', title: 'The 50/30/20 Rule' }]
          },
          {
            id: 'mod-2',
            title: 'Module 2: Advanced Strategies',
            description: 'Take your finances to the next level.',
            isFree: false,
            isUnlocked: false,
            price: 4.99,
            totalLessons: 5,
            completedLessons: 0,
            lessons: []
          }
        ]
      });
      setLoading(false);
    }, 400);
  };

  const handleUnlock = async (moduleId: string) => {
    setUnlocking(moduleId);
    
    // Simulate a secure unlock request
    setTimeout(() => {
      toast.success('Module unlocked successfully!');
      
      // Update the local state to show it as unlocked
      setTrack((prev: any) => ({
        ...prev,
        modules: prev.modules.map((m: any) => 
          m.id === moduleId ? { ...m, isUnlocked: true, lessons: [{ id: 'les-new', title: 'Welcome to the Module' }] } : m
        )
      }));
      
      setUnlocking(null);
    }, 1000);
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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                      </div>
                    )}
                    {isUnlocked && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(mod?.lessons ?? []).map((les: any) => (
                          <Link key={les?.id ?? Math.random()} href={`/lesson/${les?.id ?? ''}`}>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors cursor-pointer">
                              <BookOpen className="h-3 w-3" /> {les?.title ?? 'Lesson'}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {isUnlocked ? (
                      <Link href={`/module/${mod?.id ?? ''}`}>
                        <Button className="gap-2">
                          Continue <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => handleUnlock(mod?.id ?? '')}
                        disabled={unlocking === mod?.id}
                        className="gap-2"
                        variant="secondary"
                      >
                        <DollarSign className="h-4 w-4" />
                        {unlocking === mod?.id ? 'Unlocking...' : `Unlock — $${mod?.price?.toFixed?.(2) ?? '0.00'}`}
                      </Button>
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