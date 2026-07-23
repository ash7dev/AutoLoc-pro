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

type ServerActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type VoidServerActionResponse =
  | { success: true }
  | { success: false; error: string };

/**
 * Server Action pour mettre à jour un véhicule avec invalidation de cache automatique.
 * Utilisé par EditVehicleSheet.tsx côté client.
 */
export async function updateVehicleAction(
  vehicleId: string,
  data: UpdateVehicleInput,
): Promise<ServerActionResponse<Vehicle>> {
  try {
    const token = cookies().get('nest_access')?.value;
    if (!token) {
      return { success: false, error: 'Votre session a expiré. Veuillez vous reconnecter.' };
    }

    const result = await updateVehicleWithRevalidation(vehicleId, data, token);
    return { success: true, data: result };
  } catch (err: any) {
    console.error('[updateVehicleAction] Error:', err);
    return {
      success: false,
      error: err?.message || 'Erreur lors de la mise à jour des informations du véhicule.',
    };
  }
}

/**
 * Server Action pour supprimer une photo de véhicule avec invalidation de cache.
 */
export async function deleteVehiclePhotoAction(
  vehicleId: string,
  photoId: string,
): Promise<VoidServerActionResponse> {
  try {
    const token = cookies().get('nest_access')?.value;
    if (!token) {
      return { success: false, error: 'Votre session a expiré. Veuillez vous reconnecter.' };
    }

    await deleteVehiclePhotoWithRevalidation(vehicleId, photoId, token);
    return { success: true };
  } catch (err: any) {
    console.error('[deleteVehiclePhotoAction] Error:', err);
    return {
      success: false,
      error: err?.message || 'Erreur lors de la suppression de la photo.',
    };
  }
}

/**
 * Server Action pour mettre à jour la position d'une photo avec invalidation de cache.
 */
export async function updatePhotoPositionAction(
  vehicleId: string,
  photoId: string,
  position: number,
  estPrincipale: boolean,
): Promise<ServerActionResponse<VehiclePhoto>> {
  try {
    const token = cookies().get('nest_access')?.value;
    if (!token) {
      return { success: false, error: 'Votre session a expiré. Veuillez vous reconnecter.' };
    }

    const result = await updatePhotoPositionWithRevalidation(
      vehicleId,
      photoId,
      { position, estPrincipale },
      token
    );
    return { success: true, data: result };
  } catch (err: any) {
    console.error('[updatePhotoPositionAction] Error:', err);
    return {
      success: false,
      error: err?.message || 'Erreur lors de la mise à jour de l\'organisation des photos.',
    };
  }
}

/**
 * Server Action pour lier une nouvelle photo avec invalidation de cache.
 */
export async function linkVehiclePhotoAction(
  vehicleId: string,
  url: string,
  publicId: string,
): Promise<ServerActionResponse<VehiclePhoto>> {
  try {
    const token = cookies().get('nest_access')?.value;
    if (!token) {
      return { success: false, error: 'Votre session a expiré. Veuillez vous reconnecter.' };
    }

    const result = await linkVehiclePhotoWithRevalidation(vehicleId, { url, publicId }, token);
    return { success: true, data: result };
  } catch (err: any) {
    console.error('[linkVehiclePhotoAction] Error:', err);
    return {
      success: false,
      error: err?.message || 'Erreur lors de l\'enregistrement de la nouvelle photo.',
    };
  }
}
