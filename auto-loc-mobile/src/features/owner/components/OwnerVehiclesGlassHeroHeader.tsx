import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Car,
  Plus,
  Star,
  ShieldCheck,
  User as UserIcon,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { UserProfile } from '../../../core/store/useAppStore';
import { OwnerVehicle } from '../api/ownerApi';

interface OwnerVehiclesGlassHeroHeaderProps {
  user: UserProfile | null;
  vehicles: OwnerVehicle[];
  onProfilePress?: () => void;
  onSwitchToTenant?: () => void;
  onAddVehiclePress?: () => void;
}

export const OwnerVehiclesGlassHeroHeader: React.FC<OwnerVehiclesGlassHeroHeaderProps> = ({
  user,
  vehicles,
  onProfilePress,
  onSwitchToTenant,
  onAddVehiclePress,
}) => {
  const insets = useSafeAreaInsets();

  const totalVehicles = vehicles.length;
  const disponibleCount = vehicles.filter(
    (v) => v.statut === 'DISPONIBLE' || v.statut === 'VERIFIE'
  ).length;
  const enLocationCount = vehicles.filter((v) => v.statut === 'EN_LOCATION').length;

  const averageRating = React.useMemo(() => {
    const rated = vehicles.filter((v) => Number(v.noteMoyenne) > 0);
    if (rated.length === 0) return null;
    const sum = rated.reduce((acc, v) => acc + Number(v.noteMoyenne), 0);
    return Number((sum / rated.length).toFixed(1));
  }, [vehicles]);

  const fullName = [user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Espace Propriétaire';
  const avatarUrl = user?.avatarUrl;

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['#072A20', '#041912', '#020F0B']}
        locations={[0, 0.6, 1]}
        style={[styles.heroContainer, { paddingTop: Math.max(insets.top + 16, 44) }]}
      >
        {/* Glow halo d'arrière-plan */}
        <View style={styles.ambientGlow} pointerEvents="none" />

        {/* Ligne Supérieure : Profil & Salutation & Switch */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.profileTouchable}
            onPress={onProfilePress}
            activeOpacity={0.8}
          >
            <View style={styles.avatarRing}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <View style={styles.avatarFallback}>
                  <UserIcon size={18} color="#34D399" />
                </View>
              )}
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.greetingBox}>
              <View style={styles.verifiedRow}>
                <Text style={styles.greetingTitle}>{fullName}</Text>
                <ShieldCheck size={13} color="#34D399" />
              </View>
              <Text style={styles.greetingSub}>Gestion de Flotte</Text>
            </View>
          </TouchableOpacity>

          {onSwitchToTenant && (
            <TouchableOpacity
              style={styles.switchModePill}
              onPress={onSwitchToTenant}
              activeOpacity={0.8}
            >
              <ArrowRightLeft size={12} color="#4ADE80" />
              <Text style={styles.switchModeText}>Mode Locataire</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Centre Hero : Flotte Active & Compteur Fraunces */}
        <View style={styles.mainHeroBody}>
          <View style={styles.heroHeaderRow}>
            <Text style={styles.heroSectionTag}>PARC AUTOMOBILE ACTIVE</Text>
          </View>

          <View style={styles.fleetCountRow}>
            <Text style={styles.fleetCountValue}>
              {totalVehicles} {totalVehicles > 1 ? 'Véhicules' : 'Véhicule'}
            </Text>
          </View>
        </View>

        {/* Barre de Synthèse des Statuts (Glassmorphic) */}
        <View style={styles.glassSummaryBar}>
          <View style={styles.glassStatItem}>
            <View style={[styles.statDot, { backgroundColor: '#34D399' }]} />
            <Text style={styles.glassStatText}>
              <Text style={styles.glassStatVal}>{disponibleCount}</Text> dispo.
            </Text>
          </View>

          <View style={styles.glassDivider} />

          <View style={styles.glassStatItem}>
            <View style={[styles.statDot, { backgroundColor: '#60A5FA' }]} />
            <Text style={styles.glassStatText}>
              <Text style={styles.glassStatVal}>{enLocationCount}</Text> loué{enLocationCount > 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.glassDivider} />

          <View style={styles.glassStatItem}>
            <Star size={11} color="#F59E0B" fill={averageRating !== null ? '#F59E0B' : 'transparent'} />
            <Text style={styles.glassStatText}>
              <Text style={styles.glassStatVal}>{averageRating !== null ? averageRating : '—'}</Text> Note
            </Text>
          </View>
        </View>

        {/* Bouton d'Action VIP : Ajouter un Véhicule */}
        <TouchableOpacity
          style={styles.addVehicleGlassBtn}
          onPress={onAddVehiclePress}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#34D399', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addBtnGradient}
          >
            <View style={styles.addBtnIconBox}>
              <Plus size={16} color="#041912" strokeWidth={3} />
            </View>
            <Text style={styles.addBtnText}>Publier un nouveau véhicule</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#F8FAFC',
  },
  heroContainer: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 22,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  ambientGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    position: 'relative',
    padding: 1.5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34D399',
    borderWidth: 1.5,
    borderColor: '#041912',
  },
  greetingBox: {
    gap: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greetingTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  greetingSub: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#94A3B8',
  },
  switchModePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
    alignSelf: 'flex-start',
    marginTop: 44,
  },
  switchModeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#4ADE80',
  },
  mainHeroBody: {
    marginBottom: 16,
    gap: 4,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroSectionTag: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  kycPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  kycPillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#34D399',
  },
  fleetCountRow: {
    marginTop: 2,
  },
  fleetCountValue: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 30,
    color: '#4ADE80',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  glassSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glassStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  glassStatText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#CBD5E1',
  },
  glassStatVal: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  glassDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  addVehicleGlassBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#34D399',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  addBtnIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(4, 25, 18, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#041912',
    letterSpacing: -0.1,
  },
});
