'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuthFetch } from '../../auth/hooks/use-auth-fetch';

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_PHOTOS = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// ── Types ─────────────────────────────────────────────────────────────────────

/** Photo locale (pas encore envoyée au serveur). */
export interface PendingPhoto {
  /** Identifiant local unique (non-UUID). */
  id: string;
  file: File;
  /** URL blob pour la prévisualisation (revoke après upload ou suppression). */
  previewUrl: string;
  /** Message d'erreur de validation, null si valide. */
  error: string | null;
}

export interface UploadResult {
  uploaded: number;
  failed: number;
  errors: string[];
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Format non supporté. Utilisez JPEG, PNG ou WebP.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Fichier trop volumineux (max 5 Mo).';
  }
  return null;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Gestion des photos côté client avant envoi au serveur.
 *
 * - Prévisualisation instantanée via URL.createObjectURL
 * - Validation de type et taille côté client
 * - Respect de la limite de 8 photos (existantes + en attente)
 * - Upload individuel vers POST /vehicles/:id/photos (multipart)
 *
 * @param vehicleId - UUID du véhicule cible
 * @param existingCount - Nombre de photos déjà enregistrées sur le serveur
 *
 * Usage :
 *   const photos = useVehiclePhotos(vehicleId, vehicle.photos.length);
 *
 *   // Ajouter des fichiers (depuis un <input type="file"> ou drag & drop)
 *   photos.addFiles(event.target.files);
 *
 *   // Après soumission du formulaire :
 *   const result = await photos.uploadAll();
 *   if (result.uploaded > 0) await reload(); // rafraîchir les photos du serveur
 */
export function useVehiclePhotos(vehicleId: string, existingCount = 0) {
  const { authFetch } = useAuthFetch();
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const counter = useRef(0);

  /** Nombre total de photos (existantes + en attente valides). */
  const totalCount = existingCount + pending.filter((p) => !p.error).length;

  /** Nombre de photos supplémentaires autorisées. */
  const remaining = Math.max(0, MAX_PHOTOS - totalCount);

  // ── Ajout de fichiers ────────────────────────────────────────────────────

  /**
   * Ajoute des fichiers à la file d'attente avec prévisualisation.
   * Ignore les fichiers dépassant la limite de 8 photos au total.
   */
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const newPending: PendingPhoto[] = [];
      let slots = remaining;

      for (const file of arr) {
        const error = validateFile(file);
        // Les fichiers invalides sont ajoutés (avec erreur) mais ne comptent pas dans le quota
        if (!error && slots <= 0) continue;

        newPending.push({
          id: String(++counter.current),
          file,
          previewUrl: URL.createObjectURL(file),
          error,
        });

        if (!error) slots--;
      }

      setPending((prev) => [...prev, ...newPending]);
    },
    [remaining],
  );

  // ── Suppression locale ───────────────────────────────────────────────────

  /** Supprime une photo de la file d'attente et libère son URL blob. */
  const removePending = useCallback((id: string) => {
    setPending((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  /** Vide toute la file d'attente et libère les URL blobs. */
  const clearPending = useCallback(() => {
    setPending((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return [];
    });
  }, []);

  // ── Upload ───────────────────────────────────────────────────────────────

  /**
   * Envoie toutes les photos valides en attente vers le serveur.
   *
   * Chaque photo est uploadée individuellement (multipart/form-data).
   * Le proxy /api/nest/* gère l'authentification via cookie httpOnly.
   *
   * Les photos réussies sont retirées de la file d'attente.
   * Les erreurs sont retournées dans le résultat.
   *
   * @returns Résumé : { uploaded, failed, errors }
   */
  const uploadAll = useCallback(async (): Promise<UploadResult> => {
    const validPhotos = pending.filter((p) => !p.error);
    if (validPhotos.length === 0) {
      return { uploaded: 0, failed: 0, errors: [] };
    }

    setUploading(true);
    setUploadError(null);

    let uploaded = 0;
    const errors: string[] = [];
    const uploadedIds = new Set<string>();

    for (const photo of validPhotos) {
      const formData = new FormData();
      formData.append('file', photo.file);

      try {
        const data = await authFetch<{ id: string }, FormData>(
          `/vehicles/${vehicleId}/photos`,
          { method: 'POST', body: formData },
        );
        if (data?.id) {
          uploaded++;
          uploadedIds.add(photo.id);
          URL.revokeObjectURL(photo.previewUrl);
        } else {
          errors.push(
            `Échec pour "${photo.file.name}"`,
          );
        }
      } catch {
        errors.push(`Erreur réseau pour "${photo.file.name}"`);
      }
    }

    // Retire les photos uploadées de la file
    if (uploadedIds.size > 0) {
      setPending((prev) => prev.filter((p) => !uploadedIds.has(p.id)));
    }

    setUploading(false);

    if (errors.length > 0 && uploaded === 0) {
      setUploadError(errors.join(' • '));
    }

    return { uploaded, failed: errors.length, errors };
  }, [pending, vehicleId]);

  return {
    /** Photos en attente d'upload (avec prévisualisation). */
    pending,
    /** true pendant l'upload vers le serveur. */
    uploading,
    /** Message d'erreur global si tous les uploads ont échoué. */
    uploadError,
    /** Nombre total de photos (existantes + valides en attente). */
    totalCount,
    /** Nombre de slots disponibles avant d'atteindre la limite de 8. */
    remaining,
    /** Ajoute des fichiers à la file avec validation et prévisualisation. */
    addFiles,
    /** Retire une photo de la file d'attente et libère son blob URL. */
    removePending,
    /** Vide toute la file d'attente. */
    clearPending,
    /** Envoie toutes les photos valides au serveur. Résout quand terminé. */
    uploadAll,
  };
}
