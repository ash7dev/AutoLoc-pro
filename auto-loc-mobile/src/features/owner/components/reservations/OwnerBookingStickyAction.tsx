import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle2, Clock, Key, LogOut, ShieldAlert } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

export interface OwnerBookingStickyActionProps {
  statut: string;
  hasOwnerCheckin: boolean;
  submitting: boolean;
  onOpenConfirm: () => void;
  onOpenCheckin: () => void;
  onOpenCheckout: () => void;
}

export const OwnerBookingStickyAction: React.FC<OwnerBookingStickyActionProps> = ({
  statut,
  hasOwnerCheckin,
  submitting,
  onOpenConfirm,
  onOpenCheckin,
  onOpenCheckout,
}) => {
  const isPayee = statut === 'PAYEE';
  const isConfirmee = statut === 'CONFIRMEE' && !hasOwnerCheckin;
  const isEnCours = statut === 'EN_COURS';

  const isVisible = isPayee || isConfirmee || isEnCours;

  if (!isVisible) return null;

  const renderContent = () => {
    if (isPayee) {
      return (
        <TouchableOpacity
          disabled={submitting}
          onPress={onOpenConfirm}
          activeOpacity={0.85}
          style={[styles.button, styles.confirmButton]}
        >
          <CheckCircle2 size={19} color="#FFFFFF" />
          <Text style={styles.buttonText}>
            {submitting ? 'Confirmation…' : 'Confirmer la réservation'}
          </Text>
        </TouchableOpacity>
      );
    }

    if (isConfirmee) {
      return (
        <TouchableOpacity
          disabled={submitting}
          onPress={onOpenCheckin}
          activeOpacity={0.85}
          style={[styles.button, styles.checkinButton]}
        >
          <Key size={19} color="#FFFFFF" />
          <Text style={styles.buttonText}>
            {submitting ? 'Check-in en cours…' : 'Remise des clés (Check-in)'}
          </Text>
        </TouchableOpacity>
      );
    }

    if (isEnCours) {
      return (
        <TouchableOpacity
          disabled={submitting}
          onPress={onOpenCheckout}
          activeOpacity={0.85}
          style={[styles.button, styles.checkoutButton]}
        >
          <LogOut size={19} color="#FFFFFF" />
          <Text style={styles.buttonText}>
            {submitting ? 'Check-out en cours…' : 'Restitution du véhicule (Check-out)'}
          </Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  button: {
    minHeight: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButton: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
  },
  checkinButton: {
    backgroundColor: '#072A20',
    shadowColor: '#072A20',
  },
  checkoutButton: {
    backgroundColor: '#072A20',
    shadowColor: '#072A20',
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
