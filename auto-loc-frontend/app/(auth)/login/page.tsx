'use client';

import React, { Suspense } from 'react';
import LoginForm from '../../../features/auth/login/components/login-form';

import { LogoLoader } from '@/components/ui/logo-loader';

function LoginLoader() {
  return <LogoLoader />;
}


export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoader />}>
      <LoginForm />
    </Suspense>
  );
}
