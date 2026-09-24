import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AutoLoc — Location de Voitures au Sénégal',
    short_name: 'AutoLoc',
    description:
      "Plateforme n°1 de location de voitures et véhicules d'exception au Sénégal (Dakar, Thiès, Saly, AIBD). Réservation sécurisée avec assurance et livraison.",
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0A3D2E',
    theme_color: '#0A3D2E',
    lang: 'fr',
    scope: '/',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Explorer les véhicules',
        short_name: 'Explorer',
        description: 'Catalogue complet des véhicules disponibles au Sénégal',
        url: '/vehicles',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Publier une annonce',
        short_name: 'Ajouter',
        description: 'Mettez votre véhicule en location sur AutoLoc',
        url: '/dashboard/vehicles/new',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Mes Réservations',
        short_name: 'Réservations',
        description: 'Consulter vos réservations en cours',
        url: '/reservations',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
    categories: ['travel', 'transportation', 'business', 'lifestyle'],
  };
}
