import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { CreditCard, ShieldCheck, CheckCircle2, Key } from 'lucide-react-native';
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
      {/* En-tête de section avec badge icône sombre + Fraunces */}
      <View style={styles.headerRow}>
        <View style={styles.titleIconBadge}>
          <CreditCard size={14} color="#4ADE80" strokeWidth={2.25} />
        </View>
        <Text style={styles.sectionTitle}>Modalité de paiement</Text>
      </View>

      <View style={styles.modesStack}>
        {/* Option 1 : Acompte 30% (Recommandé) */}
        <TouchableOpacity
          style={[styles.modeCard, mode === 'DEPOSIT_30' && styles.modeCardActive]}
          onPress={() => onSelectMode('DEPOSIT_30')}
          activeOpacity={0.85}
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
              </View>
            </View>

            {/* Prix Acompte en police Fraunces avec tabular-nums */}
            <Text style={[styles.priceTag, mode === 'DEPOSIT_30' && styles.priceTagActive]}>
              {fmtCurrency(depositAmount)}
            </Text>
          </View>

          {/* Disposition structurée de la ventilation des montants (Aujourd'hui vs Check-in) */}
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelGroup}>
                <View style={styles.iconCircleGreen}>
                  <CreditCard size={12} color="#059669" strokeWidth={2.25} />
                </View>
                <Text style={styles.breakdownLabel}>À payer aujourd'hui en ligne</Text>
              </View>
              <Text style={styles.breakdownPriceMain}>{fmtCurrency(depositAmount)}</Text>
            </View>

            <View style={styles.breakdownDivider} />

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelGroup}>
                <View style={styles.iconCircleGray}>
                  <Key size={12} color="#64748B" strokeWidth={2.25} />
                </View>
                <Text style={styles.breakdownLabel}>Solde dû lors de la remise des clés</Text>
              </View>
              <Text style={styles.breakdownPriceSub}>{fmtCurrency(remaining70)}</Text>
            </View>
          </View>

          {mode === 'DEPOSIT_30' && (
            <View style={styles.activeHintBox}>
              <CheckCircle2 size={13} color="#059669" strokeWidth={2.25} />
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
          activeOpacity={0.85}
        >
          <View style={styles.modeHeader}>
            <View style={styles.radioRow}>
              <View style={[styles.radioOuter, mode === 'FULL_100' && styles.radioOuterActive]}>
                {mode === 'FULL_100' && <View style={styles.radioInner} />}
              </View>

              <View style={styles.modeTitleBox}>
                <Text style={styles.modeTitle}>Totalité 100% en ligne</Text>
              </View>
            </View>

            {/* Prix Total en police Fraunces avec tabular-nums */}
            <Text style={[styles.priceTag, mode === 'FULL_100' && styles.priceTagActive]}>
              {fmtCurrency(fullAmount)}
            </Text>
          </View>

          {/* Disposition structurée de la ventilation des montants (Totalité) */}
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelGroup}>
                <View style={styles.iconCircleGreen}>
                  <CreditCard size={12} color="#059669" strokeWidth={2.25} />
                </View>
                <Text style={styles.breakdownLabel}>Règlement intégral en ligne</Text>
              </View>
              <Text style={styles.breakdownPriceMain}>{fmtCurrency(fullAmount)}</Text>
            </View>

            <View style={styles.breakdownDivider} />

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelGroup}>
                <View style={styles.iconCircleGray}>
                  <CheckCircle2 size={12} color="#64748B" strokeWidth={2.25} />
                </View>
                <Text style={styles.breakdownLabel}>Paiement au propriétaire</Text>
              </View>
              <Text style={styles.breakdownZeroText}>0 FCFA (Tout réglé)</Text>
            </View>
          </View>

          {mode === 'FULL_100' && (
            <View style={styles.activeHintBox}>
              <ShieldCheck size={13} color="#059669" strokeWidth={2.25} />
              <Text style={styles.activeHintText}>
                Tranquillité d'esprit totale, aucun règlement supplémentaire à effectuer.
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
    fontSize: 15.5,
    color: '#041912',
    letterSpacing: -0.3,
  },
  modesStack: {
    gap: 12,
  },
  modeCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  modeCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioOuterActive: {
    borderColor: '#059669',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#059669',
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
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14.5,
    color: '#041912',
    letterSpacing: -0.2,
  },
  recomBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recomBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
    color: '#059669',
    textTransform: 'uppercase',
  },
  priceTag: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14.5,
    color: '#041912',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  priceTagActive: {
    color: '#059669',
  },
  /* Disposition de ventilation des montants */
  breakdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  breakdownLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconCircleGreen: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleGray: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#475569',
    flex: 1,
  },
  breakdownPriceMain: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
    color: '#059669',
    fontVariant: ['tabular-nums'],
  },
  breakdownPriceSub: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
    color: '#041912',
    fontVariant: ['tabular-nums'],
  },
  breakdownZeroText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#059669',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  activeHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activeHintText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#059669',
    flex: 1,
  },
});
