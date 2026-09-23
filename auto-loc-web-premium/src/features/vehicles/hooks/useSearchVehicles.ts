"use client";

import useSWR from 'swr';
import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Vehicle, VehicleType, TransmissionType, FuelType, VehicleSortOption } from '../types/vehicle.types';
import { vehicleService } from '../services/vehicleService';

export interface VehicleFilterState {
  q: string;
  ville: string;
  zone: string;
  dateDebut: string;
  dateFin: string;
  type: VehicleType | '';
  transmission: TransmissionType | '';
  carburant: FuelType | '';
  prixMin: number | null;
  prixMax: number | null;
  placesMin: number | null;
  noteMin: number | null;
  sortBy: VehicleSortOption;
}

const DEFAULT_FILTERS: VehicleFilterState = {
  q: '',
  ville: '',
  zone: '',
  dateDebut: '',
  dateFin: '',
  type: '',
  transmission: '',
  carburant: '',
  prixMin: null,
  prixMax: null,
  placesMin: null,
  noteMin: null,
  sortBy: 'popular',
};

export function useSearchVehicles() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Initialiser les filtres depuis les searchParams de l'URL
  const getFiltersFromURL = useCallback((): VehicleFilterState => {
    const rawZone = searchParams.get('zone') || searchParams.get('destination') || '';
    const rawVille = searchParams.get('ville') || '';
    const rawDateDebut = searchParams.get('dateDebut') || searchParams.get('debut') || '';
    const rawDateFin = searchParams.get('dateFin') || searchParams.get('fin') || '';

    return {
      q: searchParams.get('q') || '',
      ville: rawVille,
      zone: rawZone,
      dateDebut: rawDateDebut,
      dateFin: rawDateFin,
      type: (searchParams.get('type') as VehicleType) || '',
      transmission: (searchParams.get('transmission') as TransmissionType) || '',
      carburant: (searchParams.get('carburant') as FuelType) || '',
      prixMin: searchParams.get('prixMin') ? Number(searchParams.get('prixMin')) : null,
      prixMax: searchParams.get('prixMax') ? Number(searchParams.get('prixMax')) : null,
      placesMin: searchParams.get('placesMin') ? Number(searchParams.get('placesMin')) : null,
      noteMin: searchParams.get('noteMin') ? Number(searchParams.get('noteMin')) : null,
      sortBy: (searchParams.get('sortBy') as VehicleSortOption) || 'popular',
    };
  }, [searchParams]);

  const [filters, setFiltersState] = useState<VehicleFilterState>(getFiltersFromURL);
  const [extraVehicles, setExtraVehicles] = useState<Vehicle[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const LIMIT = 9;

  // Resynchroniser avec l'URL en cas de navigation externe / retour arrière
  useEffect(() => {
    const urlFilters = getFiltersFromURL();
    setFiltersState(urlFilters);
    setExtraVehicles([]);
    setPage(1);
  }, [searchParams, getFiltersFromURL]);

  // Mettre à jour l'URL avec les filtres actifs
  const syncURLWithFilters = useCallback((newFilters: VehicleFilterState) => {
    const params = new URLSearchParams();

    if (newFilters.q) params.set('q', newFilters.q);
    if (newFilters.ville) params.set('ville', newFilters.ville);
    if (newFilters.zone) params.set('zone', newFilters.zone);
    if (newFilters.dateDebut) params.set('dateDebut', newFilters.dateDebut);
    if (newFilters.dateFin) params.set('dateFin', newFilters.dateFin);
    if (newFilters.type) params.set('type', newFilters.type);
    if (newFilters.transmission) params.set('transmission', newFilters.transmission);
    if (newFilters.carburant) params.set('carburant', newFilters.carburant);
    if (newFilters.prixMin) params.set('prixMin', newFilters.prixMin.toString());
    if (newFilters.prixMax) params.set('prixMax', newFilters.prixMax.toString());
    if (newFilters.placesMin) params.set('placesMin', newFilters.placesMin.toString());
    if (newFilters.noteMin) params.set('noteMin', newFilters.noteMin.toString());
    if (newFilters.sortBy && newFilters.sortBy !== 'popular') params.set('sortBy', newFilters.sortBy);

    const queryString = params.toString();
    const newPath = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(newPath, { scroll: false });
    });
  }, [pathname, router]);

  // Helper pour construire les paramètres d'API compatibles backend NestJS
  const buildApiParams = useCallback((currentFilters: VehicleFilterState, pageNum: number) => {
    const apiParams: Record<string, any> = {
      limit: LIMIT,
      page: pageNum,
    };

    if (currentFilters.q && currentFilters.q.trim()) apiParams.q = currentFilters.q.trim();
    if (currentFilters.ville) apiParams.ville = currentFilters.ville;
    if (currentFilters.zone) apiParams.zone = currentFilters.zone;
    if (currentFilters.dateDebut) apiParams.dateDebut = currentFilters.dateDebut;
    if (currentFilters.dateFin) apiParams.dateFin = currentFilters.dateFin;
    if (currentFilters.type) apiParams.type = currentFilters.type;
    if (currentFilters.transmission) apiParams.transmission = currentFilters.transmission;
    if (currentFilters.carburant) apiParams.carburant = currentFilters.carburant;
    if (currentFilters.prixMin != null) apiParams.prixMin = currentFilters.prixMin;
    if (currentFilters.prixMax != null) apiParams.prixMax = currentFilters.prixMax;
    if (currentFilters.placesMin != null) apiParams.placesMin = currentFilters.placesMin;
    if (currentFilters.noteMin != null) apiParams.noteMin = currentFilters.noteMin;

    if (currentFilters.sortBy === 'price-asc') {
      apiParams.sortBy = 'prixParJour';
      apiParams.sortOrder = 'asc';
    } else if (currentFilters.sortBy === 'price-desc') {
      apiParams.sortBy = 'prixParJour';
      apiParams.sortOrder = 'desc';
    } else if (currentFilters.sortBy === 'rating') {
      apiParams.sortBy = 'note';
      apiParams.sortOrder = 'desc';
    } else if (currentFilters.sortBy === 'newest') {
      apiParams.sortBy = 'annee';
      apiParams.sortOrder = 'desc';
    } else if (currentFilters.sortBy === 'popular') {
      apiParams.sort = 'popular';
    }

    return apiParams;
  }, []);

  const swrKey = ['search-vehicles', buildApiParams(filters, 1)];

  const { data: rawResponse, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    () => vehicleService.searchVehicles(buildApiParams(filters, 1)),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60_000,
    }
  );

  const initialList: Vehicle[] = Array.isArray(rawResponse)
    ? rawResponse
    : (rawResponse?.data || []);
  const totalCount: number = Array.isArray(rawResponse)
    ? rawResponse.length
    : (rawResponse?.total ?? initialList.length);

  const vehicles = page === 1 ? initialList : [...initialList, ...extraVehicles];
  const hasMore = vehicles.length < totalCount;

  // Load More pour la pagination infinie
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const apiParams = buildApiParams(filters, nextPage);
      const res = await vehicleService.searchVehicles(apiParams);

      const newItems: Vehicle[] = Array.isArray(res) ? res : (res?.data || []);
      
      setExtraVehicles(prev => {
        const existingIds = new Set([...initialList, ...prev].map(v => v.id));
        const filteredNewItems = newItems.filter(v => !existingIds.has(v.id));
        return [...prev, ...filteredNewItems];
      });

      setPage(nextPage);
    } catch (err: any) {
      console.error('[useSearchVehicles] Error loading more vehicles:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [buildApiParams, filters, hasMore, initialList, isLoading, isLoadingMore, page]);

  // Helpers pour modifier un ou plusieurs filtres
  const setFilter = useCallback(<K extends keyof VehicleFilterState>(key: K, value: VehicleFilterState[K]) => {
    setFiltersState(prev => {
      const next = { ...prev, [key]: value };
      syncURLWithFilters(next);
      return next;
    });
    setExtraVehicles([]);
    setPage(1);
  }, [syncURLWithFilters]);

  const updateFilters = useCallback((partial: Partial<VehicleFilterState>) => {
    setFiltersState(prev => {
      const next = { ...prev, ...partial };
      syncURLWithFilters(next);
      return next;
    });
    setExtraVehicles([]);
    setPage(1);
  }, [syncURLWithFilters]);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    syncURLWithFilters(DEFAULT_FILTERS);
    setExtraVehicles([]);
    setPage(1);
  }, [syncURLWithFilters]);

  const activeFiltersCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'sortBy') return false;
    if (val === '' || val === null) return false;
    return true;
  }).length;

  return {
    vehicles,
    total: totalCount,
    isLoading: isLoading && !rawResponse, // Ne passe à true que lors du TOUT PREMIER chargement sans cache
    isValidating,
    isLoadingMore,
    isPending,
    error: error ? (error.message || 'Impossible de charger les véhicules') : null,
    hasMore,
    loadMore,
    filters,
    setFilter,
    updateFilters,
    resetFilters,
    activeFiltersCount,
    refetch: () => mutate(),
  };
}

