'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, OnboardingInput } from '../schema';
import { useOnboarding } from '../hooks/use-onboarding';
import { useEffect, useState } from 'react';
import { useAuthFlow } from '../../hooks/use-auth-flow';

// Design tokens
const T = {
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  gray50: '#F5F5F5',
  gray100: '#EBEBEB',
  gray200: '#D4D4D4',
  gray400: '#A3A3A3',
  gray600: '#525252',
  ink: '#0A0A0A',
  inkMid: 'rgba(10,10,10,0.5)',
  inkLight: 'rgba(10,10,10,0.35)',
  inkGhost: 'rgba(10,10,10,0.1)',
  red: '#DC2626',
  green: '#10B981',
  blue: '#3B82F6',
};

// Floating Input Component
function FloatingInput({
  label,
  error,
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { 
  label: string; 
  error?: string;
  icon?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const lifted = focused || hasValue;

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '18px',
            color: focused ? T.blue : T.inkLight,
            transition: 'color 0.2s ease',
            zIndex: 2,
          }}>
            {icon}
          </div>
        )}
        
        <span style={{
          position: 'absolute',
          left: icon ? '52px' : '16px',
          top: lifted ? '9px' : '50%',
          transform: lifted ? 'none' : 'translateY(-50%)',
          fontSize: lifted ? '10px' : '14px',
          fontWeight: lifted ? 600 : 400,
          letterSpacing: lifted ? '0.12em' : '0.01em',
          textTransform: lifted ? 'uppercase' : 'none',
          color: focused ? T.blue : T.inkLight,
          fontFamily: 'var(--font-body)',
          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: 'none',
          zIndex: 1,
        }}>
          {label}
        </span>

        <input
          {...props}
          style={{
            width: '100%',
            height: '56px',
            background: focused ? T.white : T.offWhite,
            border: `2px solid ${error ? T.red : focused ? T.blue : T.gray200}`,
            borderRadius: '12px',
            padding: `22px ${icon ? '52px' : '16px'} 8px 16px`,
            color: T.ink,
            fontSize: '15px',
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.01em',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: focused ? `0 0 0 4px rgba(59, 130, 246, 0.1)` : 'none',
          }}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            setHasValue(!!e.target.value);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          placeholder=""
        />
      </div>
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '6px',
        }}>
          <span style={{
            fontSize: '10px',
            color: T.red,
          }}>●</span>
          <p style={{
            margin: 0,
            fontSize: '12px',
            color: T.red,
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
          }}>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

export function OnboardingForm() {
  const { submit, loading, error, defaults } = useOnboarding();
  const { redirectAfterAuth } = useAuthFlow();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: defaults,
    mode: 'onChange',
  });

  useEffect(() => {
    if (defaults && Object.keys(defaults).length > 0) {
      reset(defaults);
    }
  }, [defaults, reset]);

  const onSubmit = async (data: OnboardingInput) => {
    const ok = await submit(data);
    if (ok) {
      setIsSuccess(true);
      setTimeout(() => {
        redirectAfterAuth();
      }, 1500);
    }
  };

  if (isSuccess) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        animation: 'fadeIn 0.5s ease-out',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '32px',
        }}>
          ✓
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: T.ink,
          margin: '0 0 8px',
          fontFamily: 'var(--font-body)',
        }}>
          Profil complété avec succès !
        </h3>
        <p style={{
          fontSize: '14px',
          color: T.inkLight,
          margin: 0,
          fontFamily: 'var(--font-body)',
        }}>
          Redirection en cours...
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
          --font-body: 'Inter', sans-serif;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }
        
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>

      <div style={{
        background: T.white,
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        border: `1px solid ${T.gray100}`,
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: T.ink,
            margin: '0 0 8px',
            fontFamily: 'var(--font-body)',
          }}>
            Finalisons votre profil 🎯
          </h2>
          <p style={{
            fontSize: '14px',
            color: T.inkLight,
            margin: 0,
            lineHeight: 1.5,
            fontFamily: 'var(--font-body)',
          }}>
            Ces informations nous aideront à personnaliser votre expérience
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FloatingInput
              label="Prénom"
              icon="👤"
              {...register('prenom')}
              error={errors.prenom?.message}
            />
            <FloatingInput
              label="Nom"
              icon="👥"
              {...register('nom')}
              error={errors.nom?.message}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '56px',
              padding: '0 16px',
              background: T.offWhite,
              border: `2px solid ${T.gray200}`,
              borderRadius: '12px',
              color: T.ink,
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}>
              🇸🇳 <span style={{ color: T.inkMid }}>+221</span>
            </div>
            <div style={{ flex: 1 }}>
              <FloatingInput
                label="Téléphone"
                icon="📱"
                type="tel"
                {...register('telephone')}
                error={errors.telephone?.message}
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(220, 38, 38, 0.08)',
              border: `1px solid ${T.red}`,
              borderRadius: '8px',
              fontSize: '13px',
              color: T.red,
              fontFamily: 'var(--font-body)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isValid}
            className="btn-primary"
            style={{
              height: '52px',
              borderRadius: '12px',
              color: T.white,
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              border: 'none',
              cursor: loading || !isValid ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: T.white,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Enregistrement en cours...
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>🚀</span>
                {isValid ? 'Compléter mon profil' : 'Remplir tous les champs'}
              </div>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
