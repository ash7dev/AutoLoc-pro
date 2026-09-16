import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {
  Calculator,
  MapPin,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react-native';
import {
  formatDirectPrice,
  getTenantPricePerDay,
  CurrencyCode,
} from '../../../core/utils/currency';

export interface TarifProgressifInput {
  dureeMinJours?: number;
  joursMin?: number;
  pourcentageReduction?: number;
  prix?: number | string;
}

interface VehicleInteractiveCalculatorCardProps {
  baseOwnerPrice: number;
  tarifsProgressifs?: any[];
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number | null;
  selectedCurrency?: CurrencyCode;
  joursMinimum?: number;
}

export const VehicleInteractiveCalculatorCard: React.FC<VehicleInteractiveCalculatorCardProps> = ({
  baseOwnerPrice,
  tarifsProgressifs = [],
  autoriseHorsDakar = false,
  supplementHorsDakarParJour = 5000,
  selectedCurrency = 'XOF',
  joursMinimum = 1,
}) => {
  const [selectedDays, setSelectedDays] = useState<number>(Math.max(joursMinimum || 1, 3));
  const [horsDakarSelected, setHorsDakarSelected] = useState<boolean>(false);

  const supplementPerDay = Math.max(0, Number(supplementHorsDakarParJour) || 5000);

  // Calcule le tarif de base locataire par jour
  const baseTenantPrice = useMemo(() => {
    return getTenantPricePerDay(baseOwnerPrice);
  }, [baseOwnerPrice]);

  // Calcule le taux de réduction selon la durée
  const discountRate = useMemo(() => {
    if (!tarifsProgressifs || tarifsProgressifs.length === 0) {
      if (selectedDays >= 30) return 30;
      if (selectedDays >= 14) return 20;
      if (selectedDays >= 7) return 15;
      if (selectedDays >= 3) return 10;
      return 0;
    }

    // Normalise l'objet de réduction
    const normalized = tarifsProgressifs.map((t) => {
      const minDays = Number(t.joursMin || t.dureeMinJours || 1);
      const discount = Number(t.pourcentageReduction || t.reductionPourcentage || 0);
      return { minDays, discount };
    }).sort((a, b) => b.minDays - a.minDays);

    const applicable = normalized.find((t) => selectedDays >= t.minDays);
    if (applicable && applicable.discount > 0) return applicable.discount;

    // Fallback par défaut si la réduction n'était pas renseignée en %
    if (selectedDays >= 30) return 30;
    if (selectedDays >= 14) return 20;
    if (selectedDays >= 7) return 15;
    if (selectedDays >= 3) return 10;
    return 0;
  }, [tarifsProgressifs, selectedDays]);

  // Calculs financiers
  const grossBaseTotal = baseTenantPrice * selectedDays;
  const discountAmount = Math.round(grossBaseTotal * (discountRate / 100));
  const baseTotalAfterDiscount = grossBaseTotal - discountAmount;
  const horsDakarTotal = horsDakarSelected ? supplementPerDay * selectedDays : 0;
  const grandTotalTenantPrice = baseTotalAfterDiscount + horsDakarTotal;
  const effectiveDailyRate = Math.round(grandTotalTenantPrice / selectedDays);

  const durationOptions = [1, 3, 7, 14, 30].filter((d) => d >= (joursMinimum || 1));

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleRow}>
          <View style={styles.iconBg}>
            <Calculator size={18} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Simulateur de Tarif en Direct</Text>
            <Text style={styles.cardSub}>Ajustez la durée et les options pour estimer votre prix</Text>
          </View>
        </View>
      </View>

      {/* Durée Pill Selectors */}
      <View style={styles.sectionBlock}>
        <Text style={styles.labelTitle}>DURÉE DE LOCATION SOUTENUE</Text>
        <View style={styles.daysPillGrid}>
          {durationOptions.map((days) => {
            const isSelected = selectedDays === days;
            let pillDiscount = 0;
            if (days >= 30) pillDiscount = 30;
            else if (days >= 14) pillDiscount = 20;
            else if (days >= 7) pillDiscount = 15;
            else if (days >= 3) pillDiscount = 10;

            return (
              <TouchableOpacity
                key={days}
                style={[styles.dayPill, isSelected && styles.dayPillActive]}
                onPress={() => setSelectedDays(days)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayPillText, isSelected && styles.dayPillTextActive]}>
                  {days} {days === 1 ? 'jour' : 'jours'}
                </Text>
                {pillDiscount > 0 && (
                  <View style={[styles.pillBadge, isSelected && styles.pillBadgeActive]}>
                    <Text style={[styles.pillBadgeText, isSelected && styles.pillBadgeTextActive]}>
                      -{pillDiscount}%
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Option Hors Dakar */}
      {autoriseHorsDakar && (
        <View style={styles.horsDakarRow}>
          <View style={styles.horsDakarInfo}>
            <View style={styles.horsDakarTitleRow}>
              <MapPin size={15} color="#D97706" />
              <Text style={styles.horsDakarTitle}>Voyage Hors Région de Dakar</Text>
            </View>
            <Text style={styles.horsDakarSub}>
              +{formatDirectPrice(supplementPerDay, selectedCurrency)}/jour (Thiès, Saly, Saint-Louis, Casamance...)
            </Text>
          </View>
          <Switch
            value={horsDakarSelected}
            onValueChange={setHorsDakarSelected}
            trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
            thumbColor={horsDakarSelected ? '#059669' : '#94A3B8'}
          />
        </View>
      )}

      {/* Décomposition Financière */}
      <View style={styles.breakdownBox}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>
            Tarif de base ({selectedDays} j x {formatDirectPrice(baseTenantPrice, selectedCurrency)})
          </Text>
          <Text style={styles.breakdownValue}>{formatDirectPrice(grossBaseTotal, selectedCurrency)}</Text>
        </View>

        {discountRate > 0 && (
          <View style={styles.breakdownRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <TrendingDown size={14} color="#059669" />
              <Text style={[styles.breakdownLabel, { color: '#059669', fontWeight: '700' }]}>
                Réduction longue durée (-{discountRate}%)
              </Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#059669', fontWeight: '700' }]}>
              -{formatDirectPrice(discountAmount, selectedCurrency)}
            </Text>
          </View>
        )}

        {horsDakarSelected && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              Supplément Hors Dakar ({selectedDays} j)
            </Text>
            <Text style={styles.breakdownValue}>+{formatDirectPrice(horsDakarTotal, selectedCurrency)}</Text>
          </View>
        )}

        <View style={styles.breakdownRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={14} color="#64748B" />
            <Text style={styles.breakdownLabel}>Assurance & Service AutoLoc</Text>
          </View>
          <Text style={[styles.breakdownValue, { color: '#059669', fontWeight: '700' }]}>Inclus ✨</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Total Box */}
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalTitle}>Total Estimé ({selectedDays}j)</Text>
            <Text style={styles.totalSub}>
              Soit {formatDirectPrice(effectiveDailyRate, selectedCurrency)}/jour net
            </Text>
          </View>
          <Text style={styles.totalPriceText}>
            {formatDirectPrice(grandTotalTenantPrice, selectedCurrency)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 1,
  },
  sectionBlock: {
    marginBottom: 14,
  },
  labelTitle: {
    fontSize: 10.5,
    fontFamily: 'Inter_700Bold',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  daysPillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
  },
  dayPillActive: {
    backgroundColor: '#051B14',
    borderColor: '#051B14',
  },
  dayPillText: {
    fontSize: 12.5,
    fontFamily: 'Inter_600SemiBold',
    color: '#334155',
  },
  dayPillTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
  },
  pillBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillBadgeActive: {
    backgroundColor: '#10B981',
  },
  pillBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
  },
  pillBadgeTextActive: {
    color: '#FFFFFF',
  },
  horsDakarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  horsDakarInfo: {
    flex: 1,
    paddingRight: 10,
  },
  horsDakarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  horsDakarTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#92400E',
  },
  horsDakarSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#B45309',
    marginTop: 2,
  },
  breakdownBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 12.5,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
  },
  breakdownValue: {
    fontSize: 12.5,
    fontFamily: 'Inter_600SemiBold',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  totalTitle: {
    fontSize: 13.5,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  totalSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#059669',
    marginTop: 1,
  },
  totalPriceText: {
    fontSize: 18,
    fontFamily: 'Inter_800Bold',
    color: '#051B14',
  },
});
