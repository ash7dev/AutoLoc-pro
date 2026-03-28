'use client';

import { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Car, 
  Users, 
  CreditCard, 
  FileText, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Scale
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSwitchToLocataire } from '../../../owner/hooks/use-switch-to-locataire';

// Basé sur vos CGU réelles - Article 3: Obligations du propriétaire
const OWNER_OBLIGATIONS = [
  {
    title: "État du véhicule",
    description: "Mettre à disposition du Locataire le véhicule décrit, en parfait état de fonctionnement, propre et avec le niveau de carburant convenu",
    icon: Car
  },
  {
    title: "Assurance valide",
    description: "S'assurer que le véhicule est couvert par une assurance automobile valide incluant la location à des tiers",
    icon: Shield
  },
  {
    title: "Contrôle technique",
    description: "S'assurer que le contrôle technique du véhicule est à jour, si applicable",
    icon: FileText
  },
  {
    title: "Documents complets",
    description: "Fournir au Locataire tous les documents nécessaires à la circulation du véhicule",
    icon: FileText
  },
  {
    title: "Conditions d'annulation",
    description: "Respecter les conditions d'annulation définies dans la Politique d'annulation",
    icon: AlertTriangle
  }
];

// Basé sur vos CGU réelles - Article 7: Annulation et pénalités
const CANCELLATION_RULES = [
  {
    type: "Propriétaire",
    rules: [
      "+7 jours avant : remboursement intégral, sans pénalité",
      "3 à 7 jours avant : remboursement intégral + pénalité de 20%",
      "-3 jours : remboursement intégral + pénalité de 40%"
    ]
  },
  {
    type: "Locataire", 
    rules: [
      "+5 jours avant : remboursement intégral moins les frais de service",
      "2 à 5 jours avant : remboursement à 75%",
      "-24 heures : aucun remboursement accordé"
    ]
  }
];

// Basé sur vos CGU réelles - Article 11: Sanctions et suspension
const SANCTIONS = [
  {
    level: "Avertissement",
    description: "Adresser un avertissement à l'Utilisateur concerné",
    color: "amber"
  },
  {
    level: "Suspension temporaire",
    description: "Suspendre temporairement le compte de l'Utilisateur",
    color: "orange"
  },
  {
    level: "Suspension définitive",
    description: "Supprimer les annonces et bannir définitivement le compte",
    color: "red"
  }
];

export function OwnerTermsValidation() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [understoodSanctions, setUnderstoodSanctions] = useState(false);
  const router = useRouter();
  const { switchToLocataire, loading: switchingBack } = useSwitchToLocataire();

  const handleAccept = () => {
    if (!acceptedTerms || !understoodSanctions) return;
    
    // Le switch vers owner a déjà été fait, on redirige simplement vers le dashboard
    router.replace('/dashboard/owner');
  };

  const handleCancel = async () => {
    await switchToLocataire();
  };

  const isFormValid = acceptedTerms && understoodSanctions;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Conditions Propriétaire AutoLoc</h1>
              <p className="text-sm text-slate-600 mt-1">
                Lisez attentivement toutes les conditions avant de continuer
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Badge d'information */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
          <Scale className="w-4 h-4 text-emerald-600" strokeWidth={2} />
          <span className="text-xs font-semibold text-emerald-700">Conditions contractuellement binding</span>
        </div>

        {/* Alert Message */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900">Conditions strictes</h3>
              <p className="text-slate-600 mt-1 leading-relaxed">
                En devenant propriétaire sur AutoLoc, vous vous engagez à respecter les obligations définies dans nos Conditions Générales d'Utilisation.
              </p>
            </div>
          </div>
        </div>

        {/* Obligations du propriétaire - Basé sur Article 3 des CGU */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Vos obligations en tant que propriétaire</h3>
            <p className="text-sm text-slate-600 mt-1">Conformément à l'Article 3 de nos CGU</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {OWNER_OBLIGATIONS.map((obligation, index) => {
                const Icon = obligation.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900">{obligation.title}</h4>
                      <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{obligation.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Règles d'annulation - Basé sur Article 7 des CGU */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Conditions d'annulation</h3>
            <p className="text-sm text-slate-600 mt-1">Conformément à l'Article 7 de nos CGU</p>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {CANCELLATION_RULES.map((category, index) => (
                <div key={index} className="space-y-3">
                  <h4 className="font-semibold text-slate-900">Annulation par {category.type}</h4>
                  <ul className="space-y-2">
                    {category.rules.map((rule, ruleIndex) => (
                      <li key={ruleIndex} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0 mt-2" />
                        <span className="text-sm text-slate-600">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <p className="text-sm text-emerald-700">
                <strong className="text-emerald-800">Annulations justifiées sans pénalité :</strong> panne mécanique majeure, accident grave, cas de force majeure — sous réserve de justificatifs.
              </p>
            </div>
          </div>
        </div>

        {/* Sanctions - Basé sur Article 11 des CGU */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-red-50 border-b border-red-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Sanctions en cas de violation</h3>
            <p className="text-sm text-slate-600 mt-1">Conformément à l'Article 11 de nos CGU</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {SANCTIONS.map((sanction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                    sanction.color === 'amber' ? 'bg-amber-500' :
                    sanction.color === 'orange' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{sanction.level}</h4>
                    <p className="text-sm text-slate-600 mt-0.5">{sanction.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-4 leading-relaxed">
              AutoLoc se réserve également le droit d'entreprendre toute action légale appropriée en cas de violation grave.
            </p>
          </div>
        </div>

        {/* Protection des données */}
        <div className="bg-slate-50 rounded-xl p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Protection des données</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            AutoLoc collecte et traite vos données personnelles conformément au RGPD et à la législation sénégalaise. 
            Consultez notre{' '}
            <a href="/legal/privacy" className="text-emerald-600 underline decoration-dotted hover:text-emerald-700 font-medium">
              Politique de Confidentialité
            </a>.
          </p>
        </div>

        {/* Checkboxes */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2 mt-0.5"
            />
            <span className="text-slate-700 leading-relaxed">
              Je déclare avoir lu, compris et accepter les obligations du propriétaire AutoLoc 
              telles que définies dans les Conditions Générales d'Utilisation
            </span>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={understoodSanctions}
              onChange={(e) => setUnderstoodSanctions(e.target.checked)}
              className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2 mt-0.5"
            />
            <span className="text-slate-700 leading-relaxed">
              Je comprends que tout manquement à ces obligations entraînera les sanctions prévues à l'Article 11 des CGU
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCancel}
            disabled={switchingBack}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {switchingBack ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Annulation...
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" />
                Annuler et rester locataire
              </>
            )}
          </button>
          
          <button
            onClick={handleAccept}
            disabled={!isFormValid}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Accepter et continuer
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
