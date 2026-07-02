'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Globe, BarChart3, Lock, Unlock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

// Import Firebase auth tools
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const iconMap: Record<string, any> = { Wallet: BookOpen, TrendingUp, Globe, BarChart3, BookOpen };

export default function AcademyClient() {
  const router = useRouter();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
      } else {
        setAuthChecking(false);
        
        // Provide safe placeholder tracks since the old Prisma API is gone
        setTracks([
          {
            id: 'personal-finance',
            title: 'Personal Finance',
            description: 'Master budgeting, savings, and credit management basics.',
            icon: 'Wallet',
            color: '#10B981',
            modules: [
              { id: 'm1', title: 'Smart Budgeting', isFree: true, _count: { lessons: 4 } },
              { id: 'm2', title: 'Credit Repair', isFree: false, _count: { lessons: 5 } }
            ]
          },
          {
            id: 'investing',
            title: 'Investing Fundamentals',
            description: 'Learn about stocks, ETFs, diversification, and risk.',
            icon: 'TrendingUp',
            color: '#3B82F6',
            modules: [
              { id: 'm3', title: 'Stock Market 101', isFree: true, _count: { lessons: 6 } }
            ]
          }
        ]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold tracking-tight">Academy</h1>
          <p className="mt-1 text-muted-foreground">Choose a learning track to begin your journey</p>
        </motion.div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="mt-8 grid gap-8">
            {(tracks ?? []).map((track: any, i: number) => {
              const Icon = iconMap[track?.icon ?? ''] ?? BookOpen;
              const totalLessons = (track?.modules ?? []).reduce((sum: number, m: any) => sum + (m?._count?.lessons ?? 0), 0);
              return (
                <motion.div
                  key={track?.id ?? i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/academy/${track?.id ?? ''}`}>
                    <div className="group grid gap-6 rounded-xl bg-card p-6 transition-all hover:scale-[1.01] md:grid-cols-3 cursor-pointer" style={{ boxShadow: 'var(--shadow-md)' }}>
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted md:aspect-[4/3] flex items-center justify-center">
                        {/* Placeholder visual if no image URL is provided */}
                        {track?.imageUrl ? (
                          <Image
                            src={track.imageUrl}
                            alt={track?.title ?? 'Track'}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <Icon className="h-16 w-16 opacity-20" style={{ color: track?.color ?? '#10B981' }} />
                        )}
                      </div>
                      <div className="md:col-span-2 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${track?.color ?? '#10B981'}15` }}>
                            <Icon className="h-5 w-5" style={{ color: track?.color ?? '#10B981' }} />
                          </div>
                          <h2 className="font-display text-xl font-bold">{track?.title ?? 'Track'}</h2>
                        </div>
                        <p className="text-muted-foreground mb-4">{track?.description ?? ''}</p>
                        <div className="flex flex-wrap gap-3 mb-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                            <BookOpen className="h-3 w-3" /> {track?.modules?.length ?? 0} modules
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                            📝 {totalLessons} lessons
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(track?.modules ?? []).map((mod: any) => (
                            <span key={mod?.id ?? Math.random()} className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${mod?.isFree ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                              {mod?.isFree ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                              {mod?.title ?? 'Module'}
                            </span>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" className="mt-4 w-fit gap-2">
                          Explore Track <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}