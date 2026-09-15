import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, Wallet } from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { formatDirectPrice } from '../../../../core/utils/currency';

interface BookingPriceBreakdownCardProps {
  tenantPricePerDay: number;
  nbJours: number;

  isDeliverySelected?: boolean;
  fraisLivraison?: number;

  isHorsDakarSelected?: boolean;
  supplementHorsDakarParJour?: number;

  selectedCurrency?: string;
}

// Alignée sur la palette Émeraude & Forest Web (#10B981 / #059669)
const ACCENT = '#10B981';
const ACCENT_LIGHT = '#34D399';
const ACCENT_SOFT = 'rgba(16, 185, 129, 0.16)';
const ACCENT_BORDER = 'rgba(16, 185, 129, 0.35)';

export const BookingPriceBreakdownCard: React.FC<BookingPriceBreakdownCardProps> = ({
  tenantPricePerDay,
  nbJours,
  isDeliverySelected = false,
  fraisLivraison = 0,
  isHorsDakarSelected = false,
  supplementHorsDakarParJour = 0,
  selectedCurrency = 'XOF',
}) => {
  const numTenantPrice = Number(tenantPricePerDay) || 0;
  const numFraisLivraison = Number(fraisLivraison) || 0;
  const numSupplementHorsDakar = Number(supplementHorsDakarParJour) || 0;

  const rentalBaseTotal = numTenantPrice * nbJours;
  const deliveryTotal = isDeliverySelected ? numFraisLivraison : 0;
  const horsDakarTotal = isHorsDakarSelected ? numSupplementHorsDakar * nbJours : 0;

  const grandTotal = rentalBaseTotal + deliveryTotal + horsDakarTotal;
  const deposit30 = Math.round(grandTotal * 0.3);
  const remaining70 = grandTotal - deposit30;

  const fmtCurrency = (val: number) => formatDirectPrice(val, selectedCurrency as any);

  return (
    <LinearGradient
      colors={['#0A2419', '#041912', '#03130D']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.darkGlassCard}
    >
      {/* Filet de lumière en haut, effet "verre" */}
      <LinearGradient
        colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']}
        style={styles.sheenOverlay}
        pointerEvents="none"
      />

      {/* En-tête */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBadge}>
            <Wallet size={15} color={ACCENT} strokeWidth={2.25} />
          </View>
          <Text style={styles.headerTitle}>Récapitulatif des frais</Text>
        </View>
        <View style={styles.currencyBadge}>
          <Text style={styles.currencyBadgeText}>{selectedCurrency}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Lignes de détails des frais */}
      <View style={styles.linesContainer}>
        <View style={styles.lineRow}>
          <Text style={styles.lineLabel} numberOfLines={1} ellipsizeMode="tail">
            Location ({nbJours}j × {fmtCurrency(tenantPricePerDay)})
          </Text>
          <Text style={styles.lineValue}>{fmtCurrency(rentalBaseTotal)}</Text>
        </View>

        {isDeliverySelected && (
          <View style={styles.lineRow}>
            <Text style={styles.lineLabel} numberOfLines={1} ellipsizeMode="tail">
              Frais de livraison à domicile
            </Text>
            <Text style={styles.lineValue}>
              {numFraisLivraison === 0 ? 'Gratuit' : fmtCurrency(deliveryTotal)}
            </Text>
          </View>
        )}

        {isHorsDakarSelected && (
          <View style={styles.lineRow}>
            <Text style={styles.lineLabel} numberOfLines={1} ellipsizeMode="tail">
              Supplément Hors Dakar ({nbJours}j)
            </Text>
            <Text style={styles.lineValue}>{fmtCurrency(horsDakarTotal)}</Text>
          </View>
        )}
      </View>

      <View style={styles.dividerLight} />

      {/* Montant Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel} numberOfLines={1}>Total de la réservation</Text>
        <Text style={styles.totalValue}>{fmtCurrency(grandTotal)}</Text>
      </View>

      {/* Encadré Acompte 30% / Solde 70% avec bordure dégradée */}
      <LinearGradient
        colors={[ACCENT_BORDER, 'rgba(16, 185, 129, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.depositRing}
      >
        <View style={styles.depositGlassBox}>
          <View style={styles.depositRow}>
            <View style={styles.depositTag}>
              <View style={styles.depositIconDot}>
                <CreditCard size={12} color={ACCENT} strokeWidth={2.5} />
              </View>
              <Text style={styles.depositTagText}>Acompte en ligne</Text>
            </View>
            <Text style={styles.depositValue}>{fmtCurrency(deposit30)}</Text>
          </View>

          {/* Barre de proportion 30/70 */}
          <View style={styles.splitTrack}>
            <LinearGradient
              colors={[ACCENT_LIGHT, ACCENT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.splitFill, { width: '30%' }]}
            />
          </View>

          <View style={styles.depositSubRow}>
            <Text style={styles.depositSubLabel} numberOfLines={1}>Solde à la remise des clés</Text>
            <Text style={styles.depositSubValue}>{fmtCurrency(remaining70)}</Text>
          </View>
        </View>
      </LinearGradient>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  darkGlassCard: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(228, 235, 219, 0.12)',
    overflow: 'hidden',
    ...theme.elevation.lg,
  },
  sheenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  headerIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: ACCENT_SOFT,
    borderWidth: 1,
    borderColor: ACCENT_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15.5,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  currencyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  currencyBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: ACCENT,
    letterSpacing: 0.4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(228, 235, 219, 0.1)',
  },
  linesContainer: {
    gap: 12,
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  lineLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: '#A0B296',
    flex: 1,
    marginRight: 8,
  },
  lineValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
    flexShrink: 0,
  },
  dividerLight: {
    height: 1,
    backgroundColor: 'rgba(228, 235, 219, 0.15)',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  totalValue: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 22,
    color: ACCENT,
    letterSpacing: -0.4,
  },
  depositRing: {
    borderRadius: theme.radius.lg + 1,
    padding: 1,
    marginTop: 2,
  },
  depositGlassBox: {
    backgroundColor: 'rgba(4, 25, 18, 0.9)',
    borderRadius: theme.radius.lg,
    padding: 14,
    gap: 10,
  },
  depositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  depositTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  depositIconDot: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositTagText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  depositValue: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 17,
    color: ACCENT,
  },
  splitTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  splitFill: {
    height: '100%',
    borderRadius: 3,
  },
  depositSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  depositSubLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#A0B296',
  },
  depositSubValue: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#E4EBDB',
  },
});