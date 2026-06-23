'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Circle, ArrowLeft, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function ModuleDetailClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const params = useParams();
  const moduleId = params?.moduleId as string;
  const [mod, setMod] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && moduleId) {
      fetch(`/api/modules/${moduleId}`)
        .then(async (r) => {
          const data = await r.json();
          if (!r.ok) {
            if (data?.locked) setError('locked');
            else setError(data?.error ?? 'Failed');
          } else {
            setMod(data);
          }
          setLoading(false);
        })
        .catch(() => { setError('Failed to load'); setLoading(false); });
    }
  }, [status, moduleId]);

  if (status === 'loading' || status === 'unauthenticated' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error === 'locked') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-[1200px] px-4 py-16 text-center">
          <Lock className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <h2 className="mt-4 font-display text-2xl font-bold">Module Locked</h2>
          <p className="mt-2 text-muted-foreground">You need to unlock this module to access its lessons.</p>
          <Button className="mt-6" onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-[1200px] px-4 py-12 text-center">
          <p className="text-muted-foreground">{error || 'Module not found'}</p>
          <Link href="/academy"><Button className="mt-4">Back to Academy</Button></Link>
        </div>
      </div>
    );
  }

  const lessons = mod?.lessons ?? [];
  const completed = lessons.filter((l: any) => l?.completed)?.length ?? 0;
  const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8">
        <Link href={`/academy/${mod?.track?.id ?? ''}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to {mod?.track?.title ?? 'Track'}
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl bg-card p-6 mb-6" style={{ boxShadow: 'var(--shadow-md)' }}>
            <h1 className="font-display text-2xl font-bold tracking-tight">{mod?.title ?? 'Module'}</h1>
            <p className="mt-1 text-muted-foreground">{mod?.description ?? ''}</p>
            <div className="mt-4 max-w-md">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{completed}/{lessons.length} lessons completed</span>
                <span className="font-medium text-primary">{pct}%</span>
              </div>
              <Progress value={pct} className="h-3" />
            </div>
            {pct === 100 && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <CheckCircle className="h-4 w-4" /> Module Completed! 🎉
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-3">
          {lessons.map((lesson: any, i: number) => (
            <motion.div
              key={lesson?.id ?? i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/lesson/${lesson?.id ?? ''}`}>
                <div className="group flex items-center gap-4 rounded-xl bg-card p-5 transition-all hover:scale-[1.01] cursor-pointer" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${lesson?.completed ? 'bg-primary/10' : 'bg-muted'}`}>
                    {lesson?.completed ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <span className="font-mono text-sm font-bold text-muted-foreground">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{lesson?.title ?? 'Lesson'}</h3>
                    {lesson?.quizScore != null && (
                      <p className="text-xs text-muted-foreground">Quiz Score: {lesson.quizScore}/{lesson.quizTotal}</p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
