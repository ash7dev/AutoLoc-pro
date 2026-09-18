import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRightLeft,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  User as UserIcon,
  ChevronRight,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { UserProfile } from '../../../core/store/useAppStore';
import { AutoSkeleton } from '../../../shared/components/AutoSkeleton';

export interface ReservationHeaderStats {
  total: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
}

interface OwnerReservationsGlassHeroHeaderProps {
  user: UserProfile | null;
  stats: ReservationHeaderStats | null;
  onProfilePress?: () => void;
  onSwitchToTenant?: () => void;
  onCalendarPress?: () => void;
}

export const OwnerReservationsGlassHeroHeader: React.FC<OwnerReservationsGlassHeroHeaderProps> = ({
  user,
  stats,
  onProfilePress,
  onSwitchToTenant,
  onCalendarPress,
}) => {
  const insets = useSafeAreaInsets();

  const fullName = [user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Espace Propriétaire';
  const avatarUrl = user?.avatarUrl;

  const total = stats?.total ?? 0;
  const pendingCount = stats?.pendingCount ?? 0;
  const inProgressCount = stats?.inProgressCount ?? 0;
  const completedCount = stats?.completedCount ?? 0;

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['#072A20', '#041912', '#020F0B']}
        locations={[0, 0.6, 1]}
        style={[styles.heroContainer, { paddingTop: Math.max(insets.top + 16, 44) }]}
      >
        {/* Halo d'ambiance d'arrière-plan */}
        <View style={styles.ambientGlow} pointerEvents="none" />

        {/* 1. Ligne Supérieure : Profil & Salutation & Switch Mode */}
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
              <Text style={styles.greetingSub}>Gestion des Réservations</Text>
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

        {/* 2. Main Hero Body : Compteur Général Prominent */}
        <View style={styles.mainHeroBody}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.sectionBadge}>
              <Calendar size={13} color="#34D399" />
              <Text style={styles.sectionBadgeText}>RÉSERVATIONS & CONTRATS</Text>
            </View>
          </View>

          <View style={styles.totalCountRow}>
            {stats !== null ? (
              <Text style={styles.totalCountValue}>
                {total} {total > 1 ? 'Réservations' : 'Réservation'}
              </Text>
            ) : (
              <AutoSkeleton
                width={200}
                height={34}
                borderRadius={10}
                style={{ backgroundColor: 'rgba(52, 211, 153, 0.25)', marginVertical: 2 }}
              />
            )}
          </View>
        </View>

        {/* 3. Barre de Synthèse des Statuts (Glassmorphic) */}
        <View style={styles.glassSummaryBar}>
          {/* Métrique En attente */}
          <View style={styles.glassStatItem}>
            <Clock size={12} color="#F59E0B" />
            <Text style={styles.glassStatText}>
              {stats !== null ? (
                <>
                  <Text style={styles.glassStatVal}>{pendingCount}</Text> en attente
                </>
              ) : (
                <AutoSkeleton width={50} height={12} borderRadius={4} style={styles.skeletonDark} />
              )}
            </Text>
          </View>

          <View style={styles.glassDivider} />

          {/* Métrique En cours */}
          <View style={styles.glassStatItem}>
            <View style={[styles.statDot, { backgroundColor: '#60A5FA' }]} />
            <Text style={styles.glassStatText}>
              {stats !== null ? (
                <>
                  <Text style={styles.glassStatVal}>{inProgressCount}</Text> en cours
                </>
              ) : (
                <AutoSkeleton width={50} height={12} borderRadius={4} style={styles.skeletonDark} />
              )}
            </Text>
          </View>

          <View style={styles.glassDivider} />

          {/* Métrique Terminées */}
          <View style={styles.glassStatItem}>
            <CheckCircle2 size={12} color="#34D399" />
            <Text style={styles.glassStatText}>
              {stats !== null ? (
                <>
                  <Text style={styles.glassStatVal}>{completedCount}</Text> terminée{completedCount > 1 ? 's' : ''}
                </>
              ) : (
                <AutoSkeleton width={50} height={12} borderRadius={4} style={styles.skeletonDark} />
              )}
            </Text>
          </View>
        </View>

        {/* 4. Bouton d'Action VIP : Calendrier des réservations */}
        <TouchableOpacity
          style={styles.actionGlassBtn}
          onPress={onCalendarPress}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#34D399', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionBtnGradient}
          >
            <View style={styles.actionBtnIconBox}>
              <Calendar size={16} color="#041912" strokeWidth={2.5} />
            </View>
            <Text style={styles.actionBtnText}>Voir le calendrier de réservations</Text>
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
    paddingHorizontal: 18,
    paddingBottom: 22,
    position: 'relative',
    overflow: 'hidden',
    gap: 16,
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
    marginTop: 4,
  },
  switchModeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#4ADE80',
  },

  // Main Hero Body
  mainHeroBody: {
    gap: 4,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  sectionBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#34D399',
    letterSpacing: 0.6,
  },
  totalCountRow: {
    marginTop: 4,
  },
  totalCountValue: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 32,
    color: '#4ADE80',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },

  // Glass Summary Bar
  glassSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glassStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  skeletonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  // CTA Action Button
  actionGlassBtn: {
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
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  actionBtnIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(4, 25, 18, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#041912',
    letterSpacing: -0.1,
  },
});
