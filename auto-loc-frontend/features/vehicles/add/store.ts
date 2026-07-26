"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type VehicleType =
  | "CITADINE"
  | "BERLINE"
  | "SUV"
  | "PICKUP"
  | "MONOSPACE"
  | "MINIBUS"
  | "MINIVAN"
  | "UTILITAIRE"
  | "LUXE"
  | "FOUR_X_FOUR";
export type FuelType = "ESSENCE" | "DIESEL" | "HYBRIDE" | "ELECTRIQUE";
export type TransmissionType = "MANUELLE" | "AUTOMATIQUE";

export interface Step1Data {
  marque: string;
  modele: string;
  annee: number;
  type?: VehicleType;
  types: VehicleType[];
  carburant?: FuelType;
  transmission?: TransmissionType;
  nombrePlaces?: number;
  immatriculation: string;
  ville: string;
  adresse: string;
  equipements: string[];
}

export interface PriceTier {
  joursMin: number;
  joursMax?: number;
  prix: number;
}

export interface Step2Data {
  prixParJour: number;
  joursMinimum?: number;
  tiers: PriceTier[];
  fraisLivraison?: number;
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number;
}

export interface Step3Data {
  ageMinimum?: number;
  zoneConduite?: string;
  assurance: string; // Maintenant obligatoire avec valeur par défaut
  carburantCondition?: string;
  reglesSpecifiques?: string;
}

export interface PhotoEntry {
  id: string;
  file: File;
  url: string | null;
  publicId: string | null;
  status: 'uploading' | 'done' | 'error';
}

// Version persistable (sans File object)
interface PersistedPhotoEntry {
  id: string;
  url: string | null;
  publicId: string | null;
  status: 'uploading' | 'done' | 'error';
  // On garde juste le nom du fichier pour référence
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface DocumentUploadResult {
  url: string;
  publicId: string;
}

interface AddVehicleStore {
  vehicleId: string | null;
  step1: Step1Data | null;
  step2: Step2Data | null;
  step3: Step3Data | null;
  photos: PhotoEntry[];
  carteGrise: File | null;
  assurance: File | null;
  carteGriseUploadResult: DocumentUploadResult | null;
  assuranceUploadResult: DocumentUploadResult | null;
  setStep1: (data: Step1Data) => void;
  setStep2: (data: Step2Data) => void;
  setStep3: (data: Step3Data) => void;
  setVehicleId: (id: string) => void;
  addPhotos: (files: File[]) => string[];
  updatePhoto: (id: string, patch: Partial<Pick<PhotoEntry, 'url' | 'publicId' | 'status'>>) => void;
  removePhoto: (index: number) => void;
  movePhotoToFirst: (index: number) => void;
  movePhoto: (fromIndex: number, toIndex: number) => void;
  setDocument: (type: "carteGrise" | "assurance", file: File | null) => void;
  setDocumentUploadResult: (type: "carteGrise" | "assurance", result: DocumentUploadResult | null) => void;
  reset: () => void;
}

export const useAddVehicleStore = create<AddVehicleStore>()(
  persist(
    (set) => ({
      vehicleId: null,
      step1: null,
      step2: null,
      step3: null,
      photos: [],
      carteGrise: null,
      assurance: null,
      carteGriseUploadResult: null,
      assuranceUploadResult: null,
      setStep1: (data) => set({ step1: data }),
      setStep2: (data) => set({ step2: data }),
      setStep3: (data) => set({ step3: data }),
      setVehicleId: (id) => set({ vehicleId: id }),
      addPhotos: (files) => {
        const entries: PhotoEntry[] = files.map((file) => ({
          id: `${Date.now()}-${Math.random()}`,
          file,
          url: null,
          publicId: null,
          status: 'uploading' as const,
        }));
        set((s) => ({ photos: [...s.photos, ...entries] }));
        return entries.map((e) => e.id);
      },
      updatePhoto: (id, patch) =>
        set((s) => ({
          photos: s.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removePhoto: (index) =>
        set((s) => ({ photos: s.photos.filter((_, i) => i !== index) })),
      movePhotoToFirst: (index) =>
        set((s) => {
          const photos = [...s.photos];
          const [moved] = photos.splice(index, 1);
          return { photos: [moved, ...photos] };
        }),
      movePhoto: (fromIndex: number, toIndex: number) =>
        set((s) => {
          const photos = [...s.photos];
          const [moved] = photos.splice(fromIndex, 1);
          photos.splice(toIndex, 0, moved);
          return { photos };
        }),
      setDocument: (type, file) => set({ [type]: file, [`${type}UploadResult`]: null }),
      setDocumentUploadResult: (type, result) => set({ [`${type}UploadResult`]: result }),
      reset: () =>
        set({ vehicleId: null, step1: null, step2: null, step3: null, photos: [], carteGrise: null, assurance: null, carteGriseUploadResult: null, assuranceUploadResult: null }),
    }),
    {
      name: 'add-vehicle-draft',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // On persiste tout sauf les File objects (carteGrise, assurance)
        vehicleId: state.vehicleId,
        step1: state.step1,
        step2: state.step2,
        step3: state.step3,
        // Pour les photos, on persiste seulement celles qui sont uploadées (status: 'done')
        photos: state.photos
          .filter((p) => p.status === 'done' && p.url && p.publicId)
          .map((p) => ({
            id: p.id,
            url: p.url,
            publicId: p.publicId,
            status: p.status,
            fileName: p.file.name,
            fileSize: p.file.size,
            fileType: p.file.type,
          })) as unknown as PhotoEntry[],
        carteGriseUploadResult: state.carteGriseUploadResult,
        assuranceUploadResult: state.assuranceUploadResult,
      }),
      // Fonction pour reconstruire les File objects à partir des données persistées
      merge: (persistedState: any, currentState) => {
        const photos = (persistedState?.photos || []).map((p: PersistedPhotoEntry) => {
          // Créer un File placeholder à partir des données persistées
          // On ne peut pas recréer le vrai fichier, donc on crée un placeholder
          const blob = new Blob([], { type: p.fileType });
          const file = new File([blob], p.fileName, { type: p.fileType });
          return {
            id: p.id,
            file,
            url: p.url,
            publicId: p.publicId,
            status: p.status,
          } as PhotoEntry;
        });

        return {
          ...currentState,
          ...persistedState,
          photos,
          // Les File objects ne sont jamais persistés
          carteGrise: null,
          assurance: null,
        };
      },
    }
  )
);
