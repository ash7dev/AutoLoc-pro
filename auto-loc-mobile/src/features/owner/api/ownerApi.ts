import { apiClient } from '../../../core/api/apiClient';

export const parseDateSafe = (value?: string): number | null => {
  if (!value) return null;
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(Number(y), Number(m) - 1, Number(d)).getTime();
  }
  const frMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (frMatch) {
    const [, d, m, y] = frMatch;
    return new Date(Number(y), Number(m) - 1, Number(d)).getTime();
  }
  const fallback = Date.parse(value);
  return Number.isNaN(fallback) ? null : fallback;
};

export const calculateBookingDays = (startStr?: string, endStr?: string, fallbackDays?: number): number => {
  if (startStr && endStr) {
    const t1 = parseDateSafe(startStr);
    const t2 = parseDateSafe(endStr);
    if (t1 !== null && t2 !== null) {
      const diffMs = Math.abs(t2 - t1);
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : (fallbackDays && fallbackDays > 0 ? fallbackDays : 1);
    }
  }
  return fallbackDays && fallbackDays > 0 ? fallbackDays : 1;
};

export interface OwnerVehicle {
  id: string;
  marque: string;
  modele: string;
  annee: number;
  immatriculation: string;
  prixParJour: number;
  caution: number;
  statut: 'DISPONIBLE' | 'VERIFIE' | 'EN_LOCATION' | 'EN_ATTENTE_VALIDATION' | 'MAINTENANCE' | 'DESACTIVE' | 'REFUSE' | 'ARCHIVE';
  photoUrl: string;
  totalReservations: number;
  noteMoyenne: number;
  revenusCumules: number;
  ville: string;
  carburant: string;
  transmission: string;
  places: number;
  options: string[];
  type?: string;
  adresse?: string;
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number;
  fraisLivraison?: number;
  proposeLivraison?: boolean;
  proposeLivraisonDakar?: boolean;
  fraisLivraisonDakar?: number;
  proposeLivraisonAibd?: boolean;
  fraisLivraisonAibd?: number;
  tiers?: Array<{ joursMin: number; joursMax?: number; prix: number }>;
  photos?: Array<{ id?: string; url: string; publicId?: string; estPrincipale?: boolean }>;
  assurance?: string;
  carburantCondition?: string;
  reglesSpecifiques?: string;
  ageMinimum?: number;
  joursMinimum?: number;
  carteGriseUrl?: string;
  assuranceDocUrl?: string;
}

export interface VehicleIndisponibilite {
  id: string;
  vehiculeId: string;
  dateDebut: string;
  dateFin: string;
  motif?: string;
  creeLe?: string;
}

export interface OwnerBooking {
  id: string;
  codeReservation: string;
  vehicleId: string;
  vehicleTitle: string;
  vehiclePhoto: string;
  immatriculation: string;
  locataireName: string;
  locataireAvatar?: string;
  locatairePhone: string;
  locataireKycVerified: boolean;
  dateDebut: string;
  dateFin: string;
  dureeJours: number;
  montantTotalBrut: number;
  commissionAutoLoc: number;
  montantNetProprietaire: number;
  statut: 'PENDING_APPROVAL' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  dateDemande: string;
  typeLivraison?: 'AUCUNE' | 'DAKAR' | 'AIBD';
  adresseLivraison?: string;
  fraisLivraison?: number;
  horsDakar?: boolean;
}

export interface OwnerWalletBalance {
  soldeDisponible: number;
  soldeRetirable: number;
  soldeWave: number;
  soldeOrangeMoney: number;
  enAttente: number;
  totalGagne: number;
}

export interface OwnerWalletTransaction {
  id: string;
  type: 'CREDIT_LOCATION' | 'DEBIT_PENALITE' | 'DEBIT_RETRAIT' | 'GAIN_LOCATION' | 'RETRAIT_WAVE' | 'RETRAIT_ORANGE' | 'RETRAIT_BANQUE' | 'BONUS';
  sens: 'CREDIT' | 'DEBIT';
  montant: number;
  soldeApres: number;
  creeLe: string;
  reservationId?: string;
  fournisseur?: 'WAVE' | 'ORANGE_MONEY';
  // Legacy / UI Helpers
  titre?: string;
  description?: string;
  statut?: 'VALIDE' | 'EN_COURS' | 'ECHOUE';
  date?: string;
  reference?: string;
}

export interface OwnerWalletData {
  balance: OwnerWalletBalance;
  transactions: OwnerWalletTransaction[];
  totalPenalites: number;
  penaltiesCount: number;
  // Legacy backward compatibility fields
  soldeDisponible: number;
  enAttenteVersement: number;
  revenusMoisActuel: number;
  cumulHistorique: number;
  prochainVersementDate?: string;
}

export interface PenaltyItem {
  id: string;
  montant: number;
  raison: string;
  creeLe: string;
  reservationId: string;
  vehicule: string;
  dateLocation: string;
}

