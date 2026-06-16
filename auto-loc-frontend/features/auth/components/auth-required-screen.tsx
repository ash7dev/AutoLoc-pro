import React from 'react';
import Link from 'next/link';
import { LogIn, UserCircle2, type LucideIcon } from 'lucide-react';

interface AuthRequiredScreenProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  /** Page d'origine, utilisée pour revenir ici juste après connexion/inscription. */
  redirectTo: string;
}

/**
 * Écran "connexion requise" affiché in-page (pas de redirection brutale) — pensé pour
 * mobile, où être renvoyé sans prévenir vers /login après un tap sur la bottom nav
 * casse le sentiment d'être "dans l'app".
 */
export function AuthRequiredScreen({
  icon: Icon = UserCircle2,
  title,
  description,
  redirectTo,
}: AuthRequiredScreenProps): React.ReactElement {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5">
        <Icon className="h-7 w-7 text-emerald-600" strokeWidth={1.75} />
      </div>

      <h1 className="text-[19px] font-black tracking-tight text-slate-900 max-w-xs">{title}</h1>
      <p className="mt-2 text-[13px] text-slate-400 leading-relaxed max-w-xs">{description}</p>

      <Link
        href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
        className="mt-7 inline-flex items-center gap-2 bg-slate-950 text-emerald-400 text-[14px] font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all"
      >
        <LogIn className="h-4 w-4" strokeWidth={2.5} />
        Se connecter
      </Link>

      <p className="mt-4 text-[12.5px] text-slate-400">
        Pas encore de compte ?{' '}
        <Link
          href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-bold text-emerald-600 underline decoration-dotted"
        >
          Créer un compte
        </Link>
      </p>
    </main>
  );
}
