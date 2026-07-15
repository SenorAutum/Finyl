"use client";

import React, { useState } from 'react';
// 🚨 IMPORT db FROM FIREBASE
import { auth, db } from '@/lib/firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
// 🚨 IMPORT FIRESTORE TOOLS
import { doc, setDoc } from 'firebase/firestore'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Creates the user credentials in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. 🚨 NEW: Create the user's database record in Firestore automatically!
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'user', // Everyone defaults to a standard user
        createdAt: new Date().toISOString()
      });

      // 3. Once successful, navigate to the dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create an account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight">Create an Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">Start your journey with Finyl today</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border p-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-black"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border p-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-black"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
        
        <div className="text-center text-sm mt-4">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}