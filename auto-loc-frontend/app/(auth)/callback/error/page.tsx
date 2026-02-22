import React from 'react';

export default function AuthCallbackErrorPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const message = searchParams.message ?? 'Une erreur est survenue.';

  return (
    <div className="mx-auto w-full max-w-md space-y-4 text-center">
      <div className="text-xl font-semibold">Connexion échouée</div>
      <p className="text-sm text-gray-600">{message}</p>
      <a href="/login" className="text-sm text-blue-600 underline">
        Revenir à la connexion
      </a>
    </div>
  );
}
