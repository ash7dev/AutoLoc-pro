import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from 'react-native';
import {
  Gauge,
  Fuel,
  Users,
  UserCheck,
  Calendar,
  SlidersHorizontal,
} from 'lucide-react-native';

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
  const UNIFIED_ICON_COLOR = '#16A34A';
  const UNIFIED_BG_TINT = '#ECFDF5';
  const UNIFIED_BORDER_COLOR = '#A7F3D0';

  const specs = [
    {
      id: 'transmission',
      label: 'Transmission',
      value: transmission || 'Automatique',
      icon: <Gauge size={19} color={UNIFIED_ICON_COLOR} />,
    },
    {
      id: 'carburant',
      label: 'Carburant',
      value: carburant || 'Essence',
      icon: <Fuel size={19} color={UNIFIED_ICON_COLOR} />,
    },
    {
      id: 'places',
      label: 'Capacité',
      value: `${nombrePlaces || 5} Places`,
      icon: <Users size={19} color={UNIFIED_ICON_COLOR} />,
    },
    {
      id: 'age',
      label: 'Âge Conducteur',
      value: `${ageMinimum || 21} ans min`,
      icon: <UserCheck size={19} color={UNIFIED_ICON_COLOR} />,
    },
    {
      id: 'duree',
      label: 'Location Min.',
      value: `${joursMinimum || 1} jour(s)`,
      icon: <Calendar size={19} color={UNIFIED_ICON_COLOR} />,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Titre de section avec icône */}
      <View style={styles.headerRow}>
        <View style={styles.titleIconBadge}>
          <SlidersHorizontal size={15} color="#16A34A" />
        </View>
        <Text style={styles.sectionTitle}>Caractéristiques Techniques</Text>
      </View>

      {/* Rangée défilante horizontale des 5 cartes d'indicateurs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {specs.map((item) => (
          <View key={item.id} style={styles.specCard}>
            <View style={[styles.iconContainer, { backgroundColor: UNIFIED_BG_TINT, borderColor: UNIFIED_BORDER_COLOR }]}>
              {item.icon}
            </View>
            <Text style={styles.specLabel}>{item.label}</Text>
            <Text style={styles.specValue} numberOfLines={1}>{item.value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
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
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#041912',
    letterSpacing: -0.2,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 20,
  },
  specCard: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4EBDB',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  specLabel: {
    fontSize: 11,
    color: '#5F6B59',
    fontWeight: '500',
    marginBottom: 3,
    textAlign: 'center',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#22271F',
    textAlign: 'center',
  },
});
