'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
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

interface LoginFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  onNavigateToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onNavigateToRegister,
}) => {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [telephone, setTelephone] = useState('+221770000000');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Étape OTP pour téléphone
  const [step, setStep] = useState<'INPUT' | 'OTP'>('INPUT');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { setUser, clearPendingIntent, closeGuestModal } = useUserStore();

  // Pré-compilation / Prefetching optimiste des routes cibles pendant que l'utilisateur remplit le formulaire
  React.useEffect(() => {
    router.prefetch('/admin');
    router.prefetch('/dashboard');
  }, [router]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!telephone || telephone.length < 8) {
      setError('Veuillez saisir un numéro de téléphone valide.');
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.sendPhoneLoginOtp(telephone, 'auto');
      setStep('OTP');
      setSuccessMsg(`Un code de confirmation à 6 chiffres a été envoyé au ${telephone}.`);
    } catch (err: any) {
      setError(err.message || 'Impossible d’envoyer le code OTP.');
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
      const userProfile = AuthService.mapProfileResponseToUserProfile(res.profile);

      if (res.accessToken) {
        setAuthCookies(res.accessToken, userProfile.role);
      }

      setUser(userProfile);
      closeGuestModal();

      // Consommer l'intention et calculer l'URL de redirection basée sur le rôle
      const pending = IntentEngine.consumePendingIntent();
      const redirectUrl = getPostAuthRedirectUrl(userProfile, pending);
      router.push(redirectUrl);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Le code d’accès est incorrect ou expiré.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthService.loginWithEmail(email.trim(), password);
      if (res.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('autoloc_token', res.accessToken);
      }
      const userProfile = AuthService.mapProfileResponseToUserProfile(res.profile);

      if (res.accessToken) {
        setAuthCookies(res.accessToken, userProfile.role);
      }

      setUser(userProfile);
      closeGuestModal();

      const pending = IntentEngine.consumePendingIntent();
      const redirectUrl = getPostAuthRedirectUrl(userProfile, pending);
      router.push(redirectUrl);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion. Vérifiez vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const googleToken = (typeof window !== 'undefined' && (window as any)?.googleAuthToken) || null;
      if (!googleToken) {
        throw new Error(
          'La connexion Google OAuth requiert un ID Client Google configuré. Veuillez utiliser la connexion par SMS / WhatsApp ou par Email pour vous connecter au serveur.'
        );
      }
      const res = await AuthService.loginWithGoogle(googleToken);
      if (res.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('autoloc_token', res.accessToken);
      }
      const userProfile = AuthService.mapProfileResponseToUserProfile(res.profile);

      if (res.accessToken) {
        setAuthCookies(res.accessToken, userProfile.role);
      }

      setUser(userProfile);
      closeGuestModal();

      const pending = IntentEngine.consumePendingIntent();
      const redirectUrl = getPostAuthRedirectUrl(userProfile, pending);
      router.push(redirectUrl);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'La connexion Google a échoué.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clearPendingIntent();
    closeGuestModal();
    router.push('/');
  };

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col justify-center">
      {/* LAYERED GLASS ARCHITECTURE (STACK DE CARTES 3D MOBILE) */}
      <div className="relative my-2">
        {/* 1. Card d'arrière-plan 3D */}
        <div className="absolute -top-2.5 -bottom-2.5 left-3 right-3 rounded-[32px] bg-emerald-500/20 border-[1.5px] border-emerald-400/35 shadow-xl pointer-events-none" />

        {/* 2. Card Principale White Floating Glass Sheet */}
        <div className="relative bg-white rounded-[28px] p-5 sm:p-6 shadow-2xl border border-white/80">
          {/* Header Card */}
          <div className="flex flex-col items-center text-center mb-3">
            <div className="relative mb-2.5 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#041912] border-2 border-emerald-400/40 flex items-center justify-center shadow-xl shadow-[#041912]/35 transition-transform duration-300 group-hover:scale-105">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 stroke-[2.2]" />
                </div>
              </div>
            </div>

            <Link
              href="/"
              onClick={handleLogoClick}
              title="Retour à l'accueil"
              className="mb-1.5 relative w-36 sm:w-40 h-10 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
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
              <span>ESPACE CLIENT SÉCURISÉ</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-fraunces font-normal text-[#041912] tracking-tight" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
              Bon <span className="italic text-emerald-700">retour.</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-body">
              Accédez à vos réservations et votre garage mobile
            </p>

          </div>

          {/* Bannière Erreur */}
          {error && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-3 mb-3.5 text-xs text-red-600 font-medium">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 text-base font-bold ml-2"
              >
                ×
              </button>
            </div>
          )}

          {/* Bannière Succès */}
          {successMsg && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3.5 text-xs text-emerald-700 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button
                onClick={() => setSuccessMsg(null)}
                className="text-emerald-600 hover:text-emerald-800 text-base font-bold ml-2"
              >
                ×
              </button>
            </div>
          )}

          {/* Switcher Méthode de Connexion */}
          <div className="flex bg-[#F3F4F6] p-1 rounded-full mb-4">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMsg(null);
                setAuthMethod('PHONE');
                setStep('INPUT');
              }}
              className={`flex-1 py-2 rounded-full text-xs font-medium transition-all ${
                authMethod === 'PHONE'
                  ? 'bg-[#041912] text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              SMS / WhatsApp
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMsg(null);
                setAuthMethod('EMAIL');
                setStep('INPUT');
              }}
              className={`flex-1 py-2 rounded-full text-xs font-medium transition-all ${
                authMethod === 'EMAIL'
                  ? 'bg-[#041912] text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Email &amp; Pass
            </button>
          </div>

          {/* Formulaire Dynamique */}
          {authMethod === 'PHONE' ? (
            step === 'INPUT' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[48px] rounded-full bg-[#041912] hover:bg-[#06291e] border border-[#041912]/90 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#041912]/20 transition-all active:scale-[0.99] disabled:opacity-60 mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Recevoir mon code d'accès</span>
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center ml-1">
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <OtpStep
                telephone={telephone}
                onVerify={handleVerifyOtp}
                onResend={(channel) => {
                  AuthService.sendPhoneLoginOtp(telephone, channel);
                  setSuccessMsg('Un nouveau code vous a été envoyé.');
                }}
                onBack={() => setStep('INPUT')}
                isLoading={isLoading}
                error={error}
                slots={6}
              />
            )
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50"
                    required
                  />
                </div>
              </div>

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
                    autoComplete="current-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  className="text-xs font-medium text-[#059669] hover:underline italic"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[48px] rounded-full bg-[#041912] hover:bg-[#06291e] border border-[#041912]/90 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#041912]/20 transition-all active:scale-[0.99] disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Se connecter</span>
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center ml-1">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </>
                )}
              </button>
            </form>
          )}


          {/* Divider Glass */}
          <div className="flex items-center my-3.5 gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              OU CONTINUER AVEC
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google Auth Button Glass */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full h-12 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.99] disabled:opacity-60"
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
            <span>Continuer avec Google</span>
          </button>
        </div>
      </div>

      {/* Inscription Footer Glass Capsule */}
      <div className="mt-3 py-3 px-5 rounded-full bg-white/10 border border-white/18 backdrop-blur-md text-center">
        <p className="text-xs text-white/80">
          Pas encore de compte ?{' '}
          {onNavigateToRegister ? (
            <button
              onClick={onNavigateToRegister}
              className="font-semibold text-[#4ADE80] underline hover:text-emerald-300 ml-1"
            >
              S'inscrire gratuitement
            </button>
          ) : (
            <Link
              href="/register"
              className="font-semibold text-[#4ADE80] underline hover:text-emerald-300 ml-1"
            >
              S'inscrire gratuitement
            </Link>
          )}
        </p>
      </div>
    </div>
  );
};
