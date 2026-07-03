'use server';

import { cookies } from 'next/headers';
import {
  updateVehicleWithRevalidation,
  deleteVehiclePhotoWithRevalidation,
  updatePhotoPositionWithRevalidation,
  linkVehiclePhotoWithRevalidation,
  type Vehicle,
  type UpdateVehicleInput,
  type VehiclePhoto,
} from '@/lib/nestjs/vehicles';

/**
 * Server Action pour mettre à jour un véhicule avec invalidation de cache automatique.
 * Utilisé par EditVehicleSheet.tsx côté client.
 */
export async function updateVehicleAction(
  vehicleId: string,
  data: UpdateVehicleInput,
): Promise<Vehicle> {
  const token = cookies().get('nest_access')?.value;
  if (!token) {
    throw new Error('Non authentifié');
  }

  return updateVehicleWithRevalidation(vehicleId, data, token);
}

/**
 * Server Action pour supprimer une photo de véhicule avec invalidation de cache.
 */
export async function deleteVehiclePhotoAction(
  vehicleId: string,
  photoId: string,
): Promise<void> {
  const token = cookies().get('nest_access')?.value;
  if (!token) {
    throw new Error('Non authentifié');
  }

  return deleteVehiclePhotoWithRevalidation(vehicleId, photoId, token);
}

/**
 * Server Action pour mettre à jour la position d'une photo avec invalidation de cache.
 */
export async function updatePhotoPositionAction(
  vehicleId: string,
  photoId: string,
  position: number,
  estPrincipale: boolean,
): Promise<VehiclePhoto> {
  const token = cookies().get('nest_access')?.value;
  if (!token) {
    throw new Error('Non authentifié');
  }

  return updatePhotoPositionWithRevalidation(
    vehicleId,
    photoId,
    { position, estPrincipale },
    token
  );
}

/**
 * Server Action pour lier une nouvelle photo avec invalidation de cache.
 */
export async function linkVehiclePhotoAction(
  vehicleId: string,
  url: string,
  publicId: string,
): Promise<VehiclePhoto> {
  const token = cookies().get('nest_access')?.value;
  if (!token) {
    throw new Error('Non authentifié');
  }

  return linkVehiclePhotoWithRevalidation(vehicleId, { url, publicId }, token);
}
