'use client';

import React from 'react';
import { LoginForm } from './LoginForm';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onNavigateToRegister?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onNavigateToRegister,
}) => {
  if (!isOpen) return null;

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop sombre émeraude translucide avec flou glassmorphic */}
      <div
        className="fixed inset-0 bg-[#04150F]/85 backdrop-blur-lg transition-opacity"
        onClick={onClose}
      />

      {/* Halo lumineux vert émeraude radial (Aura Glow) */}
      <div className="fixed -top-32 left-1/2 -translate-x-1/2 w-[90vw] max-w-[600px] aspect-square bg-[#10B981]/25 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none animate-pulse" />

      {/* Container Modale / Formulaire */}
      <div className="relative z-10 w-full max-w-md my-auto">
        <LoginForm
          onSuccess={handleSuccess}
          onClose={onClose}
          onNavigateToRegister={onNavigateToRegister}
        />
      </div>
    </div>
  );
};
