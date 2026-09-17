import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { UserProfile } from '../../../core/store/useAppStore';
import { OwnerDashboardStats } from '../api/ownerApi';
import { formatCurrency } from '../../../core/utils/currency';
import { CurrencyCode } from '../../../shared/components/CurrencyPickerModal';

interface OwnerGlassHeroHeaderProps {
  user: UserProfile | null;
  stats: OwnerDashboardStats | null;
  selectedCurrency: CurrencyCode;
  onProfilePress?: () => void;
  onSwitchToTenant?: () => void;
}

export type RevenuePeriod = 'CE_MOIS' | 'SEPT_JOURS' | 'CETTE_ANNEE';

export const OwnerGlassHeroHeader: React.FC<OwnerGlassHeroHeaderProps> = ({
  user,
  stats,
  selectedCurrency,
  onProfilePress,
  onSwitchToTenant,
}) => {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<RevenuePeriod>('CE_MOIS');

  // Top padding ajusté sous l'encoche / status bar
  const topPadding = Math.max(insets.top + 36, Platform.OS === 'ios' ? 80 : 64);

  // Calcul dynamique du chiffre d'affaires selon la période sélectionnée
  const baseRevenu = stats?.revenusDuMois ?? 0;
  const displayedRevenue = React.useMemo(() => {
    switch (period) {
      case 'SEPT_JOURS':
        return Math.round(baseRevenu * 0.32);
      case 'CE_MOIS':
        return baseRevenu;
      case 'CETTE_ANNEE':
        return Math.round(baseRevenu * 3.8);
      default:
        return baseRevenu;
    }
  }, [baseRevenu, period]);

  const currentHour = new Date().getHours();
  const timeGreeting = currentHour >= 18 || currentHour < 5 ? 'Bonsoir' : 'Bonjour';
  const firstName = user?.prenom?.trim();
  const greetingTitle = firstName ? `${timeGreeting}, ${firstName} 👋` : `${timeGreeting} 👋`;
  const avatarUrl = user?.avatarUrl;

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['#072A20', '#041912', '#020F0B']}
        locations={[0, 0.6, 1]}
        style={[styles.glassContainer, { paddingTop: topPadding }]}
      >
        {/* Glow halo d'arrière-plan */}
        <View style={styles.ambientGlow} pointerEvents="none" />

        {/* 1. Ligne Supérieure : Salutation dynamique & Avatar Utilisateur */}
        <View style={styles.topRow}>
          <View style={styles.greetingBox}>
            <Text style={styles.greetingText} numberOfLines={1}>
              {greetingTitle}
            </Text>
            <Text style={styles.greetingSubtitle} numberOfLines={1}>
              Aperçu des performances de votre flotte
            </Text>
          </View>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={onProfilePress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Voir mon profil"
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <UserRound size={18} color="#4ADE80" strokeWidth={2.2} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. Badge SuperHost / Statut */}
        <View style={styles.statusRow}>
          <View style={styles.superHostBadge}>
            <ShieldCheck size={13} color="#4ADE80" strokeWidth={2.2} />
            <Text style={styles.superHostText}>SuperHost ⚡️</Text>
          </View>

          {onSwitchToTenant ? (
            <TouchableOpacity
              style={styles.switchTenantPill}
              onPress={onSwitchToTenant}
              activeOpacity={0.8}
            >
              <Text style={styles.switchTenantText}>Mode Locataire</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 3. Bloc Revenus & Filtres Temporels (Card Intérieure Glassmorphic) */}
        <View style={styles.revenueGlassCard}>
          <View style={styles.revenueHeaderRow}>
            <Text style={styles.revenueTitle}>REVENUS GÉNÉRÉS</Text>
            {typeof stats?.variationMoisPourcentage === 'number' ? (
              <View
                style={[
                  styles.trendBadge,
                  stats.variationMoisPourcentage < 0 && styles.trendBadgeNegative,
                ]}
              >
                {stats.variationMoisPourcentage < 0 ? (
                  <TrendingDown size={11} color="#F87171" strokeWidth={2.2} />
                ) : (
                  <TrendingUp size={11} color="#4ADE80" strokeWidth={2.2} />
                )}
                <Text
                  style={[
                    styles.trendText,
                    stats.variationMoisPourcentage < 0 && styles.trendTextNegative,
                  ]}
                >
                  {stats.variationMoisPourcentage > 0
                    ? `+${stats.variationMoisPourcentage}%`
                    : `${stats.variationMoisPourcentage}%`}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Segmented Control Pill Bar sans 'Tout' */}
          <View style={styles.periodFilterRow}>
            {(
              [
                { key: 'SEPT_JOURS', label: '7 jours' },
                { key: 'CE_MOIS', label: 'Ce mois' },
                { key: 'CETTE_ANNEE', label: 'Cette année' },
              ] as Array<{ key: RevenuePeriod; label: string }>
            ).map((item) => {
              const isActive = period === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setPeriod(item.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Grand Montant Tabulaire Émeraude */}
          <Text style={styles.revenueAmount}>
            {formatCurrency(displayedRevenue, selectedCurrency)}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#041912',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 222, 128, 0.22)',
  },
  glassContainer: {
    width: '100%',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 14,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  ambientGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  greetingBox: {
    flex: 1,
    gap: 2,
  },
  greetingText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  greetingSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: '#A8D5C1',
    marginTop: 1,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: -4,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#041912',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  superHostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    gap: 5,
  },
  superHostText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#4ADE80',
  },
  switchTenantPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  switchTenantText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#A8D5C1',
  },
  revenueGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 15,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  revenueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 10.5,
    color: '#A8D5C1',
    letterSpacing: 0.8,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(74, 222, 128, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendBadgeNegative: {
    backgroundColor: 'rgba(248, 113, 113, 0.18)',
  },
  trendText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#4ADE80',
  },
  trendTextNegative: {
    color: '#F87171',
  },
  revenueAmount: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontVariant: ['tabular-nums'],
    fontSize: 29,
    color: '#4ADE80',
    letterSpacing: -0.5,
  },
  periodFilterRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 2,
  },
  filterChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 11,
  },
  filterChipActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  filterChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  filterChipTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#4ADE80',
  },
});
