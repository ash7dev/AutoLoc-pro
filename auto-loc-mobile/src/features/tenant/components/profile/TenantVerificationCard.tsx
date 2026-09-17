import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  BadgeCheck,
  ChevronRight,
  Clock,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { TenantProfile } from '../../api/tenantProfileApi';

interface TenantVerificationCardProps {
  profile: TenantProfile;
  onPress: () => void;
}

function VerificationItem({
  icon: Icon,
  label,
  detail,
  status,
  onPress,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  detail: string;
  status: 'DONE' | 'PENDING' | 'REJECTED' | 'TODO';
  onPress: () => void;
}) {
  const isDone = status === 'DONE';
  const isPending = status === 'PENDING';
  const isRejected = status === 'REJECTED';

  return (
    <TouchableOpacity
      style={[
        styles.itemRow,
        isDone && styles.itemRowDone,
        isPending && styles.itemRowPending,
        isRejected && styles.itemRowRejected,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${detail}`}
    >
      <View
        style={[
          styles.itemIconBadge,
          isDone && styles.itemIconBadgeDone,
          isPending && styles.itemIconBadgePending,
          isRejected && styles.itemIconBadgeRejected,
        ]}
      >
        <Icon
          size={13}
          color={
            isDone
              ? '#4ADE80'
              : isPending
                ? '#FBBF24'
                : isRejected
                  ? '#F87171'
                  : '#A8D5C1'
          }
          strokeWidth={2.25}
        />
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemDetail} numberOfLines={1}>
          {detail}
        </Text>
      </View>

      {isDone ? (
        <View style={styles.badgeDonePill}>
          <CheckCircle2 size={13} color="#047857" strokeWidth={2.2} />
          <Text style={styles.badgeDoneText}>Vérifié</Text>
        </View>
      ) : isPending ? (
        <View style={styles.badgePendingPill}>
          <Clock size={12} color="#B45309" strokeWidth={2.2} />
          <Text style={styles.badgePendingText}>En examen</Text>
        </View>
      ) : isRejected ? (
        <View style={styles.badgeRejectedPill}>
          <Text style={styles.badgeRejectedText}>À refaire</Text>
        </View>
      ) : (
        <View style={styles.actionBtnMini}>
          <Text style={styles.actionBtnMiniText}>Ajouter</Text>
          <ChevronRight size={13} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export function TenantVerificationCard({
  profile,
  onPress,
}: TenantVerificationCardProps) {
  const kycVerified = profile.statutKyc === 'VERIFIE';
  const kycPending = profile.statutKyc === 'EN_ATTENTE';
  const kycRejected = profile.statutKyc === 'REJETE';
  const phoneDone = Boolean(profile.phoneVerified);
  const permisDone = Boolean(profile.permisUrl);

  const completedCount =
    Number(phoneDone) + Number(kycVerified) + Number(permisDone);
  const isFullyVerified = completedCount === 3;
  const progressPercent = Math.round((completedCount / 3) * 100);

  const kycDetailText = kycVerified
    ? 'Identité officielle confirmée'
    : kycPending
      ? 'Dossier en cours d’examen'
      : kycRejected
        ? 'Dossier rejeté, cliquez pour réessayer'
        : 'CNI / Passeport + selfie requis';

  return (
    <View style={styles.card}>
      {/* 1. En-tête avec Badge Sombre Icon et Compteur */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.darkIconBadge}>
            <ShieldCheck size={18} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <View style={styles.titleTextGroup}>
            <Text style={styles.title}>Vérification du compte</Text>
            <Text style={styles.subtitle}>
              {isFullyVerified
                ? 'Profil 100% vérifié et certifié'
                : `${completedCount}/3 éléments validés pour réserver`}
            </Text>
          </View>
        </View>

        <View
          style={
            isFullyVerified
              ? styles.counterBadgeSuccess
              : styles.counterBadgeWarning
          }
        >
          <Text
            style={
              isFullyVerified
                ? styles.counterTextSuccess
                : styles.counterTextWarning
            }
          >
            {completedCount}/3
          </Text>
        </View>
      </View>

      {/* 2. Barre de Progression */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progressPercent}%` },
            isFullyVerified && styles.progressFillSuccess,
          ]}
        />
      </View>

      {/* 3. Bannière d'état VIP */}
      {isFullyVerified ? (
        <View style={styles.vipBannerSuccess}>
          <CheckCircle2 size={15} color="#047857" strokeWidth={2.2} />
          <Text style={styles.vipBannerSuccessText}>
            Votre profil est 100% vérifié. Réservations instantanées débloquées !
          </Text>
        </View>
      ) : (
        <Pressable
          style={styles.vipBannerPending}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="Compléter la vérification du compte"
        >
          <Sparkles size={14} color="#B45309" strokeWidth={2.2} />
          <Text style={styles.vipBannerPendingText}>
            Complétez vos 3 étapes pour débloquer la réservation instantanée.
          </Text>
          <ChevronRight size={14} color="#B45309" strokeWidth={2.2} />
        </Pressable>
      )}

      {/* 4. Liste des 3 Éléments */}
      <View style={styles.itemsList}>
        <VerificationItem
          icon={Smartphone}
          label="Numéro de téléphone"
          detail={
            phoneDone ? 'Numéro confirmé par SMS' : 'Confirmez votre numéro par SMS'
          }
          status={phoneDone ? 'DONE' : 'TODO'}
          onPress={onPress}
        />

        <VerificationItem
          icon={
            kycPending
              ? Clock
              : kycVerified
                ? ShieldCheck
                : kycRejected
                  ? ShieldAlert
                  : ShieldCheck
          }
          label="Pièce d'identité & Selfie"
          detail={kycDetailText}
          status={
            kycVerified
              ? 'DONE'
              : kycPending
                ? 'PENDING'
                : kycRejected
                  ? 'REJECTED'
                  : 'TODO'
          }
          onPress={onPress}
        />

        <VerificationItem
          icon={CreditCard}
          label="Permis de conduire"
          detail={
            permisDone
              ? 'Permis de conduire enregistré'
              : 'Ajoutez votre permis de conduire'
          }
          status={permisDone ? 'DONE' : 'TODO'}
          onPress={onPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    flexShrink: 1,
  },
  darkIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    flexShrink: 0,
  },
  titleTextGroup: {
    flex: 1,
    flexShrink: 1,
    gap: 2,
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: '#041912',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#64748B',
  },
  counterBadgeSuccess: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    flexShrink: 0,
    alignSelf: 'center',
  },
  counterTextSuccess: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#047857',
  },
  counterBadgeWarning: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    flexShrink: 0,
    alignSelf: 'center',
  },
  counterTextWarning: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#B45309',
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  progressFillSuccess: {
    backgroundColor: '#10B981',
  },
  vipBannerSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  vipBannerSuccessText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#047857',
    lineHeight: 16,
  },
  vipBannerPending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  vipBannerPendingText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#B45309',
    lineHeight: 16,
  },
  itemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemRowDone: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(16, 185, 129, 0.18)',
  },
  itemRowPending: {
    backgroundColor: '#FFFBEB',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  itemRowRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  itemIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },
  itemIconBadgeDone: {
    backgroundColor: '#041912',
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  itemIconBadgePending: {
    backgroundColor: '#041912',
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  itemIconBadgeRejected: {
    backgroundColor: '#041912',
    borderColor: 'rgba(248, 113, 113, 0.4)',
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemLabel: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
    color: '#041912',
  },
  itemDetail: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#64748B',
  },
  badgeDonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  badgeDoneText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#047857',
  },
  badgePendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgePendingText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#B45309',
  },
  badgeRejectedPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  badgeRejectedText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#DC2626',
  },
  actionBtnMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#041912',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  actionBtnMiniText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11.5,
    color: '#FFFFFF',
  },
});
