'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function CallbackErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const message = searchParams.get('message') || 'Erreur de connexion';

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/login');
      return undefined;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  const handleRetry = () => {
    router.push('/login');
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">Erreur de connexion</CardTitle>
          <CardDescription className="text-gray-600">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-500 text-center">
            <p>Redirection automatique vers la page de connexion dans {countdown} secondes...</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleRetry} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
            <Button onClick={handleHome} variant="outline" className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Accueil
            </Button>
          </div>
          
          <div className="text-xs text-gray-400 text-center border-t pt-4">
            <p>Si ce problème persiste, contactez le support technique.</p>
            <p className="mt-1">Référence: {new Date().toISOString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
