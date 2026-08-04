'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

// Import the interactive cards component
import MicroLearningCards from '@/components/micro-learning-cards';

export default function ModuleDetailClient() {
  const router = useRouter();
  const params = useParams();
  
  // This automatically grabs the ID from the URL (e.g., 'mod_1', 'mod_2')
  const moduleId = params?.moduleId as string;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-8 flex flex-col justify-center">
        {/* Navigation back to the academy */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm text-slate-500 mb-8 hover:text-slate-800 self-start transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Academy
        </button>

        {/* Render the dynamic learning cards using the URL parameter */}
        <MicroLearningCards moduleId={moduleId} />
      </main>

      <Footer />
    </div>
  );
}