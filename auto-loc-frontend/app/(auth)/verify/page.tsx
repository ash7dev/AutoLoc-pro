import { OtpForm } from '../../../features/auth/verify/components/otp-form';
import { Mail, Smartphone, ShieldCheck } from 'lucide-react';

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { email?: string; phone?: string; type?: 'email' | 'phone' };
}) {
  const email = searchParams.email ?? '';
  const phone = searchParams.phone ?? '';
  const type = searchParams.type === 'phone' ? 'phone' : 'email';

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 mb-2">
            {type === 'phone' ? (
                <Smartphone className="w-8 h-8 text-emerald-600" />
            ) : (
                <Mail className="w-8 h-8 text-emerald-600" />
            )}
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Vérification</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-[260px] mx-auto">
            {type === 'phone'
              ? `Saisissez le code SMS envoyé au numéro ${phone}.`
              : `Saisissez le code de confirmation envoyé à l'adresse ${email}.`}
          </p>
        </div>
      </div>
      
      <div className="bg-white">
        <OtpForm email={email} phone={phone} type={type} />
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-300">
        <ShieldCheck className="w-3.5 h-3.5" />
        Sécurisé par AutoLoc
      </div>
    </div>
  );
}
