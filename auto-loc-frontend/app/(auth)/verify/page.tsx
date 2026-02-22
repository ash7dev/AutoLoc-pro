import { OtpForm } from '../../../features/auth/verify/components/otp-form';

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { email?: string; phone?: string; type?: 'email' | 'phone' };
}) {
  const email = searchParams.email ?? '';
  const phone = searchParams.phone ?? '';
  const type = searchParams.type === 'phone' ? 'phone' : 'email';

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Vérification</h1>
      <p className="text-sm text-gray-600">
        {type === 'phone'
          ? `Un code SMS a été envoyé au ${phone}.`
          : `Un code a été envoyé à ${email}.`}
      </p>
      <OtpForm email={email} phone={phone} type={type} />
    </div>
  );
}
