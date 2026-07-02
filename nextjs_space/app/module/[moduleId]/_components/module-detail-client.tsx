'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, ArrowLeft, ChevronRight, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

// Import Firebase auth tools
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function ModuleDetailClient() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params?.moduleId as string;
  
  const [user, setUser] = useState<any>(null);
  const [mod, setMod] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState('');

  // 1. Authentication Check & Data Load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
      } else {
        setUser(currentUser);
        setAuthChecking(false);
        loadMockModuleData();
      }
    });

    return () => unsubscribe();
  }, [router, moduleId]);

  // 2. Safe Fallback Data
  const loadMockModuleData = () => {
    setLoading(true);
    
    // Simulating a fast network request
    setTimeout(() => {
      if (moduleId === 'locked-demo') {
        setError('locked');
        setLoading(false);
        return;
      }
      
      setMod({
        id: moduleId,
        title: 'Module 1: The Basics',
        description: 'Learn the fundamental rules of budgeting, saving, and taking control of your financial future.',
        track: { 
          id: 'personal-finance', 
          title: 'Personal Finance' 
        },
        lessons: [
          { id: 'les-1', title: 'What is a Budget?', completed: true, quizScore: 2, quizTotal: 2 },
          { id: 'les-2', title: 'The 50/30/20 Rule', completed: false },
          { id: 'les-3', title: 'Building an Emergency Fund', completed: false }
        ]
      });
      
      setLoading(false);
    }, 400);
  };

  // 3. Loading State
  if (authChecking || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  // 4. Locked State UI
  if (error === 'locked') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased flex flex-col">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-16 text-center flex-1 flex flex-col justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Module Locked</h2>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Complete the previous modules to unlock these lessons and continue your financial journey.
            </p>
            <Button 
              className="mt-6 w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl py-6" 
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 5. Error / Not Found State UI
  if (!mod) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased flex flex-col">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-16 text-center flex-1 flex flex-col justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-400 mb-4" />
            <p className="text-slate-600 font-medium mb-6">{error || 'Module not found'}</p>
            <Link href="/academy" className="block w-full">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-6">
                Back to Academy
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 6. Active Module Logic
  const lessons = mod?.lessons ?? [];
  const completed = lessons.filter((l: any) => l?.completed)?.length ?? 0;
  const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        
        {/* Navigation Breadcrumb */}
        <Link 
          href={`/academy/${mod?.track?.id ?? ''}`} 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors mb-6 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {mod?.track?.title ?? 'Track'}
        </Link>

        {/* Module Header Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-3xl bg-white p-6 md:p-8 mb-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-0 opacity-50" />
            
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 block mb-2">
                Module Overview
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">{mod?.title ?? 'Module'}</h1>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">{mod?.description ?? ''}</p>
              
              {/* Custom Progress Bar matching Finyl Theme */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-500">{completed} of {lessons.length} lessons read</span>
                  <span className="text-teal-600">{pct}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-500 h-full transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {pct === 100 && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-3 text-sm font-bold text-teal-700 w-full justify-center border border-teal-100">
                  <CheckCircle className="h-5 w-5" /> Module Successfully Completed! 🎉
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Micro-Learning Lessons List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 ml-2 mb-4">Lessons in this Module</h3>
          {lessons.map((lesson: any, i: number) => (
            <motion.div
              key={lesson?.id ?? i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/lesson/${lesson?.id ?? ''}`}>
                <div className={`group flex items-center gap-4 rounded-2xl p-4 md:p-5 transition-all cursor-pointer border ${
                  lesson?.completed 
                    ? 'bg-white border-teal-100 shadow-sm hover:border-teal-300' 
                    : 'bg-white border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-md'
                }`}>
                  
                  {/* Status Indicator */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 transition-colors ${
                    lesson?.completed 
                      ? 'bg-teal-50 text-teal-600' 
                      : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600'
                  }`}>
                    {lesson?.completed ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <span className="font-sans text-sm font-bold">{i + 1}</span>
                    )}
                  </div>
                  
                  {/* Lesson Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm md:text-base truncate ${lesson?.completed ? 'text-slate-800' : 'text-slate-700'}`}>
                      {lesson?.title ?? 'Lesson'}
                    </h3>
                    {lesson?.quizScore != null && (
                      <p className="text-xs font-medium text-amber-600 mt-1">
                        Quiz Score: {lesson.quizScore}/{lesson.quizTotal}
                      </p>
                    )}
                    {!lesson?.completed && (
                      <p className="text-[11px] text-slate-400 mt-0.5">Tap to start learning</p>
                    )}
                  </div>
                  
                  {/* Action Icon */}
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    lesson?.completed ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-800 group-hover:text-white'
                  }`}>
                    <ChevronRight className="h-4 w-4" />
                  </div>

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