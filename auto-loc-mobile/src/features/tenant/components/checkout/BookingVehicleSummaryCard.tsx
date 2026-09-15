import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { MapPin, Star, Gauge, Fuel, Users, Sparkles } from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { formatDirectPrice } from '../../../../core/utils/currency';

interface BookingVehicleSummaryCardProps {
  photoUrl?: string;
  marque: string;
  modele: string;
  annee?: number;
  typeStr?: string;
  ville?: string;
  tenantPricePerDay: number;
  selectedCurrency?: string;
  note?: number;
  transmission?: string;
  carburant?: string;
  nombrePlaces?: number;
}

export const BookingVehicleSummaryCard: React.FC<BookingVehicleSummaryCardProps> = ({
  photoUrl,
  marque,
  modele,
  annee,
  typeStr = 'LUXE & VIP',
  ville = 'Dakar',
  tenantPricePerDay,
  selectedCurrency = 'XOF',
  note = 5.0,
  transmission = 'Automatique',
  carburant = 'Essence',
  nombrePlaces = 5,
}) => {
  const fullTitle = `${marque} ${modele}`.trim();
  const formattedPrice = formatDirectPrice(tenantPricePerDay, selectedCurrency as any);

  return (
    <View style={styles.cardContainer}>
      {/* 1. Hero Showcase Banner (Image 190px + Badges Flottants) */}
      <View style={styles.heroBannerBox}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.placeholderChar}>{marque.charAt(0)}</Text>
          </View>
        )}

        {/* Badge Catégorie Flottant (Top Left) */}
        <View style={styles.floatingCategoryBadge}>
          <Sparkles size={11} color="#D4AF37" />
          <Text style={styles.floatingCategoryText}>{typeStr.toUpperCase()}</Text>
        </View>

        {/* Badge Note Flottant (Top Right - Uniquement si note > 0) */}
        {note && note > 0 ? (
          <View style={styles.floatingRatingBadge}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.floatingRatingText}>{note.toFixed(1)}</Text>
            <Text style={styles.floatingRatingCount}>(Excellent)</Text>
          </View>
        ) : null}

        {/* Marque & Modèle avec Conteneur Flottant effet Blur / Glassmorphism */}
        <View style={styles.heroTitleOverlay}>
          <View style={styles.heroTitleRow}>
            <Text style={styles.heroTitleText} numberOfLines={1}>
              {fullTitle}
            </Text>
            {annee ? (
              <View style={styles.anneePill}>
                <Text style={styles.anneePillText}>{annee}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* 2. Corps de Carte : Spécifications & Attributs de Luxe */}
      <View style={styles.cardBody}>
        {/* Ligne Localisation */}
        <View style={styles.locationVerifiedRow}>
          <View style={styles.locationTag}>
            <MapPin size={13} color={theme.colors.brand.main} />
            <Text style={styles.locationText}>{ville}, Sénégal</Text>
          </View>
        </View>

        {/* Grille de Spécifications Clés (Alignement Strict sur Une Seule Ligne) */}
        <View style={styles.specsRow}>
          {transmission && (
            <View style={styles.specChip}>
              <Gauge size={12} color={theme.colors.brand.main} />
              <Text style={styles.specChipText} numberOfLines={1}>{transmission}</Text>
            </View>
          )}

          {carburant && (
            <View style={styles.specChip}>
              <Fuel size={12} color={theme.colors.brand.main} />
              <Text style={styles.specChipText} numberOfLines={1}>{carburant}</Text>
            </View>
          )}

          {nombrePlaces && (
            <View style={styles.specChip}>
              <Users size={12} color={theme.colors.brand.main} />
              <Text style={styles.specChipText} numberOfLines={1}>{nombrePlaces} places</Text>
            </View>
          )}
        </View>
      </View>

      {/* 3. Pied de Carte Sombre Ultra-Premium (#041912) */}
      <View style={styles.premiumFooterRibbon}>
        <View style={styles.priceLabelBox}>
          <Text style={styles.priceLabelSub} numberOfLines={1}>
            Tarif journalier locataire
          </Text>
        </View>

        <View style={styles.priceValueBox}>
          <View style={styles.priceAmountRow}>
            <Text style={styles.priceAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
              {formattedPrice}
            </Text>
            <Text style={styles.priceUnit}>/ jour</Text>
          </View>
        </View>
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
    overflow: 'hidden',
    ...theme.elevation.md,
  },
  heroBannerBox: {
    height: 190,
    width: '100%',
    position: 'relative',
    backgroundColor: '#041912',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    flex: 1,
    backgroundColor: '#041912',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderChar: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 54,
    color: '#E4EBDB',
  },
  imageDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(4, 25, 18, 0.45)',
  },
  floatingCategoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 25, 18, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 5,
  },
  floatingCategoryText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  floatingRatingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 4,
    ...theme.elevation.sm,
  },
  floatingRatingText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11.5,
    color: theme.primitives.forest[800],
  },
  floatingRatingCount: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: '#5F6B59',
  },
  heroTitleOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(4, 25, 18, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.lg,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroTitleText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 22,
    color: '#FFFFFF',
    flexShrink: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  anneePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  anneePillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  cardBody: {
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    backgroundColor: '#FFFFFF',
  },
  locationVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12.5,
    color: '#2C3A2E',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 6,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FBF4',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    gap: 4,
    flexShrink: 1,
  },
  specChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: theme.primitives.forest[800],
  },
  premiumFooterRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#041912',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: 'rgba(228, 235, 219, 0.2)',
  },
  priceLabelBox: {
    flex: 1,
    marginRight: theme.spacing[2],
    justifyContent: 'center',
  },
  priceLabelSub: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#E4EBDB',
  },
  priceValueBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 0,
  },
  priceAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceAmount: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 18,
    color: '#34D399',
    letterSpacing: -0.3,
  },
  priceUnit: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#A0B296',
  },
});

