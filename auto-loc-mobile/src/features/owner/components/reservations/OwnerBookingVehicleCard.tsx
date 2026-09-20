import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, Truck, Plane, Navigation, Home } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

export interface OwnerBookingVehicleCardProps {
  photoUrl?: string;
  marque?: string;
  modele?: string;
  immatriculation?: string;
  typeLivraison?: 'AUCUNE' | 'DAKAR' | 'AIBD' | string | null;
  adresseLivraison?: string | null;
  horsDakar?: boolean | null;
  ville?: string;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80';

export const OwnerBookingVehicleCard: React.FC<OwnerBookingVehicleCardProps> = ({
  photoUrl,
  marque,
  modele,
  immatriculation,
  typeLivraison,
  adresseLivraison,
  horsDakar,
  ville,
}) => {
  const isAibd = typeLivraison === 'AIBD' || (adresseLivraison && adresseLivraison.toLowerCase().includes('aibd'));
  const isDakar = typeLivraison === 'DAKAR' || (adresseLivraison && !isAibd);

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

        {/* Badges Mode de Prise en Main / Livraison */}
        <View style={styles.badgesRow}>
          {isAibd ? (
            <View style={[styles.deliveryPill, styles.aibdPill]}>
              <Plane size={11} color="#0284C7" />
              <Text style={styles.aibdPillText}>Livraison AIBD</Text>
            </View>
          ) : isDakar ? (
            <View style={[styles.deliveryPill, styles.dakarPill]}>
              <Truck size={11} color="#059669" />
              <Text style={styles.dakarPillText}>Livraison Dakar</Text>
            </View>
          ) : (
            <View style={[styles.deliveryPill, styles.homePill]}>
              <Home size={11} color="#475569" />
              <Text style={styles.homePillText}>Prise chez l'hôte</Text>
            </View>
          )}

          {horsDakar && (
            <View style={[styles.deliveryPill, styles.horsDakarPill]}>
              <Navigation size={11} color="#D97706" />
              <Text style={styles.horsDakarPillText}>Hors Dakar</Text>
            </View>
          )}
        </View>

        <View style={styles.locationRow}>
          <MapPin size={13} color={theme.colors.brand.main} />
          <Text style={styles.locationText} numberOfLines={2}>
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
  vehicleImage: { width: 110, minHeight: 125 },
  vehicleBody: { flex: 1, padding: 14, gap: 5, justifyContent: 'center' },
  vehicleName: { color: '#072A20', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 16.5 },
  vehicleMeta: { color: '#64748B', fontFamily: theme.typography.fontFamily.regular, fontSize: 12 },
  badgesRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  deliveryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  dakarPill: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  dakarPillText: { fontFamily: theme.typography.fontFamily.bold, fontSize: 10.5, color: '#059669' },
  aibdPill: { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' },
  aibdPillText: { fontFamily: theme.typography.fontFamily.bold, fontSize: 10.5, color: '#0284C7' },
  homePill: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  homePillText: { fontFamily: theme.typography.fontFamily.bold, fontSize: 10.5, color: '#475569' },
  horsDakarPill: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  horsDakarPillText: { fontFamily: theme.typography.fontFamily.bold, fontSize: 10.5, color: '#B45309' },
  locationRow: { flexDirection: 'row', gap: 5, alignItems: 'flex-start', marginTop: 3 },
  locationText: { flex: 1, color: '#475569', fontFamily: theme.typography.fontFamily.medium, fontSize: 11, lineHeight: 16 },
});
