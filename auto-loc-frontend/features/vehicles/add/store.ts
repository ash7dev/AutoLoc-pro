"use client";

import { create } from "zustand";

export type VehicleType = "CITADINE" | "BERLINE" | "SUV" | "4X4" | "PICKUP" | "MONOSPACE" | "MINIBUS" | "UTILITAIRE" | "LUXE";
export type FuelType = "ESSENCE" | "DIESEL" | "HYBRIDE" | "ELECTRIQUE";
export type TransmissionType = "MANUELLE" | "AUTOMATIQUE";

export interface Step1Data {
  marque: string;
  modele: string;
  annee: number;
  type: VehicleType;
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
}

export interface Step3Data {
  ageMinimum?: number;
  zoneConduite?: string;
  assurance?: string;
  reglesSpecifiques?: string;
}

interface AddVehicleStore {
  vehicleId: string | null;
  step1: Step1Data | null;
  step2: Step2Data | null;
  step3: Step3Data | null;
  photos: File[];
  setStep1: (data: Step1Data) => void;
  setStep2: (data: Step2Data) => void;
  setStep3: (data: Step3Data) => void;
  setVehicleId: (id: string) => void;
  addPhoto: (file: File) => void;
  removePhoto: (index: number) => void;
  reset: () => void;
}

export const useAddVehicleStore = create<AddVehicleStore>((set) => ({
  vehicleId: null,
  step1: null,
  step2: null,
  step3: null,
  photos: [],
  setStep1: (data) => set({ step1: data }),
  setStep2: (data) => set({ step2: data }),
  setStep3: (data) => set({ step3: data }),
  setVehicleId: (id) => set({ vehicleId: id }),
  addPhoto: (file) => set((s) => ({ photos: [...s.photos, file] })),
  removePhoto: (index) => set((s) => ({ photos: s.photos.filter((_, i) => i !== index) })),
  reset: () => set({ vehicleId: null, step1: null, step2: null, step3: null, photos: [] }),
}));
