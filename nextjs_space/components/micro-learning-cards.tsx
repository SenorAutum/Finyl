'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { finylCurriculum } from '@/lib/curriculumData';

// Import Firebase tools
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function MicroLearningCards({ moduleId = "mod_1" }: { moduleId?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // New state variables for database operations
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Listen for the currently logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Find the requested module
  const activeModule = finylCurriculum.find(m => m.moduleId === moduleId);
  
  if (!activeModule) return <div>Module not found.</div>;

  const lessons = activeModule.lessons;
  const progress = ((currentIndex) / lessons.length) * 100;

  // Updated function to handle progress and database saving
  const handleNext = async () => {
    if (currentIndex < lessons.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      
      // If a user is logged in, securely save their progress to Firestore
      if (user) {
        setIsSaving(true);
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            totalCompleted: increment(1), // Add 1 to their completed lessons
            points: increment(10)         // Award 10 points
          });
        } catch (error) {
          console.error("Failed to save progress to database:", error);
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Animation variants for Framer Motion
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  if (isCompleted) {
    return (
      <div className="w-full max-w-md mx-auto bg-emerald-50 rounded-2xl p-8 border border-emerald-100 text-center shadow-sm relative overflow-hidden">
        {/* Show a subtle loading spinner while writing to the database */}
        {isSaving && (
          <div className="absolute top-4 right-4 text-emerald-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        </div>
        <h3 className="font-display text-2xl font-bold text-emerald-900 mb-2">Module Completed!</h3>
        <p className="text-emerald-700 text-sm mb-6">
          You've unlocked a milestone and earned 10 points. Understanding your financial rights strengthens your business.
        </p>
        <Button onClick={() => { setIsCompleted(false); setCurrentIndex(0); }} className="w-full bg-emerald-600 hover:bg-emerald-700">
          Review Lesson
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Module Title & Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-5 w-5 text-teal-600" />
          <h2 className="font-semibold text-sm text-slate-600">{activeModule.title}</h2>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right mt-1 text-xs text-slate-400 font-medium">
          Card {currentIndex + 1} of {lessons.length}
        </div>
      </div>

      {/* Swipeable Card Area */}
      <div className="relative h-[300px] w-full overflow-hidden rounded-2xl bg-white shadow-md border border-slate-100">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 p-8 flex flex-col justify-center"
          >
            <h3 className="font-display text-xl font-bold text-slate-800 mb-4 leading-tight">
              {lessons[currentIndex].title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {lessons[currentIndex].content} 
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6 gap-4">
        <Button 
          variant="outline" 
          onClick={handlePrev} 
          disabled={currentIndex === 0 || isSaving}
          className="w-12 h-12 rounded-full p-0 flex-shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Button 
          onClick={handleNext} 
          disabled={isSaving}
          className="w-full h-12 rounded-full text-base font-medium shadow-md bg-teal-600 hover:bg-teal-700 text-white"
        >
          {currentIndex === lessons.length - 1 ? 'Finish Module' : 'Next Card'}
        </Button>
      </div>
    </div>
  );
}