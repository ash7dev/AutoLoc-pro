import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Plus, Clock, Wallet } from 'lucide-react-native';
import { theme } from '../../../core/theme';

interface OwnerQuickActionsWidgetProps {
  pendingBookingsCount: number;
  onAddVehiclePress?: () => void;
  onBookingsPress?: () => void;
  onRevenuesPress?: () => void;
}

export const OwnerQuickActionsWidget: React.FC<OwnerQuickActionsWidgetProps> = ({
  pendingBookingsCount,
  onAddVehiclePress,
  onBookingsPress,
  onRevenuesPress,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {/* Pill 1 : Ajouter un véhicule (Bouton d'action principal) */}
      <TouchableOpacity
        style={[styles.pillBtn, styles.pillPrimary]}
        onPress={onAddVehiclePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Ajouter un véhicule"
      >
        <View style={styles.primaryIconCircle}>
          <Plus size={15} color="#FFFFFF" strokeWidth={2.8} />
        </View>
        <Text style={styles.primaryPillText}>Ajouter véhicule</Text>
      </TouchableOpacity>

      {/* Pill 2 : Demandes en attente */}
      <TouchableOpacity
        style={styles.pillBtn}
        onPress={onBookingsPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Demandes en attente, ${pendingBookingsCount}`}
      >
        <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
          <Clock size={15} color="#D97706" strokeWidth={2.2} />
        </View>
        <Text style={styles.pillText}>Demandes</Text>
        {pendingBookingsCount > 0 ? (
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>{pendingBookingsCount}</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      {/* Pill 3 : Mes revenus / Portefeuille */}
      <TouchableOpacity
        style={styles.pillBtn}
        onPress={onRevenuesPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Voir mes revenus"
      >
        <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
          <Wallet size={15} color="#059669" strokeWidth={2.2} />
        </View>
        <Text style={styles.pillText}>Mes revenus</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    gap: 10,
    paddingVertical: 2,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.full,
    paddingVertical: 9,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pillPrimary: {
    backgroundColor: '#041912',
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  primaryIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12.5,
    color: '#0F172A',
  },
  badgePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 2,
  },
  badgePillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#D97706',
  },
});
