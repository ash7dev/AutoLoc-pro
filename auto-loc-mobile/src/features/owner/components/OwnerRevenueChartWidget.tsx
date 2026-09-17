import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BarChart3, TrendingUp, Sparkles, Calendar } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { formatCurrency, CurrencyCode } from '../../../core/utils/currency';

export interface RevenueChartPoint {
  id: string;
  label: string; // Ex: 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct' ou 'Lun', 'Mar', etc.
  fullLabel: string; // Ex: 'Septembre 2026' ou 'Lundi 14 Sep'
  amount: number;
  reservationsCount: number;
}

interface OwnerRevenueChartWidgetProps {
  selectedCurrency: CurrencyCode;
  period?: '7D' | '6M' | '1Y';
  onPeriodChange?: (period: '7D' | '6M' | '1Y') => void;
  chartData?: RevenueChartPoint[];
}

// Données par défaut dynamiques (fallback si pas encore chargées)
const DEFAULT_6M_POINTS: RevenueChartPoint[] = [
  { id: 'p1', label: 'Avr', fullLabel: 'Avril 2026', amount: 320000, reservationsCount: 5 },
  { id: 'p2', label: 'Mai', fullLabel: 'Mai 2026', amount: 480000, reservationsCount: 8 },
  { id: 'p3', label: 'Juin', fullLabel: 'Juin 2026', amount: 620000, reservationsCount: 11 },
  { id: 'p4', label: 'Juil', fullLabel: 'Juillet 2026', amount: 890000, reservationsCount: 15 },
  { id: 'p5', label: 'Août', fullLabel: 'Août 2026', amount: 1150000, reservationsCount: 19 },
  { id: 'p6', label: 'Sep', fullLabel: 'Septembre 2026 (En cours)', amount: 875000, reservationsCount: 12 },
];

const DEFAULT_7D_POINTS: RevenueChartPoint[] = [
  { id: 'd1', label: 'Ven', fullLabel: 'Vendredi 11 Sep', amount: 55000, reservationsCount: 1 },
  { id: 'd2', label: 'Sam', fullLabel: 'Samedi 12 Sep', amount: 120000, reservationsCount: 2 },
  { id: 'd3', label: 'Dim', fullLabel: 'Dimanche 13 Sep', amount: 120000, reservationsCount: 2 },
  { id: 'd4', label: 'Lun', fullLabel: 'Lundi 14 Sep', amount: 65000, reservationsCount: 1 },
  { id: 'd5', label: 'Mar', fullLabel: 'Mardi 15 Sep', amount: 0, reservationsCount: 0 },
  { id: 'd6', label: 'Mer', fullLabel: 'Mercredi 16 Sep', amount: 148500, reservationsCount: 3 },
  { id: 'd7', label: 'Jeu', fullLabel: 'Aujourd’hui', amount: 198000, reservationsCount: 3 },
];

const DEFAULT_1Y_POINTS: RevenueChartPoint[] = [
  { id: 'y1', label: '2025 Q3', fullLabel: '3ème Trimestre 2025', amount: 1250000, reservationsCount: 22 },
  { id: 'y2', label: '2025 Q4', fullLabel: '4ème Trimestre 2025', amount: 1890000, reservationsCount: 31 },
  { id: 'y3', label: '2026 Q1', fullLabel: '1er Trimestre 2026', amount: 2100000, reservationsCount: 36 },
  { id: 'y4', label: '2026 Q2', fullLabel: '2ème Trimestre 2026', amount: 2950000, reservationsCount: 48 },
];

