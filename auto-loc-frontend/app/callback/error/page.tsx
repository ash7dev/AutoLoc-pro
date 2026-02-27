import React from 'react';

export default function CallbackErrorPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const message = searchParams?.message ?? 'Erreur de connexion';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-600 font-bold">!</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Erreur de connexion</h1>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <a
          href="/login"
          className="mt-4 inline-block text-sm font-semibold text-blue-600 underline"
        >
          Revenir à la connexion
        </a>
      </div>
    </div>
  );
}
