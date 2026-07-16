import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-lg mt-auto">
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Brand Section */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">Finyly</span>
          </div>

          {/* Copyright & Links */}
          <div className="text-sm text-muted-foreground flex flex-col md:flex-row items-center gap-4">
            <p>&copy; {new Date().getFullYear()} Finyly. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
}