import React from 'react';
import type { Metadata } from 'next';

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
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
