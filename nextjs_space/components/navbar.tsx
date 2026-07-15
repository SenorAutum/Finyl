'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { GraduationCap, LayoutDashboard, BookOpen, Shield, LogOut, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import Firebase tools
import { auth, db } from '@/lib/firebase'; // 🚨 Make sure db is exported from your firebase config
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // New state to track actual database role
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // 1. User is logged in, let's fetch their profile from Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          // 2. Check if the document exists AND if the role is admin
          if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      setMobileOpen(false);
      setIsAdmin(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Finyl</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {!loading && (
            user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Button>
                </Link>
                <Link href="/academy">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <BookOpen className="h-4 w-4" /> Academy
                  </Button>
                </Link>
                
                {/* 🚨 This now only renders if Firestore says they are an admin! */}
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                      <Shield className="h-4 w-4" /> Admin
                    </Button>
                  </Link>
                )}
                
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" /> Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="gap-2 ml-2" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="gap-2">Get Started</Button>
                </Link>
              </>
            )
          )}
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && !loading && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-2 pt-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Button>
                </Link>
                <Link href="/academy" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <BookOpen className="h-4 w-4" /> Academy
                  </Button>
                </Link>
                
                {/* Mobile Admin Link */}
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-amber-600">
                      <Shield className="h-4 w-4" /> Admin
                    </Button>
                  </Link>
                )}
                
                <Link href="/profile" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <User className="h-4 w-4" /> Profile
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full">Sign In</Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}