import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
} from 'react-native';
import { Navigation, Truck, Zap, CheckCircle2 } from 'lucide-react-native';
import { CurrencyCode, formatDirectPrice } from '../../../core/utils/currency';
import { theme } from '../../../core/theme';

export interface VehicleOptionsCardProps {
  autoriseHorsDakar?: boolean | null;
  supplementHorsDakarParJour?: number | null;
  fraisLivraison?: number | null;
  selectedCurrency: CurrencyCode;
}

export const VehicleOptionsCard: React.FC<VehicleOptionsCardProps> = ({
  autoriseHorsDakar,
  supplementHorsDakarParJour,
  fraisLivraison,
  selectedCurrency,
}) => {
  const hasHorsDakar = Boolean(autoriseHorsDakar || (supplementHorsDakarParJour && supplementHorsDakarParJour > 0));
  const hasLivraison = fraisLivraison !== undefined && fraisLivraison !== null && fraisLivraison >= 0;

  // Si ni l'option Hors Dakar ni la livraison ne sont présentes, on masque le composant
  if (!hasHorsDakar && !hasLivraison) {
    return null;
  }

  const supplementHorsDakarText = supplementHorsDakarParJour && supplementHorsDakarParJour > 0
    ? `+ ${formatDirectPrice(supplementHorsDakarParJour, selectedCurrency)} / j`
    : 'Autorisé sans frais';

  const fraisLivraisonText = fraisLivraison && fraisLivraison > 0
    ? `+ ${formatDirectPrice(fraisLivraison, selectedCurrency)}`
    : 'Livraison Gratuite';

  return (
    <View style={styles.container}>
      {/* En-tête de section */}
      <View style={styles.headerRow}>
        <View style={styles.titleIconBadge}>
          <Zap size={14} color="#4ADE80" strokeWidth={2.25} />
        </View>
        <Text style={styles.sectionTitle}>Options & Services</Text>
      </View>

      {/* Grille des cartes d'options premium */}
      <View style={styles.optionsGrid}>
        {/* Option 1 : Déplacement Hors Dakar */}
        {hasHorsDakar && (
          <View style={styles.optionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Navigation size={13} color="#4ADE80" strokeWidth={2.25} />
              </View>
              <View style={styles.cardHeaderContent}>
                <Text style={styles.optionTitle}>Déplacement Hors Dakar</Text>
                <View style={styles.badgePill}>
                  <CheckCircle2 size={11} color="#059669" />
                  <Text style={styles.badgeText}>{supplementHorsDakarText}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.optionDescription}>
              Autorisé pour vos trajets interurbains à travers le Sénégal.
            </Text>
          </View>
        )}

        {/* Option 2 : Livraison & Restitution */}
        {hasLivraison && (
          <View style={styles.optionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Truck size={13} color="#4ADE80" strokeWidth={2.25} />
              </View>
              <View style={styles.cardHeaderContent}>
                <Text style={styles.optionTitle}>Livraison & Restitution</Text>
                <View style={[styles.badgePill, (fraisLivraison ?? 0) === 0 && styles.freeBadgePill]}>
                  <CheckCircle2 size={11} color={(fraisLivraison ?? 0) === 0 ? '#059669' : '#041912'} />
                  <Text style={[styles.badgeText, (fraisLivraison ?? 0) === 0 && styles.freeBadgeText]}>
                    {fraisLivraisonText}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.optionDescription}>
              Faites-vous livrer le véhicule à l'adresse de votre choix ou à l'aéroport.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
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
    fontSize: 17.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
    letterSpacing: -0.3,
    flex: 1,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4EBDB',
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
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
  cardHeaderContent: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: '#041912',
    letterSpacing: -0.2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#059669',
  },
  freeBadgePill: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  freeBadgeText: {
    color: '#059669',
  },
  optionDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: '#5F6B59',
    lineHeight: 18,
    marginLeft: 42,
  },
});
