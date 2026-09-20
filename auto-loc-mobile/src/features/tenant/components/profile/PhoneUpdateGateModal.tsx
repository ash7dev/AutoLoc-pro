import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ShieldCheck } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { GateStepPhoneOtp } from '../gates/GateStepPhoneOtp';
import { theme } from '../../../../core/theme';

const { width: screenWidth } = Dimensions.get('window');

interface PhoneUpdateGateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PhoneUpdateGateModal: React.FC<PhoneUpdateGateModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  if (!visible) {
    return null;
  }

  const handlePhoneOtpSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['tenant', 'profile'] });
    Alert.alert(
      'Téléphone mis à jour !',
      'Votre numéro de téléphone a été vérifié et enregistré avec succès.'
    );
    if (onSuccess) {
      onSuccess();
    }
    onClose();
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
            <View style={styles.glassNavPlaceholder} />

            <View style={styles.badgeSecurityHeader}>
              <ShieldCheck size={13} color="#4ADE80" />
              <Text style={styles.badgeSecurityText}>VÉRIFICATION MOBILE</Text>
            </View>

            <TouchableOpacity
              style={styles.glassNavBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Corps Gate Step Phone OTP */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flexOne}
        >
          <View style={[styles.bodyWrapper, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
            <GateStepPhoneOtp onSuccess={handlePhoneOtpSuccess} />
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
