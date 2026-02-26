'use client';

import React, { Suspense } from 'react';
import LoginForm from '../../../features/auth/login/components/login-form';

function LoginLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoader />}>
      <LoginForm />
    </Suspense>
  );
}
