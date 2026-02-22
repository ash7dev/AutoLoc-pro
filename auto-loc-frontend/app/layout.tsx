import React from 'react';
import type { Metadata } from 'next';
import { ThemeProvider, ColorSystemProvider } from '../providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoLoc',
  description: 'AutoLoc',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="light" storageKey="autoloc-theme">
          <ColorSystemProvider>{children}</ColorSystemProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
