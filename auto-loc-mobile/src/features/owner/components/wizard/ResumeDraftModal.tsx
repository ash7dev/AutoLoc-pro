import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { RotateCcw, Plus, Car, Sparkles, ArrowRight } from 'lucide-react-native';
import { theme } from '../../../../core/theme';
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
      ? `${draft.step1.marque} ${draft.step1.modele}`
      : 'Véhicule en cours';

  const vehicleYear = draft.step1.annee || 2024;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Centered Luxury Icon Badge */}
          <View style={styles.iconBadge}>
            <RotateCcw size={24} color="#4ADE80" strokeWidth={2.2} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Brouillon en cours trouvé !</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Vous avez une création d’annonce non terminée. Souhaitez-vous la reprendre là où vous vous étiez arrêté ?
          </Text>

          {/* Draft Vehicle Highlight Card */}
          <View style={styles.draftCardInfo}>
            <View style={styles.draftCarIconBg}>
              <Car size={20} color="#059669" />
            </View>
            <View style={styles.draftTextCol}>
              <Text style={styles.draftVehicleTitle} numberOfLines={1}>
                {vehicleTitle} ({vehicleYear})
              </Text>
              <View style={styles.draftStepBadge}>
                <Sparkles size={11} color="#047857" />
                <Text style={styles.draftStepText}>
                  Progression : Étape {draft.currentStep} sur 7
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionCol}>
            {/* Primary: Resume */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onResume}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Reprendre la création</Text>
              <View style={styles.emeraldArrowCircle}>
                <ArrowRight size={14} color="#4ADE80" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>

            {/* Secondary: Start Fresh */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onStartFresh}
              activeOpacity={0.8}
            >
              <Plus size={15} color="#64748B" strokeWidth={2.2} />
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
    backgroundColor: 'rgba(4, 25, 18, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#041912',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 20,
    lineHeight: 26,
    color: '#041912',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },

  // Draft Info Box
  draftCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  draftCarIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  draftTextCol: {
    flex: 1,
    gap: 2,
  },
  draftVehicleTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
    color: '#041912',
  },
  draftStepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  draftStepText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#047857',
  },

  // Actions
  actionCol: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#041912',
    height: 48,
    borderRadius: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(4, 25, 18, 0.9)',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  emeraldArrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    height: 44,
    borderRadius: 22,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  secondaryBtnText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#64748B',
  },
});

