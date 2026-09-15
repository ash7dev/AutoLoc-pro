import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { CreditCard, ShieldCheck, CheckCircle } from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { formatDirectPrice } from '../../../../core/utils/currency';

export type PaymentMode = 'DEPOSIT_30' | 'FULL_100';

interface BookingPaymentModeSelectorProps {
  mode: PaymentMode;
  onSelectMode: (m: PaymentMode) => void;
  depositAmount: number;
  fullAmount: number;
  selectedCurrency?: string;
}

export const BookingPaymentModeSelector: React.FC<BookingPaymentModeSelectorProps> = ({
  mode,
  onSelectMode,
  depositAmount,
  fullAmount,
  selectedCurrency = 'XOF',
}) => {
  const fmtCurrency = (val: number) => formatDirectPrice(val, selectedCurrency as any);
  const remaining70 = fullAmount - depositAmount;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <CreditCard size={16} color={theme.colors.brand.main} />
        <Text style={styles.sectionLabelText}>MODALITÉ DE PAIEMENT</Text>
      </View>

      {/* Option 1 : Acompte 30% (Recommandé) */}
      <TouchableOpacity
        style={[styles.modeCard, mode === 'DEPOSIT_30' && styles.modeCardActive]}
        onPress={() => onSelectMode('DEPOSIT_30')}
        activeOpacity={0.8}
      >
        <View style={styles.modeHeader}>
          <View style={styles.radioRow}>
            <View style={[styles.radioOuter, mode === 'DEPOSIT_30' && styles.radioOuterActive]}>
              {mode === 'DEPOSIT_30' && <View style={styles.radioInner} />}
            </View>

            <View style={styles.modeTitleBox}>
              <View style={styles.badgeRow}>
                <Text style={styles.modeTitle}>Acompte de 30% en ligne</Text>
                <View style={styles.recomBadge}>
                  <Text style={styles.recomBadgeText}>Populaire</Text>
                </View>
              </View>
              <Text style={styles.modeSubtitle}>
                Payez {fmtCurrency(depositAmount)} aujourd'hui, et les {fmtCurrency(remaining70)} restants au propriétaire lors de la prise des clés.
              </Text>
            </View>
          </View>

          <Text style={styles.priceTag}>{fmtCurrency(depositAmount)}</Text>
        </View>

        {mode === 'DEPOSIT_30' && (
          <View style={styles.activeHintBox}>
            <CheckCircle size={13} color={theme.colors.brand.main} />
            <Text style={styles.activeHintText}>
              Réservation instantanée garantie dès la validation de l'acompte.
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Option 2 : Totalité 100% en ligne */}
      <TouchableOpacity
        style={[styles.modeCard, mode === 'FULL_100' && styles.modeCardActive]}
        onPress={() => onSelectMode('FULL_100')}
        activeOpacity={0.8}
      >
        <View style={styles.modeHeader}>
          <View style={styles.radioRow}>
            <View style={[styles.radioOuter, mode === 'FULL_100' && styles.radioOuterActive]}>
              {mode === 'FULL_100' && <View style={styles.radioInner} />}
            </View>

            <View style={styles.modeTitleBox}>
              <Text style={styles.modeTitle}>Totalité 100% en ligne</Text>
              <Text style={styles.modeSubtitle}>
                Réglez la totalité ({fmtCurrency(fullAmount)}) en ligne. Aucun paiement en espèces à la remise du véhicule.
              </Text>
            </View>
          </View>

          <Text style={styles.priceTag}>{fmtCurrency(fullAmount)}</Text>
        </View>

        {mode === 'FULL_100' && (
          <View style={styles.activeHintBox}>
            <ShieldCheck size={13} color={theme.colors.brand.main} />
            <Text style={styles.activeHintText}>
              Tranquillité d'esprit totale, aucun règlement supplémentaire à effectuer.
            </Text>
          </View>
        )}
      </TouchableOpacity>
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
  modeCard: {
    backgroundColor: '#F8FBF4',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    borderRadius: theme.radius.md,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  modeCardActive: {
    backgroundColor: '#F1F8EE',
    borderColor: theme.colors.brand.main,
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing[2],
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9EAD96',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  radioOuterActive: {
    borderColor: theme.colors.brand.main,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.brand.main,
  },
  modeTitleBox: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  modeTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: theme.primitives.forest[800],
  },
  recomBadge: {
    backgroundColor: theme.colors.brand.subtle,
    borderWidth: 1,
    borderColor: theme.colors.brand.border,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.full,
  },
  recomBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
    color: theme.colors.brand.main,
    textTransform: 'uppercase',
  },
  modeSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#5F6B59',
    lineHeight: 16,
  },
  priceTag: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: theme.primitives.forest[800],
  },
  activeHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E4EBDB',
  },
  activeHintText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: theme.colors.brand.main,
    flex: 1,
  },
});
