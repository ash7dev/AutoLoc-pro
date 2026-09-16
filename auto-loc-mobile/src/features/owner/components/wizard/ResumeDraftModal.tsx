import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { RotateCcw, PlusCircle, Car } from 'lucide-react-native';
import { VehicleWizardDraft } from '../../stores/useVehicleDraftStore';

interface ResumeDraftModalProps {
  visible: boolean;
  draft: VehicleWizardDraft | null;
  onResume: () => void;
  onStartFresh: () => void;
}

export const ResumeDraftModal: React.FC<ResumeDraftModalProps> = ({
  visible,
  draft,
  onResume,
  onStartFresh,
}) => {
  if (!visible || !draft) return null;

  const vehicleTitle =
    draft.step1.marque && draft.step1.modele
      ? `${draft.step1.marque} ${draft.step1.modele} (${draft.step1.annee || 2024})`
      : 'Véhicule sans nom';

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Icon */}
          <View style={styles.iconContainer}>
            <Car size={32} color="#059669" />
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Brouillon en cours trouvé !</Text>
          <Text style={styles.subtitle}>
            Vous avez commencé la création d’une annonce pour{' '}
            <Text style={styles.boldText}>{vehicleTitle}</Text> (Étape {draft.currentStep} sur 7).
          </Text>

          {/* Actions */}
          <View style={styles.actionCol}>
            {/* Resume Button */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onResume}
              activeOpacity={0.85}
            >
              <RotateCcw size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Reprendre la création</Text>
            </TouchableOpacity>

            {/* Start Fresh Button */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onStartFresh}
              activeOpacity={0.8}
            >
              <PlusCircle size={16} color="#475569" />
              <Text style={styles.secondaryBtnText}>Démarrer une nouvelle annonce</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  boldText: {
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  actionCol: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
  },
  primaryBtnText: {
    fontSize: 14.5,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 13,
    width: '100%',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#475569',
  },
});
