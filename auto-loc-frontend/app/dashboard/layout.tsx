import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { fetchMe } from '../../lib/nestjs/auth';
import { createSupabaseServerClient } from '../../lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  // Priorité 1 : JWT NestJS (cookie httpOnly — DB comme source de vérité).
  // Priorité 2 : token Supabase (fallback — guard hybride l'accepte aussi).
  const nestToken = cookies().get('nest_access')?.value ?? null;

  let token: string | null = nestToken;
  if (!token) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
  }

  if (!token) {
    redirect('/login');
  }

  const profile = await fetchMe(token);

  // LOCATAIRE n'a pas de dashboard — il utilise le marketplace directement.
  if (profile.role === 'LOCATAIRE') {
    redirect('/');
  }

  // ADMIN et PROPRIETAIRE passent.
  // Le hub /dashboard/page.tsx et /dashboard/admin/layout.tsx
  // gèrent les redirections fines par rôle.
  return <div className="min-h-screen">{children}</div>;
}
