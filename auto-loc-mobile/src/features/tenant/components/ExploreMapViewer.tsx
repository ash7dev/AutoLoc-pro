import React, { useState, useRef, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Image } from 'expo-image';
import { Star, ArrowRight, X } from 'lucide-react-native';
import { VehicleFeedItem } from '../types';
import { theme } from '../../../core/theme';
import { useAppStore } from '../../../core/store/useAppStore';
import { formatConvertedPrice } from '../../../core/utils/currency';

const DAKAR_REGION = {
  latitude: 14.7167,
  longitude: -17.4677,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

// Fixed mock fallback coordinates for Dakar neighborhoods if vehicle has no exact lat/lng
const DAKAR_LOCATIONS: Record<string, { latitude: number; longitude: number }> = {
  Almadies: { latitude: 14.7456, longitude: -17.5189 },
  Plateau: { latitude: 14.6672, longitude: -17.4344 },
  Ngor: { latitude: 14.7505, longitude: -17.5144 },
  Ouakam: { latitude: 14.7231, longitude: -17.4891 },
  Mermoz: { latitude: 14.7088, longitude: -17.4728 },
  Fann: { latitude: 14.6903, longitude: -17.4625 },
  PointE: { latitude: 14.6931, longitude: -17.4589 },
  Yoff: { latitude: 14.7602, longitude: -17.4672 },
  Thiès: { latitude: 14.7903, longitude: -16.9261 },
  Saly: { latitude: 14.4442, longitude: -17.0211 },
};

export interface ExploreMapViewerProps {
  vehicles: VehicleFeedItem[];
  userLocation?: { latitude: number; longitude: number } | null;
  onVehiclePress: (vehicle: VehicleFeedItem) => void;
}

const PriceMarker = memo(({
  vehicle,
  isSelected,
  onSelect,
  formattedPrice,
}: {
  vehicle: VehicleFeedItem & { latitude?: number; longitude?: number };
  isSelected: boolean;
  onSelect: (v: VehicleFeedItem) => void;
  formattedPrice: string;
}) => {
  // Determine coordinates: exact lat/lng or fallback based on city/hash
  const coords = React.useMemo(() => {
    if (vehicle.latitude && vehicle.longitude) {
      return { latitude: vehicle.latitude, longitude: vehicle.longitude };
    }
    const locMatch = DAKAR_LOCATIONS[vehicle.ville] || DAKAR_LOCATIONS['Almadies'];
    // Add deterministic micro offset based on vehicle ID string char codes
    const hash = vehicle.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const latOffset = ((hash % 30) - 15) * 0.003;
    const lngOffset = (((hash * 7) % 30) - 15) * 0.003;
    return {
      latitude: locMatch.latitude + latOffset,
      longitude: locMatch.longitude + lngOffset,
    };
  }, [vehicle]);

  return (
    <Marker
      coordinate={coords}
      onPress={() => onSelect(vehicle)}
      tracksViewChanges={false}
      zIndex={isSelected ? 100 : 1}
    >
      <View
        style={[
          styles.markerBadge,
          isSelected && styles.markerBadgeSelected,
        ]}
      >
        <Text
          style={[
            styles.markerText,
            isSelected && styles.markerTextSelected,
          ]}
        >
          {formattedPrice}
        </Text>
      </View>
    </Marker>
  );
});

export const ExploreMapViewer: React.FC<ExploreMapViewerProps> = ({
  vehicles,
  userLocation,
  onVehiclePress,
}) => {
  const mapRef = useRef<MapView>(null);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleFeedItem | null>(null);

  const initialRegion = React.useMemo(() => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
    }
    return DAKAR_REGION;
  }, [userLocation]);

  const handleSelectVehicle = (v: VehicleFeedItem) => {
    setSelectedVehicle(v);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={Boolean(userLocation)}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {vehicles.map((v) => (
          <PriceMarker
            key={v.id}
            vehicle={v}
            isSelected={selectedVehicle?.id === v.id}
            onSelect={handleSelectVehicle}
            formattedPrice={formatConvertedPrice(v.prixParJour, selectedCurrency)}
          />
        ))}
      </MapView>

      {/* Overlay Mini Card lors de la sélection d'un marqueur */}
      {selectedVehicle && (
        <View style={styles.cardOverlay}>
          <TouchableOpacity
            style={styles.closeCardBtn}
            onPress={() => setSelectedVehicle(null)}
            hitSlop={10}
          >
            <X size={14} color="#64748B" />
          </TouchableOpacity>

          <Pressable
            style={styles.miniCardInner}
            onPress={() => onVehiclePress(selectedVehicle)}
          >
            <Image
              source={{
                uri: selectedVehicle.photoUrl ||
                  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
              }}
              style={styles.miniCardImg}
              contentFit="cover"
            />

            <View style={styles.miniCardBody}>
              <View style={styles.miniCardHeaderRow}>
                <Text style={styles.miniCardTitle} numberOfLines={1}>
                  {selectedVehicle.marque} {selectedVehicle.modele}
                </Text>

                {selectedVehicle.note > 0 && (
                  <View style={styles.ratingBadge}>
                    <Star size={11} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.ratingText}>
                      {selectedVehicle.note.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.miniCardLoc}>
                {selectedVehicle.ville || 'Dakar'} • Sénégal
              </Text>

              <View style={styles.miniCardPriceRow}>
                <Text style={styles.miniCardPrice}>
                  {formatConvertedPrice(selectedVehicle.prixParJour, selectedCurrency)}
                  <Text style={styles.perDay}> / jour</Text>
                </Text>

                <View style={styles.viewDetailBtn}>
                  <Text style={styles.viewDetailText}>Voir</Text>
                  <ArrowRight size={13} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  markerBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.full, // 9999px
    borderWidth: 1,
    borderColor: '#CBD5E1',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  markerBadgeSelected: {
    backgroundColor: theme.primitives.forest[800], // #072A20
    borderColor: theme.primitives.forest[800],
    transform: [{ scale: 1.1 }],
  },
  markerText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#0F172A',
  },
  markerTextSelected: {
    color: '#FFFFFF',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.card, // 20px
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  closeCardBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  miniCardInner: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  miniCardImg: {
    width: 90,
    height: 80,
    borderRadius: 14,
    backgroundColor: '#0F172A',
  },
  miniCardBody: {
    flex: 1,
    gap: 3,
  },
  miniCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
  },
  miniCardTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: theme.primitives.forest[800],
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11.5,
    color: '#0F172A',
  },
  miniCardLoc: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#64748B',
  },
  miniCardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  miniCardPrice: {
    fontFamily: theme.typography.fontFamily.extraBold,
    fontSize: 14,
    color: theme.primitives.forest[800],
  },
  perDay: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748B',
  },
  viewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primitives.forest[800],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 4,
  },
  viewDetailText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },
});