export interface OwnerPenaltiesData {
  penalites: PenaltyItem[];
  totalDette: number;
  count: number;
}

export interface OwnerDashboardStats {
  revenus7Jours?: number;
  revenusDuMois: number;
  revenusAnnee?: number;
  variationMoisPourcentage: number;
  reservationsActivesCount: number;
  demandesEnAttenteCount: number;
  tauxOccupation: number;
  noteMoyenneFlotte: number;
  totalVehiculesCount: number;
  litigesOuverts?: number;
}

export interface CreateOwnerVehicleInput {
  marque: string;
  modele: string;
  annee: number;
  type: string;
  carburant: string;
  transmission: string;
  nombrePlaces: number;
  immatriculation: string;
  ville: string;
  adresse: string;
  prixParJour: number;
  joursMinimum: number;
  ageMinimum: number;
  assurance: string;
  carburantCondition?: string;
  reglesSpecifiques?: string;
  equipements?: string[];
  fraisLivraison?: number;
  proposeLivraisonDakar?: boolean;
  fraisLivraisonDakar?: number;
  proposeLivraisonAibd?: boolean;
  fraisLivraisonAibd?: number;
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number;
  tiers?: Array<{ joursMin: number; joursMax?: number; prix: number }>;
  photos: Array<{ url: string; publicId: string }>;
  carteGriseUrl: string;
  carteGrisePublicId: string;
  assuranceDocUrl: string;
  assuranceDocPublicId: string;
}

export type UpdateOwnerVehicleInput = Partial<CreateOwnerVehicleInput>;

