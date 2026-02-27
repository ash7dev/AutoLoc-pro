import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique des Cookies - AutoLoc',
  description: 'Politique d\'utilisation des cookies sur AutoLoc',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Politique des Cookies
          </h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Qu'est-ce qu'un cookie ?
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez notre site. 
                Il nous permet de mémoriser vos préférences et d'améliorer votre expérience de navigation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Types de cookies que nous utilisons
              </h2>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-1">Cookies essentiels</h3>
                  <p className="text-sm text-gray-600">
                    Nécessaires au fonctionnement du site (authentification, panier, etc.).
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-1">Cookies de performance</h3>
                  <p className="text-sm text-gray-600">
                    Nous aident à comprendre comment vous utilisez notre site.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-1">Cookies fonctionnels</h3>
                  <p className="text-sm text-gray-600">
                    Mémorisent vos préférences et personnalise votre expérience.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Gestion des cookies
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Via les paramètres de votre navigateur</li>
                <li>En utilisant notre bandeau de consentement</li>
                <li>En bloquant spécifiquement certains cookies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Contact
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Pour toute question sur notre politique des cookies, 
                contactez-nous à : contact@autoloc.sn
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500 text-center">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
