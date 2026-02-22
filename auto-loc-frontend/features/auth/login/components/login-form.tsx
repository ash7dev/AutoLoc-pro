'use client';

import { useState, useEffect, useTransition } from 'react';
import { Eye, EyeOff, Loader2, Mail, Lock, Phone, ArrowRight, Shield, Car, Clock, Star, Users } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthFlow } from '../../hooks/use-auth-flow';
import { useLogin } from '../hooks/use-login';
import { useLoginOtp } from '../hooks/use-login-otp';
import { useOAuth } from '../hooks/use-oauth';

export default function LoginAutoLoc() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [phone, setPhone]               = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activeTab, setActiveTab]       = useState('phone');
  const [isMounted, setIsMounted]       = useState(false);
  const [isPending, startTransition]    = useTransition();
  const [error, setError]               = useState<{ erreur: string; details?: string } | null>(null);

  const router       = useRouter();
  const searchParams = useSearchParams();

  const { redirectAfterAuth }                       = useAuthFlow();
  const { signIn, loading: emailLoading, error: emailError }   = useLogin();
  const { sendCode, loading: phoneLoading, error: phoneError } = useLoginOtp();
  const { signInWithGoogle, loading: oauthLoading, error: oauthError } = useOAuth();

  const isLoading = emailLoading || phoneLoading || oauthLoading;

  useEffect(() => { setIsMounted(true); }, []);

  // Après retour OAuth Google (?from=oauth), déclenche la redirection automatique.
  useEffect(() => {
    if (searchParams.get('from') === 'oauth') {
      setIsRedirecting(true);
      startTransition(() => redirectAfterAuth());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mappe les erreurs des hooks vers l'état d'erreur du composant.
  useEffect(() => {
    if (emailError) setError({ erreur: 'Erreur de connexion', details: emailError });
  }, [emailError]);

  useEffect(() => {
    if (phoneError) setError({ erreur: "Erreur d'envoi SMS", details: phoneError });
  }, [phoneError]);

  useEffect(() => {
    if (oauthError) setError({ erreur: 'Connexion Google échouée', details: oauthError });
  }, [oauthError]);

  /* ── EMAIL ─────────────────────────────────────────── */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const ok = await signIn({ email, password });
    if (ok) {
      setIsRedirecting(true);
      startTransition(() => redirectAfterAuth());
    }
  };

  /* ── TÉLÉPHONE OTP ──────────────────────────────────── */
  const handlePhoneLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formattedPhone = `+221${phone.replace(/\s/g, '')}`;
    const ok = await sendCode(formattedPhone);
    if (ok) {
      setIsRedirecting(true);
      router.push(`/verify?phone=${encodeURIComponent(formattedPhone)}&type=phone`);
    }
  };

  /* ── GOOGLE OAUTH ───────────────────────────────────── */
  const handleGoogle = async () => {
    setError(null);
    await signInWithGoogle();
    // Supabase redirige vers Google — le browser quitte la page ici.
    // Si erreur, oauthError est mis à jour et le useEffect l'affiche.
  };

  /* ── RENDER ─────────────────────────────────────────── */
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Écran de loading pendant la redirection OAuth
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
          <p className="text-gray-600 text-sm">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      <div className="relative z-10 flex min-h-screen">

        {/* ══════════════ LEFT — hero ══════════════ */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 xl:px-16 bg-white">
          <div className="max-w-lg" style={{ animation: 'fadeInLeft .7s cubic-bezier(.16,1,.3,1) both' }}>

            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="autoloc-hero text-2xl text-gray-900">
                Auto<em>Loc</em>
              </span>
            </div>

            <h1 className="autoloc-body text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Gérez votre{' '}
              <span className="text-gray-900">flotte</span>{' '}
              <span className="text-gray-900">auto</span>{' '}
              en ligne
            </h1>

            <p className="autoloc-body text-xl text-gray-500 mb-8 leading-relaxed">
              Rejoignez plus de 5 000 professionnels qui font confiance à AutoLoc pour louer et gérer leurs véhicules.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {[
                { icon: Shield, title: 'Sécurisé',   sub: 'Paiements protégés',     iconCls: 'text-sky-500',     bgCls: 'bg-sky-50'      },
                { icon: Clock,  title: 'Rapide',      sub: 'Mise en ligne en 5 min', iconCls: 'text-emerald-500', bgCls: 'bg-emerald-50'  },
                { icon: Users,  title: 'Communauté',  sub: '5k+ professionnels',     iconCls: 'text-violet-500',  bgCls: 'bg-violet-50'   },
                { icon: Star,   title: 'Excellence',  sub: '4.8/5 étoiles',          iconCls: 'text-amber-500',   bgCls: 'bg-amber-50'    },
              ].map(({ icon: Icon, title, sub, iconCls, bgCls }) => (
                <div key={title} className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${bgCls} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${iconCls}`} />
                  </div>
                  <div>
                    <div className="autoloc-body font-semibold text-gray-900">{title}</div>
                    <div className="autoloc-body text-sm text-gray-500">{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full border-2 border-white" />
                  <div className="w-10 h-10 bg-sky-500 rounded-full border-2 border-white" />
                  <div className="w-10 h-10 bg-violet-400 rounded-full border-2 border-white" />
                </div>
                <div className="autoloc-body text-sm font-medium text-gray-900">
                  +30 nouveaux pros ce mois
                </div>
              </div>
              <p className="autoloc-body text-sm text-gray-600 leading-relaxed">
                &ldquo;Grâce à AutoLoc, j&apos;ai pu doubler mes réservations en 4 mois.&rdquo;
              </p>
              <p className="autoloc-body text-sm font-semibold text-gray-900 mt-2">
                — Oumar Sy, Gérant · AutoLoc Dakar
              </p>
            </div>

          </div>
        </div>

        {/* ══════════════ RIGHT — form ══════════════ */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 xl:px-12 bg-white lg:border-l lg:border-gray-100">
          <div className="w-full max-w-md mx-auto">

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="autoloc-hero text-2xl text-gray-900">Auto<em>Loc</em></span>
            </div>

            {/* Header */}
            <div className="text-center mb-8" style={{ animation: 'fadeInUp .5s cubic-bezier(.16,1,.3,1) both' }}>
              <p className="autoloc-body text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                Connexion
              </p>
              <h2 className="autoloc-hero text-4xl text-gray-900">
                Bon retour !
              </h2>
              <p className="autoloc-body text-gray-500 mt-2">
                Connectez-vous à votre espace
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl" style={{ animation: 'fadeInUp .3s ease both' }}>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="autoloc-body text-sm font-semibold text-red-800">{error.erreur}</p>
                    {error.details && <p className="autoloc-body text-sm text-red-600 mt-0.5">{error.details}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none"
                  >×</button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              {[
                { id: 'phone', label: 'Téléphone', icon: Phone, activeIconCls: 'text-emerald-500' },
                { id: 'email', label: 'Email',     icon: Mail,  activeIconCls: 'text-sky-500'     },
              ].map(({ id, label, icon: Icon, activeIconCls }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setActiveTab(id); setError(null); }}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 autoloc-body ${
                    activeTab === id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === id ? activeIconCls : 'text-gray-400'}`} />{label}
                </button>
              ))}
            </div>

            {/* ── PHONE FORM ── */}
            {activeTab === 'phone' && (
              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <div>
                  <label className="autoloc-body block text-sm font-medium text-gray-800 mb-1.5">Numéro de téléphone</label>
                  <div className="flex gap-2">
                    <div className="autoloc-body flex items-center gap-2 px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm whitespace-nowrap select-none">
                      🇸🇳 +221
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-emerald-400" />
                      </div>
                      <input
                        type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        className="autoloc-body w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-300 text-sm"
                        placeholder="77 000 00 00" required disabled={isLoading || isRedirecting}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit" disabled={isLoading || isRedirecting || isPending}
                  className="autoloc-body w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-700 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wide"
                >
                  {(isLoading || isRedirecting)
                    ? <><Loader2 className="w-4 h-4 animate-spin" />{isRedirecting ? 'Redirection...' : 'Envoi en cours…'}</>
                    : <>Recevoir le code SMS<ArrowRight className="w-4 h-4 text-emerald-400" /></>
                  }
                </button>
              </form>
            )}

            {/* ── EMAIL FORM ── */}
            {activeTab === 'email' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="autoloc-body block text-sm font-medium text-gray-800 mb-1.5">Adresse email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-sky-400" />
                    </div>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="autoloc-body w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-300 text-sm"
                      placeholder="vous@autoloc.sn" required disabled={isLoading || isRedirecting}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="autoloc-body block text-sm font-medium text-gray-800">Mot de passe</label>
                    <a href="/forgot-password" className="autoloc-body text-sm text-sky-500 hover:text-sky-600 transition-colors">
                      Oublié ?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-violet-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      className="autoloc-body w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-300 text-sm"
                      placeholder="••••••••" required disabled={isLoading || isRedirecting}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center" disabled={isLoading || isRedirecting}>
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit" disabled={isLoading || isRedirecting || isPending}
                  className="autoloc-body w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-700 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wide"
                >
                  {(isLoading || isRedirecting)
                    ? <><Loader2 className="w-4 h-4 animate-spin" />{isRedirecting ? 'Redirection...' : 'Connexion…'}</>
                    : <>Se connecter<ArrowRight className="w-4 h-4 text-sky-400" /></>
                  }
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white autoloc-body text-gray-400">Ou continuer avec</span>
              </div>
            </div>

            {/* Google */}
            <div className="mt-5">
              <button
                type="button"
                onClick={handleGoogle}
                disabled={isLoading || isRedirecting}
                className="autoloc-body w-full bg-white border border-gray-200 rounded-xl py-3 px-4 hover:bg-gray-50 hover:border-gray-300 focus:ring-2 focus:ring-gray-900 transition-all duration-200 flex items-center justify-center gap-3 text-sm font-medium text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isLoading || isRedirecting) ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {(isLoading || isRedirecting) ? 'Redirection...' : 'Continuer avec Google'}
              </button>
            </div>

            {/* Sign up */}
            <div className="mt-8 text-center">
              <p className="autoloc-body text-sm text-gray-500">
                Pas encore de compte ?{' '}
                <a href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors underline underline-offset-2 decoration-emerald-300 hover:decoration-emerald-500">
                  Créer un compte
                </a>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
