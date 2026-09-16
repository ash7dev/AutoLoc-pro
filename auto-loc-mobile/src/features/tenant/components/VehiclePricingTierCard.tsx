import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { TrendingDown, Zap, Clock, Sparkles } from 'lucide-react-native';
import { TarifTierDetail } from '../hooks/useVehicleDetail';
import { CurrencyCode, getTenantPricePerDay, formatDirectPrice } from '../../../core/utils/currency';

interface VehiclePricingTierCardProps {
  tarifsProgressifs?: TarifTierDetail[];
  baseOwnerPrice: number;
  selectedCurrency: CurrencyCode;
}

export const VehiclePricingTierCard: React.FC<VehiclePricingTierCardProps> = ({
  tarifsProgressifs = [],
  baseOwnerPrice,
  selectedCurrency,
}) => {
  // Si le serveur backend ne renvoie aucun tarif dégressif pour ce véhicule, on masque la section
  if (!tarifsProgressifs || tarifsProgressifs.length === 0) {
    return null;
  }

  const standardTenantPrice = getTenantPricePerDay(baseOwnerPrice);

  const displayTiers = tarifsProgressifs.map((t) => {
    const priceVal = getTenantPricePerDay(Number(t.prix));
    const saving = Math.max(0, Math.round(((standardTenantPrice - priceVal) / standardTenantPrice) * 100));
    const label = t.joursMax
      ? `${t.joursMin} à ${t.joursMax} jours`
      : `${t.joursMin}+ jours`;

    return {
      id: t.id || `tier-${t.joursMin}`,
      label,
      tenantPrix: priceVal,
      savingPct: saving,
    };
  });

  const basePrice = standardTenantPrice;
  const minPrice = Math.min(...displayTiers.map((t) => t.tenantPrix));
  const hasDiscount = basePrice > minPrice;
  const maxSavingPct = Math.max(...displayTiers.map((t) => t.savingPct));

  return (
    <View style={styles.container}>
      {/* En-tête de Section */}
      <View style={styles.headerTop}>
        <View style={styles.titleBox}>
          <Text style={styles.sectionTitle}>Tarifs dégressifs par durée</Text>
          <Text style={styles.subtitleText}>
            {hasDiscount ? (
              <>
                Économisez jusqu'à{' '}
                <Text style={styles.discountHighlight}>−{maxSavingPct}%</Text> sur vos longs séjours
              </>
            ) : (
              'Tarif fixe garanti'
            )}
          </Text>
        </View>

        <View style={styles.headerBadge}>
          <TrendingDown size={13} color="#16A34A" />
          <Text style={styles.headerBadgeText}>Plus longtemps = Moins cher</Text>
        </View>
      </View>

      {/* Grille de cartes de paliers dégressifs */}
      <View style={styles.tiersContainer}>
        {displayTiers.map((tier) => {
          const isLowest = tier.tenantPrix === minPrice && hasDiscount;
          const formattedPrice = formatDirectPrice(tier.tenantPrix, selectedCurrency);
          const barPct = hasDiscount
            ? Math.round(20 + ((basePrice - tier.tenantPrix) / Math.max(1, basePrice - minPrice)) * 80)
            : 100;

          return (
            <View
              key={tier.id}
              style={[
                styles.tierCard,
                isLowest ? styles.tierCardFeatured : styles.tierCardStandard,
              ]}
            >
              {/* Badge Meilleur Tarif */}
              {isLowest && (
                <View style={styles.bestPriceBadge}>
                  <Zap size={11} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.bestPriceText}>MEILLEUR TARIF</Text>
                </View>
              )}

              <View style={styles.cardMainRow}>
                {/* Durée avec icône Horloge */}
                <View style={styles.durationBox}>
                  <View
                    style={[
                      styles.clockIconBox,
                      isLowest ? styles.clockIconFeatured : styles.clockIconStandard,
                    ]}
                  >
                    <Clock
                      size={15}
                      color={isLowest ? '#FFFFFF' : '#041912'}
                    />
                  </View>
                  <Text style={styles.durationLabel}>{tier.label}</Text>
                </View>

                {/* Prix & Réduction */}
                <View style={styles.priceContainer}>
                  {tier.savingPct > 0 && (
                    <View
                      style={[
                        styles.savingBadge,
                        isLowest ? styles.savingBadgeFeatured : styles.savingBadgeStandard,
                      ]}
                    >
                      <Text
                        style={[
                          styles.savingBadgeText,
                          isLowest ? styles.savingBadgeTextFeatured : styles.savingBadgeTextStandard,
                        ]}
                      >
                        −{tier.savingPct}%
                      </Text>
                    </View>
                  )}
                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{formattedPrice}</Text>
                    <Text style={styles.perDayText}>/j</Text>
                  </View>
                </View>
              </View>

              {/* Barre d'indicateur visuel de progression */}
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${barPct}%` },
                    isLowest ? styles.progressFeatured : styles.progressStandard,
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Note d'information automatique */}
      <View style={styles.footerNote}>
        <Sparkles size={13} color="#16A34A" />
        <Text style={styles.footerNoteText}>
          Le tarif dégressif s'applique automatiquement lors du choix de vos dates
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    marginBottom: 16,
    gap: 10,
  },
  titleBox: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#041912',
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 13,
    color: '#5F6B59',
    marginTop: 3,
    fontWeight: '500',
  },
  discountHighlight: {
    color: '#16A34A',
    fontWeight: '800',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  headerBadgeText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  tiersContainer: {
    gap: 10,
  },
  tierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4EBDB',
    position: 'relative',
    overflow: 'hidden',
  },
  tierCardStandard: {
    borderColor: '#E4EBDB',
  },
  tierCardFeatured: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F4FBF7',
  },
  bestPriceBadge: {
    position: 'absolute',
    top: 0,
    right: 14,
    backgroundColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bestPriceText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 2,
  },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clockIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockIconStandard: {
    backgroundColor: '#F1F6EA',
  },
  clockIconFeatured: {
    backgroundColor: '#16A34A',
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#041912',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  savingBadgeStandard: {
    backgroundColor: '#041912',
  },
  savingBadgeFeatured: {
    backgroundColor: '#16A34A',
  },
  savingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  savingBadgeTextStandard: {
    color: '#FFFFFF',
  },
  savingBadgeTextFeatured: {
    color: '#FFFFFF',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16A34A',
  },
  perDayText: {
    fontSize: 11,
    color: '#5F6B59',
    fontWeight: '500',
    marginLeft: 1,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#E4EBDB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressStandard: {
    backgroundColor: '#A8D5C1',
  },
  progressFeatured: {
    backgroundColor: '#16A34A',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  footerNoteText: {
    fontSize: 11.5,
    color: '#5F6B59',
    fontWeight: '500',
  },
});
