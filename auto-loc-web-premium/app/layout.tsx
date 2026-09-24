import {
  Fraunces,
  Gloock,
  Plus_Jakarta_Sans,
  Playfair_Display,
  Cormorant_Garamond,
  Cinzel,
  Syne,
} from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const gloock = Gloock({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gloock",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0A3D2E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://autoloc.sn"),
  title: {
    default: "AutoLoc — Location de Voitures & Véhicules au Sénégal",
    template: "%s | AutoLoc",
  },
  description:
    "AutoLoc est la plateforme de référence pour la location de véhicules (berlines, SUV 4x4, voitures de luxe) à Dakar et au Sénégal. Réservation simple, rapide et sécurisée avec assurance.",
  keywords: [
    "AutoLoc",
    "location voiture dakar",
    "location SUV senegal",
    "location voiture de luxe dakar",
    "louer voiture dakar",
    "location vehicule senegal",
    "rent a car dakar",
  ],
  authors: [{ name: "AutoLoc" }],
  creator: "AutoLoc",
  publisher: "AutoLoc",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AutoLoc",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AutoLoc — Location de Voitures & Véhicules au Sénégal",
    description:
      "Réservez des véhicules de qualité, SUV tout-terrain et voitures de prestige au Sénégal.",
    url: "https://autoloc.sn",
    siteName: "AutoLoc",
    locale: "fr_SN",
    type: "website",
    images: [
      {
        url: "/banner-premium.png",
        width: 1200,
        height: 630,
        alt: "AutoLoc Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoLoc — Location de Voitures & Véhicules au Sénégal",
    description:
      "Louez votre véhicule en toute sérénité à Dakar et dans tout le Sénégal.",
    images: ["/banner-premium.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

import { Navbar } from "../src/core/components/Navbar";
import { Footer } from "../src/core/components/Footer";
import { AuthProvider } from "../src/core/providers/AuthProvider";
import { SWRProvider } from "../src/core/providers/SWRProvider";
import { PwaManager } from "../src/core/components/Pwa/PwaManager";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${fraunces.variable} ${gloock.variable} ${jakarta.variable} ${playfair.variable} ${cormorant.variable} ${cinzel.variable} ${syne.variable}`}
    >
      <body suppressHydrationWarning className="font-body bg-background text-foreground antialiased selection:bg-emerald-500/30 selection:text-emerald-300 min-h-screen flex flex-col">
        <SWRProvider>
          <AuthProvider>
            <PwaManager />
            <Navbar />
            <main className="flex-1 pb-28 lg:pb-0">{children}</main>
            <Footer />
          </AuthProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
