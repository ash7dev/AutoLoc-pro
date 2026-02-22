'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, CheckCircle, Loader2, Car, Phone, Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '../schema';
import { useRegister } from '../hooks/use-register';
import { useOAuth } from '../../login/hooks/use-oauth';
import { useRouter } from 'next/navigation';

// ─── Calcul de la force du mot de passe ───────────────────────────────────────
function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)                                  score += 25;
  if (/[a-z]/.test(password))                               score += 25;
  if (/[A-Z]/.test(password))                               score += 25;
  if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) score += 25;
  return score;
}

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  const label =
    strength <= 25 ? { text: 'Faible',    color: 'bg-red-500',    textColor: 'text-red-500'   } :
    strength <= 50 ? { text: 'Moyen',     color: 'bg-yellow-500', textColor: 'text-yellow-500'} :
    strength <= 75 ? { text: 'Bon',       color: 'bg-blue-500',   textColor: 'text-blue-500'  } :
                     { text: 'Excellent', color: 'bg-green-500',  textColor: 'text-green-600' };

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">Force du mot de passe</span>
        <span className={`text-xs font-semibold ${label.textColor}`}>{label.text}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${label.color}`}
          style={{ width: `${strength}%` }}
        />
      </div>
    </div>
  );
}

// ─── RegisterForm ──────────────────────────────────────────────────────────────
export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted]       = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const { signUp, loading, error }                        = useRegister();
  const { signInWithGoogle, loading: oauthLoading, error: oauthError } = useOAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  // Suivre la valeur du mot de passe pour l'indicateur de force
  const watchedPassword = watch('password', '');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setPasswordValue(watchedPassword ?? '');
  }, [watchedPassword]);

  const onSubmit = async (data: RegisterInput) => {
    const ok = await signUp(data);
    if (ok) {
      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  const isLoading = loading || isSubmitting || oauthLoading;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      <div className="relative z-10 flex min-h-screen">

        {/* ══════════ LEFT — hero ══════════ */}
        <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-12 xl:px-16 bg-white">
          <div className="max-w-lg" style={{ animation: 'fadeInLeft .7s cubic-bezier(.16,1,.3,1) both' }}>

            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="autoloc-hero text-2xl text-gray-900">Auto<em>Loc</em></span>
            </div>

            <h1 className="autoloc-body text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Louez ou publiez<br />
              <span className="text-gray-900">votre véhicule</span>
            </h1>

            <p className="autoloc-body text-xl text-gray-500 mb-8 leading-relaxed">
              Rejoignez la première plateforme de location de véhicules entre particuliers au Sénégal.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { label: '5 000+', sub: 'Membres actifs',  numCls: 'text-emerald-600' },
                { label: '100+',   sub: 'Véhicules dispo', numCls: 'text-sky-600'     },
                { label: '5 min',  sub: 'Pour démarrer',   numCls: 'text-amber-600'   },
              ].map(({ label, sub, numCls }) => (
                <div key={label} className="text-center">
                  <p className={`autoloc-body text-2xl font-bold ${numCls}`}>{label}</p>
                  <p className="autoloc-body text-sm text-gray-500">{sub}</p>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-8">
              {[
                { text: 'Publiez votre véhicule en 5 minutes',              cls: 'text-emerald-500' },
                { text: 'Paiements sécurisés et garantis',                  cls: 'text-sky-500'     },
                { text: 'Soyez locataire et propriétaire avec un seul compte', cls: 'text-violet-500' },
                { text: 'Support disponible 7j/7',                          cls: 'text-amber-500'   },
              ].map(({ text, cls }) => (
                <div key={text} className="flex items-center gap-3">
                  <CheckCircle className={`w-5 h-5 ${cls} flex-shrink-0`} />
                  <span className="autoloc-body text-gray-700 text-sm">{text}</span>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-3">
                  <div className="w-9 h-9 bg-emerald-500 rounded-full border-2 border-white" />
                  <div className="w-9 h-9 bg-sky-500 rounded-full border-2 border-white" />
                  <div className="w-9 h-9 bg-violet-400 rounded-full border-2 border-white" />
                </div>
                <span className="autoloc-body text-sm font-medium text-gray-900">+80 nouveaux membres ce mois</span>
              </div>
              <p className="autoloc-body text-sm text-gray-600 leading-relaxed">
                &ldquo;En 2 semaines j&apos;avais déjà mes 3 premières réservations. AutoLoc, c&apos;est simple et sécurisé.&rdquo;
              </p>
              <p className="autoloc-body text-sm font-semibold text-gray-900 mt-2">
                — Fatou Diallo, Propriétaire · Dakar
              </p>
            </div>

          </div>
        </div>

        {/* ══════════ RIGHT — form ══════════ */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-10 lg:px-10 xl:px-14 bg-white lg:border-l lg:border-gray-100">
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
                Inscription gratuite
              </p>
              <h2 className="autoloc-hero text-4xl text-gray-900">
                Créez votre compte
              </h2>
              <p className="autoloc-body text-gray-500 mt-2">
                Aucun abonnement requis
              </p>
            </div>

            {/* Erreur globale */}
            {(error || oauthError) && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="autoloc-body text-sm text-red-700">{error ?? oauthError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Prénom + Nom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="autoloc-body block text-sm font-medium text-gray-800 mb-1.5">Prénom</label>
                  <input
                    type="text"
                    {...register('prenom')}
                    placeholder="Oumar"
                    disabled={isLoading}
                    className="autoloc-body w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-300 text-sm disabled:opacity-50"
                  />
                  {errors.prenom && <p className="autoloc-body text-xs text-red-500 mt-1">{errors.prenom.message}</p>}
                </div>
                <div>
                  <label className="autoloc-body block text-sm font-medium text-gray-800 mb-1.5">Nom</label>
                  <input
                    type="text"
                    {...register('nom')}
                    placeholder="Sy"
                    disabled={isLoading}
                    className="autoloc-body w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-300 text-sm disabled:opacity-50"
                  />
                  {errors.nom && <p className="autoloc-body text-xs text-red-500 mt-1">{errors.nom.message}</p>}
                </div>
              </div>

              {/* Téléphone */}
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
                      type="tel"
                      {...register('telephone')}
                      placeholder="77 000 00 00"
                      disabled={isLoading}
                      className="autoloc-body w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-300 text-sm disabled:opacity-50"
                    />
                  </div>
                </div>
                {errors.telephone && <p className="autoloc-body text-xs text-red-500 mt-1">{errors.telephone.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="autoloc-body block text-sm font-medium text-gray-800 mb-1.5">Adresse email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-sky-400" />
                  </div>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="vous@autoloc.sn"
                    disabled={isLoading}
                    className="autoloc-body w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-300 text-sm disabled:opacity-50"
                  />
                </div>
                {errors.email && <p className="autoloc-body text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              {/* Mot de passe */}
              <div>
                <label className="autoloc-body block text-sm font-medium text-gray-800 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-violet-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="autoloc-body w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-300 text-sm disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword
                      ? <EyeOff className="h-4 w-4 text-gray-400" />
                      : <Eye className="h-4 w-4 text-gray-400" />
                    }
                  </button>
                </div>
                <PasswordStrengthBar password={passwordValue} />
                {errors.password && <p className="autoloc-body text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="autoloc-body w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-700 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wide mt-2"
              >
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Création en cours…</>
                  : <>Créer mon compte<ArrowRight className="w-4 h-4 text-emerald-400" /></>
                }
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white autoloc-body text-gray-400">Ou continuer avec</span>
              </div>
            </div>

            {/* Google uniquement */}
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={isLoading}
              className="autoloc-body w-full bg-white border border-gray-200 rounded-xl py-3 px-4 hover:bg-gray-50 hover:border-gray-300 focus:ring-2 focus:ring-gray-900 transition-all flex items-center justify-center gap-3 text-sm font-medium text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {oauthLoading
                ? <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )
              }
              Continuer avec Google
            </button>

            {/* Lien login */}
            <div className="mt-8 text-center">
              <p className="autoloc-body text-sm text-gray-500">
                Déjà un compte ?{' '}
                <a href="/login" className="font-semibold text-sky-600 hover:text-sky-700 transition-colors underline underline-offset-2 decoration-sky-300 hover:decoration-sky-500">
                  Se connecter
                </a>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
