import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { formatCurrency } from '../../../core/utils/currency';
import { useAppStore } from '../../../core/store/useAppStore';

interface OwnerStatCardProps {
  title: string;
  value: string | number;
  isCurrency?: boolean;
  changePercentage?: number;
  subtitle?: string;
  icon: React.ReactNode;
  badgeText?: string;
  accentColor?: string;
}

export const OwnerStatCard: React.FC<OwnerStatCardProps> = ({
  title,
  value,
  isCurrency = false,
  changePercentage,
  subtitle,
  icon,
  badgeText,
  accentColor = '#10B981',
}) => {
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);

  const formattedValue = isCurrency && typeof value === 'number'
    ? formatCurrency(value, selectedCurrency)
    : value;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: `${accentColor}15` }]}>
          {icon}
        </View>

        {badgeText ? (
          <View style={[styles.badge, { backgroundColor: `${accentColor}18`, borderColor: `${accentColor}35` }]}>
            <Text style={[styles.badgeText, { color: accentColor }]}>{badgeText}</Text>
          </View>
        ) : changePercentage !== undefined ? (
          <View
            style={[
              styles.changeBadge,
              changePercentage >= 0 ? styles.positiveChange : styles.negativeChange,
            ]}
          >
            {changePercentage >= 0 ? (
              <TrendingUp size={12} color="#047857" />
            ) : (
              <TrendingDown size={12} color="#DC2626" />
            )}
            <Text
              style={[
                styles.changeText,
                { color: changePercentage >= 0 ? '#047857' : '#DC2626' },
              ]}
            >
              {changePercentage >= 0 ? `+${changePercentage}%` : `${changePercentage}%`}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.contentBox}>
        <Text style={styles.valueText} numberOfLines={1}>
          {formattedValue}
        </Text>
        <Text style={styles.titleText}>{title}</Text>
        {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 155,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  positiveChange: {
    backgroundColor: '#ECFDF5',
  },
  negativeChange: {
    backgroundColor: '#FEF2F2',
  },
  changeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  contentBox: {
    gap: 2,
  },
  valueText: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 20,
    color: '#041912',
    letterSpacing: -0.4,
  },
  titleText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12.5,
    color: '#4B5563',
  },
  subtitleText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
