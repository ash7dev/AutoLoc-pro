'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { searchVehicles } from '@/lib/nestjs/vehicles';
import { HorizontalVehicleCarousel } from '../HorizontalVehicleCarousel';

export function NearbyVehiclesSection(): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Check if geolocation is already allowed or if we should show standard list
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setHasPermission(true);
          getLocationAndFetch();
        } else if (result.state === 'prompt') {
          setHasPermission(null);
          // Load default vehicles (non-geolocated) as initial view
          fetchDefaultVehicles();
        } else {
          setHasPermission(false);
          fetchDefaultVehicles();
        }
      });
    } else {
      fetchDefaultVehicles();
    }
  }, []);

  const fetchDefaultVehicles = async () => {
    setLoading(true);
    try {
      const res = await searchVehicles({ page: 1 });
      setVehicles(res.data || []);
    } catch (err) {
      console.error('Error fetching default vehicles', err);
    } finally {
      setLoading(false);
    }
  };

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
        } catch (err) {
          console.error('Error searching nearby vehicles', err);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setHasPermission(false);
        fetchDefaultVehicles();
      }
    );
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

        {!hasPermission && (
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
          <HorizontalVehicleCarousel vehicles={vehicles} />
        </div>
      )}
    </div>
  );
}
