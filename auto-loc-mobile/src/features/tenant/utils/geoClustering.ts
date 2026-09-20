import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ProcessedVehicleItem {
  id: string;
  computedLat: number;
  computedLng: number;
  prixParJour: number;
  isApproximate: boolean;
  [key: string]: any;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export type MapMarkerCluster =
  | {
      isCluster: true;
      id: string;
      latitude: number;
      longitude: number;
      count: number;
      points: ProcessedVehicleItem[];
      minPrice: number;
    }
  | {
      isCluster: false;
      id: string;
      latitude: number;
      longitude: number;
      vehicle: ProcessedVehicleItem;
    };

/**
 * Calcule les clusters de marqueurs en fonction des limites et du zoom de la carte.
 * @param items Liste des véhicules avec coordonnées calculées
 * @param region Région actuelle de la carte
 * @param clusterRadius Radius en pixels pour regrouper les marqueurs (ex: 55px)
 */
export function clusterVehicleMarkers(
  items: ProcessedVehicleItem[],
  region: MapRegion,
  clusterRadius: number = 55
): MapMarkerCluster[] {
  if (!items || items.length === 0) return [];

  // Si le dézomm est très serré (très grand zoom / petit delta), afficher tous les marqueurs individuels
  if (region.latitudeDelta < 0.015 && region.longitudeDelta < 0.015) {
    return items.map((v) => ({
      isCluster: false,
      id: v.id,
      latitude: v.computedLat,
      longitude: v.computedLng,
      vehicle: v,
    }));
  }

  const latDelta = Math.max(region.latitudeDelta, 0.0001);
  const lngDelta = Math.max(region.longitudeDelta, 0.0001);

  // Conversion Coordonnées GPS -> Pixels Écran approximatifs
  const toPixel = (lat: number, lng: number) => {
    const x = ((lng - region.longitude) / lngDelta) * SCREEN_WIDTH;
    const y = ((region.latitude - lat) / latDelta) * SCREEN_HEIGHT;
    return { x, y };
  };

  const clusters: {
    latitude: number;
    longitude: number;
    points: ProcessedVehicleItem[];
  }[] = [];

  const visited = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (visited.has(item.id)) continue;

    const p1 = toPixel(item.computedLat, item.computedLng);
    const clusterPoints: ProcessedVehicleItem[] = [item];
    visited.add(item.id);

    for (let j = i + 1; j < items.length; j++) {
      const neighbor = items[j];
      if (visited.has(neighbor.id)) continue;

      const p2 = toPixel(neighbor.computedLat, neighbor.computedLng);
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= clusterRadius) {
        clusterPoints.push(neighbor);
        visited.add(neighbor.id);
      }
    }

    // Calcul du centre de gravité du cluster
    const avgLat =
      clusterPoints.reduce((acc, p) => acc + p.computedLat, 0) /
      clusterPoints.length;
    const avgLng =
      clusterPoints.reduce((acc, p) => acc + p.computedLng, 0) /
      clusterPoints.length;

    clusters.push({
      latitude: avgLat,
      longitude: avgLng,
      points: clusterPoints,
    });
  }

  return clusters.map((c, index) => {
    if (c.points.length === 1) {
      const v = c.points[0];
      return {
        isCluster: false,
        id: v.id,
        latitude: v.computedLat,
        longitude: v.computedLng,
        vehicle: v,
      };
    }

    const minPrice = Math.min(...c.points.map((p) => p.prixParJour));

    return {
      isCluster: true,
      id: `cluster_${index}_${c.points.length}`,
      latitude: c.latitude,
      longitude: c.longitude,
      count: c.points.length,
      points: c.points,
      minPrice,
    };
  });
}
