import React, { useState, useRef, memo, useMemo, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  FlatList,
  Dimensions,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Image } from 'expo-image';
import { Star, ArrowRight, RefreshCw, MapPin } from 'lucide-react-native';
import { VehicleFeedItem } from '../types';
import { theme } from '../../../core/theme';
import { useAppStore } from '../../../core/store/useAppStore';
import { formatConvertedPrice } from '../../../core/utils/currency';
import { clusterVehicleMarkers, MapRegion, MapMarkerCluster } from '../utils/geoClustering';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.82;
const CARD_MARGIN = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;

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
  hideCarousel?: boolean;
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
  hideCarousel = false,
}) => {
  const mapRef = useRef<MapView>(null);
  const carouselRef = useRef<FlatList>(null);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showSearchAreaBtn, setShowSearchAreaBtn] = useState<boolean>(false);
  const [currentRegion, setCurrentRegion] = useState<MapRegion>(DAKAR_REGION);
  const isProgrammaticScrollRef = useRef<boolean>(false);

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

  // Clic sur un marqueur de la carte -> Fait défiler le carrousel vers la carte correspondante
  const handleMarkerSelect = (v: ProcessedVehicle) => {
    const index = processedVehicles.findIndex((pv) => pv.id === v.id);
    if (index !== -1) {
      setSelectedIndex(index);
      isProgrammaticScrollRef.current = true;
      carouselRef.current?.scrollToIndex({ index, animated: true });
      centerMapOnVehicle(v);
      if (onSelectVehicle) {
        onSelectVehicle(v);
      }
    }
  };

  // Synchronisation en temps réel 120 FPS pendant le swipe du carrousel horizontal
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScrollRef.current) return;
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.max(0, Math.min(Math.round(offsetX / SNAP_INTERVAL), processedVehicles.length - 1));
    if (newIndex !== selectedIndex && processedVehicles[newIndex]) {
      setSelectedIndex(newIndex);
      centerMapOnVehicle(processedVehicles[newIndex]);
      if (onSelectVehicle) {
        onSelectVehicle(processedVehicles[newIndex]);
      }
    }
  }, [processedVehicles, selectedIndex, centerMapOnVehicle, onSelectVehicle]);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScrollRef.current) {
      isProgrammaticScrollRef.current = false;
      return;
    }
    handleScroll(event);
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

  const selectedVehicle = processedVehicles[selectedIndex] || null;

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
              isSelected={selectedVehicle?.id === v.id}
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

      {/* Carrousel Horizontal Style Airbnb en Bas de Carte */}
      {processedVehicles.length > 0 && !hideCarousel && (
        <View style={styles.carouselWrapper} pointerEvents="box-none">
          <FlatList
            ref={carouselRef}
            data={processedVehicles}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContentContainer}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            getItemLayout={(_, index) => ({
              length: SNAP_INTERVAL,
              offset: SNAP_INTERVAL * index,
              index,
            })}
            renderItem={({ item, index }) => {
              const isCardSelected = index === selectedIndex;
              return (
                <Pressable
                  style={[
                    styles.cardContainer,
                    isCardSelected && styles.cardContainerSelected,
                  ]}
                  onPress={() => {
                    setSelectedIndex(index);
                    centerMapOnVehicle(item);
                    onVehiclePress(item);
                  }}
                >
                  <Image
                    source={{
                      uri:
                        item.photoUrl ||
                        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
                    }}
                    style={styles.cardImg}
                    contentFit="cover"
                  />

                  <View style={styles.cardBody}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.marque} {item.modele}
                      </Text>

                      {item.note > 0 && (
                        <View style={styles.ratingBadge}>
                          <Star size={11} color="#F59E0B" fill="#F59E0B" />
                          <Text style={styles.ratingText}>
                            {item.note.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.locationRow}>
                      <MapPin size={11} color="#64748B" />
                      <Text style={styles.cardLoc} numberOfLines={1}>
                        {item.ville || 'Dakar'}
                      </Text>
                    </View>

                    <View style={styles.cardPriceRow}>
                      <Text style={styles.cardPrice}>
                        {formatConvertedPrice(item.prixParJour, selectedCurrency)}
                        <Text style={styles.perDay}> / j</Text>
                      </Text>

                      <View style={styles.viewDetailBtn}>
                        <Text style={styles.viewDetailText}>Voir</Text>
                        <ArrowRight size={12} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />
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

  /* Carrousel Horizontal Style Airbnb */
  carouselWrapper: {
    position: 'absolute',
    bottom: 95,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  carouselContentContainer: {
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.card,
    padding: 10,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardContainerSelected: {
    borderColor: theme.primitives.forest[800],
    borderWidth: 1.5,
  },
  cardImg: {
    width: 90,
    height: 80,
    borderRadius: 14,
    backgroundColor: '#0F172A',
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14.5,
    color: theme.primitives.forest[800],
    flex: 1,
    marginRight: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#0F172A',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardLoc: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#64748B',
    flex: 1,
  },
  cardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cardPrice: {
    fontFamily: theme.typography.fontFamily.extraBold,
    fontSize: 13.5,
    color: theme.primitives.forest[800],
  },
  perDay: {
    fontSize: 10.5,
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
