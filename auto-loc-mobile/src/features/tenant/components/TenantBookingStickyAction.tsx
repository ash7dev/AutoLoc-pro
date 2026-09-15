import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle2, CreditCard } from 'lucide-react-native';
import { theme } from '../../../core/theme';

export interface TenantBookingStickyActionProps {
  visible: boolean;
  loading: boolean;
  onPress: () => void;
  label?: string;
  type?: 'CHECKIN' | 'PAYMENT';
}

export const TenantBookingStickyAction: React.FC<TenantBookingStickyActionProps> = ({
  visible,
  loading,
  onPress,
  label = 'Confirmer la prise en charge',
  type = 'CHECKIN',
}) => {
  if (!visible) return null;

  const Icon = type === 'PAYMENT' ? CreditCard : CheckCircle2;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          disabled={loading}
          onPress={onPress}
          activeOpacity={0.85}
          style={[styles.button, type === 'PAYMENT' && styles.paymentButton]}
        >
          <Icon size={19} color="#FFFFFF" />
          <Text style={styles.text}>{loading ? 'Traitement…' : label}</Text>
        </TouchableOpacity>
      </View>
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
    shadowOpacity: 0.06,
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
    backgroundColor: '#072A20',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#072A20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentButton: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
  },
  text: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
