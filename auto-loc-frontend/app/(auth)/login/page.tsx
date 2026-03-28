'use client';

import React, { Suspense } from 'react';
import LoginForm from '../../../features/auth/login/components/login-form';

function LoginLoader() {
  return null; // Pas de spinner pendant le chargement
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoader />}>
      <LoginForm />
    </Suspense>
  );
}
