'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle, XCircle,
  Lightbulb, ChevronRight, Award, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { toast } from 'sonner';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

type LessonStep = 'hook' | 'content' | 'quiz' | 'complete';

export default function LessonClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const params = useParams();
  const lessonId = params?.lessonId as string;

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<LessonStep>('hook');

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && lessonId) {
      fetch(`/api/lessons/${lessonId}`)
        .then(async (r) => {
          if (!r.ok) throw new Error('Failed');
          return r.json();
        })
        .then((d) => {
          setLesson(d);
          try {
            const q = JSON.parse(d?.quizData ?? '[]');
            setQuestions(q ?? []);
          } catch { setQuestions([]); }
          // If already completed, show content step
          if (d?.progress?.completed) setStep('content');
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, lessonId]);

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === questions?.[currentQ]?.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ < (questions?.length ?? 0) - 1) {
      setCurrentQ((c) => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
      completeLesson();
    }
  };

  const completeLesson = async () => {
    try {
      await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizScore: score + (selectedAnswer === questions?.[currentQ]?.correctIndex ? 1 : 0),
          quizTotal: questions?.length ?? 0,
        }),
      });
      setStep('complete');
      toast.success('Lesson completed!');
    } catch {
      toast.error('Failed to save progress');
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
    setStep('quiz');
  };

  // Find next/prev lesson
  const siblings = lesson?.siblings ?? [];
  const currentIdx = siblings.findIndex((s: any) => s?.id === lessonId);
  const prevLesson = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextLesson = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  if (status === 'loading' || status === 'unauthenticated' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-[1200px] px-4 py-12 text-center">
          <p className="text-muted-foreground">Lesson not found or access denied</p>
          <Link href="/academy"><Button className="mt-4">Back to Academy</Button></Link>
        </div>
      </div>
    );
  }

  const trackColor = lesson?.module?.track?.color ?? '#10B981';
  const stepProgress = step === 'hook' ? 25 : step === 'content' ? 50 : step === 'quiz' ? 75 : 100;

  // Parse markdown-like content to HTML
  const renderContent = (text: string) => {
    const lines = (text ?? '').split('\n');
    return lines.map((line: string, i: number) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-3">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
      if (line.startsWith('- ')) return <li key={i} className="ml-6 list-disc text-muted-foreground">{renderInline(line.slice(2))}</li>;
      if (line.startsWith('| ')) return null; // skip table rows for simplicity
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="mb-2 leading-relaxed text-muted-foreground">{renderInline(line)}</p>;
    });
  };

  const renderInline = (text: string) => {
    // Bold **text**
    const parts = (text ?? '').split(/\*\*(.*?)\*\*/);
    return parts.map((part: string, i: number) => 
      i % 2 === 1 ? <strong key={i} className="text-foreground font-semibold">{part}</strong> : part
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Breadcrumb */}
        <Link
          href={`/module/${lesson?.module?.id ?? ''}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {lesson?.module?.title ?? 'Module'}
        </Link>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Lesson Progress</span>
            <span>{stepProgress}%</span>
          </div>
          <Progress value={stepProgress} className="h-2" />
          <div className="flex justify-between mt-2">
            {['Hook', 'Content', 'Quiz', 'Complete'].map((label, i) => (
              <span key={label} className={`text-xs font-medium ${
                i <= ['hook', 'content', 'quiz', 'complete'].indexOf(step)
                  ? 'text-primary' : 'text-muted-foreground'
              }`}>{label}</span>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* HOOK step */}
          {step === 'hook' && (
            <motion.div
              key="hook"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-xl bg-card p-8" style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${trackColor}15` }}>
                  <Lightbulb className="h-6 w-6" style={{ color: trackColor }} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Did You Know?</p>
                  <h1 className="font-display text-2xl font-bold tracking-tight">{lesson?.title ?? 'Lesson'}</h1>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-6 mb-6">
                <p className="text-lg leading-relaxed italic text-foreground">{lesson?.hook ?? ''}</p>
              </div>
              <Button onClick={() => setStep('content')} className="gap-2" size="lg">
                Let&apos;s Learn <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* CONTENT step */}
          {step === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-xl bg-card p-8" style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              <h1 className="font-display text-2xl font-bold tracking-tight mb-6">{lesson?.title ?? 'Lesson'}</h1>
              <div className="prose max-w-none">
                {renderContent(lesson?.content ?? '')}
              </div>

              {lesson?.videoUrl && (
                <div className="mt-6 aspect-video rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src={lesson.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title="Lesson video"
                  />
                </div>
              )}

              <div className="mt-8 flex gap-3">
                <Button variant="outline" onClick={() => setStep('hook')} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Review Hook
                </Button>
                {(questions?.length ?? 0) > 0 ? (
                  <Button onClick={() => setStep('quiz')} className="gap-2">
                    Take Quiz <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={() => completeLesson()} className="gap-2">
                    Complete Lesson <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* QUIZ step */}
          {step === 'quiz' && !quizComplete && (questions?.length ?? 0) > 0 && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-xl bg-card p-8" style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">Knowledge Check</h2>
                <span className="text-sm font-mono text-muted-foreground">
                  {currentQ + 1} / {questions?.length ?? 0}
                </span>
              </div>

              <Progress value={((currentQ + 1) / (questions?.length ?? 1)) * 100} className="h-2 mb-6" />

              <p className="text-lg font-medium mb-6">{questions?.[currentQ]?.question ?? ''}</p>

              <div className="space-y-3">
                {(questions?.[currentQ]?.options ?? []).map((opt: string, idx: number) => {
                  const isCorrect = idx === questions?.[currentQ]?.correctIndex;
                  const isSelected = idx === selectedAnswer;
                  let bgClass = 'bg-muted hover:bg-accent';
                  if (showResult && isCorrect) bgClass = 'bg-primary/10 ring-2 ring-primary';
                  else if (showResult && isSelected && !isCorrect) bgClass = 'bg-destructive/10 ring-2 ring-destructive';
                  else if (isSelected) bgClass = 'bg-accent';

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={showResult}
                      className={`w-full text-left rounded-lg p-4 transition-all ${bgClass} ${showResult ? '' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-sm font-bold flex-shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm font-medium">{opt}</span>
                        {showResult && isCorrect && <CheckCircle className="h-5 w-5 text-primary ml-auto flex-shrink-0" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-destructive ml-auto flex-shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className={`rounded-lg p-4 mb-4 ${
                    selectedAnswer === questions?.[currentQ]?.correctIndex
                      ? 'bg-primary/10 text-primary'
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    <p className="font-medium">
                      {selectedAnswer === questions?.[currentQ]?.correctIndex
                        ? '✅ Correct! Great job!'
                        : `❌ Incorrect. The correct answer is ${questions?.[currentQ]?.options?.[questions?.[currentQ]?.correctIndex ?? 0] ?? ''}`}
                    </p>
                  </div>
                  <Button onClick={nextQuestion} className="gap-2">
                    {currentQ < (questions?.length ?? 0) - 1 ? 'Next Question' : 'See Results'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* COMPLETE step */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl bg-card p-8 text-center" style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold">Lesson Complete! 🎉</h2>
              <p className="mt-2 text-muted-foreground">{lesson?.title ?? 'Lesson'}</p>

              {(questions?.length ?? 0) > 0 && (
                <div className="mt-4 rounded-lg bg-muted p-4 inline-block">
                  <p className="font-display text-3xl font-bold text-primary">
                    {score + (selectedAnswer === questions?.[currentQ]?.correctIndex ? 1 : 0)}/{questions?.length ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Quiz Score</p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={resetQuiz} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Retake Quiz
                </Button>
                {nextLesson && (
                  <Link href={`/lesson/${nextLesson?.id ?? ''}`}>
                    <Button className="gap-2">
                      Next Lesson <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link href={`/module/${lesson?.module?.id ?? ''}`}>
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" /> Back to Module
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step !== 'complete' && (
          <div className="mt-6 flex justify-between">
            {prevLesson ? (
              <Link href={`/lesson/${prevLesson?.id ?? ''}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> {prevLesson?.title ?? 'Previous'}
                </Button>
              </Link>
            ) : <div />}
            {nextLesson && step === 'content' && (
              <Link href={`/lesson/${nextLesson?.id ?? ''}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  {nextLesson?.title ?? 'Next'} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
