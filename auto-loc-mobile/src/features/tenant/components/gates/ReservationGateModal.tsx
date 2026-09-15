import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { X, ChevronLeft } from 'lucide-react-native';
import { GateStep } from '../../hooks/useBookingGate';
import { BookingPreGateOverview } from './BookingPreGateOverview';
import { GateStepProfile } from './GateStepProfile';
import { GateStepPhoneOtp } from './GateStepPhoneOtp';
import { GateStepKycIdentity } from './GateStepKycIdentity';
import { GateStepDriverLicense } from './GateStepDriverLicense';
import { GateStepAgeWarning } from './GateStepAgeWarning';

interface ReservationGateModalProps {
  visible: boolean;
  vehicleTitle: string;
  vehicleMinimumAge?: number;
  missingSteps: GateStep[];
  userAge: number | null;
  onClose: () => void;
  onAllCompleted: () => void;
}

const COLORS = {
  bg: '#FFFFFF',
  accent: '#16A34A',
  ink: '#041912',
  inkMuted: '#64748B',
  border: '#E2E8F0',
  surface: '#F8FAFC',
};

export const ReservationGateModal: React.FC<ReservationGateModalProps> = ({
  visible,
  vehicleTitle,
  vehicleMinimumAge,
  missingSteps,
  userAge,
  onClose,
  onAllCompleted,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Réinitialiser le step au changement de visibilité
  useEffect(() => {
    if (visible) {
      setCurrentStepIndex(0);
    }
  }, [visible]);

  if (!visible || missingSteps.length === 0) {
    return null;
  }

  const currentStep = missingSteps[currentStepIndex] || missingSteps[0];
  const totalSteps = missingSteps.length;
  const isPreGate = currentStep === 'PREGATE';
  const isAgeWarning = currentStep === 'AGE_INSUFFICIENT';

  // Passer à l'étape suivante ou terminer si toutes validées
  const handleStepSuccess = () => {
    if (currentStepIndex + 1 < totalSteps) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onAllCompleted();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* En-tête de Modal (Fond Blanc) */}
        <View style={styles.header}>
          {currentStepIndex > 0 ? (
            <Pressable style={styles.iconButton} onPress={handleBack}>
              <ChevronLeft size={24} color={COLORS.ink} />
            </Pressable>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}

          {/* Indicateur de Progression (Dots) */}
          {!isPreGate && !isAgeWarning && (
            <View style={styles.progressContainer}>
              <Text style={styles.stepCounterText}>
                Étape {currentStepIndex} sur {totalSteps - 1}
              </Text>
              <View style={styles.dotsRow}>
                {missingSteps
                  .filter((s) => s !== 'PREGATE')
                  .map((stepItem, idx) => {
                    const activeIdx = currentStepIndex - 1; // décalé de PREGATE
                    const isCompleted = idx < activeIdx;
                    const isActive = idx === activeIdx;

                    return (
                      <View
                        key={stepItem}
                        style={[
                          styles.dot,
                          isCompleted && styles.dotCompleted,
                          isActive && styles.dotActive,
                        ]}
                      />
                    );
                  })}
              </View>
            </View>
          )}

          <Pressable style={styles.iconButton} onPress={onClose}>
            <X size={22} color={COLORS.ink} />
          </Pressable>
        </View>

        {/* Corps des Équivalents de Pages */}
        <View style={styles.body}>
          {currentStep === 'PREGATE' && (
            <BookingPreGateOverview
              vehicleTitle={vehicleTitle}
              missingSteps={missingSteps}
              onStart={() => setCurrentStepIndex(1)}
              onCancel={onClose}
            />
          )}

          {currentStep === 'PROFILE' && (
            <GateStepProfile onSuccess={handleStepSuccess} />
          )}

          {currentStep === 'PHONE' && (
            <GateStepPhoneOtp onSuccess={handleStepSuccess} />
          )}

          {currentStep === 'KYC' && (
            <GateStepKycIdentity onSuccess={handleStepSuccess} />
          )}

          {currentStep === 'PERMIS' && (
            <GateStepDriverLicense onSuccess={handleStepSuccess} />
          )}

          {currentStep === 'AGE_INSUFFICIENT' && (
            <GateStepAgeWarning
              vehicleMinimumAge={vehicleMinimumAge}
              userAge={userAge}
              onClose={onClose}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  iconPlaceholder: {
    width: 40,
  },
  progressContainer: {
    alignItems: 'center',
  },
  stepCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.inkMuted,
    marginBottom: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.accent,
  },
  dotCompleted: {
    backgroundColor: '#86EFAC',
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
