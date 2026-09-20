import React, { useState, useRef, memo, useMemo, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Image } from 'expo-image';
import { RefreshCw } from 'lucide-react-native';
import { VehicleFeedItem } from '../types';
import { theme } from '../../../core/theme';
import { useAppStore } from '../../../core/store/useAppStore';
import { formatConvertedPrice } from '../../../core/utils/currency';
import { clusterVehicleMarkers, MapRegion, MapMarkerCluster } from '../utils/geoClustering';


const DAKAR_REGION: MapRegion = {
  latitude: 14.7167,
  longitude: -17.4677,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

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
  Dakar: { latitude: 14.7167, longitude: -17.4677 },
};

export interface ExploreMapViewerProps {
  vehicles: VehicleFeedItem[];
  userLocation?: { latitude: number; longitude: number } | null;
  onVehiclePress: (vehicle: VehicleFeedItem) => void;
  onSearchInArea?: (region?: MapRegion) => void;
  onSelectVehicle?: (vehicle: VehicleFeedItem) => void;
}

interface ProcessedVehicle extends VehicleFeedItem {
  computedLat: number;
  computedLng: number;
  isApproximate: boolean;
}

const PriceMarker = memo(({
  vehicle,
  isSelected,
  onSelect,
  formattedPrice,
}: {
  vehicle: ProcessedVehicle;
  isSelected: boolean;
  onSelect: (v: ProcessedVehicle) => void;
  formattedPrice: string;
}) => {
  return (
    <Marker
      coordinate={{ latitude: vehicle.computedLat, longitude: vehicle.computedLng }}
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
          {vehicle.isApproximate ? '≈ ' : ''}{formattedPrice}
        </Text>
      </View>
    </Marker>
  );
});

const ClusterMarker = memo(({
  cluster,
  onPress,
}: {
  cluster: Extract<MapMarkerCluster, { isCluster: true }>;
  onPress: (cluster: Extract<MapMarkerCluster, { isCluster: true }>) => void;
}) => {
  return (
    <Marker
      coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
      onPress={() => onPress(cluster)}
      tracksViewChanges={false}
      zIndex={50}
    >
      <View style={styles.clusterBadge}>
        <Text style={styles.clusterCountText}>{cluster.count}</Text>
        <Text style={styles.clusterSubtext}>véhicules</Text>
      </View>
    </Marker>
  );
});

