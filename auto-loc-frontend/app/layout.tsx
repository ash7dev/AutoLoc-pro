import React from 'react';
import type { Metadata } from 'next';
import { ThemeProvider, ColorSystemProvider } from '../providers';
import './globals.css';

const BASE_URL = 'https://autoloc.sn';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'AutoLoc — Location de véhicules au Sénégal',
    template: '%s | AutoLoc',
  },
  description:
    'Louez un véhicule vérifié au Sénégal en quelques clics. SUV, berlines, pick-ups et utilitaires disponibles à Dakar et partout au Sénégal.',
  keywords: [
    'location voiture Sénégal',
    'louer voiture Dakar',
    'location véhicule Dakar',
    'AutoLoc',
    'location SUV Sénégal',
    'location berline Dakar',
  ],
  authors: [{ name: 'AutoLoc', url: BASE_URL }],
  creator: 'AutoLoc',
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    url: BASE_URL,
    siteName: 'AutoLoc',
    title: 'AutoLoc — Location de véhicules au Sénégal',
    description:
      'Louez un véhicule vérifié au Sénégal en quelques clics. SUV, berlines, pick-ups disponibles à Dakar et partout au Sénégal.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AutoLoc — Location de véhicules au Sénégal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoLoc — Location de véhicules au Sénégal',
    description:
      'Louez un véhicule vérifié au Sénégal en quelques clics.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'AutoLoc',
  description:
    'Plateforme de location de véhicules vérifiés au Sénégal. SUV, berlines, pick-ups et utilitaires disponibles à Dakar et partout au Sénégal.',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  image: `${BASE_URL}/og-image.jpg`,
  telephone: '+221 XX XXX XX XX',
  email: 'contact@autoloc.sn',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Dakar',
    addressCountry: 'SN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 14.6928,
    longitude: -17.4467,
  },
  areaServed: {
    '@type': 'Country',
    name: 'Sénégal',
  },
  priceRange: '₣₣',
  sameAs: [],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider defaultTheme="light" storageKey="autoloc-theme">
          <ColorSystemProvider>{children}</ColorSystemProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
