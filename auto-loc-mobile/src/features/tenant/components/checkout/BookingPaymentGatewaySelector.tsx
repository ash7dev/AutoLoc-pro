import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
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
      sub: 'Paiement sans frais via Wave App',
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
      <View style={styles.headerRow}>
        <Smartphone size={16} color={theme.colors.brand.main} />
        <Text style={styles.sectionLabelText}>CHOIX DU MOYEN DE PAIEMENT</Text>
      </View>

      <View style={styles.gatewayList}>
        {GATEWAYS.map((g) => {
          const isSelected = selectedGateway === g.id;
          return (
            <TouchableOpacity
              key={g.id}
              style={[styles.gatewayCard, isSelected && styles.gatewayCardActive]}
              onPress={() => onSelectGateway(g.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.radio, isSelected && styles.radioActive]}>
                {isSelected && <Check size={11} color="#FFFFFF" />}
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
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: '#E4EBDB',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    ...theme.elevation.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabelText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#7D8975',
    letterSpacing: 0.6,
  },
  gatewayList: {
    gap: theme.spacing[3],
  },
  gatewayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FBF4',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    gap: theme.spacing[3],
  },
  gatewayCardActive: {
    backgroundColor: '#F1F8EE',
    borderColor: theme.colors.brand.main,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#9EAD96',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioActive: {
    backgroundColor: theme.colors.brand.main,
    borderColor: theme.colors.brand.main,
  },
  logoWrapper: {
    width: 42,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4EBDB',
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
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: theme.primitives.forest[800],
  },
  gatewaySub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#5F6B59',
  },
});
