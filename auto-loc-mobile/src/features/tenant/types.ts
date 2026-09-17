export interface TarifTier {
  id: string;
  joursMin: number;
  joursMax: number | null;
  prix: string;
  position: number;
}

export interface VehicleFeedItem {
  id: string;
  marque: string;
  modele: string;
  annee: number;
  type: string;
  prixParJour: number;
  prixBarre?: number;
  ville: string;
  note: number;
  totalAvis: number;
  statut: string;
  totalLocations: number;
  carburant: string | null;
  transmission: string | null;
  nombrePlaces: number | null;
  isFeatured: boolean;
  scoreGlobal: number;
  photoUrl: string | null;
  tarifsProgressifs?: TarifTier[];
}

export interface RecommendedFeedSection {
  items: VehicleFeedItem[];
  excludedIds: string[];
}

export interface MobileFeedResponse {
  premium: VehicleFeedItem[];
  nouveautes: VehicleFeedItem[];
  topNotes: VehicleFeedItem[];
  economiques: VehicleFeedItem[];
  luxe: VehicleFeedItem[];
  dakar: VehicleFeedItem[];
  suvMoment: VehicleFeedItem[];
  berlinesPopulaires: VehicleFeedItem[];
  recommended: RecommendedFeedSection;
}

export interface FeedSectionMeta {
  key: keyof MobileFeedResponse;
  title: string;
  subtitle: string;
  iconName: string; // Ionicons icon name
}
