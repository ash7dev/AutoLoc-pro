'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

// Pages qui gèrent leur propre layout full-screen
const FULLSCREEN_ROUTES = ['/login', '/register'];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();

  if (FULLSCREEN_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
