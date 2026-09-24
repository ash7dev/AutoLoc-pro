'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { useUserStore } from '../../../core/store/useUserStore';
import { IntentEngine } from '../../../core/auth/intentEngine';
import { AuthService } from '../services/authService';
import { PhoneField } from './PhoneField';
import { OtpStep } from './OtpStep';
import { setAuthCookies, getPostAuthRedirectUrl } from '../../../core/auth/roleUtils';

interface RegisterFormProps {
  onSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[a-z]/.test(password)) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) score += 25;
  return score;
}

const PasswordStrengthBar: React.FC<{ password: string }> = ({ password }) => {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  const label =
    strength <= 25
      ? { text: 'Faible', color: '#EF4444', width: '25%' }
      : strength <= 50
      ? { text: 'Moyen', color: '#F59E0B', width: '50%' }
      : strength <= 75
      ? { text: 'Bon', color: '#0284C7', width: '75%' }
      : { text: 'Excellent', color: '#10B981', width: '100%' };

  return (
    <div className="mt-1.5 mb-2">
      <div className="flex justify-between items-center text-[10px] font-medium mb-1">
        <span className="text-slate-400">Force du mot de passe</span>
        <span style={{ color: label.color }}>{label.text}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{ width: label.width, backgroundColor: label.color }}
        />
      </div>
    </div>
  );
};

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onNavigateToLogin,
}) => {
  const router = useRouter();
  const [step, setStep] = useState<'REGISTER' | 'OTP'>('REGISTER');

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('+221770000000');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setUser } = useUserStore();

  // Pré-compilation / Prefetching optimiste des routes cibles pendant l'inscription
  React.useEffect(() => {
    router.prefetch('/admin');
    router.prefetch('/dashboard');
  }, [router]);

  // Capture et traitement automatique du retour OAuth Supabase / Google dans l'URL (#access_token=...)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    const search = window.location.search;
    let accessToken: string | null = null;

    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      accessToken = params.get('access_token');
    } else if (search && search.includes('access_token=')) {
      const params = new URLSearchParams(search);
      accessToken = params.get('access_token');
    }

    if (accessToken) {
      window.history.replaceState(null, '', window.location.pathname);
      setIsLoading(true);

      AuthService.loginWithGoogle(accessToken)
        .then((res) => {
          if (res.accessToken && typeof window !== 'undefined') {
            localStorage.setItem('autoloc_token', res.accessToken);
            setAuthCookies(res.accessToken, res.profile.role);
          }
          const userProfile = AuthService.mapProfileResponseToUserProfile(res.profile);
          setUser(userProfile);

          const pending = IntentEngine.consumePendingIntent();
          const redirectUrl = getPostAuthRedirectUrl(userProfile, pending);
          router.push(redirectUrl);
          if (onSuccess) onSuccess();
        })
        .catch((err: any) => {
          setError(err.message || 'L’inscription via Google a échoué.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [onSuccess, router, setUser]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!prenom.trim() || !nom.trim() || !telephone.trim() || !email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Vérifier la disponibilité de l'email/téléphone auprès du backend
      const availability = await AuthService.checkAvailability(email, telephone);
      if (!availability.available) {
        setError(availability.message || 'Cet email ou numéro de téléphone est déjà utilisé.');
        setIsLoading(false);
        return;
      }

      // 2. Demander le code OTP (en mode inscription)
      await AuthService.sendPhoneLoginOtp(telephone, 'auto', true);
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de compte.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await AuthService.verifyPhoneLoginOtp(telephone, code);
      if (res.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('autoloc_token', res.accessToken);
      }
      
      // Enregistrer prénom, nom et email auprès du backend
      if (prenom || nom || email) {
        try {
          await AuthService.completeProfile({ prenom, nom, email });
        } catch {
          // Ignorer si le profil est déjà complet
        }
      }

      const userProfile = AuthService.mapProfileResponseToUserProfile({
        ...res.profile,
        prenom: prenom || res.profile.prenom,
        nom: nom || res.profile.nom,
        email: email || res.profile.email,
      });

      if (res.accessToken) {
        setAuthCookies(res.accessToken, userProfile.role);
      }

      setUser(userProfile);

      // Consommer et calculer la redirection dynamique par rôle
      const pending = IntentEngine.consumePendingIntent();
      const redirectUrl = getPostAuthRedirectUrl(userProfile, pending);
      router.push(redirectUrl);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Le code de vérification est incorrect ou expiré.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setError(null);
    setIsLoading(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tcnlndjrvfddsjblamsj.supabase.co';
    const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/register` : 'https://autoloc.sn/register';
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
  };

  const clearPendingIntent = useUserStore((s) => s.clearPendingIntent);
  const closeGuestModal = useUserStore((s) => s.closeGuestModal);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clearPendingIntent();
    closeGuestModal();
    router.push('/');
  };

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col justify-center">
      {/* LAYERED GLASS ARCHITECTURE (STACK DE CARTES 3D) */}
      <div className="relative my-2">
        {/* 1. Card d'arrière-plan 3D */}
        <div className="absolute -top-2.5 -bottom-2.5 left-3 right-3 rounded-[32px] bg-emerald-500/20 border-[1.5px] border-emerald-400/35 shadow-xl pointer-events-none" />

        {/* 2. Card Principale White Floating Sheet */}
        <div className="relative bg-white rounded-[28px] p-5 sm:p-6 shadow-2xl border border-white/80">
          {step === 'REGISTER' ? (
            <>
              {/* Header Card : Logo AutoLoc & Badge KYC */}
              <div className="flex flex-col items-center text-center mb-3">
                <Link
                  href="/"
                  onClick={handleLogoClick}
                  title="Retour à l'accueil"
                  className="mb-2 relative w-36 sm:w-40 h-10 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Image
                    src="/logo.png"
                    alt="AutoLoc"
                    width={150}
                    height={45}
                    className="object-contain"
                    priority
                  />
                </Link>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-[9px] sm:text-[10px] font-medium tracking-wider uppercase mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                  <span>INSCRIPTION GRATUITE EN 1 MIN</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-normal text-[#041912] font-fraunces tracking-tight">
                  Créer un <span className="italic text-emerald-700">compte.</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Rejoignez la plateforme leader de location au Sénégal
                </p>
              </div>

              {/* Bannière Erreur */}
              {error && (
                <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-3 mb-3 text-xs text-red-600 font-medium">
                  <span>{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-700 text-base font-bold ml-2"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Formulaire Grid */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {/* Ligne Prénom / Nom 2 Colonnes */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Prénom
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={prenom}
                        onChange={(e) => {
                          setError(null);
                          setPrenom(e.target.value);
                        }}
                        placeholder="Oumar"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => {
                        setError(null);
                        setNom(e.target.value);
                      }}
                      placeholder="Sy"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                      required
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Numéro de téléphone
                  </label>
                  <PhoneField
                    value={telephone}
                    onChange={(val) => {
                      setError(null);
                      setTelephone(val);
                    }}
                  />
                </div>

                {/* Adresse Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Adresse email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        if (error) setError(null);
                        setEmail(e.target.value);
                      }}
                      placeholder="vous@autoloc.sn"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                      required
                    />
                  </div>
                </div>

                {/* Mot de Passe */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        if (error) setError(null);
                        setPassword(e.target.value);
                      }}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthBar password={password} />
                </div>

                {/* Bouton de Soumission */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[50px] rounded-full bg-[#041912] hover:bg-[#06291e] border border-[#041912]/90 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#041912]/25 transition-all active:scale-[0.99] disabled:opacity-60 mt-1"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Créer mon compte</span>
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center ml-1">
                        <ArrowRight className="w-3.5 h-3.5 text-[#4ADE80]" />
                      </div>
                    </>
                  )}
                </button>
              </form>

              {/* Divider Glass */}
              <div className="flex items-center my-3 gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                  OU CONTINUER AVEC
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Google Auth */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full h-11 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.99] disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>S'inscrire avec Google</span>
              </button>
            </>
          ) : (
            <OtpStep
              telephone={telephone}
              onVerify={handleVerifyOtp}
              onResend={(channel) => {
                AuthService.sendPhoneLoginOtp(telephone, channel);
              }}
              onBack={() => setStep('REGISTER')}
              isLoading={isLoading}
              error={error}
              slots={6}
            />
          )}
        </div>
      </div>

      {/* Connection Link Footer Capsule */}
      <div className="mt-3 py-3 px-5 rounded-full bg-white/10 border border-white/18 backdrop-blur-md text-center">
        <p className="text-xs text-white/80">
          Vous avez déjà un compte ?{' '}
          {onNavigateToLogin ? (
            <button
              onClick={onNavigateToLogin}
              className="font-normal text-[#4ADE80] italic underline hover:text-emerald-300 ml-1"
            >
              Se connecter
            </button>
          ) : (
            <Link
              href="/login"
              className="font-normal text-[#4ADE80] italic underline hover:text-emerald-300 ml-1"
            >
              Se connecter
            </Link>
          )}
        </p>
      </div>
    </div>
  );
};
