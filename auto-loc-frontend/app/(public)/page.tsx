import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AutoLoc</h1>
          <p className="text-gray-600">Location de véhicules entre particuliers</p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/login"
            className="inline-block w-full max-w-xs mx-auto bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Se connecter
          </Link>
          
          <Link 
            href="/register"
            className="inline-block w-full max-w-xs mx-auto border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </main>
  );
}