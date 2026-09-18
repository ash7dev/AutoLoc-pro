import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AutoSkeleton } from '../../../shared/components/AutoSkeleton';

export const OwnerBookingSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.codeGroup}>
          <AutoSkeleton width={110} height={16} borderRadius={5} />
          <AutoSkeleton width={90} height={11} borderRadius={4} />
        </View>
        <AutoSkeleton width={75} height={20} borderRadius={8} />
      </View>

      <View style={styles.vehicleRow}>
        <AutoSkeleton width={60} height={44} borderRadius={8} />
        <View style={styles.vehicleInfo}>
          <AutoSkeleton width={150} height={14} borderRadius={5} />
          <AutoSkeleton width={180} height={12} borderRadius={4} />
        </View>
      </View>

      <View style={styles.tenantBox}>
        <View style={styles.tenantRow}>
          <AutoSkeleton width={34} height={34} borderRadius={17} />
          <View style={styles.tenantInfo}>
            <AutoSkeleton width={130} height={13} borderRadius={4} />
            <AutoSkeleton width={95} height={11} borderRadius={4} />
          </View>
        </View>
      </View>

      <View style={styles.payoutRow}>
        <AutoSkeleton width={130} height={12} borderRadius={4} />
        <AutoSkeleton width={90} height={18} borderRadius={5} />
      </View>

      <AutoSkeleton width="100%" height={38} borderRadius={11} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeGroup: {
    gap: 4,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 9,
    borderRadius: 12,
  },
  vehicleInfo: {
    flex: 1,
    gap: 6,
  },
  tenantBox: {
    paddingVertical: 2,
  },
  tenantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tenantInfo: {
    gap: 4,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});
