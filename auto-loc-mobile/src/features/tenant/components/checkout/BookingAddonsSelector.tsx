import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Check, Truck, Navigation } from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { formatDirectPrice } from '../../../../core/utils/currency';

interface BookingAddonsSelectorProps {
  hasDelivery?: boolean;
  fraisLivraison?: number;
  isDeliverySelected: boolean;
  onToggleDelivery: (val: boolean) => void;

  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number;
  isHorsDakarSelected: boolean;
  onToggleHorsDakar: (val: boolean) => void;

  nbJours: number;
  selectedCurrency?: string;
}

export const BookingAddonsSelector: React.FC<BookingAddonsSelectorProps> = ({
  hasDelivery = false,
  fraisLivraison = 0,
  isDeliverySelected,
  onToggleDelivery,
  autoriseHorsDakar = false,
  supplementHorsDakarParJour = 0,
  isHorsDakarSelected,
  onToggleHorsDakar,
  nbJours,
  selectedCurrency = 'XOF',
}) => {
  const showDelivery = hasDelivery && (fraisLivraison ?? 0) >= 0;
  const showHorsDakar = autoriseHorsDakar && (supplementHorsDakarParJour ?? 0) >= 0;

  if (!showDelivery && !showHorsDakar) {
    return null;
  }

  const formattedDeliveryFee = formatDirectPrice(fraisLivraison, selectedCurrency as any);
  const totalHorsDakar = (supplementHorsDakarParJour || 0) * nbJours;
  const formattedHorsDakarFee = formatDirectPrice(totalHorsDakar, selectedCurrency as any);
  const formattedHorsDakarDaily = formatDirectPrice(supplementHorsDakarParJour, selectedCurrency as any);

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.sectionTitle}>Options complémentaires</Text>

      <View style={styles.optionsList}>
        {/* Option 1 : Livraison à Domicile */}
        {showDelivery && (
          <TouchableOpacity
            style={[styles.addonCard, isDeliverySelected && styles.addonCardActive]}
            onPress={() => onToggleDelivery(!isDeliverySelected)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconCircle, isDeliverySelected && styles.iconCircleActive]}>
              <Truck size={17} color={isDeliverySelected ? theme.colors.brand.main : '#5F6B59'} />
            </View>

            <View style={styles.addonTextGroup}>
              <Text style={styles.addonTitle}>Livraison à domicile</Text>
              <Text style={styles.addonSubtitle}>Remise des clés à l'adresse de votre choix</Text>
            </View>

            <View style={styles.addonRightBox}>
              <Text style={[styles.addonPriceText, isDeliverySelected && styles.addonPriceTextActive]}>
                {fraisLivraison === 0 ? 'Gratuit' : `+${formattedDeliveryFee}`}
              </Text>
              <View style={[styles.checkboxIndicator, isDeliverySelected && styles.checkboxIndicatorActive]}>
                {isDeliverySelected && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Option 2 : Voyage Hors Dakar */}
        {showHorsDakar && (
          <TouchableOpacity
            style={[styles.addonCard, isHorsDakarSelected && styles.addonCardActive]}
            onPress={() => onToggleHorsDakar(!isHorsDakarSelected)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconCircle, isHorsDakarSelected && styles.iconCircleActive]}>
              <Navigation size={17} color={isHorsDakarSelected ? theme.colors.brand.main : '#5F6B59'} />
            </View>

            <View style={styles.addonTextGroup}>
              <Text style={styles.addonTitle}>Voyage Hors Dakar</Text>
              <Text style={styles.addonSubtitle}>
                {formattedHorsDakarDaily} / jour · Régions du Sénégal
              </Text>
            </View>

            <View style={styles.addonRightBox}>
              <Text style={[styles.addonPriceText, isHorsDakarSelected && styles.addonPriceTextActive]}>
                +{formattedHorsDakarFee}
              </Text>
              <View style={[styles.checkboxIndicator, isHorsDakarSelected && styles.checkboxIndicatorActive]}>
                {isHorsDakarSelected && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: '#E4EBDB',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    ...theme.elevation.md,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: theme.primitives.forest[800],
  },
  optionsList: {
    gap: 10,
  },
  addonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FBF4',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    gap: 12,
  },
  addonCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: theme.colors.brand.main,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleActive: {
    borderColor: theme.colors.brand.border,
    backgroundColor: theme.colors.brand.subtle,
  },
  addonTextGroup: {
    flex: 1,
    gap: 2,
  },
  addonTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: theme.primitives.forest[800],
  },
  addonSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#5F6B59',
  },
  addonRightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addonPriceText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#5F6B59',
  },
  addonPriceTextActive: {
    color: theme.colors.brand.main,
  },
  checkboxIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#BDC8B7',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxIndicatorActive: {
    backgroundColor: theme.colors.brand.main,
    borderColor: theme.colors.brand.main,
  },
});