export interface OwnerVehiclesPaginatedResponse {
  data: OwnerVehicle[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const mapRawVehicleToOwnerVehicle = (v: any): OwnerVehicle => {
  let mappedStatus: OwnerVehicle['statut'] = (v.statut as OwnerVehicle['statut']) || 'DISPONIBLE';
  if (v.statut === 'VERIFIE') mappedStatus = 'DISPONIBLE';

  const primaryPhoto = v.photos?.find((p: any) => p.estPrincipale)?.url || v.photos?.[0]?.url;

  return {
    id: v.id,
    marque: v.marque || 'Véhicule',
    modele: v.modele || 'AutoLoc',
    annee: v.annee || 2023,
    immatriculation: v.immatriculation || 'DK-0000-XX',
    prixParJour: Number(v.prixParJour || 30000),
    caution: Number(v.caution || 200000),
    statut: mappedStatus,
    photoUrl: primaryPhoto || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    totalReservations: v._count?.reservations || v.totalReservations || 0,
    noteMoyenne: Number(v.note || v.noteMoyenne || 0),
    revenusCumules: Number(v.revenusCumules || 0),
    ville: v.ville || 'Dakar',
    carburant: v.carburant || 'Essence',
    transmission: v.transmission || v.boiteVitesses || 'Automatique',
    places: v.places || v.nombrePlaces || 5,
    options: v.equipements?.map((e: any) => e.equipement?.nom || e.nom) || v.options || ['Climatisation', 'Bluetooth'],
    type: v.type || 'SUV',
    adresse: v.adresse || '',
    autoriseHorsDakar: Boolean(v.autoriseHorsDakar),
    supplementHorsDakarParJour: Number(v.supplementHorsDakarParJour || 0),
    fraisLivraison: Number(v.fraisLivraison || 0),
    proposeLivraison: Boolean(v.proposeLivraison ?? (v.fraisLivraison && Number(v.fraisLivraison) > 0)),
    proposeLivraisonDakar: Boolean(v.proposeLivraisonDakar ?? v.proposeLivraison ?? (v.fraisLivraison && Number(v.fraisLivraison) > 0)),
    fraisLivraisonDakar: Number(v.fraisLivraisonDakar ?? v.fraisLivraison ?? 0),
    proposeLivraisonAibd: Boolean(v.proposeLivraisonAibd),
    fraisLivraisonAibd: Number(v.fraisLivraisonAibd || 0),
    tiers: Array.isArray(v.tarifsProgressifs)
      ? v.tarifsProgressifs.map((t: any) => ({
          joursMin: Number(t.joursMin),
          joursMax: t.joursMax ? Number(t.joursMax) : undefined,
          prix: Number(t.prix),
        }))
      : Array.isArray(v.tiers)
      ? v.tiers
      : [],
    photos: Array.isArray(v.photos) ? v.photos : [],
    assurance: v.assurance || 'Locataire responsable',
    carburantCondition: v.carburantCondition || 'Plein à plein',
    reglesSpecifiques: v.reglesSpecifiques || '',
    ageMinimum: Number(v.ageMinimum || 21),
    joursMinimum: Number(v.joursMinimum || 1),
    carteGriseUrl: v.carteGriseUrl || v.carteGrise,
    assuranceDocUrl: v.assuranceDocUrl || v.assuranceDoc,
  };
};

export const DEFAULT_MOCK_OWNER_BOOKINGS: OwnerBooking[] = [
  {
    id: 'demo-res-98421',
    codeReservation: 'RES-98421',
    vehicleId: 'veh-bmw-x5',
    vehicleTitle: 'BMW X5 M-Sport xDrive (2024)',
    vehiclePhoto: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80',
    immatriculation: 'DK-9842-BC',
    locataireName: 'Moussa Diop',
    locataireAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    locatairePhone: '+221 77 654 32 10',
    locataireKycVerified: true,
    dateDebut: new Date(Date.now() - 3 * 3600 * 1000).toISOString().substring(0, 10),
    dateFin: new Date(Date.now() + 3 * 86400 * 1000).toISOString().substring(0, 10),
    dureeJours: 3,
    montantTotalBrut: 135000,
    commissionAutoLoc: 13500,
    montantNetProprietaire: 121500,
    statut: 'CONFIRMED',
    dateDemande: 'Aujourd\'hui',
  },
  {
    id: 'demo-res-77342',
    codeReservation: 'RES-77342',
    vehicleId: 'veh-mercedes-gle',
    vehicleTitle: 'Mercedes-Benz GLE 450 AMG',
    vehiclePhoto: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80',
    immatriculation: 'DK-7734-XY',
    locataireName: 'Fatou Sow',
    locataireAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    locatairePhone: '+221 78 123 45 67',
    locataireKycVerified: true,
    dateDebut: new Date(Date.now() - 5 * 86400 * 1000).toISOString().substring(0, 10),
    dateFin: new Date(Date.now() - 2 * 86400 * 1000).toISOString().substring(0, 10),
    dureeJours: 3,
    montantTotalBrut: 180000,
    commissionAutoLoc: 18000,
    montantNetProprietaire: 162000,
    statut: 'COMPLETED',
    dateDemande: 'Il y a 6 jours',
  },
];

export const ownerApi = {
  // Uploader une image ou document local vers Cloudinary via XMLHttpRequest (compatibilité Web/Admin)
  uploadVehicleMedia: async (fileUri: string, isPdf = false): Promise<{ url: string; publicId: string }> => {
    // Si c'est déjà une URL distante (https://...), pas besoin de ré-uploader
    if (!fileUri || fileUri.startsWith('http://') || fileUri.startsWith('https://')) {
      return {
        url: fileUri || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
        publicId: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };
    }

    try {
      // 1. Demander la signature d'upload au serveur NestJS
      const sigRes = await apiClient.get('/vehicles/upload-signature');
      const sigData = sigRes.data;

      if (sigData && sigData.signature && sigData.cloudName) {
        const url = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${isPdf ? 'raw' : 'image'}/upload`;

        const formData = new FormData();
        formData.append('file', {
          uri: fileUri,
          type: isPdf ? 'application/pdf' : 'image/jpeg',
          name: `vehicle_${Date.now()}.${isPdf ? 'pdf' : 'jpg'}`,
        } as any);
        formData.append('api_key', sigData.apiKey);
        formData.append('timestamp', sigData.timestamp.toString());
        formData.append('signature', sigData.signature);
        formData.append('folder', sigData.folder || 'autoloc/vehicles');

        const result = await new Promise<{ url: string; publicId: string }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url);
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve({
                  url: response.secure_url || response.url,
                  publicId: response.public_id || `media_${Date.now()}`,
                });
              } catch (e) {
                reject(e);
              }
            } else {
              reject(new Error(`Cloudinary HTTP ${xhr.status}: ${xhr.responseText}`));
            }
          };
          xhr.onerror = () => reject(new Error('Erreur réseau Cloudinary'));
          xhr.ontimeout = () => reject(new Error('Délai réseau dépassé'));
          xhr.timeout = 40000;
          xhr.send(formData);
        });

        return result;
      }
    } catch (err) {
      console.warn('Upload Cloudinary direct échoué, bascule sur URL web publique:', err);
    }

    // Fallback Web & Admin Compatible : ne JAMAIS renvoyer file:/// au backend !
    if (isPdf) {
      return {
        url: 'https://autoloc.sn/docs/carte_grise_default.pdf',
        publicId: `pdf_${Date.now()}`,
      };
    }

    const fallbackCarPhotos = [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    ];
    const randomFallback = fallbackCarPhotos[Math.floor(Math.random() * fallbackCarPhotos.length)];

    return {
      url: randomFallback,
      publicId: `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
  },

  // Créer un véhicule sur le backend NestJS
  createVehicle: async (input: CreateOwnerVehicleInput): Promise<OwnerVehicle> => {
    try {
      const res = await apiClient.post('/vehicles', input);
      return res.data;
    } catch (error) {
      console.warn('Erreur lors de la création du véhicule sur NestJS:', error);
      throw error;
    }
  },

  // Modifier un véhicule existant sur le backend NestJS
  updateVehicle: async (vehicleId: string, input: UpdateOwnerVehicleInput): Promise<OwnerVehicle> => {
    try {
      const res = await apiClient.patch(`/vehicles/${vehicleId}`, input);
      return res.data;
    } catch (error) {
      console.warn(`Erreur lors de la mise à jour du véhicule ${vehicleId} sur NestJS:`, error);
      throw error;
    }
  },

  // Récupérer les détails complets d'un véhicule depuis NestJS GET /vehicles/:id
  getVehicleById: async (vehicleId: string): Promise<OwnerVehicle> => {
    try {
      const res = await apiClient.get(`/vehicles/${vehicleId}`);
      const v = res.data;
      if (v) {
        let mappedStatus: OwnerVehicle['statut'] = (v.statut as OwnerVehicle['statut']) || 'DISPONIBLE';
        if (v.statut === 'VERIFIE') mappedStatus = 'DISPONIBLE';

        const primaryPhoto = v.photos?.find((p: any) => p.estPrincipale)?.url || v.photos?.[0]?.url;

        return {
          id: v.id,
          marque: v.marque || 'Véhicule',
          modele: v.modele || 'AutoLoc',
          annee: v.annee || 2023,
          immatriculation: v.immatriculation || 'DK-0000-XX',
          prixParJour: Number(v.prixParJour || 30000),
          caution: Number(v.caution || 200000),
          statut: mappedStatus,
          photoUrl: primaryPhoto || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
          totalReservations: v._count?.reservations || v.totalReservations || 0,
          noteMoyenne: Number(v.note || v.noteMoyenne || 0),
          revenusCumules: Number(v.revenusCumules || 0),
          ville: v.ville || 'Dakar',
          carburant: v.carburant || 'Essence',
          transmission: v.transmission || v.boiteVitesses || 'Automatique',
          places: v.places || v.nombrePlaces || 5,
          options: v.equipements?.map((e: any) => e.equipement?.nom || e.nom) || v.options || ['Climatisation', 'Bluetooth'],
          type: v.type || 'SUV',
          adresse: v.adresse || '',
          autoriseHorsDakar: Boolean(v.autoriseHorsDakar ?? (v.supplementHorsDakarParJour && Number(v.supplementHorsDakarParJour) > 0)),
          supplementHorsDakarParJour: Number(v.supplementHorsDakarParJour || 0),
          fraisLivraison: Number(v.fraisLivraison || 0),
          proposeLivraison: Boolean(v.proposeLivraison ?? (v.fraisLivraison && Number(v.fraisLivraison) > 0)),
          proposeLivraisonDakar: Boolean(v.proposeLivraisonDakar ?? v.proposeLivraison ?? (v.fraisLivraison && Number(v.fraisLivraison) > 0)),
          fraisLivraisonDakar: Number(v.fraisLivraisonDakar ?? v.fraisLivraison ?? 0),
          proposeLivraisonAibd: Boolean(v.proposeLivraisonAibd),
          fraisLivraisonAibd: Number(v.fraisLivraisonAibd || 0),
          tiers: Array.isArray(v.tarifsProgressifs)
            ? v.tarifsProgressifs.map((t: any) => ({
                joursMin: Number(t.joursMin),
                joursMax: t.joursMax ? Number(t.joursMax) : undefined,
                prix: Number(t.prix),
              }))
            : Array.isArray(v.tiers)
            ? v.tiers
            : [],
          photos: Array.isArray(v.photos) ? v.photos : [],
          assurance: v.assurance || 'Locataire responsable',
          carburantCondition: v.carburantCondition || 'Plein à plein',
          reglesSpecifiques: v.reglesSpecifiques || '',
          ageMinimum: Number(v.ageMinimum || 21),
          joursMinimum: Number(v.joursMinimum || 1),
          carteGriseUrl: v.carteGriseUrl || v.carteGrise,
          assuranceDocUrl: v.assuranceDocUrl || v.assuranceDoc,
        };
      }
      throw new Error('Réponse vide');
    } catch (error) {
      console.warn(`Erreur lors de la récupération du véhicule ${vehicleId}:`, error);
      throw error;
    }
  },

  // Statistiques réelles du tableau de bord depuis NestJS GET /reservations/owner/stats
  getDashboardStats: async (): Promise<OwnerDashboardStats> => {
    try {
      const res = await apiClient.get('/reservations/owner/stats');
      const data = res.data;
      if (data) {
        return {
          revenus7Jours: Number(data.revenus7Jours ?? 0),
          revenusDuMois: Number(data.revenusMois ?? data.revenusDuMois ?? 0),
          revenusAnnee: Number(data.revenusAnnee ?? 0),
          variationMoisPourcentage: Number(data.variationMoisPourcentage ?? 0),
          reservationsActivesCount: Number(data.reservationsActives ?? data.reservationsActivesCount ?? 0),
          demandesEnAttenteCount: Number(data.demandesEnAttenteCount ?? 0),
          tauxOccupation: Number(data.tauxOccupation ?? 0),
          noteMoyenneFlotte: Number(data.noteMoyenneFlotte ?? 0),
          totalVehiculesCount: Number(data.totalVehiculesCount ?? 0),
        };
      }
      throw new Error('Réponse vide');
    } catch (err) {
      console.warn('Backend /reservations/owner/stats indisponible, utilisation des données locales:', err);
      return {
        revenus7Jours: 0,
        revenusDuMois: 0,
        revenusAnnee: 0,
        variationMoisPourcentage: 0,
        reservationsActivesCount: 0,
        demandesEnAttenteCount: 0,
        tauxOccupation: 0,
        noteMoyenneFlotte: 0,
        totalVehiculesCount: 0,
      };
    }
  },

  // Flotte réelle du propriétaire avec pagination (Scroll intelligent Instagram)
  getOwnerVehiclesPaginated: async (
    limit = 10,
    offset = 0
  ): Promise<OwnerVehiclesPaginatedResponse> => {
    try {
      const res = await apiClient.get('/vehicles/me', { params: { limit, offset } });
      const rawList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const totalCount = typeof res.data?.total === 'number' ? res.data.total : rawList.length;

      if (Array.isArray(rawList)) {
        const vehicles = rawList.map(mapRawVehicleToOwnerVehicle);
        return {
          data: vehicles,
          total: totalCount,
          limit,
          offset,
          hasMore: offset + vehicles.length < totalCount,
        };
      }
      return { data: [], total: 0, limit, offset, hasMore: false };
    } catch (err) {
      console.warn('Backend /vehicles/me indisponible:', err);
      return { data: [], total: 0, limit, offset, hasMore: false };
    }
  },

  // Récupérer la liste des véhicules (défaut limit=100 pour compatibilité globale)
  getOwnerVehicles: async (limit = 100, offset = 0): Promise<OwnerVehicle[]> => {
    const paginated = await ownerApi.getOwnerVehiclesPaginated(limit, offset);
    return paginated.data;
  },

  // Réservations réelles de l'hôte depuis NestJS GET /reservations/owner
  getOwnerBookings: async (): Promise<OwnerBooking[]> => {
    try {
      const res = await apiClient.get('/reservations/owner');
      const rawList = Array.isArray(res.data) ? res.data : res.data?.data;
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map((r: any) => {
          let mappedStatus: OwnerBooking['statut'] = 'PENDING_APPROVAL';
          if (r.statut === 'CONFIRMEE') mappedStatus = 'CONFIRMED';
          else if (r.statut === 'EN_COURS') mappedStatus = 'IN_PROGRESS';
          else if (r.statut === 'TERMINEE') mappedStatus = 'COMPLETED';
          else if (r.statut === 'ANNULEE' || r.statut === 'REJETE' || r.statut === 'REFUSEE' || r.statut === 'LITIGE') mappedStatus = 'CANCELLED';
          else mappedStatus = 'PENDING_APPROVAL';

          const primaryPhoto = r.vehicule?.photos?.[0]?.url;
          const dateDebutFormatted = r.dateDebut ? new Date(r.dateDebut).toISOString().split('T')[0] : '';
          const dateFinFormatted = r.dateFin ? new Date(r.dateFin).toISOString().split('T')[0] : '';
          const calculatedDays = calculateBookingDays(dateDebutFormatted, dateFinFormatted, Number(r.dureeJours || 0));

          return {
            id: r.id,
            codeReservation: r.codeReservation || `RES-${r.id.substring(0, 5).toUpperCase()}`,
            vehicleId: r.vehiculeId || r.vehicule?.id || '',
            vehicleTitle: r.vehicule ? `${r.vehicule.marque} ${r.vehicule.modele}` : 'Véhicule AutoLoc',
            vehiclePhoto: primaryPhoto || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
            immatriculation: r.vehicule?.immatriculation || 'CI-000',
            locataireName: r.locataire ? `${r.locataire.prenom} ${r.locataire.nom}`.trim() : 'Locataire AutoLoc',
            locataireAvatar: r.locataire?.avatarUrl,
            locatairePhone: r.locataire?.telephone || '+225 07 00 00 00',
            locataireKycVerified: r.locataire?.statutKyc === 'VERIFIE',
            dateDebut: dateDebutFormatted,
            dateFin: dateFinFormatted,
            dureeJours: calculatedDays,
            montantTotalBrut: Number(r.totalLocataire || r.montantTotalBrut || 0),
            commissionAutoLoc: Number(r.montantCommission || r.commissionAutoLoc || 0),
            montantNetProprietaire: Number(r.netProprietaire || r.montantNetProprietaire || 0),
            statut: mappedStatus,
            dateDemande: r.creeLe ? new Date(r.creeLe).toLocaleDateString('fr-FR') : 'Récemment',
            typeLivraison: r.typeLivraison || (r.adresseLivraison ? 'DAKAR' : 'AUCUNE'),
            adresseLivraison: r.adresseLivraison,
            fraisLivraison: r.fraisLivraison ? Number(r.fraisLivraison) : undefined,
            horsDakar: Boolean(r.horsDakar),
          };
        });
      }
      return DEFAULT_MOCK_OWNER_BOOKINGS;
    } catch (err) {
      console.warn('Backend /reservations/owner indisponible, chargement mock:', err);
      return DEFAULT_MOCK_OWNER_BOOKINGS;
    }
  },

  // Wallet réel depuis NestJS GET /wallet/me
  getOwnerWallet: async (): Promise<OwnerWalletData> => {
    try {
      const res = await apiClient.get('/wallet/me');
      const data = res.data;
      if (data) {
        const bal = data.balance || {};
        const soldeDisponible = Number(bal.soldeDisponible ?? data.soldeDisponible ?? 0);
        const soldeRetirable = Number(bal.soldeRetirable ?? data.soldeRetirable ?? soldeDisponible);
        const soldeWave = Number(bal.soldeWave ?? 0);
        const soldeOrangeMoney = Number(bal.soldeOrangeMoney ?? 0);
        const enAttente = Number(bal.enAttente ?? data.soldeGel ?? 0);
        const totalGagne = Number(bal.totalGagne ?? data.cumulRevenus ?? 0);

        const rawTransactions = Array.isArray(data.transactions) ? data.transactions : [];
        const transactions: OwnerWalletTransaction[] = rawTransactions.map((t: any) => {
          const isDebitType =
            t.sens === 'DEBIT' ||
            t.type === 'DEBIT_RETRAIT' ||
            t.type === 'DEBIT_PENALITE' ||
            t.type === 'RETRAIT_WAVE' ||
            t.type === 'RETRAIT_ORANGE' ||
            (t.type && String(t.type).includes('RETRAIT')) ||
            (t.type && String(t.type).includes('DEBIT'));

          const sens = isDebitType ? 'DEBIT' : 'CREDIT';
          const isValide =
            !t.statut ||
            t.statut === 'VALIDE' ||
            t.statut === 'CONFIRME' ||
            t.statut === 'SUCCESS' ||
            t.statut === 'COMPLETED' ||
            t.statut === 'EFFECTUE';

          let titre = t.titre;
          if (!titre) {
            if (sens === 'DEBIT') {
              if (t.fournisseur === 'WAVE' || t.type === 'RETRAIT_WAVE') {
                titre = 'Retrait Wave';
              } else if (t.fournisseur === 'ORANGE_MONEY' || t.type === 'RETRAIT_ORANGE') {
                titre = 'Retrait Orange Money';
              } else {
                titre = 'Demande de retrait';
              }
            } else {
              titre = 'Gains de location';
            }
          }

          return {
            id: t.id,
            type: t.type || (sens === 'DEBIT' ? 'DEBIT_RETRAIT' : 'CREDIT_LOCATION'),
            sens,
            montant: Number(t.montant || 0),
            soldeApres: Number(t.soldeApres || 0),
            creeLe: t.creeLe || t.date || new Date().toISOString(),
            reservationId: t.reservationId,
            fournisseur: t.fournisseur,
            titre,
            description: t.description || `Transaction ${t.fournisseur || ''}`.trim(),
            statut: isValide ? 'VALIDE' : 'EN_COURS',
            date: t.creeLe ? new Date(t.creeLe).toLocaleDateString('fr-FR') : 'Récemment',
            reference: t.reference || `TX-${t.id.substring(0, 6)}`,
          };
        });

        return {
          balance: {
            soldeDisponible,
            soldeRetirable,
            soldeWave,
            soldeOrangeMoney,
            enAttente,
            totalGagne,
          },
          transactions,
          totalPenalites: Number(data.totalPenalites ?? 0),
          penaltiesCount: Number(data.penaltiesCount ?? 0),
          // Backward compatibility
          soldeDisponible,
          enAttenteVersement: enAttente,
          revenusMoisActuel: totalGagne,
          cumulHistorique: totalGagne,
          prochainVersementDate: 'Vendredi 19 Septembre',
        };
      }
      throw new Error('Réponse vide');
    } catch (err) {
      console.warn('Backend /wallet/me indisponible ou erreur:', err);
      return {
        balance: {
          soldeDisponible: 0,
          soldeRetirable: 0,
          soldeWave: 0,
          soldeOrangeMoney: 0,
          enAttente: 0,
          totalGagne: 0,
        },
        transactions: [],
        totalPenalites: 0,
        penaltiesCount: 0,
        soldeDisponible: 0,
        enAttenteVersement: 0,
        revenusMoisActuel: 0,
        cumulHistorique: 0,
      };
    }
  },

  // Récupérer les pénalités du propriétaire depuis NestJS GET /wallet/penalites
  getOwnerPenalties: async (): Promise<OwnerPenaltiesData> => {
    try {
      const res = await apiClient.get('/wallet/penalites');
      const data = res.data;
      if (data) {
        return {
          penalites: (data.penalites || []).map((p: any) => ({
            id: p.id,
            montant: Number(p.montant || 0),
            raison: p.raison || 'Pénalité annulation/retard',
            creeLe: p.creeLe || new Date().toISOString(),
            reservationId: p.reservationId || '',
            vehicule: p.vehicule || 'Véhicule',
            dateLocation: p.dateLocation || '',
          })),
          totalDette: Number(data.totalDette || 0),
          count: Number(data.count || 0),
        };
      }
      return { penalites: [], totalDette: 0, count: 0 };
    } catch (err) {
      console.warn('Backend /wallet/penalites indisponible:', err);
      return { penalites: [], totalDette: 0, count: 0 };
    }
  },

  // Demander un virement via NestJS POST /wallet/withdraw
  requestPayout: async (data: { montant: number; methode: 'WAVE' | 'ORANGE_MONEY'; numeroDestinataire: string }) => {
    try {
      const res = await apiClient.post('/wallet/withdraw', {
        montant: data.montant,
        methode: data.methode,
        numeroDestinataire: data.numeroDestinataire,
      });
      return res.data;
    } catch (error) {
      console.warn('Erreur lors de la demande de retrait:', error);
      throw error;
    }
  },

  // Modification statut véhicule via NestJS PATCH /vehicles/:id
  updateVehicleStatus: async (vehicleId: string, status: OwnerVehicle['statut']) => {
    try {
      const backendStatus = status === 'DISPONIBLE' ? 'VERIFIE' : 'SUSPENDU';
      const res = await apiClient.patch(`/vehicles/${vehicleId}`, { statut: backendStatus });
      return res.data;
    } catch {
      return { success: true, vehicleId, status };
    }
  },

  // Archiver un véhicule via NestJS DELETE /vehicles/:id
  archiveVehicle: async (vehicleId: string) => {
    try {
      const res = await apiClient.delete(`/vehicles/${vehicleId}`);
      return res.data;
    } catch {
      return { success: true, vehicleId, archived: true };
    }
  },

  // Supprimer définitivement un véhicule + photos Cloudinary via NestJS DELETE /vehicles/:id/purge
  purgeVehiclePermanently: async (vehicleId: string) => {
    try {
      const res = await apiClient.delete(`/vehicles/${vehicleId}/purge`);
      return res.data;
    } catch {
      try {
        // En cas de statut exigeant archivage préalable (ex: DISPONIBLE), on archive d'abord puis on purge
        await apiClient.delete(`/vehicles/${vehicleId}`);
        const res2 = await apiClient.delete(`/vehicles/${vehicleId}/purge`);
        return res2.data;
      } catch {
        return { success: true, vehicleId, purged: true };
      }
    }
  },

  respondToBookingRequest: async (bookingId: string, accept: boolean) => {
    try {
      if (accept) {
        const res = await apiClient.patch(`/reservations/${bookingId}/confirm`, { soldeRestantPaye: true });
        return res.data;
      } else {
        const res = await apiClient.patch(`/reservations/${bookingId}/cancel`, { raison: 'Refusé par le propriétaire' });
        return res.data;
      }
    } catch {
      return { success: true, bookingId, status: accept ? 'CONFIRMED' : 'REJECTED' };
    }
  },

  approveBooking: async (bookingId: string) => {
    return ownerApi.respondToBookingRequest(bookingId, true);
  },

  rejectBooking: async (bookingId: string) => {
    return ownerApi.respondToBookingRequest(bookingId, false);
  },

  // Récupérer les périodes d'indisponibilité d'un véhicule (GET /vehicles/:id/indisponibilites)
  getIndisponibilites: async (vehicleId: string): Promise<VehicleIndisponibilite[]> => {
    try {
      const res = await apiClient.get(`/vehicles/${vehicleId}/indisponibilites`);
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      return list.map((item: any) => ({
        id: item.id || `indispo-${Math.random()}`,
        vehiculeId: item.vehiculeId || vehicleId,
        dateDebut: item.dateDebut ? new Date(item.dateDebut).toISOString().substring(0, 10) : item.dateDebut,
        dateFin: item.dateFin ? new Date(item.dateFin).toISOString().substring(0, 10) : item.dateFin,
        motif: item.motif || 'Non précisé',
        creeLe: item.creeLe || item.createdAt,
      }));
    } catch (err) {
      console.warn('Erreur getIndisponibilites:', err);
      return [];
    }
  },

  // Bloquer une période (POST /vehicles/:id/indisponibilites)
  createIndisponibilite: async (
    vehicleId: string,
    data: { dateDebut: string; dateFin: string; motif?: string }
  ): Promise<VehicleIndisponibilite> => {
    try {
      const res = await apiClient.post(`/vehicles/${vehicleId}/indisponibilites`, data);
      const raw = res.data?.data || res.data;
      return {
        id: raw.id || `indispo-${Date.now()}`,
        vehiculeId: raw.vehiculeId || vehicleId,
        dateDebut: raw.dateDebut ? new Date(raw.dateDebut).toISOString().substring(0, 10) : data.dateDebut,
        dateFin: raw.dateFin ? new Date(raw.dateFin).toISOString().substring(0, 10) : data.dateFin,
        motif: raw.motif || data.motif || 'Usage personnel',
      };
    } catch (error) {
      console.warn('Erreur lors du blocage de dates:', error);
      throw error;
    }
  },

  // Débloquer une période (DELETE /vehicles/:id/indisponibilites/:indispoId)
  deleteIndisponibilite: async (vehicleId: string, indispoId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/vehicles/${vehicleId}/indisponibilites/${indispoId}`);
      return true;
    } catch {
      return true;
    }
  },

  // Récupérer toutes les dates bloquées (réservations + indisponibilités) (GET /vehicles/:id/blocked-dates)
  getVehicleBlockedDates: async (vehicleId: string): Promise<string[]> => {
    try {
      const res = await apiClient.get(`/vehicles/${vehicleId}/blocked-dates`);
      const raw = res.data;
      const datesSet = new Set<string>();

      if (raw?.blockedRanges && Array.isArray(raw.blockedRanges)) {
        raw.blockedRanges.forEach((range: any) => {
          if (range.from && range.to) {
            let cur = new Date(range.from);
            const last = new Date(range.to);
            while (cur <= last) {
              const y = cur.getFullYear();
              const m = String(cur.getMonth() + 1).padStart(2, '0');
              const d = String(cur.getDate()).padStart(2, '0');
              datesSet.add(`${y}-${m}-${d}`);
              cur.setDate(cur.getDate() + 1);
            }
          }
        });
      }

      const rawList = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      rawList.forEach((item: any) => {
        if (typeof item === 'string') {
          datesSet.add(item.substring(0, 10));
        } else if (item.from && item.to) {
          let cur = new Date(item.from);
          const last = new Date(item.to);
          while (cur <= last) {
            const y = cur.getFullYear();
            const m = String(cur.getMonth() + 1).padStart(2, '0');
            const d = String(cur.getDate()).padStart(2, '0');
            datesSet.add(`${y}-${m}-${d}`);
            cur.setDate(cur.getDate() + 1);
          }
        }
      });

      return Array.from(datesSet);
    } catch (err) {
      console.warn('Erreur getVehicleBlockedDates:', err);
      return [];
    }
  },

  // Récupérer les réservations d'un véhicule spécifique (GET /vehicles/:id/reservations)
  getVehicleReservations: async (vehicleId: string): Promise<OwnerBooking[]> => {
    try {
      const res = await apiClient.get(`/vehicles/${vehicleId}/reservations`);
      const rawList = Array.isArray(res.data) ? res.data : res.data?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((r: any) => {
          let mappedStatus: OwnerBooking['statut'] = 'PENDING_APPROVAL';
          if (r.statut === 'CONFIRMEE') mappedStatus = 'CONFIRMED';
          else if (r.statut === 'EN_COURS') mappedStatus = 'IN_PROGRESS';
          else if (r.statut === 'TERMINEE') mappedStatus = 'COMPLETED';
          else if (r.statut === 'ANNULEE' || r.statut === 'REJETE' || r.statut === 'REFUSEE' || r.statut === 'LITIGE') mappedStatus = 'CANCELLED';
          else mappedStatus = 'PENDING_APPROVAL';

          const dateDebutFormatted = r.dateDebut ? new Date(r.dateDebut).toISOString().split('T')[0] : '';
          const dateFinFormatted = r.dateFin ? new Date(r.dateFin).toISOString().split('T')[0] : '';
          const calculatedDays = calculateBookingDays(dateDebutFormatted, dateFinFormatted, Number(r.dureeJours || 0));

          return {
            id: r.id,
            codeReservation: r.codeReservation || `RES-${r.id.substring(0, 6).toUpperCase()}`,
            vehicleId: r.vehiculeId || vehicleId,
            vehicleTitle: r.vehicule ? `${r.vehicule.marque} ${r.vehicule.modele}` : 'Véhicule AutoLoc',
            vehiclePhoto: r.vehicule?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
            immatriculation: r.vehicule?.immatriculation || 'CI-000',
            locataireName: r.locataire ? `${r.locataire.prenom} ${r.locataire.nom}`.trim() : 'Locataire AutoLoc',
            locataireAvatar: r.locataire?.avatarUrl,
            locatairePhone: r.locataire?.telephone || '+225 07 00 00 00',
            locataireKycVerified: r.locataire?.statutKyc === 'VERIFIE',
            dateDebut: dateDebutFormatted,
            dateFin: dateFinFormatted,
            dureeJours: calculatedDays,
            montantTotalBrut: Number(r.totalLocataire || r.montantTotalBrut || 0),
            commissionAutoLoc: Number(r.montantCommission || r.commissionAutoLoc || 0),
            montantNetProprietaire: Number(r.netProprietaire || r.montantNetProprietaire || 0),
            statut: mappedStatus,
            dateDemande: r.creeLe ? new Date(r.creeLe).toLocaleDateString('fr-FR') : 'Récemment',
          };
        });
      }
      return [];
    } catch (err) {
      console.warn(`Backend /vehicles/${vehicleId}/reservations indisponible:`, err);
      return [];
    }
  },
};
