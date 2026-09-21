import type { Metadata } from "next";
import {
  Fraunces,
  Gloock,
  Plus_Jakarta_Sans,
  Playfair_Display,
  Cormorant_Garamond,
  Cinzel,
  Bodoni_Moda,
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

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoLoc Web Premium — Location de Véhicules de Prestige",
  description: "Plateforme web haut de gamme de location de véhicules inspirée de la suite AutoLoc",
};

import { Navbar } from "../src/core/components/Navbar";
import { Footer } from "../src/core/components/Footer";
import { AuthProvider } from "../src/core/providers/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${gloock.variable} ${jakarta.variable} ${playfair.variable} ${cormorant.variable} ${cinzel.variable} ${bodoni.variable} ${syne.variable}`}
    >
      <body className="font-body bg-background text-foreground antialiased selection:bg-emerald-500/30 selection:text-emerald-300 min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
