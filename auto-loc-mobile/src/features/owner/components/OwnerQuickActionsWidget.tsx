import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { PlusCircle, Clock, Wallet } from 'lucide-react-native';
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
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onAddVehiclePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Ajouter un véhicule"
      >
        <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
          <PlusCircle size={20} color="#059669" />
        </View>
        <Text
          style={styles.actionText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          Ajouter véhicule
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onBookingsPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Voir les demandes en attente, ${pendingBookingsCount}`}
      >
        <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
          <Clock size={20} color="#D97706" />
        </View>
        <Text
          style={styles.actionText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          Demandes ({pendingBookingsCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onRevenuesPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Voir mes revenus"
      >
        <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
          <Wallet size={20} color="#2563EB" />
        </View>
        <Text
          style={styles.actionText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          Mes revenus
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#1F2937',
    textAlign: 'center',
  },
});
