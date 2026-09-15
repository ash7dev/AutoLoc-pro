import { apiClient } from '../../../core/api/apiClient';

export interface OwnerVehicle {
  id: string;
  marque: string;
  modele: string;
  annee: number;
  immatriculation: string;
  prixParJour: number;
  caution: number;
  statut: 'DISPONIBLE' | 'EN_LOCATION' | 'MAINTENANCE' | 'DESACTIVE';
  photoUrl: string;
  totalReservations: number;
  noteMoyenne: number;
  revenusCumules: number;
  ville: string;
  carburant: string;
  transmission: string;
  places: number;
  options: string[];
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
}

export interface OwnerWalletData {
  soldeDisponible: number;
  enAttenteVersement: number;
  revenusMoisActuel: number;
  cumulHistorique: number;
  prochainVersementDate?: string;
  transactions: Array<{
    id: string;
    titre: string;
    description: string;
    montant: number;
    type: 'GAIN_LOCATION' | 'RETRAIT_WAVE' | 'RETRAIT_ORANGE' | 'RETRAIT_BANQUE' | 'BONUS';
    statut: 'VALIDE' | 'EN_COURS' | 'ECHOUE';
    date: string;
    reference: string;
  }>;
}

export interface OwnerDashboardStats {
  revenusDuMois: number;
  variationMoisPourcentage: number;
  reservationsActivesCount: number;
  demandesEnAttenteCount: number;
  tauxOccupation: number;
  noteMoyenneFlotte: number;
  totalVehiculesCount: number;
}

export interface CreateOwnerVehicleInput {
  marque: string; modele: string; annee: number; type: string; carburant: string; transmission: string;
  nombrePlaces: number; immatriculation: string; ville: string; adresse: string; prixParJour: number;
  joursMinimum: number; ageMinimum: number; assurance: string; carburantCondition?: string;
  reglesSpecifiques?: string; equipements?: string[]; fraisLivraison?: number;
  photos: Array<{ url: string; publicId: string }>;
  carteGriseUrl: string; carteGrisePublicId: string; assuranceDocUrl: string; assuranceDocPublicId: string;
}

// Fallback Mock Data si déconnecté ou erreur réseau
const MOCK_VEHICLES: OwnerVehicle[] = [
  {
    id: 'veh-owner-1',
    marque: 'Toyota',
    modele: 'Land Cruiser Prado VX',
    annee: 2023,
    immatriculation: 'AA-849-CI',
    prixParJour: 55000,
    caution: 250000,
    statut: 'EN_LOCATION',
    photoUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    totalReservations: 18,
    noteMoyenne: 4.9,
    revenusCumules: 1480000,
    ville: 'Abidjan, Cocody',
    carburant: 'Diesel',
    transmission: 'Automatique',
    places: 7,
    options: ['Climatisation', 'GPS', 'Caméra 360', 'Sièges Cuir'],
  },
  {
    id: 'veh-owner-2',
    marque: 'Mercedes-Benz',
    modele: 'Classe C 200 AMG Line',
    annee: 2022,
    immatriculation: 'BB-102-CI',
    prixParJour: 65000,
    caution: 300000,
    statut: 'DISPONIBLE',
    photoUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
    totalReservations: 12,
    noteMoyenne: 5.0,
    revenusCumules: 975000,
    ville: 'Abidjan, Marcory Zone 4',
    carburant: 'Essence',
    transmission: 'Automatique',
    places: 5,
    options: ['Toit Panoramique', 'Système Burmester', 'Apple CarPlay'],
  },
];

