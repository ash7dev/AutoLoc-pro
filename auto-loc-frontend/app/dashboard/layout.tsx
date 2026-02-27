import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Layout synchrone — pas d'appel réseau.
// Le middleware a déjà vérifié que nest_access existe.
// La validation réelle du token (fetchMe) est faite dans les sous-layouts
// admin/owner qui utilisent unstable_cache.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const nestToken = cookies().get('nest_access')?.value;

  if (!nestToken) {
    redirect('/login');
  }

  return <div className="min-h-screen">{children}</div>;
}