export const OwnerRevenueChartWidget: React.FC<OwnerRevenueChartWidgetProps> = ({
  selectedCurrency,
  period: externalPeriod,
  onPeriodChange,
  chartData,
}) => {
  const [internalPeriod, setInternalPeriod] = useState<'7D' | '6M' | '1Y'>('6M');
  const activePeriod = externalPeriod ?? internalPeriod;

  const handleSetPeriod = (p: '7D' | '6M' | '1Y') => {
    setInternalPeriod(p);
    onPeriodChange?.(p);
  };

  // Sélection des points selon la période
  const points: RevenueChartPoint[] = React.useMemo(() => {
    if (chartData && chartData.length > 0) return chartData;
    if (activePeriod === '7D') return DEFAULT_7D_POINTS;
    if (activePeriod === '1Y') return DEFAULT_1Y_POINTS;
    return DEFAULT_6M_POINTS;
  }, [chartData, activePeriod]);

  // Point sélectionné au toucher (par défaut le dernier point)
  const [selectedIndex, setSelectedIndex] = useState<number>(points.length - 1);
  const selectedPoint = points[selectedIndex] ?? points[points.length - 1];

  // Calcul du max pour échelle dynamique
  const maxAmount = Math.max(...points.map((p) => p.amount), 10000);
  const totalPeriodAmount = points.reduce((acc, p) => acc + p.amount, 0);
  const averageAmount = Math.round(totalPeriodAmount / points.length);

  return (
    <View style={styles.container}>
      {/* En-tête Widget Signature Dark Obsidian */}
      <View style={styles.headerRow}>
        <View style={styles.titleBox}>
          <View style={styles.titleIconBadge}>
            <BarChart3 size={14} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <View style={styles.titleColumn}>
            <Text style={styles.title}>Évolution des Revenus</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              Dynamique financière de votre activité
            </Text>
          </View>
        </View>

        {/* Pill Selector 7D / 6M / 1Y */}
        <View style={styles.periodPillContainer}>
          {(['7D', '6M', '1Y'] as const).map((p) => {
            const isActive = activePeriod === p;
            const label = p === '7D' ? '7J' : p === '6M' ? '6M' : '1A';

            return (
              <TouchableOpacity
                key={p}
                style={[styles.periodPill, isActive && styles.periodPillActive]}
                onPress={() => {
                  handleSetPeriod(p);
                  setSelectedIndex(0);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.periodPillText, isActive && styles.periodPillTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Résumé interactif du point sélectionné */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiLeft}>
          <Text style={styles.kpiLabel}>{selectedPoint?.fullLabel || 'Période'}</Text>
          <Text style={styles.kpiValue}>
            {formatCurrency(selectedPoint?.amount || 0, selectedCurrency)}
          </Text>
        </View>

        <View style={styles.kpiRight}>
          <View style={styles.kpiChip}>
            <Calendar size={11} color="#059669" />
            <Text style={styles.kpiChipText}>
              {selectedPoint?.reservationsCount || 0} location{(selectedPoint?.reservationsCount || 0) > 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.kpiAvgText}>
            Moy. : {formatCurrency(averageAmount, selectedCurrency)}
          </Text>
        </View>
      </View>

      {/* Zone du Diagramme à Barres de Verre */}
      <View style={styles.chartContainer}>
        <View style={styles.barsRow}>
          {points.map((pt, idx) => {
            const isSelected = idx === selectedIndex;
            const heightPercent = maxAmount > 0 ? (pt.amount / maxAmount) * 100 : 4;
            const clampedHeight = Math.max(heightPercent, 6);

            return (
              <TouchableOpacity
                key={pt.id || `pt-${idx}`}
                style={styles.barColumn}
                onPress={() => setSelectedIndex(idx)}
                activeOpacity={0.85}
              >
                {/* Visual Bar Container */}
                <View style={styles.barTrack}>
                  {isSelected && (
                    <View style={styles.glowPill}>
                      <Text style={styles.glowText}>
                        {formatCurrency(pt.amount, selectedCurrency)}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.barFill,
                      { height: `${clampedHeight}%` },
                      isSelected ? styles.barFillSelected : styles.barFillDefault,
                    ]}
                  />
                </View>

                {/* X-Axis Label */}
                <Text style={[styles.axisLabel, isSelected && styles.axisLabelSelected]}>
                  {pt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Pied de Carte Insight Stratégique */}
      <View style={styles.insightBanner}>
        <TrendingUp size={14} color="#059669" />
        <Text style={styles.insightText} numberOfLines={1}>
          Progression de +34% des revenus ce mois-ci grâce aux SUV.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  titleColumn: {
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
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 17,
    color: '#041912',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  periodPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: theme.radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  periodPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  periodPillActive: {
    backgroundColor: '#041912',
  },
  periodPillText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#64748B',
  },
  periodPillTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiLeft: {
    gap: 2,
  },
  kpiLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#64748B',
  },
  kpiValue: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 20,
    color: '#047857',
    fontVariant: ['tabular-nums'],
  },
  kpiRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  kpiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  kpiChipText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#047857',
  },
  kpiAvgText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10.5,
    color: '#94A3B8',
  },
  chartContainer: {
    height: 140,
    paddingTop: 10,
    justifyContent: 'flex-end',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 6,
  },
  barTrack: {
    width: 22,
    height: 105,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barFillDefault: {
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },
  barFillSelected: {
    backgroundColor: '#059669',
    borderWidth: 1.5,
    borderColor: '#4ADE80',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  glowPill: {
    position: 'absolute',
    top: -24,
    backgroundColor: '#041912',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4ADE80',
    zIndex: 10,
  },
  glowText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
    color: '#4ADE80',
  },
  axisLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10.5,
    color: '#64748B',
  },
  axisLabelSelected: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#059669',
  },
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  insightText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11.5,
    color: '#047857',
    flex: 1,
  },
});
