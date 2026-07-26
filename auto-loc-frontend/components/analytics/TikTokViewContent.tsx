'use client';

import { useEffect } from 'react';
import { ttqTrack } from '@/lib/tiktok-pixel';

interface Props {
  vehicleId: string;
  marque: string;
  modele: string;
  prixParJour: number;
  ville: string;
}

/**
 * Invisible client component that fires TikTok `ViewContent` when
 * a vehicle detail page is mounted.
 */
export function TikTokViewContent({ vehicleId, marque, modele, prixParJour, ville }: Props) {
  useEffect(() => {
    ttqTrack('ViewContent', {
      content_id: vehicleId,
      content_type: 'product',
      content_name: `${marque} ${modele}`,
      value: prixParJour,
      currency: 'XOF',
      description: `Location ${marque} ${modele} à ${ville}`,
    });
  }, [vehicleId, marque, modele, prixParJour, ville]);

  return null;
}
