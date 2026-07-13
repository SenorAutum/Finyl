'use client';

import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-sm font-semibold">Money Masters Academy</span>
        </div>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/academy" className="hover:text-foreground transition-colors">Academy</Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          © 2026 Money Masters Academy
        </p>
      </div>
    </footer>
  );
}