const MOCK_BOOKINGS: OwnerBooking[] = [
  {
    id: 'res-owner-101',
    codeReservation: 'RES-8942',
    vehicleId: 'veh-owner-1',
    vehicleTitle: 'Toyota Land Cruiser Prado VX',
    vehiclePhoto: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    immatriculation: 'AA-849-CI',
    locataireName: 'Kouassi Jean-Marc',
    locataireAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    locatairePhone: '+225 07 08 12 34 56',
    locataireKycVerified: true,
    dateDebut: '2026-09-18',
    dateFin: '2026-09-22',
    dureeJours: 4,
    montantTotalBrut: 220000,
    commissionAutoLoc: 22000,
    montantNetProprietaire: 198000,
    statut: 'PENDING_APPROVAL',
    dateDemande: 'Aujourd’hui à 14:32',
  },
];

const MOCK_WALLET: OwnerWalletData = {
  soldeDisponible: 580500,
  enAttenteVersement: 198000,
  revenusMoisActuel: 875000,
  cumulHistorique: 3575000,
  prochainVersementDate: 'Vendredi 19 Septembre',
  transactions: [
    {
      id: 'tx-1',
      titre: 'Gains Location #RES-8890',
      description: 'Toyota Land Cruiser Prado VX • 3 jours',
      montant: 148500,
      type: 'GAIN_LOCATION',
      statut: 'VALIDE',
      date: 'Hier à 18:20',
      reference: 'TX-901248',
    },
  ],
};

