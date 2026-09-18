import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MapPin } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

export interface OwnerBookingVehicleCardProps {
  photoUrl?: string;
  marque?: string;
  modele?: string;
  immatriculation?: string;
  adresseLivraison?: string | null;
  ville?: string;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80';

export const OwnerBookingVehicleCard: React.FC<OwnerBookingVehicleCardProps> = ({
  photoUrl,
  marque,
  modele,
  immatriculation,
  adresseLivraison,
  ville,
}) => {
  return (
    <View style={styles.vehicleCard}>
      <Image source={{ uri: photoUrl || FALLBACK_IMAGE }} contentFit="cover" style={styles.vehicleImage} />
      <View style={styles.vehicleBody}>
        <Text style={styles.vehicleName}>
          {marque} {modele}
        </Text>
        <Text style={styles.vehicleMeta}>
          Immatriculation : {immatriculation || 'En attente'}
        </Text>
        <View style={styles.locationRow}>
          <MapPin size={13} color={theme.colors.brand.main} />
          <Text style={styles.locationText}>
            {adresseLivraison || ville || 'Dakar'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  vehicleCard: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vehicleImage: { width: 110, minHeight: 118 },
  vehicleBody: { flex: 1, padding: 14, gap: 5, justifyContent: 'center' },
  vehicleName: { color: '#072A20', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 17 },
  vehicleMeta: { color: '#64748B', fontFamily: theme.typography.fontFamily.regular, fontSize: 12 },
  locationRow: { flexDirection: 'row', gap: 5, alignItems: 'flex-start', marginTop: 3 },
  locationText: { flex: 1, color: '#475569', fontFamily: theme.typography.fontFamily.medium, fontSize: 11, lineHeight: 16 },
});
