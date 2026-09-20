import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Check, Truck, Navigation, MapPin, Zap, Plane, Home } from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { formatDirectPrice } from '../../../../core/utils/currency';

export type TypeLivraison = 'AUCUNE' | 'DAKAR' | 'AIBD';

interface BookingAddonsSelectorProps {
  proposeLivraisonDakar?: boolean;
  fraisLivraisonDakar?: number;
  proposeLivraisonAibd?: boolean;
  fraisLivraisonAibd?: number;
  // Options legacy
  hasDelivery?: boolean;
  fraisLivraison?: number;

  typeLivraison: TypeLivraison;
  onSelectTypeLivraison: (val: TypeLivraison) => void;
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
  proposeLivraisonDakar,
  fraisLivraisonDakar,
  proposeLivraisonAibd,
  fraisLivraisonAibd,
  hasDelivery = false,
  fraisLivraison = 0,
  typeLivraison = 'AUCUNE',
  onSelectTypeLivraison,
  adresseLivraison = '',
  onAdresseLivraisonChange,
  autoriseHorsDakar = false,
  supplementHorsDakarParJour = 0,
  isHorsDakarSelected,
  onToggleHorsDakar,
  nbJours,
  selectedCurrency = 'XOF',
}) => {
  const canDeliverDakar = proposeLivraisonDakar ?? (hasDelivery || (fraisLivraison ?? 0) > 0);
  const actualFraisDakar = fraisLivraisonDakar ?? fraisLivraison ?? 0;
  const canDeliverAibd = Boolean(proposeLivraisonAibd);
  const actualFraisAibd = fraisLivraisonAibd ?? 0;

  const hasAnyDelivery = canDeliverDakar || canDeliverAibd;
  const showHorsDakar = autoriseHorsDakar && (supplementHorsDakarParJour ?? 0) >= 0;

  if (!hasAnyDelivery && !showHorsDakar) {
    return null;
  }

  const fmtCurrency = (val: number) => formatDirectPrice(val, selectedCurrency as any);
  const totalHorsDakar = (supplementHorsDakarParJour || 0) * nbJours;

  return (
    <View style={styles.cardContainer}>
      {/* En-tête de section */}
      <View style={styles.headerRow}>
        <View style={styles.titleIconBadge}>
          <Zap size={11} color="#4ADE80" strokeWidth={2.25} />
        </View>
        <Text style={styles.sectionTitle}>Options & Services</Text>
      </View>

      <View style={styles.optionsList}>
        {/* Section Modes de Prise en Main / Livraison */}
        {hasAnyDelivery && (
          <View style={styles.deliverySection}>
            <Text style={styles.subSectionTitle}>Lieu de prise en main</Text>

            {/* Option 1: Adresse du véhicule (Gratuit) */}
            <TouchableOpacity
              style={[styles.addonCard, typeLivraison === 'AUCUNE' && styles.addonCardActive]}
              onPress={() => onSelectTypeLivraison('AUCUNE')}
              activeOpacity={0.85}
            >
              <View style={styles.iconCircle}>
                <Home size={11} color="#4ADE80" strokeWidth={2.25} />
              </View>
              <View style={styles.addonTextGroup}>
                <Text style={styles.addonTitle}>Prise en main à l'adresse</Text>
                <Text style={styles.addonSubtitle}>Récupération directe chez le propriétaire</Text>
              </View>
              <View style={styles.addonRightBox}>
                <View style={[styles.priceBadgePill, typeLivraison === 'AUCUNE' && styles.priceBadgePillActive]}>
                  <Text style={styles.priceBadgeText}>Gratuit</Text>
                </View>
                <View style={[styles.checkboxIndicator, typeLivraison === 'AUCUNE' && styles.checkboxIndicatorActive]}>
                  {typeLivraison === 'AUCUNE' && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </View>
            </TouchableOpacity>

            {/* Option 2: Livraison Dakar */}
            {canDeliverDakar && (
              <TouchableOpacity
                style={[styles.addonCard, typeLivraison === 'DAKAR' && styles.addonCardActive]}
                onPress={() => onSelectTypeLivraison('DAKAR')}
                activeOpacity={0.85}
              >
                <View style={styles.iconCircle}>
                  <Truck size={11} color="#4ADE80" strokeWidth={2.25} />
                </View>
                <View style={styles.addonTextGroup}>
                  <Text style={styles.addonTitle}>Livraison sur Dakar (Ville)</Text>
                  <Text style={styles.addonSubtitle}>Remise des clés à votre domicile ou hôtel</Text>
                </View>
                <View style={styles.addonRightBox}>
                  <View style={[styles.priceBadgePill, typeLivraison === 'DAKAR' && styles.priceBadgePillActive]}>
                    <Text style={styles.priceBadgeText}>
                      {actualFraisDakar === 0 ? 'Gratuit' : `+${fmtCurrency(actualFraisDakar)}`}
                    </Text>
                  </View>
                  <View style={[styles.checkboxIndicator, typeLivraison === 'DAKAR' && styles.checkboxIndicatorActive]}>
                    {typeLivraison === 'DAKAR' && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Option 3: Livraison Aéroport AIBD */}
            {canDeliverAibd && (
              <TouchableOpacity
                style={[styles.addonCard, typeLivraison === 'AIBD' && styles.addonCardActive]}
                onPress={() => onSelectTypeLivraison('AIBD')}
                activeOpacity={0.85}
              >
                <View style={styles.iconCircle}>
                  <Plane size={11} color="#4ADE80" strokeWidth={2.25} />
                </View>
                <View style={styles.addonTextGroup}>
                  <Text style={styles.addonTitle}>Livraison Aéroport AIBD</Text>
                  <Text style={styles.addonSubtitle}>Accueil à la sortie du terminal avec la voiture</Text>
                </View>
                <View style={styles.addonRightBox}>
                  <View style={[styles.priceBadgePill, typeLivraison === 'AIBD' && styles.priceBadgePillActive]}>
                    <Text style={styles.priceBadgeText}>
                      {actualFraisAibd === 0 ? 'Gratuit' : `+${fmtCurrency(actualFraisAibd)}`}
                    </Text>
                  </View>
                  <View style={[styles.checkboxIndicator, typeLivraison === 'AIBD' && styles.checkboxIndicatorActive]}>
                    {typeLivraison === 'AIBD' && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Champ Saisie Adresse uniquement pour la livraison Dakar */}
            {typeLivraison === 'DAKAR' && (
              <View style={styles.addressInputContainer}>
                <View style={styles.addressHeaderRow}>
                  <MapPin size={11} color="#059669" strokeWidth={2.25} />
                  <Text style={styles.addressLabel}>Adresse exacte de livraison *</Text>
                </View>
                <TextInput
                  style={styles.addressInput}
                  value={adresseLivraison}
                  onChangeText={onAdresseLivraisonChange}
                  placeholder="Ex: Les Almadies, Villa 12 / Ngor..."
                  placeholderTextColor="#94A3B8"
                />
              </View>
            )}
          </View>
        )}

        {/* Option Voyage Hors Dakar */}
        {showHorsDakar && (
          <View style={{ gap: 6, marginTop: hasAnyDelivery ? 6 : 0 }}>
            {hasAnyDelivery && <Text style={styles.subSectionTitle}>Zone de circulation</Text>}
            <TouchableOpacity
              style={[styles.addonCard, isHorsDakarSelected && styles.addonCardActive]}
              onPress={() => onToggleHorsDakar(!isHorsDakarSelected)}
              activeOpacity={0.85}
            >
              <View style={styles.iconCircle}>
                <Navigation size={11} color="#4ADE80" strokeWidth={2.25} />
              </View>

              <View style={styles.addonTextGroup}>
                <Text style={styles.addonTitle}>Voyage Hors Dakar</Text>
                <Text style={styles.addonSubtitle}>
                  {supplementHorsDakarParJour && supplementHorsDakarParJour > 0
                    ? `${fmtCurrency(supplementHorsDakarParJour)} / jour · Trajets interurbains`
                    : 'Autorisé sans supplément'}
                </Text>
              </View>

              <View style={styles.addonRightBox}>
                <View style={[styles.priceBadgePill, isHorsDakarSelected && styles.priceBadgePillActive]}>
                  <Text style={styles.priceBadgeText}>
                    {supplementHorsDakarParJour === 0 ? 'Inclus' : `+${fmtCurrency(totalHorsDakar)}`}
                  </Text>
                </View>
                <View style={[styles.checkboxIndicator, isHorsDakarSelected && styles.checkboxIndicatorActive]}>
                  {isHorsDakarSelected && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </View>
            </TouchableOpacity>
          </View>
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
    width: 22,
    height: 22,
    borderRadius: 7,
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
  deliverySection: {
    gap: 10,
  },
  subSectionTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12.5,
    color: '#5F6B59',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
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
    width: 24,
    height: 24,
    borderRadius: 7,
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
    fontSize: 14.5,
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
  addressInputContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 12,
    gap: 8,
    marginTop: 4,
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

