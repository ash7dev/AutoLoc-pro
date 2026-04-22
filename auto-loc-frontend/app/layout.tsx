import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider, ColorSystemProvider, CurrencyProviderServer } from '../providers';
import { GlobalModals } from '@/features/pwa/GlobalModals';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

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
  icons: {
    icon: '/icon-192x192.png',
    shortcut: '/icon-192x192.png',
    apple: '/icon-512x512.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AutoLoc',
    startupImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'AutoLoc',
  }
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
      <body className={cn(inter.variable, "font-sans antialiased")}>
        <ThemeProvider defaultTheme="light" storageKey="autoloc-theme">
          <ColorSystemProvider>
            <CurrencyProviderServer>{children}</CurrencyProviderServer>
          </ColorSystemProvider>
          <GlobalModals />
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
