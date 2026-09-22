import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Step1Data {
  marque: string;
  modele: string;
  annee: number;
  type: string;
  transmission: 'AUTOMATIQUE' | 'MANUELLE';
  carburant: 'ESSENCE' | 'DIESEL' | 'HYBRIDE' | 'ELECTRIQUE';
  immatriculation: string;
}

export interface Step2Data {
  nombrePlaces: number;
  ageMinimum: number;
  joursMinimum: number;
  equipements: string[];
}

export interface Step3Data {
  ville: string;
  adresse: string;
  autoriseHorsDakar: boolean;
  supplementHorsDakarParJour: number;
  fraisLivraison: number;
  proposeLivraison?: boolean;
  proposeLivraisonDakar?: boolean;
  fraisLivraisonDakar?: number;
  proposeLivraisonAibd?: boolean;
  fraisLivraisonAibd?: number;
}

export interface Step4Data {
  assurance: string;
  carburantCondition: string;
  reglesSpecifiques?: string;
}

export interface PriceTier {
  joursMin: number;
  joursMax?: number;
  prix: number;
}

export interface Step5Data {
  prixParJour: number;
  tiers: PriceTier[];
}

export interface PhotoItem {
  id: string;
  uri: string;
  publicId?: string;
  isCover?: boolean;
}

export interface DocumentItem {
  uri: string;
  name: string;
  isImage?: boolean;
  publicId?: string;
}

export interface Step6Data {
  photos: PhotoItem[];
  carteGrise?: DocumentItem | null;
  assuranceDoc?: DocumentItem | null;
}

export interface VehicleWizardDraft {
  currentStep: number;
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;
}

const initialDraft: VehicleWizardDraft = {
  currentStep: 1,
  step1: {
    marque: '',
    modele: '',
    annee: 2024,
    type: 'SUV',
    transmission: 'AUTOMATIQUE',
    carburant: 'ESSENCE',
    immatriculation: '',
  },
  step2: {
    nombrePlaces: 5,
    ageMinimum: 21,
    joursMinimum: 1,
    equipements: ['CLIMATISATION'],
  },
  step3: {
    ville: 'Dakar',
    adresse: '',
    autoriseHorsDakar: false,
    supplementHorsDakarParJour: 0,
    fraisLivraison: 0,
    proposeLivraison: false,
    proposeLivraisonDakar: false,
    fraisLivraisonDakar: 0,
    proposeLivraisonAibd: false,
    fraisLivraisonAibd: 0,
  },
  step4: {
    assurance: 'Locataire responsable',
    carburantCondition: 'Plein à plein',
    reglesSpecifiques: '',
  },
  step5: {
    prixParJour: 25000,
    tiers: [],
  },
  step6: {
    photos: [],
    carteGrise: null,
    assuranceDoc: null,
  },
};

interface VehicleDraftStoreState {
  draft: VehicleWizardDraft;
  saveDraft: (partial: Partial<VehicleWizardDraft>) => void;
  clearDraft: () => void;
  loadDraft: () => VehicleWizardDraft | null;
}

export const useVehicleDraftStore = create<VehicleDraftStoreState>()(
  persist(
    (set, get) => ({
      draft: initialDraft,

      saveDraft: (partial) =>
        set((state) => ({
          draft: { ...state.draft, ...partial },
        })),

      clearDraft: () =>
        set(() => ({
          draft: initialDraft,
        })),

      loadDraft: () => {
        const d = get().draft;
        if (d && d.step1 && (d.step1.marque || d.step1.immatriculation || d.currentStep > 1)) {
          return d;
        }
        return null;
      },
    }),
    {
      name: 'autoloc_vehicle_draft_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
);
