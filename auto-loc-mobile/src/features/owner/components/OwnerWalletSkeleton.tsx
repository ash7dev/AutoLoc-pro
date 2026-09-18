import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AutoSkeleton } from '../../../shared/components/AutoSkeleton';

export const OwnerWalletSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Hero Header Glass Skeleton */}
      <LinearGradient
        colors={['#072A20', '#041912', '#020F0B']}
        locations={[0, 0.6, 1]}
        style={[styles.heroHeader, { paddingTop: Math.max(insets.top + 16, 44) }]}
      >
        {/* Top bar profile skeleton */}
        <View style={styles.topBar}>
          <View style={styles.profileRow}>
            <AutoSkeleton
              width={44}
              height={44}
              borderRadius={22}
              style={styles.darkSkeleton}
            />
            <View style={styles.greetingBox}>
              <AutoSkeleton
                width={120}
                height={15}
                borderRadius={6}
                style={styles.darkSkeleton}
              />
              <AutoSkeleton
                width={95}
                height={11}
                borderRadius={4}
                style={styles.darkSkeleton}
              />
            </View>
          </View>

          <AutoSkeleton
            width={105}
            height={28}
            borderRadius={20}
            style={styles.darkSkeleton}
          />
        </View>

        {/* Main hero balance skeleton */}
        <View style={styles.mainHeroBody}>
          <View style={styles.walletBadgeRow}>
            <AutoSkeleton
              width={145}
              height={22}
              borderRadius={11}
              style={styles.darkSkeleton}
            />
          </View>

          {/* Solde Total Chiffre Skeleton */}
          <View style={styles.totalBalanceRow}>
            <AutoSkeleton
              width={190}
              height={34}
              borderRadius={10}
              style={styles.emeraldSkeleton}
            />
          </View>
        </View>

        {/* Glass Summary Bar Skeleton (Retirable & Séquestre) */}
        <View style={styles.glassSummaryBar}>
          <View style={styles.glassStatItem}>
            <AutoSkeleton width={12} height={12} borderRadius={6} style={styles.emeraldSkeleton} />
            <AutoSkeleton width={110} height={12} borderRadius={4} style={styles.darkSkeleton} />
          </View>

          <View style={styles.glassDivider} />

          <View style={styles.glassStatItem}>
            <AutoSkeleton width={12} height={12} borderRadius={6} style={styles.goldSkeleton} />
            <AutoSkeleton width={100} height={12} borderRadius={4} style={styles.darkSkeleton} />
          </View>
        </View>

        {/* CTA Button Skeleton */}
        <AutoSkeleton
          width="100%"
          height={48}
          borderRadius={14}
          style={styles.emeraldSkeleton}
        />
      </LinearGradient>

      {/* Body Content Skeleton */}
      <View style={styles.bodyContent}>
        {/* Mobile Money Accounts Card Skeleton */}
        <View style={styles.whiteCard}>
          <View style={styles.cardHeaderRow}>
            <AutoSkeleton width={160} height={16} borderRadius={6} />
          </View>
          <View style={styles.accountsRow}>
            <View style={styles.accountCardSkeleton}>
              <AutoSkeleton width={28} height={28} borderRadius={14} />
              <View style={{ flex: 1, gap: 4 }}>
                <AutoSkeleton width={80} height={12} borderRadius={4} />
                <AutoSkeleton width={60} height={10} borderRadius={3} />
              </View>
              <AutoSkeleton width={50} height={14} borderRadius={4} />
            </View>
            <View style={styles.accountCardSkeleton}>
              <AutoSkeleton width={28} height={28} borderRadius={14} />
              <View style={{ flex: 1, gap: 4 }}>
                <AutoSkeleton width={80} height={12} borderRadius={4} />
                <AutoSkeleton width={60} height={10} borderRadius={3} />
              </View>
              <AutoSkeleton width={50} height={14} borderRadius={4} />
            </View>
          </View>
        </View>

        {/* Transactions History Card Skeleton */}
        <View style={styles.whiteCard}>
          <View style={styles.cardHeaderRow}>
            <AutoSkeleton width={165} height={16} borderRadius={6} />
          </View>
          <View style={styles.tabsRow}>
            <AutoSkeleton width="30%" height={26} borderRadius={8} />
            <AutoSkeleton width="30%" height={26} borderRadius={8} />
            <AutoSkeleton width="30%" height={26} borderRadius={8} />
          </View>

          <View style={styles.txList}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.txRow}>
                <AutoSkeleton width={36} height={36} borderRadius={18} />
                <View style={styles.txCenter}>
                  <AutoSkeleton width={120} height={13} borderRadius={5} />
                  <AutoSkeleton width={140} height={10} borderRadius={4} />
                </View>
                <View style={styles.txRight}>
                  <AutoSkeleton width={75} height={14} borderRadius={5} />
                  <AutoSkeleton width={50} height={12} borderRadius={4} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  heroHeader: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 18,
    paddingBottom: 22,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetingBox: {
    gap: 6,
  },
  mainHeroBody: {
    gap: 4,
  },
  walletBadgeRow: {
    flexDirection: 'row',
  },
  totalBalanceRow: {
    marginTop: 4,
  },
  glassSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glassStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  glassDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  darkSkeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  emeraldSkeleton: {
    backgroundColor: 'rgba(52, 211, 153, 0.25)',
  },
  goldSkeleton: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
  },
  bodyContent: {
    padding: 16,
    gap: 16,
  },
  whiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountsRow: {
    gap: 10,
  },
  accountCardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 3,
    borderRadius: 12,
  },
  txList: {
    gap: 10,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  txCenter: {
    flex: 1,
    gap: 4,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
});