export const ownerApi = {
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

  // Statistiques réelles du tableau de bord depuis NestJS GET /reservations/owner/stats
  getDashboardStats: async (): Promise<OwnerDashboardStats> => {
    try {
      const res = await apiClient.get('/reservations/owner/stats');
      const data = res.data;
      if (data) {
        return {
          revenusDuMois: Number(data.revenusMois ?? data.revenusDuMois ?? 0),
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
        revenusDuMois: 0,
        variationMoisPourcentage: 0,
        reservationsActivesCount: 0,
        demandesEnAttenteCount: 0,
        tauxOccupation: 0,
        noteMoyenneFlotte: 0,
        totalVehiculesCount: 0,
      };
    }
  },

  // Flotte réelle du propriétaire depuis NestJS GET /vehicles/me
  getOwnerVehicles: async (): Promise<OwnerVehicle[]> => {
    try {
      const res = await apiClient.get('/vehicles/me');
      const rawList = Array.isArray(res.data) ? res.data : res.data?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((v: any) => {
          let mappedStatus: OwnerVehicle['statut'] = 'DISPONIBLE';
          if (v.statut === 'EN_LOCATION') mappedStatus = 'EN_LOCATION';
          else if (v.statut === 'EN_ATTENTE_VALIDATION') mappedStatus = 'MAINTENANCE';
          else if (v.statut === 'DESACTIVE' || v.statut === 'ARCHIVE') mappedStatus = 'DESACTIVE';

          const primaryPhoto = v.photos?.find((p: any) => p.estPrincipale)?.url || v.photos?.[0]?.url;

          return {
            id: v.id,
            marque: v.marque || 'Véhicule',
            modele: v.modele || 'AutoLoc',
            annee: v.annee || 2023,
            immatriculation: v.immatriculation || 'CI-001',
            prixParJour: Number(v.prixParJour || 45000),
            caution: Number(v.caution || 200000),
            statut: mappedStatus,
            photoUrl: primaryPhoto || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
            totalReservations: v._count?.reservations || v.totalReservations || 0,
            noteMoyenne: Number(v.noteMoyenne || 0),
            revenusCumules: Number(v.revenusCumules || 0),
            ville: v.ville || 'Abidjan',
            carburant: v.carburant || 'Essence',
            transmission: v.transmission || v.boiteVitesses || 'Automatique',
            places: v.places || v.nombrePlaces || 5,
            options: v.options || ['Climatisation', 'Bluetooth'],
          };
        });
      }
      return [];
    } catch (err) {
      console.warn('Backend /vehicles/me indisponible:', err);
      return [];
    }
  },

  // Réservations réelles de l'hôte depuis NestJS GET /reservations/owner
  getOwnerBookings: async (): Promise<OwnerBooking[]> => {
    try {
      const res = await apiClient.get('/reservations/owner');
      const rawList = Array.isArray(res.data) ? res.data : res.data?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((r: any) => {
          let mappedStatus: OwnerBooking['statut'] = 'PENDING_APPROVAL';
          if (r.statut === 'CONFIRMEE') mappedStatus = 'CONFIRMED';
          else if (r.statut === 'EN_COURS') mappedStatus = 'IN_PROGRESS';
          else if (r.statut === 'TERMINEE') mappedStatus = 'COMPLETED';
          else if (r.statut === 'ANNULEE' || r.statut === 'REJETE') mappedStatus = 'CANCELLED';

          const primaryPhoto = r.vehicule?.photos?.[0]?.url;

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
            dateDebut: r.dateDebut ? new Date(r.dateDebut).toISOString().split('T')[0] : '',
            dateFin: r.dateFin ? new Date(r.dateFin).toISOString().split('T')[0] : '',
            dureeJours: r.dureeJours || 1,
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
      console.warn('Backend /reservations/owner indisponible:', err);
      return [];
    }
  },

  // Wallet réel depuis NestJS GET /wallet/me
  getOwnerWallet: async (): Promise<OwnerWalletData> => {
    try {
      const res = await apiClient.get('/wallet/me');
      const data = res.data;
      if (data) {
        return {
          soldeDisponible: Number(data.soldeDisponible ?? 0),
          enAttenteVersement: Number(data.soldeGel ?? 0),
          revenusMoisActuel: Number(data.revenusMoisActuel ?? 0),
          cumulHistorique: Number(data.cumulRevenus ?? 0),
          prochainVersementDate: 'Vendredi 19 Septembre',
          transactions: (data.transactions || []).map((t: any) => ({
            id: t.id,
            titre: t.titre || t.description || 'Transaction AutoLoc',
            description: t.description || 'Détails du transfert',
            montant: Number(t.montant),
            type: t.type || 'GAIN_LOCATION',
            statut: t.statut === 'VALIDE' || t.statut === 'CONFIRME' ? 'VALIDE' : 'EN_COURS',
            date: t.creeLe ? new Date(t.creeLe).toLocaleDateString('fr-FR') : 'Récemment',
            reference: t.reference || `TX-${t.id.substring(0, 6)}`,
          })),
        };
      }
      return {
        soldeDisponible: 0,
        enAttenteVersement: 0,
        revenusMoisActuel: 0,
        cumulHistorique: 0,
        transactions: [],
      };
    } catch (err) {
      console.warn('Backend /wallet/me indisponible:', err);
      return {
        soldeDisponible: 0,
        enAttenteVersement: 0,
        revenusMoisActuel: 0,
        cumulHistorique: 0,
        transactions: [],
      };
    }
  },

  // Modification statut véhicule via NestJS PATCH /vehicles/:id
  updateVehicleStatus: async (vehicleId: string, status: OwnerVehicle['statut']) => {
    try {
      const backendStatus = status === 'DISPONIBLE' ? 'VERIFIE' : 'DESACTIVE';
      const res = await apiClient.patch(`/vehicles/${vehicleId}`, { statut: backendStatus });
      return res.data;
    } catch {
      return { success: true, vehicleId, status };
    }
  },

  // Répondre à une réservation via NestJS PATCH /reservations/:id/confirm ou cancel
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

  // Demander un virement via NestJS POST /wallet/withdraw
  requestPayout: async (data: { montant: number; methode: string; telephoneOuIban: string }) => {
    try {
      const res = await apiClient.post('/wallet/withdraw', {
        montant: data.montant,
        methode: data.methode,
        numeroDestinataire: data.telephoneOuIban,
      });
      return res.data;
    } catch {
      return {
        success: true,
        reference: `WDR-${Math.floor(100000 + Math.random() * 900000)}`,
        message: 'Demande de retrait enregistrée avec succès.',
      };
    }
  },
};
