import { create } from 'zustand';
import { secureStorage } from '../../../core/storage/secureStore';
import { Step1Data } from '../components/wizard/WizardStep1Model';
import { Step2Data } from '../components/wizard/WizardStep2Specs';
import { Step3Data } from '../components/wizard/WizardStep3Location';
import { Step4Data } from '../components/wizard/WizardStep4Conditions';
import { Step5Data } from '../components/wizard/WizardStep5Pricing';
import { Step6Data } from '../components/wizard/WizardStep6Photos';

export interface VehicleWizardDraft {
  currentStep: number;
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;
  updatedAt: string;
}

interface VehicleDraftState {
  hasDraft: boolean;
  draft: VehicleWizardDraft | null;
  isLoading: boolean;

  loadDraft: () => Promise<VehicleWizardDraft | null>;
  saveDraft: (draft: Omit<VehicleWizardDraft, 'updatedAt'>) => Promise<void>;
  clearDraft: () => Promise<void>;
}

export const useVehicleDraftStore = create<VehicleDraftState>((set) => ({
  hasDraft: false,
  draft: null,
  isLoading: true,

  loadDraft: async () => {
    try {
      set({ isLoading: true });
      const saved = await secureStorage.getVehicleDraft<VehicleWizardDraft>();
      if (saved && saved.step1 && saved.step1.marque) {
        set({ hasDraft: true, draft: saved, isLoading: false });
        return saved;
      } else {
        set({ hasDraft: false, draft: null, isLoading: false });
        return null;
      }
    } catch {
      set({ hasDraft: false, draft: null, isLoading: false });
      return null;
    }
  },

  saveDraft: async (draftData) => {
    try {
      const fullDraft: VehicleWizardDraft = {
        ...draftData,
        updatedAt: new Date().toISOString(),
      };
      set({ hasDraft: true, draft: fullDraft });
      await secureStorage.setVehicleDraft(fullDraft);
    } catch (e) {
      console.warn('Erreur lors de la sauvegarde du brouillon:', e);
    }
  },

  clearDraft: async () => {
    try {
      set({ hasDraft: false, draft: null });
      await secureStorage.removeVehicleDraft();
    } catch (e) {
      console.warn('Erreur lors du nettoyage du brouillon:', e);
    }
  },
}));