export const ExploreMapViewer: React.FC<ExploreMapViewerProps> = ({
  vehicles,
  userLocation,
  onVehiclePress,
  onSearchInArea,
  onSelectVehicle,
}) => {
  const mapRef = useRef<MapView>(null);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showSearchAreaBtn, setShowSearchAreaBtn] = useState<boolean>(false);
  const [currentRegion, setCurrentRegion] = useState<MapRegion>(DAKAR_REGION);

  // Dispersion en spirale pour étaler les marqueurs se superposant sur la même ville
  const processedVehicles = useMemo(() => {
    const coordMap: Record<string, number> = {};
    return vehicles.map((v) => {
      let lat = v.latitude;
      let lng = v.longitude;
      let isApproximate = false;

      if (!lat || !lng) {
        const baseLoc = DAKAR_LOCATIONS[v.ville] || DAKAR_LOCATIONS['Dakar'] || DAKAR_REGION;
        lat = baseLoc.latitude;
        lng = baseLoc.longitude;
        isApproximate = true;
      }

      const key = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
      const count = coordMap[key] || 0;
      coordMap[key] = count + 1;

      if (count > 0) {
        const angle = count * 1.35;
        const radius = 0.003 * Math.sqrt(count);
        lat = lat + radius * Math.cos(angle);
        lng = lng + radius * Math.sin(angle);
      }

      return {
        ...v,
        computedLat: lat,
        computedLng: lng,
        isApproximate,
      };
    });
  }, [vehicles]);

  const initialRegion = useMemo(() => {
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

  // Clustering géospatial dynamique
  const clusteredMarkers = useMemo(() => {
    return clusterVehicleMarkers(processedVehicles, currentRegion, 55);
  }, [processedVehicles, currentRegion]);

  // Centrer la caméra sur le véhicule actif
  const centerMapOnVehicle = useCallback((vehicle: ProcessedVehicle) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: vehicle.computedLat,
          longitude: vehicle.computedLng,
          latitudeDelta: Math.min(currentRegion.latitudeDelta, 0.05),
          longitudeDelta: Math.min(currentRegion.longitudeDelta, 0.05),
        },
        250
      );
    }
  }, [currentRegion]);

  // Ajuster automatiquement le cadrage de la caméra au chargement initial
  useEffect(() => {
    if (processedVehicles.length > 0 && mapRef.current) {
      const coords = processedVehicles.map((v) => ({
        latitude: v.computedLat,
        longitude: v.computedLng,
      }));
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  }, [processedVehicles.length]);

  // Zoomer sur un groupe/cluster au clic
  const handleClusterPress = useCallback((cluster: Extract<MapMarkerCluster, { isCluster: true }>) => {
    if (mapRef.current) {
      const coords = cluster.points.map((p) => ({
        latitude: p.computedLat,
        longitude: p.computedLng,
      }));
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 60, bottom: 220, left: 60 },
        animated: true,
      });
    }
  }, []);

  // Clic sur un marqueur de la carte -> Notifie le parent pour scroll BottomSheet
  const handleMarkerSelect = (v: ProcessedVehicle) => {
    const index = processedVehicles.findIndex((pv) => pv.id === v.id);
    if (index !== -1) {
      setSelectedIndex(index);
      centerMapOnVehicle(v);
      if (onSelectVehicle) {
        onSelectVehicle(v);
      }
    }
  };



  const handleSearchAreaPress = () => {
    setShowSearchAreaBtn(false);
    if (onSearchInArea) {
      onSearchInArea(currentRegion);
    } else if (processedVehicles.length > 0 && mapRef.current) {
      const coords = processedVehicles.map((v) => ({
        latitude: v.computedLat,
        longitude: v.computedLng,
      }));
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  };

  const selectedVehicleId = processedVehicles[selectedIndex]?.id || null;

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
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        onRegionChangeComplete={(region) => {
          setCurrentRegion(region);
          setShowSearchAreaBtn(true);
        }}
      >
        {clusteredMarkers.map((item) => {
          if (item.isCluster) {
            return (
              <ClusterMarker
                key={item.id}
                cluster={item}
                onPress={handleClusterPress}
              />
            );
          }

          const v = item.vehicle as ProcessedVehicle;
          return (
            <PriceMarker
              key={v.id}
              vehicle={v}
              isSelected={selectedVehicleId === v.id}
              onSelect={handleMarkerSelect}
              formattedPrice={formatConvertedPrice(v.prixParJour, selectedCurrency)}
            />
          );
        })}
      </MapView>

      {/* Bouton Flottant style Airbnb : Rechercher dans cette zone */}
      {showSearchAreaBtn ? (
        <TouchableOpacity
          style={styles.searchAreaBtn}
          onPress={handleSearchAreaPress}
          activeOpacity={0.85}
        >
          <RefreshCw size={13} color="#072A20" />
          <Text style={styles.searchAreaText}>Rechercher dans cette zone</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.locationNotice} pointerEvents="none">
          <Text style={styles.locationNoticeText}>≈ Zone de prise en charge indicative</Text>
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
    borderRadius: theme.radius.full,
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
    backgroundColor: theme.primitives.forest[800],
    borderColor: theme.primitives.forest[800],
    transform: [{ scale: 1.12 }],
  },
  markerText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#0F172A',
  },
  markerTextSelected: {
    color: '#FFFFFF',
  },
  clusterBadge: {
    backgroundColor: '#072A20',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4ADE80',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  clusterCountText: {
    fontFamily: theme.typography.fontFamily.extraBold,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 16,
  },
  clusterSubtext: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    color: '#4ADE80',
    marginTop: 1,
  },
  searchAreaBtn: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  searchAreaText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#072A20',
  },
  locationNotice: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  locationNoticeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#475569',
  },


});
