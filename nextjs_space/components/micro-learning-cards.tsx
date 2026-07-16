'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { finylCurriculum } from '@/lib/curriculumData';

// Accept a moduleId as a prop to render a specific module
export default function MicroLearningCards({ moduleId = "mod_1" }: { moduleId?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Find the requested module
  const activeModule = finylCurriculum.find(m => m.moduleId === moduleId);
  
  if (!activeModule) return <div>Module not found.</div>;

  const lessons = activeModule.lessons;
  const progress = ((currentIndex) / lessons.length) * 100;

  const handleNext = () => {
    if (currentIndex < lessons.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      // Here you could trigger a database write to save user progress!
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
      <div className="w-full max-w-md mx-auto bg-emerald-50 rounded-2xl p-8 border border-emerald-100 text-center shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        </div>
        <h3 className="font-display text-2xl font-bold text-emerald-900 mb-2">Module Completed!</h3>
        <p className="text-emerald-700 text-sm mb-6">
          You've unlocked a milestone. Understanding your financial rights strengthens your business.
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
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-sm text-slate-600">{activeModule.title}</h2>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right mt-1 text-xs text-slate-400 font-medium">
          Card {currentIndex + 1} of {lessons.length}
        </div>
      </div>

      {/* Swipeable Card Area */}
      <div className="relative h-[300px] w-full overflow-hidden rounded-2xl bg-white shadow-lg border border-slate-100">
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
              {lessons[currentIndex].content.replace('[cite: 1]', '')} 
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6 gap-4">
        <Button 
          variant="outline" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full p-0 flex-shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Button 
          onClick={handleNext} 
          className="w-full h-12 rounded-full text-base font-medium shadow-md shadow-primary/20"
        >
          {currentIndex === lessons.length - 1 ? 'Finish Module' : 'Next Card'}
        </Button>
      </div>
    </div>
  );
}