import React, { Suspense } from 'react';
import { RegisterForm } from '../../../features/auth/register/components/register-form';
import { LogoLoader } from '@/components/ui/logo-loader';

export default function RegisterPage() {
  return (
    <Suspense fallback={<LogoLoader />}>
      <RegisterForm />
    </Suspense>
  );
}
