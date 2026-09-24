'use client';

import React, { useEffect } from 'react';
import { Car, Banknote, Shield, FileText, UserCheck, KeyRound } from 'lucide-react';

import { HelpHeroSection } from '@/src/features/help/components/HelpHeroSection';
import { HelpTopicsGrid } from '@/src/features/help/components/HelpTopicsGrid';
import { HelpFaqAccordion } from '@/src/features/help/components/HelpFaqAccordion';
import { HelpContactBanner } from '@/src/features/help/components/HelpContactBanner';

/* ════════════════════════════════════════════════════════════════
   FAQ DATA — Toutes les catégories avec questions/réponses
   (typographie française : espaces insécables avant % et h, « » avec insécables)
════════════════════════════════════════════════════════════════ */
const FAQ_CATEGORIES = [
  {
    id: 'faq-location',
    icon: Car,
    title: 'Location de véhicules',
    items: [
      {
        question: 'Comment réserver un véhicule sur AutoLoc ?',
        answer:
          'Parcourez les véhicules disponibles dans notre catalogue, choisissez vos dates de location, puis cliquez sur «\u00a0Réserver\u00a0». Confirmez en payant l’acompte par Wave ou Orange Money. Vous recevrez une confirmation instantanée par e-mail et SMS.',
      },
      {
        question: 'Quels documents sont nécessaires pour louer ?',
        answer:
          'Vous aurez besoin d’une pièce d’identité valide (CNI ou passeport) et d’un permis de conduire en cours de validité. Ces documents sont vérifiés lors du processus KYC (Know Your Customer) pour la sécurité de tous.',
      },
      {
        question: 'Comment récupérer le véhicule ?',
        answer:
          'Après confirmation de la réservation, vous recevez les coordonnées du propriétaire. Rendez-vous au point de rencontre convenu pour effectuer l’état des lieux et récupérer les clés. Certains propriétaires proposent la livraison à l’aéroport AIBD.',
      },
      {
        question: 'Combien de temps dure une location ?',
        answer:
          'La durée minimum est de 1\u00a0jour. Il n’y a pas de durée maximum\u00a0: vous pouvez louer pour une semaine, un mois ou plus. Les tarifs dégressifs s’appliquent automatiquement pour les longues durées.',
      },
    ],
  },
  {
    id: 'faq-paiements',
    icon: Banknote,
    title: 'Paiements & Tarifs',
    items: [
      {
        question: 'Quels sont les modes de paiement acceptés ?',
        answer:
          'Nous acceptons les paiements par Wave et Orange Money pour un règlement instantané et 100\u00a0% sécurisé. Le paiement par carte bancaire est également disponible pour les paiements internationaux.',
      },
      {
        question: 'Quels sont les frais prélevés par AutoLoc ?',
        answer:
          'AutoLoc prélève une commission de service sur chaque location. Le détail des frais est toujours visible avant toute confirmation de réservation. Aucun frais caché n’est appliqué.',
      },
      {
        question: 'Quand est-ce que le propriétaire reçoit son paiement ?',
        answer:
          'Le paiement est débloqué 24\u00a0h après la confirmation de remise du véhicule par le locataire, ou automatiquement 48\u00a0h après la fin de la location. Les fonds sont versés sur le portefeuille AutoLoc du propriétaire.',
      },
      {
        question: 'Comment retirer mes gains (propriétaire) ?',
        answer:
          'Dans la section «\u00a0Portefeuille\u00a0» de votre dashboard, cliquez sur «\u00a0Retirer\u00a0». Vous pouvez retirer via Wave ou Orange Money. Les retraits sont traités sous 24 à 48\u00a0h ouvrables.',
      },
    ],
  },
  {
    id: 'faq-assurance',
    icon: Shield,
    title: 'Assurance & Sécurité',
    items: [
      {
        question: 'L’assurance est-elle incluse dans le prix ?',
        answer:
          'Oui, tous les véhicules sur AutoLoc bénéficient d’une assurance tous risques incluse dans le tarif affiché. Aucun frais caché ni supplément d’assurance à prévoir.',
      },
      {
        question: 'Comment sont vérifiés les locataires ?',
        answer:
          'Chaque locataire doit soumettre une pièce d’identité valide (CNI ou passeport) et un permis de conduire en cours de validité. Ces documents sont vérifiés automatiquement via notre processus KYC avant toute réservation.',
      },
      {
        question: 'Que faire en cas d’accident ?',
        answer:
          'En cas d’accident, informez immédiatement le propriétaire et AutoLoc. Remplissez un constat amiable et transmettez-le à nos équipes. L’assurance tous risques prend en charge les dommages, sous réserve des franchises applicables.',
      },
      {
        question: 'Et si le véhicule tombe en panne ?',
        answer:
          'Contactez immédiatement le propriétaire et notre support. En fonction de la situation, un véhicule de remplacement ou un remboursement partiel pourra être proposé.',
      },
    ],
  },
  {
    id: 'faq-annulations',
    icon: FileText,
    title: 'Annulations & Litiges',
    items: [
      {
        question: 'Puis-je annuler ma réservation ?',
        answer:
          'Oui. Annulation gratuite plus de 5\u00a0jours avant la prise en charge (remboursement intégral moins les frais de service). Entre 2 et 5\u00a0jours\u00a0: remboursement à 75\u00a0%. Moins de 24\u00a0h\u00a0: aucun remboursement. Les cas de force majeure sont exemptés de pénalités.',
      },
      {
        question: 'Que se passe-t-il si le propriétaire annule ?',
        answer:
          'Vous êtes intégralement remboursé. Si l’annulation intervient moins de 3\u00a0jours avant, le propriétaire peut recevoir une pénalité de 40\u00a0% pour protéger les locataires.',
      },
      {
        question: 'Comment signaler un litige ?',
        answer:
          'Contactez notre support via WhatsApp ou e-mail avec les détails de la situation (numéro de réservation, photos, description). Notre équipe de médiation intervient sous 24\u00a0h pour trouver une solution amiable.',
      },
    ],
  },
  {
    id: 'faq-compte',
    icon: UserCheck,
    title: 'Mon compte',
    items: [
      {
        question: 'Comment créer un compte AutoLoc ?',
        answer:
          'Rendez-vous sur autoloc.sn et cliquez sur «\u00a0Créer un compte\u00a0». Renseignez votre nom, e-mail, numéro de téléphone et mot de passe. Vous pouvez également vous inscrire via Google.',
      },
      {
        question: 'Comment modifier mon profil ?',
        answer:
          'Accédez à votre profil depuis le menu utilisateur. Vous pouvez modifier votre nom, photo, e-mail et numéro de téléphone. Certaines modifications nécessitent une re-vérification d’identité.',
      },
      {
        question: 'Comment supprimer mon compte ?',
        answer:
          'Rendez-vous dans les paramètres de sécurité de votre profil. Cliquez sur «\u00a0Supprimer mon compte\u00a0». Cette action est irréversible et entraîne la suppression de toutes vos données après le délai légal de conservation.',
      },
    ],
  },
  {
    id: 'faq-proprietaires',
    icon: KeyRound,
    title: 'Propriétaires',
    items: [
      {
        question: 'Comment devenir propriétaire hôte sur AutoLoc ?',
        answer:
          'Créez un compte AutoLoc, basculez en mode propriétaire depuis votre profil, puis ajoutez votre véhicule avec les photos et documents requis (carte grise, assurance, contrôle technique). Notre équipe validera votre annonce sous 24\u00a0h.',
      },
      {
        question: 'Comment ajouter un nouveau véhicule ?',
        answer:
          'Rendez-vous dans «\u00a0Mes Véhicules\u00a0» depuis votre dashboard, puis cliquez sur «\u00a0Ajouter un véhicule\u00a0». Remplissez les informations demandées (photos, description, prix par jour, disponibilités) et soumettez votre annonce.',
      },
      {
        question: 'Comment bloquer des dates de disponibilité ?',
        answer:
          'Dans la fiche d’un véhicule, accédez à l’onglet «\u00a0Calendrier\u00a0» et sélectionnez les dates auxquelles le véhicule est indisponible. Ces dates seront automatiquement bloquées pour les locataires.',
      },
      {
        question: 'Combien de véhicules puis-je ajouter ?',
        answer:
          'Il n’y a pas de limite au nombre de véhicules que vous pouvez ajouter sur AutoLoc. Plus votre flotte est grande, plus vous avez de chances de générer des revenus.',
      },
      {
        question: 'Comment refuser une réservation ?',
        answer:
          'Depuis la page «\u00a0Réservations\u00a0», ouvrez la demande en attente et cliquez sur «\u00a0Refuser\u00a0». Nous vous encourageons à répondre dans les 24\u00a0h pour maintenir un bon taux de réponse.',
      },
    ],
  },
];

/** Nombre de questions par catégorie, affiché sur les cartes de sujets */
const FAQ_COUNTS: Record<string, number> = Object.fromEntries(
  FAQ_CATEGORIES.map((cat) => [cat.id, cat.items.length])
);

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export default function HelpPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAF4] px-4 pb-32 pt-[calc(1.5rem+env(safe-area-inset-top))] text-[#0F172A] sm:px-6 sm:pt-8 lg:px-8 lg:pb-24 lg:pt-36">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* 1. Hero */}
        <HelpHeroSection />

        {/* 2. Sujets */}
        <HelpTopicsGrid counts={FAQ_COUNTS} />

        {/* 3. FAQ et contact */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <HelpFaqAccordion categories={FAQ_CATEGORIES} />
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <HelpContactBanner />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}