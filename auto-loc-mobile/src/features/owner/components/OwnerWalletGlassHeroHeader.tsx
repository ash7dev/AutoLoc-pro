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
  ArrowDownRight,
  ArrowRightLeft,
  Lock,
  ShieldCheck,
  User as UserIcon,
  Wallet,
  Zap,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { UserProfile } from '../../../core/store/useAppStore';
import { OwnerWalletData } from '../api/ownerApi';
import { formatCurrency } from '../../../core/utils/currency';
import { CurrencyCode } from '../../../shared/components/CurrencyPickerModal';
import { AutoSkeleton } from '../../../shared/components/AutoSkeleton';

interface OwnerWalletGlassHeroHeaderProps {
  user: UserProfile | null;
  walletData: OwnerWalletData | null;
  selectedCurrency: CurrencyCode;
  onProfilePress?: () => void;
  onSwitchToTenant?: () => void;
  onRequestPayoutPress?: () => void;
}

export const OwnerWalletGlassHeroHeader: React.FC<OwnerWalletGlassHeroHeaderProps> = ({
  user,
  walletData,
  selectedCurrency,
  onProfilePress,
  onSwitchToTenant,
  onRequestPayoutPress,
}) => {
  const insets = useSafeAreaInsets();

  const soldeTotal = walletData?.balance?.soldeDisponible ?? walletData?.soldeDisponible ?? 0;
  const soldeRetirable = walletData?.balance?.soldeRetirable ?? walletData?.soldeDisponible ?? 0;
  const soldeEnAttente = walletData?.balance?.enAttente ?? walletData?.enAttenteVersement ?? 0;
  const soldeSequestre = walletData?.balance?.enAttente ?? 0;

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

        {/* 1. Ligne Supérieure : Profil & Statut & Switch Mode */}
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
              <Text style={styles.greetingSub}>Portefeuille & Virement</Text>
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

        {/* 2. Main Hero Body : Solde Total Prominent */}
        <View style={styles.mainHeroBody}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.walletBadge}>
              <Wallet size={13} color="#34D399" />
              <Text style={styles.walletBadgeText}>SOLDE TOTAL DISPONIBLE</Text>
            </View>

            {Boolean(walletData?.totalPenalites && walletData.totalPenalites > 0) && (
              <View style={styles.penaltiesWarningPill}>
                <Text style={styles.penaltiesWarningText}>
                  -{formatCurrency(walletData?.totalPenalites || 0, selectedCurrency)} déduit
                </Text>
              </View>
            )}
          </View>

          <View style={styles.totalBalanceRow}>
            {walletData ? (
              <Text style={styles.totalBalanceValue}>
                {formatCurrency(soldeTotal, selectedCurrency)}
              </Text>
            ) : (
              <AutoSkeleton
                width={190}
                height={34}
                borderRadius={10}
                style={{ backgroundColor: 'rgba(52, 211, 153, 0.25)', marginVertical: 2 }}
              />
            )}
          </View>
        </View>

        {/* 3. Barre de Synthèse des Statuts Financiers (Glassmorphic) */}
        <View style={styles.glassSummaryBar}>
          {/* Métrique Retirable */}
          <View style={styles.glassStatItem}>
            <Zap size={12} color="#34D399" />
            <Text style={styles.glassStatText}>
              Retirable :{' '}
              <Text style={styles.glassStatVal}>
                {formatCurrency(soldeRetirable, selectedCurrency)}
              </Text>
            </Text>
          </View>

          <View style={styles.glassDivider} />

          {/* Métrique Séquestre */}
          <View style={styles.glassStatItem}>
            <Lock size={12} color="#F59E0B" />
            <Text style={styles.glassStatText}>
              Séquestre :{' '}
              <Text style={styles.glassStatVal}>
                {formatCurrency(soldeSequestre, selectedCurrency)}
              </Text>
            </Text>
          </View>
        </View>

        {/* 4. Bouton d'Action VIP : Demander un virement */}
        <TouchableOpacity
          style={styles.payoutActionBtn}
          onPress={onRequestPayoutPress}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#34D399', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.payoutBtnGradient}
          >
            <View style={styles.payoutBtnIconBox}>
              <ArrowDownRight size={16} color="#041912" strokeWidth={3} />
            </View>
            <Text style={styles.payoutBtnText}>Demander un virement instantané</Text>
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

  // Main Body
  mainHeroBody: {
    gap: 4,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletBadge: {
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
  walletBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#34D399',
    letterSpacing: 0.6,
  },
  penaltiesWarningPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  penaltiesWarningText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#F87171',
  },
  totalBalanceRow: {
    marginTop: 4,
  },
  totalBalanceValue: {
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

  // CTA Payout Button
  payoutActionBtn: {
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
  payoutBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  payoutBtnIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(4, 25, 18, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#041912',
    letterSpacing: -0.1,
  },
});
