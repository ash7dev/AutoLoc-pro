import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { GateStep } from '../../hooks/useBookingGate';
import { BookingPreGateOverview } from './BookingPreGateOverview';
import { GateStepProfile } from './GateStepProfile';
import { GateStepPhoneOtp } from './GateStepPhoneOtp';
import { GateStepKycIdentity } from './GateStepKycIdentity';
import { GateStepDriverLicense } from './GateStepDriverLicense';
import { GateStepAgeWarning } from './GateStepAgeWarning';
import { theme } from '../../../../core/theme';

const { width: screenWidth } = Dimensions.get('window');

interface ReservationGateModalProps {
  visible: boolean;
  vehicleTitle: string;
  vehicleMinimumAge?: number;
  missingSteps: GateStep[];
  userAge: number | null;
  onClose: () => void;
  onAllCompleted: () => void;
  customTitle?: string;
  customSubtitle?: string;
}

export const ReservationGateModal: React.FC<ReservationGateModalProps> = ({
  visible,
  vehicleTitle,
  vehicleMinimumAge,
  missingSteps,
  userAge,
  onClose,
  onAllCompleted,
  customTitle,
  customSubtitle,
}) => {
  const insets = useSafeAreaInsets();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

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
      <View style={styles.container}>
        <StatusBar style="light" animated />

        {/* 1. Fond Sombre Émeraude & Aura Lumineuse */}
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={['#062017', '#04150F', '#020B08']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.auraGlow} />
        </View>

        {/* 2. En-tête Navigation Glassmorphism */}
        <View
          style={[
            styles.safeHeader,
            {
              paddingTop: Math.max(insets.top, 16) + 4,
            },
          ]}
        >
          <View style={styles.topHeaderRow}>
            {currentStepIndex > 0 ? (
              <TouchableOpacity
                style={styles.glassNavBtn}
                onPress={handleBack}
                activeOpacity={0.8}
              >
                <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            ) : (
              <View style={styles.glassNavPlaceholder} />
            )}

            {/* Indicateur de Progression en Pilule Glass */}
            {!isPreGate && !isAgeWarning ? (
              <View style={styles.glassProgressCapsule}>
                <Text style={styles.stepCounterText}>
                  Étape {currentStepIndex} / {totalSteps - 1}
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
            ) : (
              <View style={styles.badgeSecurityHeader}>
                <ShieldCheck size={13} color="#4ADE80" />
                <Text style={styles.badgeSecurityText}>VÉRIFICATION SÉCURISÉE</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.glassNavBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Corps des Équivalents de Éapes */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flexOne}
        >
          <View style={[styles.bodyWrapper, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
            {currentStep === 'PREGATE' && (
              <BookingPreGateOverview
                vehicleTitle={vehicleTitle}
                missingSteps={missingSteps}
                onStart={() => setCurrentStepIndex(1)}
                onCancel={onClose}
                customTitle={customTitle}
                customSubtitle={customSubtitle}
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
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#04150F',
  },
  auraGlow: {
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
    width: screenWidth * 0.9,
    height: screenWidth * 0.9,
    borderRadius: (screenWidth * 0.9) / 2,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
  },
  flexOne: {
    flex: 1,
  },
  safeHeader: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: 10,
    zIndex: 10,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glassNavBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassNavPlaceholder: {
    width: 38,
  },
  glassProgressCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
  },
  stepCounterText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
  },
  dotActive: {
    width: 16,
    backgroundColor: '#4ADE80',
  },
  dotCompleted: {
    backgroundColor: '#059669',
  },
  badgeSecurityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.30)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
  },
  badgeSecurityText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#4ADE80',
  },
  bodyWrapper: {
    flex: 1,
  },
});

