import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { AutoSkeleton } from '../../../shared/components/AutoSkeleton';

export interface TenantBookingDetailSkeletonProps {
  onBack?: () => void;
}

export const TenantBookingDetailSkeleton: React.FC<TenantBookingDetailSkeletonProps> = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topBar}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityLabel="Retour">
              <ArrowLeft size={19} color="#072A20" />
            </TouchableOpacity>
          ) : (
            <AutoSkeleton width={40} height={40} borderRadius={20} />
          )}
          <AutoSkeleton width={110} height={16} borderRadius={6} />
        </View>

        {/* Hero Skeleton Card */}
        <View style={styles.heroCard}>
          <View style={styles.rowBetween}>
            <AutoSkeleton width={130} height={24} borderRadius={12} />
            <AutoSkeleton width={90} height={14} borderRadius={4} />
          </View>
          <AutoSkeleton width="40%" height={12} borderRadius={4} style={{ marginTop: 10 }} />
          <AutoSkeleton width="75%" height={26} borderRadius={6} style={{ marginTop: 6 }} />
          <AutoSkeleton width="90%" height={14} borderRadius={4} style={{ marginTop: 6 }} />

          <View style={styles.datesBox}>
            <View style={styles.dateCol}>
              <AutoSkeleton width="60%" height={10} borderRadius={4} />
              <AutoSkeleton width="80%" height={14} borderRadius={4} />
            </View>
            <View style={{ width: 50, alignItems: 'center' }}>
              <AutoSkeleton width={30} height={20} borderRadius={6} />
            </View>
            <View style={styles.dateCol}>
              <AutoSkeleton width="60%" height={10} borderRadius={4} />
              <AutoSkeleton width="80%" height={14} borderRadius={4} />
            </View>
          </View>

          <View style={[styles.rowBetween, { marginTop: 12 }]}>
            <AutoSkeleton width={120} height={12} borderRadius={4} />
            <AutoSkeleton width={100} height={22} borderRadius={6} />
          </View>
        </View>

        {/* Vehicle Info Card Skeleton */}
        <View style={styles.vehicleCard}>
          <AutoSkeleton width={110} height={118} borderRadius={0} />
          <View style={styles.vehicleBody}>
            <AutoSkeleton width="75%" height={18} borderRadius={6} />
            <AutoSkeleton width="45%" height={13} borderRadius={4} />
            <AutoSkeleton width="85%" height={13} borderRadius={4} />
          </View>
        </View>

        {/* Contract Skeleton */}
        <View style={styles.sectionCard}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, gap: 6 }}>
              <AutoSkeleton width={140} height={16} borderRadius={4} />
              <AutoSkeleton width={180} height={12} borderRadius={4} />
            </View>
            <AutoSkeleton width={90} height={36} borderRadius={18} />
          </View>
        </View>

        {/* Lifecycle Card Skeleton */}
        <View style={styles.sectionCard}>
          <View style={styles.rowHeader}>
            <AutoSkeleton width={32} height={32} borderRadius={10} />
            <AutoSkeleton width={160} height={18} borderRadius={6} />
          </View>
          <AutoSkeleton width="100%" height={44} borderRadius={22} />
          <AutoSkeleton width="100%" height={40} borderRadius={20} />
        </View>

        {/* Finance / Guarantee Card Skeleton */}
        <View style={styles.darkSectionCard}>
          <View style={styles.rowHeader}>
            <AutoSkeleton width={32} height={32} borderRadius={10} />
            <AutoSkeleton width={170} height={18} borderRadius={6} />
          </View>
          <View style={styles.rowBetween}>
            <AutoSkeleton width="50%" height={14} borderRadius={4} />
            <AutoSkeleton width="30%" height={14} borderRadius={4} />
          </View>
          <View style={styles.rowBetween}>
            <AutoSkeleton width="60%" height={14} borderRadius={4} />
            <AutoSkeleton width="25%" height={14} borderRadius={4} />
          </View>
          <View style={styles.rowBetween}>
            <AutoSkeleton width="40%" height={18} borderRadius={6} />
            <AutoSkeleton width="35%" height={22} borderRadius={6} />
          </View>
        </View>

        {/* Host Contact Skeleton */}
        <View style={styles.sectionCard}>
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <AutoSkeleton width={42} height={42} borderRadius={21} />
              <View style={{ gap: 6 }}>
                <AutoSkeleton width={120} height={15} borderRadius={4} />
                <AutoSkeleton width={90} height={12} borderRadius={4} />
              </View>
            </View>
            <AutoSkeleton width={80} height={32} borderRadius={16} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  heroCard: { backgroundColor: '#072A20', borderRadius: 24, padding: 20, gap: 6, overflow: 'hidden' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  datesBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)', borderRadius: 14, padding: 12, marginTop: 12 },
  dateCol: { flex: 1, alignItems: 'center', gap: 6 },
  vehicleCard: { flexDirection: 'row', overflow: 'hidden', borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  vehicleBody: { flex: 1, padding: 14, gap: 8, justifyContent: 'center' },
  sectionCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, padding: 16, gap: 14 },
  darkSectionCard: { backgroundColor: '#072A20', borderWidth: 1, borderColor: '#072A20', borderRadius: 18, padding: 16, gap: 14 },
});
