import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Star,
  MapPin,
  Navigation,
} from 'lucide-react-native';

interface VehicleMainInfoCardProps {
  marque: string;
  modele: string;
  annee?: number;
  ville: string;
  adresse?: string;
  typeStr: string;
  note?: number;
  totalAvis?: number;
  totalLocations?: number;
  transmission?: string | null;
  carburant?: string | null;
  nombrePlaces?: number | null;
  joursMinimum?: number;
  autoriseHorsDakar?: boolean;
}

const COLORS = {
  accent: '#16A34A',
  accentDeep: '#0F7A38',
  tint: '#ECFDF5',
  tintBorder: '#A7F3D0',
  ink: '#041912',
  inkMuted: '#5F6B59',
  inkSoft: '#3D4638',
  chipBorder: '#E4EBDB',
  gold: '#F59E0B',
  goldBg: '#FFFBEB',
  goldBorder: '#FDE9B8',
};

export const VehicleMainInfoCard: React.FC<VehicleMainInfoCardProps> = ({
  marque,
  modele,
  annee,
  ville,
  adresse,
  typeStr,
  note = 5.0,
  totalAvis = 0,
  totalLocations = 0,
  autoriseHorsDakar = false,
}) => {
  const fullTitle = `${marque} ${modele}`.trim();
  const formattedCity = ville ? ville.replace(/-/g, ' ').toUpperCase() : 'DAKAR';

  return (
    <View style={styles.sheetContainer}>
      {/* Barre poignée d'accroche */}
      <View style={styles.dragHandleBox}>
        <View style={styles.dragHandlePill} />
      </View>

      {/* Rangée de Badges de Statut */}
      <View style={styles.badgesRow}>
        <LinearGradient
          colors={['#062017', '#041912']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.typeBadge}
        >
          <Text style={styles.typeBadgeText}>{typeStr}</Text>
        </LinearGradient>

        {autoriseHorsDakar && (
          <View style={styles.horsDakarBadge}>
            <Navigation size={12} color="#059669" strokeWidth={2.25} />
            <Text style={styles.horsDakarBadgeText}>HORS DAKAR</Text>
          </View>
        )}

        {totalLocations > 0 && (
          <View style={styles.tripsBadge}>
            <Text style={styles.tripsBadgeText}>{totalLocations} location{totalLocations > 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      {/* Titre Marque + Modèle & Année */}
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>
          {fullTitle}{' '}
          {annee ? <Text style={styles.anneeText}>· {annee}</Text> : null}
        </Text>
      </View>

      {/* Localisation & Avis Client */}
      <View style={styles.metaRow}>
        <View style={styles.locationBox}>
          <View style={styles.pinDot}>
            <MapPin size={13} color="#4ADE80" strokeWidth={2.5} />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {formattedCity} {adresse ? `· ${adresse}` : ''}
          </Text>
        </View>

        {totalAvis > 0 && note > 0 ? (
          <View style={styles.ratingBox}>
            <Star size={13} color={COLORS.gold} fill={COLORS.gold} />
            <Text style={styles.ratingValue}>{Number(note).toFixed(1)}</Text>
            <View style={styles.ratingDivider} />
            <Text style={styles.ratingCount}>{totalAvis} avis</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderColor: COLORS.chipBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  dragHandleBox: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 12,
  },
  dragHandlePill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.chipBorder,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: COLORS.accentDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  horsDakarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.tint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.tintBorder,
  },
  horsDakarBadgeText: {
    color: COLORS.accentDeep,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tripsBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tripsBadgeText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  titleRow: {
    marginBottom: 10,
  },
  titleText: {
    fontSize: 25,
    fontFamily: 'Fraunces_600SemiBold',
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: -0.5,
    lineHeight: 31,
  },
  anneeText: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.inkMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
    marginRight: 12,
  },
  pinDot: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    color: COLORS.inkSoft,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.goldBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },
  newBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.tint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.tintBorder,
  },
  newBadgeText: {
    color: COLORS.accentDeep,
    fontSize: 11.5,
    fontWeight: '700',
  },
  ratingValue: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  ratingDivider: {
    width: 1,
    height: 10,
    backgroundColor: COLORS.goldBorder,
    marginHorizontal: 2,
  },
  ratingCount: {
    color: '#8A6D1F',
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(4, 25, 18, 0.06)',
    marginBottom: 16,
  },
  quickSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 10,
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specIconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specPillText: {
    color: '#041912',
    fontSize: 12,
    fontWeight: '600',
  },
});