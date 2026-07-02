'use client';

import React from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // NextAuth SessionProvider has been removed.
  // Firebase auth state is now handled directly inside our client components!
  return <>{children}</>;
}