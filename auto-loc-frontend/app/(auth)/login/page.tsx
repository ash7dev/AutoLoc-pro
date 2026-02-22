'use client';

import React from 'react';
import LoginForm from '../../../features/auth/login/components/login-form';

export default function LoginPage() {
  // NOTE: Redirection désactivée pour permettre d'afficher /login
  // même si une session existe ou si l'onboarding n'est pas terminé.

  return (
    <LoginForm />
  );
}
