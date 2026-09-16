import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { X, ChevronLeft } from 'lucide-react-native';
import { GateStep } from '../../tenant/hooks/useBookingGate';
import { HostPreGateOverview } from './HostPreGateOverview';
import { GateStepProfile } from '../../tenant/components/gates/GateStepProfile';
import { GateStepPhoneOtp } from '../../tenant/components/gates/GateStepPhoneOtp';
import { GateStepKycIdentity } from '../../tenant/components/gates/GateStepKycIdentity';
import { GateStepDriverLicense } from '../../tenant/components/gates/GateStepDriverLicense';
import { becomeAutoLocHost } from '../../tenant/api/tenantProfileApi';
import { secureStorage } from '../../../core/storage/secureStore';
import { useAppStore } from '../../../core/store/useAppStore';

interface HostGateModalProps {
  visible: boolean;
  missingSteps: GateStep[];
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

export const HostGateModal: React.FC<HostGateModalProps> = ({
  visible,
  missingSteps,
  onClose,
  onAllCompleted,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [upgradingRole, setUpgradingRole] = useState(false);
  const setAuth = useAppStore((state) => state.setAuth);
  const user = useAppStore((state) => state.user);

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

  const handleStepSuccess = async () => {
    if (currentStepIndex + 1 < totalSteps) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Toutes les étapes de vérification sont franchies !
      // Si l'utilisateur n'est pas encore PROPRIETAIRE, upgrade son rôle automatiquement.
      try {
        setUpgradingRole(true);
        if (user && user.role !== 'PROPRIETAIRE') {
          const result = await becomeAutoLocHost();
          await secureStorage.setRefreshToken(result.refreshToken);
          await setAuth(result.accessToken, {
            ...user,
            role: result.role,
          });
        }
      } catch {
        // En cas d'erreur réseau, poursuivre tout de même le flow
      } finally {
        setUpgradingRole(false);
        onAllCompleted();
      }
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

        {/* Header */}
        <View style={styles.header}>
          {currentStepIndex > 0 ? (
            <Pressable style={styles.iconButton} onPress={handleBack}>
              <ChevronLeft size={24} color={COLORS.ink} />
            </Pressable>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}

          {!isPreGate && (
            <View style={styles.progressContainer}>
              <Text style={styles.stepCounterText}>
                Étape {currentStepIndex} sur {totalSteps - 1}
              </Text>
              <View style={styles.dotsRow}>
                {missingSteps
                  .filter((s) => s !== 'PREGATE')
                  .map((stepItem, idx) => {
                    const activeIdx = currentStepIndex - 1;
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

          <Pressable style={styles.iconButton} onPress={onClose} disabled={upgradingRole}>
            <X size={22} color={COLORS.ink} />
          </Pressable>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {currentStep === 'PREGATE' && (
            <HostPreGateOverview
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
