import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { Smartphone, Check } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

export type PaymentGateway = 'WAVE' | 'ORANGE_MONEY';

interface BookingPaymentGatewaySelectorProps {
  selectedGateway: PaymentGateway;
  onSelectGateway: (g: PaymentGateway) => void;
}

const waveLogo = require('../../../../../assets/images/payment/wave.png');
const orangeMoneyLogo = require('../../../../../assets/images/payment/orange_money.jpg');

export const BookingPaymentGatewaySelector: React.FC<BookingPaymentGatewaySelectorProps> = ({
  selectedGateway,
  onSelectGateway,
}) => {
  const GATEWAYS: { id: PaymentGateway; label: string; sub: string; logo: any }[] = [
    {
      id: 'WAVE',
      label: 'Wave Sénégal',
      sub: 'Paiement sans frais via l’application Wave',
      logo: waveLogo,
    },
    {
      id: 'ORANGE_MONEY',
      label: 'Orange Money',
      sub: 'Paiement sécurisé via code OTP / OM',
      logo: orangeMoneyLogo,
    },
  ];

  return (
    <View style={styles.cardContainer}>
      {/* En-tête de section avec badge icône sombre + Fraunces */}
      <View style={styles.headerRow}>
        <View style={styles.titleIconBadge}>
          <Smartphone size={14} color="#4ADE80" strokeWidth={2.25} />
        </View>
        <Text style={styles.sectionTitle}>Moyen de paiement</Text>
      </View>

      <View style={styles.gatewayList}>
        {GATEWAYS.map((g) => {
          const isSelected = selectedGateway === g.id;
          return (
            <TouchableOpacity
              key={g.id}
              style={[styles.gatewayCard, isSelected && styles.gatewayCardActive]}
              onPress={() => onSelectGateway(g.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.radio, isSelected && styles.radioActive]}>
                {isSelected && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
              </View>

              <View style={styles.logoWrapper}>
                <Image source={g.logo} style={styles.logoImage} resizeMode="contain" />
              </View>

              <View style={styles.gatewayInfo}>
                <Text style={styles.gatewayTitle}>{g.label}</Text>
                <Text style={styles.gatewaySub}>{g.sub}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E4EBDB',
    padding: 16,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15.5,
    color: '#041912',
    letterSpacing: -0.3,
  },
  gatewayList: {
    gap: 12,
  },
  gatewayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  gatewayCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  logoWrapper: {
    width: 44,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    padding: 3,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  gatewayInfo: {
    flex: 1,
    gap: 2,
  },
  gatewayTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: '#041912',
    letterSpacing: -0.2,
  },
  gatewaySub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#5F6B59',
  },
});
