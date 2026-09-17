import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Gauge,
  Fuel,
  Users,
  UserCheck,
  Calendar,
  SlidersHorizontal,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';

interface VehicleSpecsCardProps {
  transmission?: string | null;
  carburant?: string | null;
  nombrePlaces?: number | null;
  ageMinimum?: number | null;
  joursMinimum?: number | null;
}

export const VehicleSpecsCard: React.FC<VehicleSpecsCardProps> = ({
  transmission = 'Automatique',
  carburant = 'Essence',
  nombrePlaces = 5,
  ageMinimum = 21,
  joursMinimum = 1,
}) => {
  const specs = [
    {
      id: 'transmission',
      label: 'Transmission',
      value: transmission || 'Automatique',
      icon: Gauge,
    },
    {
      id: 'carburant',
      label: 'Carburant',
      value: carburant || 'Essence',
      icon: Fuel,
    },
    {
      id: 'places',
      label: 'Capacité',
      value: `${nombrePlaces || 5} Places`,
      icon: Users,
    },
    {
      id: 'age',
      label: 'Âge Conducteur',
      value: `${ageMinimum || 21} ans min`,
      icon: UserCheck,
    },
    {
      id: 'duree',
      label: 'Location Min.',
      value: `${joursMinimum || 1} jour(s)`,
      icon: Calendar,
    },
  ];

  return (
    <View style={styles.container}>
      {/* En-tête de section */}
      <View style={styles.headerRow}>
        <View style={styles.titleIconBadge}>
          <SlidersHorizontal size={14} color="#4ADE80" strokeWidth={2.25} />
        </View>
        <Text style={styles.sectionTitle}>Spécifications & Performance</Text>
      </View>

      {/* Carte à Fond Blanc (Harmonisé avec Options & Services) */}
      <View style={styles.mainCard}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {specs.map((item) => {
            const IconComponent = item.icon;
            return (
              <View key={item.id} style={styles.specCard}>
                <View style={styles.iconCircle}>
                  <IconComponent size={18} color="#4ADE80" strokeWidth={2.25} />
                </View>
                <Text style={styles.specLabel}>{item.label}</Text>
                <Text style={styles.specValue} numberOfLines={1}>
                  {item.value}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
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
  sectionTitle: {
    fontSize: 17.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
    letterSpacing: -0.3,
    flex: 1,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E4EBDB',
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  scrollContent: {
    gap: 10,
    paddingHorizontal: 4,
  },
  specCard: {
    width: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#041912',
    borderColor: 'rgba(74, 222, 128, 0.35)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  specLabel: {
    fontSize: 11,
    color: '#5F6B59',
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: 3,
    textAlign: 'center',
  },
  specValue: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#041912',
    textAlign: 'center',
  },
});
