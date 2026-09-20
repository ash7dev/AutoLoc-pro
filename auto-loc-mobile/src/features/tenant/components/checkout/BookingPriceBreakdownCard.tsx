import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { Wallet, CreditCard, CheckCircle2 } from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { formatDirectPrice } from '../../../../core/utils/currency';

export type TypeLivraison = 'AUCUNE' | 'DAKAR' | 'AIBD';

interface BookingPriceBreakdownCardProps {
  tenantPricePerDay: number;
  nbJours: number;

  typeLivraison?: TypeLivraison;
  fraisLivraisonDakar?: number;
  fraisLivraisonAibd?: number;
  isDeliverySelected?: boolean;
  fraisLivraison?: number;

  isHorsDakarSelected?: boolean;
  supplementHorsDakarParJour?: number;

  selectedCurrency?: string;
}

export const BookingPriceBreakdownCard: React.FC<BookingPriceBreakdownCardProps> = ({
  tenantPricePerDay,
  nbJours,
  typeLivraison,
  fraisLivraisonDakar = 0,
  fraisLivraisonAibd = 0,
  isDeliverySelected = false,
  fraisLivraison = 0,
  isHorsDakarSelected = false,
  supplementHorsDakarParJour = 0,
  selectedCurrency = 'XOF',
}) => {
  const numTenantPrice = Number(tenantPricePerDay) || 0;
  const numSupplementHorsDakar = Number(supplementHorsDakarParJour) || 0;

  // Calcul du tarif de livraison selon le type de livraison
  let deliveryFee = 0;
  let deliveryLabel = '';

  if (typeLivraison === 'DAKAR') {
    deliveryFee = Number(fraisLivraisonDakar || fraisLivraison || 0);
    deliveryLabel = 'Livraison Dakar (Ville)';
  } else if (typeLivraison === 'AIBD') {
    deliveryFee = Number(fraisLivraisonAibd || 0);
    deliveryLabel = 'Livraison Aéroport AIBD';
  } else if (isDeliverySelected) { // Legacy fallback
    deliveryFee = Number(fraisLivraison || 0);
    deliveryLabel = 'Livraison & Restitution à domicile';
  }

  const rentalBaseTotal = numTenantPrice * nbJours;
  const deliveryTotal = deliveryFee;
  const horsDakarTotal = isHorsDakarSelected ? numSupplementHorsDakar * nbJours : 0;

  const grandTotal = rentalBaseTotal + deliveryTotal + horsDakarTotal;
  const deposit30 = Math.round(grandTotal * 0.3);
  const remaining70 = grandTotal - deposit30;

  const fmtCurrency = (val: number) => formatDirectPrice(val, selectedCurrency as any);

  return (
    <View style={styles.cardContainer}>
      {/* En-tête : Badge Icône Sombre + Titre Fraunces + Currency Pill */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.titleIconBadge}>
            <Wallet size={14} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <Text style={styles.sectionTitle}>Récapitulatif des frais</Text>
        </View>
        <View style={styles.currencyPill}>
          <Text style={styles.currencyPillText}>{selectedCurrency}</Text>
        </View>
      </View>

      {/* Lignes de Détails des Frais */}
      <View style={styles.linesStack}>
        {/* Ligne 1 : Location de base */}
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel} numberOfLines={1}>
            Location ({nbJours} jour{nbJours > 1 ? 's' : ''} × {fmtCurrency(numTenantPrice)})
          </Text>
          <Text style={styles.feeValue}>{fmtCurrency(rentalBaseTotal)}</Text>
        </View>

        {/* Ligne 2 : Livraison (si sélectionnée) */}
        {deliveryLabel !== '' && (
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel} numberOfLines={1}>
              {deliveryLabel}
            </Text>
            <Text style={styles.feeValue}>
              {deliveryTotal === 0 ? 'Gratuit' : fmtCurrency(deliveryTotal)}
            </Text>
          </View>
        )}

        {/* Ligne 3 : Option Hors Dakar (si cochée) */}
        {isHorsDakarSelected && (
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel} numberOfLines={1}>
              Supplément Hors Dakar ({nbJours}j × {fmtCurrency(numSupplementHorsDakar)})
            </Text>
            <Text style={styles.feeValue}>{fmtCurrency(horsDakarTotal)}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Ligne Total Général */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total de la réservation</Text>
        <Text style={styles.totalValue}>{fmtCurrency(grandTotal)}</Text>
      </View>

      {/* Module Acompte 30% / Solde 70% Dark Obsidian */}
      <View style={styles.depositDarkModule}>
        {/* En-tête Acompte */}
        <View style={styles.depositTopRow}>
          <View style={styles.depositBadgeGroup}>
            <View style={styles.depositIconCircle}>
              <CreditCard size={14} color="#4ADE80" strokeWidth={2.25} />
            </View>
            <View>
              <Text style={styles.depositTitle}>Acompte à payer maintenant</Text>
              <Text style={styles.depositSubtitle}>30% pour bloquer la réservation</Text>
            </View>
          </View>
          <Text style={styles.depositAmount}>{fmtCurrency(deposit30)}</Text>
        </View>

        {/* Piste Visuelle de Progression 30% / 70% */}
        <View style={styles.progressTrack}>
          <View style={styles.progressFill30} />
        </View>

        {/* Pied Solde au Check-in */}
        <View style={styles.depositBottomRow}>
          <View style={styles.checkinGroup}>
            <CheckCircle2 size={13} color="rgba(255, 255, 255, 0.60)" />
            <Text style={styles.checkinText}>Solde dû à la remise des clés (70%)</Text>
          </View>
          <Text style={styles.checkinAmount}>{fmtCurrency(remaining70)}</Text>
        </View>
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
    justifyContent: 'space-between',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
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
  currencyPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  currencyPillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#059669',
  },
  linesStack: {
    gap: 10,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  feeLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#5F6B59',
    flex: 1,
  },
  feeValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#041912',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  totalLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: '#041912',
  },
  totalValue: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 20,
    color: '#041912',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.4,
  },
  /* Module Acompte 30% Dark Obsidian */
  depositDarkModule: {
    backgroundColor: '#041912',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.30)',
  },
  depositTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  depositBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  depositIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  depositSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  depositAmount: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 17,
    color: '#4ADE80',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
  },
  progressFill30: {
    width: '30%',
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 3,
  },
  depositBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 2,
  },
  checkinGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  checkinText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  checkinAmount: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12.5,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
});