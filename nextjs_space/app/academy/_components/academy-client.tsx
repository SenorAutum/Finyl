'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Coins, 
  Target, 
  Wallet, 
  PiggyBank, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';

// Import Firebase auth & database tools
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// Import Curriculum
import { finylCurriculum } from '@/lib/curriculumData';

export default function AcademyClient() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeData: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
      } else {
        setUser(currentUser);
        
        // Listen to live user stats for the gamification header
        const userDocRef = doc(db, 'users', currentUser.uid);
        unsubscribeData = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
          setLoading(false);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeData) unsubscribeData();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  // Extract live stats or default to 0
  const points = userData?.points || 0;
  const completedLessons = userData?.totalCompleted || 0;
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Learner';

  // Map the first 3 modules from your actual curriculum to the circular badges
  const levelOneModules = [
    { ...finylCurriculum[0], icon: Wallet, color: 'bg-blue-100 text-blue-600 border-blue-50' },
    { ...finylCurriculum[1], icon: PiggyBank, color: 'bg-emerald-100 text-emerald-600 border-emerald-50' },
    { ...finylCurriculum[2], icon: ShieldCheck, color: 'bg-purple-100 text-purple-600 border-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-md mx-auto relative pb-12 mt-4 md:mt-8">
        {/* VIBRANT HEADER BACKGROUND */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-indigo-500 to-purple-600 md:rounded-3xl rounded-b-[40px] z-0 shadow-lg" />

        <div className="relative z-10 px-4 pt-8">
          
          {/* USER INFO & NOTIFICATIONS */}
          <div className="flex items-center justify-between mb-8 text-white">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center backdrop-blur-sm overflow-hidden">
                <span className="text-xl font-bold">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <span className="font-bold text-lg tracking-wide truncate max-w-[150px]">{userName}</span>
            </div>
            <button className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 hover:bg-white/20 transition">
              <Target className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* 4 GAMIFICATION STAT PILLS */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-amber-100 p-2 rounded-full">
                <Coins className="h-5 w-5 text-amber-500" />
              </div>
              <span className="font-bold text-slate-700 text-sm">{points} Coins</span>
            </div>
            
            <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 p-2 rounded-full">
                <span className="text-xs font-black text-purple-700">XP</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-700 text-sm">{completedLessons * 50} / 500</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-amber-50 p-2 rounded-full">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <span className="font-bold text-slate-700 text-sm">Leaderboard</span>
            </div>

            <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-slate-100 p-2 rounded-full">
                <Flame className="h-5 w-5 text-slate-400" />
              </div>
              <span className="font-bold text-slate-700 text-sm">1 day streak</span>
            </div>
          </div>

          {/* MAIN ACADEMY CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-6 shadow-xl shadow-indigo-100/50 mb-6 border border-slate-50"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-extrabold text-slate-800">Finyl Academy - Level 1</h2>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider rounded-full">
                Current level
              </span>
            </div>

            {/* CIRCULAR MODULE ICONS */}
            <div className="flex justify-between items-start mb-8 px-2">
              {levelOneModules.map((mod) => (
                <div key={mod.moduleId} className="flex flex-col items-center gap-3 w-1/3 group cursor-pointer">
                  <div className="relative transition-transform group-hover:scale-105">
                    <div className={`h-20 w-20 rounded-full flex items-center justify-center shadow-inner border-4 ${mod.color}`}>
                      <mod.icon className="h-8 w-8" />
                    </div>
                    {/* Decorative ring */}
                    <div className="absolute -inset-1 border-2 border-slate-100 rounded-full -z-10 group-hover:border-indigo-100 transition-colors" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 text-center leading-tight px-1 group-hover:text-indigo-600 transition-colors">
                    {mod.title.split(':')[0]} {/* Just shows "Module 1", "Module 2", etc. */}
                  </span>
                </div>
              ))}
            </div>

            {/* PRIMARY ACTION BUTTON */}
            <Link href={`/module/${levelOneModules[0].moduleId}`}>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 text-lg font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]">
                Enter the Academy
              </Button>
            </Link>
          </motion.div>

          {/* EXTRA CONTENT SECTION */}
          <div className="bg-amber-50 rounded-[32px] p-6 shadow-sm border border-amber-100/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-200 p-2 rounded-xl">
                  <Sparkles className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Articles</h3>
                  <p className="text-xs text-slate-500">Discover all about Finance</p>
                </div>
              </div>
              <span className="text-sm font-bold text-indigo-600 cursor-pointer">More</span>
            </div>

            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl font-bold text-sm text-slate-700 shadow-sm flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                The Golden Rule of Cash
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
              <div className="bg-white p-4 rounded-2xl font-bold text-sm text-slate-700 shadow-sm flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                Demystifying the KFS
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}