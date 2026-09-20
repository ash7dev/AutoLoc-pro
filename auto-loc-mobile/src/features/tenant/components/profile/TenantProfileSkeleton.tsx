import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../../../../core/theme';
import { TenantHeader } from '../../../../shared/components';
import { AutoSkeleton } from '../../../../shared/components/AutoSkeleton';

interface TenantProfileSkeletonProps {
  isOwnerMode?: boolean;
}

export const TenantProfileSkeleton: React.FC<TenantProfileSkeletonProps> = ({
  isOwnerMode = false,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <TenantHeader
        variant="MANAGEMENT"
        title={isOwnerMode ? 'Mon Profil Hôte' : 'Mon profil'}
        subtitle={isOwnerMode ? 'Mon compte et basculement de mode' : 'Mon compte et mes vérifications'}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero Profile Skeleton Card */}
        <View style={styles.cardHero}>
          <View style={styles.heroTopRow}>
            {/* Avatar Circle Skeleton */}
            <AutoSkeleton width={72} height={72} borderRadius={36} />
            
            <View style={styles.heroTextGroup}>
              {/* Nom & Prénom */}
              <AutoSkeleton width={160} height={20} borderRadius={6} />
              {/* Role Badge Pill */}
              <AutoSkeleton width={110} height={22} borderRadius={8} style={{ marginTop: 6 }} />
              {/* Telephone / Email */}
              <AutoSkeleton width={140} height={13} borderRadius={4} style={{ marginTop: 6 }} />
            </View>
          </View>
        </View>

        {/* 2. Role Switch Obsidian Card Skeleton */}
        <View style={styles.cardRoleSwitch}>
          <View style={styles.rowHeader}>
            <AutoSkeleton width={36} height={36} borderRadius={11} style={styles.darkSkeleton} />
            <View style={{ flex: 1, gap: 6 }}>
              <AutoSkeleton width={180} height={16} borderRadius={6} style={styles.darkSkeleton} />
              <AutoSkeleton width="90%" height={12} borderRadius={4} style={styles.darkSkeleton} />
            </View>
          </View>
          <AutoSkeleton width="100%" height={44} borderRadius={14} style={styles.darkBtnSkeleton} />
        </View>

        {/* 3. Verification Card Skeleton */}
        <View style={styles.cardStandard}>
          <View style={styles.cardHeaderRow}>
            <AutoSkeleton width={140} height={16} borderRadius={6} />
            <AutoSkeleton width={75} height={20} borderRadius={8} />
          </View>
          <AutoSkeleton width="100%" height={8} borderRadius={4} style={{ marginVertical: 12 }} />
          <View style={{ gap: 10 }}>
            <AutoSkeleton width="100%" height={38} borderRadius={10} />
            <AutoSkeleton width="100%" height={38} borderRadius={10} />
            <AutoSkeleton width="100%" height={38} borderRadius={10} />
          </View>
        </View>

        {/* 4. Information Card Skeleton */}
        <View style={styles.cardStandard}>
          <AutoSkeleton width={180} height={16} borderRadius={6} />
          <View style={{ gap: 12, marginTop: 14 }}>
            <AutoSkeleton width="100%" height={46} borderRadius={12} />
            <AutoSkeleton width="100%" height={46} borderRadius={12} />
            <AutoSkeleton width="100%" height={46} borderRadius={12} />
          </View>
        </View>

        {/* 5. Security Card Skeleton */}
        <View style={styles.cardStandard}>
          <AutoSkeleton width={150} height={16} borderRadius={6} />
          <View style={{ gap: 12, marginTop: 14 }}>
            <AutoSkeleton width="100%" height={46} borderRadius={12} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  content: {
    padding: theme.spacing[4],
    paddingBottom: 118,
    gap: theme.spacing[4],
  },
  cardHero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  cardRoleSwitch: {
    backgroundColor: '#041912',
    borderRadius: 22,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  darkSkeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  darkBtnSkeleton: {
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
  },
  cardStandard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
