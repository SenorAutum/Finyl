'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, TrendingUp, Globe, BarChart3, ChevronRight, Zap, Target, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

// Import Firebase auth tools
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const tracks = [
  { icon: BookOpen, title: 'Personal Finance', description: 'Budgeting, savings, and credit management', color: '#10B981' },
  { icon: TrendingUp, title: 'Investing', description: 'Stocks, ETFs, diversification, and risk', color: '#3B82F6' },
  { icon: Globe, title: 'Economics', description: 'Inflation, GDP, supply & demand', color: '#8B5CF6' },
  { icon: BarChart3, title: 'Trading', description: 'Market orders, technical analysis, psychology', color: '#F59E0B' },
];

const features = [
  { icon: Zap, title: 'Bite-Sized Lessons', description: 'Learn complex concepts in 5-10 minute lessons designed for busy schedules.' },
  { icon: Target, title: 'Interactive Quizzes', description: 'Test your knowledge with instant feedback after every lesson.' },
  { icon: Award, title: 'Track Progress', description: 'Watch your expertise grow with detailed progress tracking across all tracks.' },
];

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        router.replace('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-4 pb-20 pt-16 text-center md:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <GraduationCap className="h-4 w-4" />
              Financial Education, Simplified
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Master Your{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Finances
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Bite-sized lessons, interactive quizzes, and structured learning paths to build your financial literacy from the ground up.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 text-base px-8">
                  Start Learning Free <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 w-full max-w-4xl"
          >
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl" style={{ boxShadow: 'var(--shadow-lg)' }}>
              <Image
                src="https://cdn.abacus.ai/images/f22baf51-ec18-40cd-a69e-9f6e29bbf661.png"
                alt="Finylys Academy - Financial education platform showing diverse learners engaging with financial concepts"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tracks */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold tracking-tight">4 Learning Tracks</h2>
            <p className="mt-3 text-muted-foreground">Structured paths to build comprehensive financial knowledge</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tracks.map((track, i) => (
              <motion.div
                key={track.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-xl bg-card p-6 transition-all hover:scale-[1.02]"
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: `${track.color}15` }}>
                  <track.icon className="h-6 w-6" style={{ color: track.color }} />
                </div>
                <h3 className="font-display font-semibold text-lg">{track.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{track.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold tracking-tight">Learn the Smart Way</h2>
            <p className="mt-3 text-muted-foreground">Everything you need to become financially literate</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold tracking-tight">How It Works</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your free account in seconds' },
              { step: '2', title: 'Choose a Track', desc: 'Pick the topic that interests you most' },
              { step: '3', title: 'Complete Lessons', desc: 'Learn through engaging, bite-sized content' },
              { step: '4', title: 'Test & Track', desc: 'Take quizzes and watch your progress grow' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-[1200px] px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-12 text-white"
          >
            <h2 className="font-display text-3xl font-bold">Ready to Master Your Finances?</h2>
            <p className="mt-3 text-white/80 max-w-lg mx-auto">Join thousands of learners building their financial future with Finylys Academy.</p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="mt-6 bg-white text-primary hover:bg-white/90 gap-2">
                Get Started Free <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}