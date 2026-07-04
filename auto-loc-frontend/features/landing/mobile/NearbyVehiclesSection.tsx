'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { searchVehicles, type VehicleSearchResult } from '@/lib/nestjs/vehicles';
import { HorizontalVehicleCarousel } from '../HorizontalVehicleCarousel';

interface NearbyVehiclesSectionProps {
  initialVehicles: VehicleSearchResult[];
  excludeIds: string[];
}

export function NearbyVehiclesSection({ initialVehicles, excludeIds }: NearbyVehiclesSectionProps): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleSearchResult[]>(initialVehicles);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const pageRef = useRef(2);
  const excludeIdsRef = useRef(excludeIds);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);

  // Resynchronise avec les données du feed quand elles arrivent (HomeMobile les fetch
  // de façon asynchrone) — sauf si la géolocalisation a déjà pris le relais.
  useEffect(() => {
    if (hasPermission === true) return;
    setVehicles(initialVehicles);
    excludeIdsRef.current = excludeIds;
    pageRef.current = 2;
    hasMoreRef.current = true;
  }, [initialVehicles, excludeIds, hasPermission]);

  // Keep the server-rendered recommendation feed by default. Geolocation is
  // intentionally user-triggered to avoid an extra API request on first paint.
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setHasPermission(result.state === 'prompt' ? null : result.state === 'granted');
      });
    }
  }, []);

  const getLocationAndFetch = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });
        setHasPermission(true);
        try {
          const res = await searchVehicles({
            latitude: lat,
            longitude: lng,
            rayon: 50, // 50 km
          });
          setVehicles(res.data || []);
          // Pagination invisible repartie de page 2 sur la base géolocalisée
          pageRef.current = 2;
          hasMoreRef.current = true;
        } catch (err) {
          console.error('Error searching nearby vehicles', err);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setHasPermission(false);
        setLoading(false);
      }
    );
  };

  const loadMore = async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    try {
      const res = await searchVehicles({
        page: pageRef.current,
        excludeIds: excludeIdsRef.current,
        ...(coords ? { latitude: coords.lat, longitude: coords.lng, rayon: 50 } : {}),
      });
      const newVehicles = res.data || [];
      if (newVehicles.length === 0) {
        hasMoreRef.current = false;
        return;
      }
      setVehicles((prev) => [...prev, ...newVehicles]);
      excludeIdsRef.current = [...excludeIdsRef.current, ...newVehicles.map((v) => v.id)];
      pageRef.current += 1;
    } catch (err) {
      console.error('Error loading more vehicles', err);
    } finally {
      loadingMoreRef.current = false;
    }
  };

  return (
    <div className="py-4 border-t border-slate-50">
      <div className="px-4 mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-black text-slate-800 tracking-tight uppercase flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-emerald-500" />
            {hasPermission && coords ? 'Près de chez vous' : 'Véhicules recommandés'}
          </h3>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-none">
            {hasPermission && coords ? 'Triage par distance' : 'Disponibles actuellement'}
          </p>
        </div>

        {!coords && (
          <button
            type="button"
            onClick={getLocationAndFetch}
            className="text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
          >
            <Navigation className="h-3 w-3" />
            À proximité
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
          <p className="text-[11px] font-semibold text-slate-400">Recherche en cours...</p>
        </div>
      ) : (
        <div className="px-4">
          <HorizontalVehicleCarousel vehicles={vehicles} onEndReached={loadMore} />
        </div>
      )}
    </div>
  );
}
