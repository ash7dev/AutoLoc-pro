import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowRight, CheckCircle2, ChevronRight, CreditCard, ShieldCheck } from 'lucide-react-native';
import { theme } from '../../../core/theme';

export interface TenantBookingStickyActionProps {
  visible: boolean;
  loading: boolean;
  onPress: () => void;
  label?: string;
  subtitle?: string;
  type?: 'CHECKIN' | 'PAYMENT';
}

export const TenantBookingStickyAction: React.FC<TenantBookingStickyActionProps> = ({
  visible,
  loading,
  onPress,
  label = 'Confirmer la prise en charge',
  subtitle = 'Inspectez le véhicule puis validez la remise des clés',
  type = 'CHECKIN',
}) => {
  if (!visible) return null;

  const Icon = type === 'PAYMENT' ? CreditCard : CheckCircle2;
  const isPayment = type === 'PAYMENT';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Contextual Header Eyebrow with Pulse Dot */}
        <View style={styles.contextHeader}>
          <View style={styles.pulseDotWrapper}>
            <View style={styles.pulseDot} />
          </View>
          <Text style={styles.contextEyebrow}>
            {isPayment ? 'ACTION REQUISE · RÈGLEMENT' : 'ACTION REQUISE · REMISE DES CLÉS'}
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={onPress}
          activeOpacity={0.88}
          style={[styles.button, isPayment ? styles.paymentButton : styles.checkinButton]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Icon size={19} color="#FFFFFF" />
              <View style={styles.labelWrapper}>
                <Text style={styles.buttonText}>{label}</Text>
              </View>
              <View style={[styles.arrowCircle, isPayment ? styles.arrowCirclePayment : styles.arrowCircleCheckin]}>
                <ChevronRight size={14} color={isPayment ? '#A7F3D0' : '#A7F3D0'} />
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#04150F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  pulseDotWrapper: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  contextEyebrow: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    letterSpacing: 0.7,
    color: '#A7F3D0',
  },
  button: {
    minHeight: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    gap: 10,
  },
  checkinButton: {
    backgroundColor: '#059669',
    borderWidth: 1,
    borderColor: '#34D399',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  paymentButton: {
    backgroundColor: '#059669',
    borderWidth: 1,
    borderColor: '#34D399',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  labelWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14.5,
    letterSpacing: 0.2,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircleCheckin: {
    backgroundColor: 'rgba(5, 150, 105, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.40)',
  },
  arrowCirclePayment: {
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
});
