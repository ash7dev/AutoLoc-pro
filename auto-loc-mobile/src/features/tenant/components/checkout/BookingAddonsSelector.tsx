import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Check, Truck, Navigation, MapPin, Zap } from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { formatDirectPrice } from '../../../../core/utils/currency';

interface BookingAddonsSelectorProps {
  hasDelivery?: boolean;
  fraisLivraison?: number;
  isDeliverySelected: boolean;
  onToggleDelivery: (val: boolean) => void;
  adresseLivraison?: string;
  onAdresseLivraisonChange?: (val: string) => void;

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
  adresseLivraison = '',
  onAdresseLivraisonChange,
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
      {/* En-tête de section avec badge sombre + titre Fraunces */}
      <View style={styles.headerRow}>
        <View style={styles.titleIconBadge}>
          <Zap size={14} color="#4ADE80" strokeWidth={2.25} />
        </View>
        <Text style={styles.sectionTitle}>Options complémentaires</Text>
      </View>

      <View style={styles.optionsList}>
        {/* Option 1 : Livraison à Domicile */}
        {showDelivery && (
          <View style={styles.addonWrapper}>
            <TouchableOpacity
              style={[styles.addonCard, isDeliverySelected && styles.addonCardActive]}
              onPress={() => onToggleDelivery(!isDeliverySelected)}
              activeOpacity={0.85}
            >
              <View style={styles.iconCircle}>
                <Truck size={13} color="#4ADE80" strokeWidth={2.25} />
              </View>

              <View style={styles.addonTextGroup}>
                <Text style={styles.addonTitle}>Livraison & Restitution</Text>
                <Text style={styles.addonSubtitle}>
                  Remise des clés à l'adresse de votre choix ou à l'aéroport
                </Text>
              </View>

              <View style={styles.addonRightBox}>
                <View style={[styles.priceBadgePill, isDeliverySelected && styles.priceBadgePillActive]}>
                  <Text style={styles.priceBadgeText}>
                    {fraisLivraison === 0 ? 'Gratuit' : `+${formattedDeliveryFee}`}
                  </Text>
                </View>
                <View style={[styles.checkboxIndicator, isDeliverySelected && styles.checkboxIndicatorActive]}>
                  {isDeliverySelected && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </View>
            </TouchableOpacity>

            {/* Champ Saisie Adresse si Livraison cochée */}
            {isDeliverySelected && (
              <View style={styles.addressInputContainer}>
                <View style={styles.addressHeaderRow}>
                  <MapPin size={13} color="#059669" strokeWidth={2.25} />
                  <Text style={styles.addressLabel}>Adresse exacte de livraison *</Text>
                </View>
                <TextInput
                  style={styles.addressInput}
                  value={adresseLivraison}
                  onChangeText={onAdresseLivraisonChange}
                  placeholder="Ex: Les Almadies, Villa 12 / Aéroport DSS..."
                  placeholderTextColor="#94A3B8"
                />
              </View>
            )}
          </View>
        )}

        {/* Option 2 : Voyage Hors Dakar */}
        {showHorsDakar && (
          <TouchableOpacity
            style={[styles.addonCard, isHorsDakarSelected && styles.addonCardActive]}
            onPress={() => onToggleHorsDakar(!isHorsDakarSelected)}
            activeOpacity={0.85}
          >
            <View style={styles.iconCircle}>
              <Navigation size={13} color="#4ADE80" strokeWidth={2.25} />
            </View>

            <View style={styles.addonTextGroup}>
              <Text style={styles.addonTitle}>Voyage Hors Dakar</Text>
              <Text style={styles.addonSubtitle}>
                {supplementHorsDakarParJour && supplementHorsDakarParJour > 0
                  ? `${formattedHorsDakarDaily} / jour · Trajets interurbains`
                  : 'Autorisé sans supplément'}
              </Text>
            </View>

            <View style={styles.addonRightBox}>
              <View style={[styles.priceBadgePill, isHorsDakarSelected && styles.priceBadgePillActive]}>
                <Text style={styles.priceBadgeText}>
                  {supplementHorsDakarParJour === 0 ? 'Inclus' : `+${formattedHorsDakarFee}`}
                </Text>
              </View>
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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E4EBDB',
    padding: 16,
    gap: 14,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
    fontSize: 17.5,
    color: '#041912',
    letterSpacing: -0.3,
  },
  optionsList: {
    gap: 12,
  },
  addonWrapper: {
    gap: 10,
  },
  addonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  addonCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  addonTextGroup: {
    flex: 1,
    gap: 2,
  },
  addonTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: '#041912',
    letterSpacing: -0.2,
  },
  addonSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#5F6B59',
    lineHeight: 16,
  },
  addonRightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceBadgePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priceBadgePillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#A7F3D0',
  },
  priceBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#059669',
  },
  checkboxIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxIndicatorActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  /* Saisie Adresse de Livraison */
  addressInputContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  addressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressLabel: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#041912',
  },
  addressInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#041912',
  },
});
