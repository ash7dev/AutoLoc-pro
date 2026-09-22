import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  AlertOctagon,
  AlertTriangle,
  CarFront,
  CheckCircle2,
  Clock,
  Key,
  LogOut,
  ShieldAlert,
  Sparkles,
  Users,
  XCircle,
  Zap,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';

interface OwnerBookingLifecyclePanelProps {
  statut: string;
  dateDebut?: string;
  creeLe?: string;
  tacitCheckinDeadlineLe?: string;
  hasOwnerCheckin: boolean;
  hasTenantCheckin: boolean;
  absenceSignalee?: boolean;
  submitting: boolean;
  onOpenConfirm: () => void;
  onOpenCheckin: () => void;
  onOpenCheckout: () => void;
  onOpenSignalNoshow: () => void;
  onOpenDispute: () => void;
  onOpenCancel?: () => void;
}

const formatConfirmationDeadline = (
  creeLe?: string,
  dateDebut?: string,
  tacitDeadline?: string
): string => {
  let target: Date | null = null;

  if (tacitDeadline) {
    const d = new Date(tacitDeadline);
    if (!isNaN(d.getTime())) target = d;
  }

  if (!target && creeLe && dateDebut) {
    const createdDate = new Date(creeLe);
    const startDate = new Date(dateDebut);

    if (!isNaN(createdDate.getTime()) && !isNaN(startDate.getTime())) {
      const createdDay =
        createdDate.getUTCFullYear() * 10000 +
        (createdDate.getUTCMonth() + 1) * 100 +
        createdDate.getUTCDate();
      const startDay =
        startDate.getUTCFullYear() * 10000 +
        (startDate.getUTCMonth() + 1) * 100 +
        startDate.getUTCDate();
      const isSameDay = createdDay === startDay;

      if (isSameDay) {
        const diffMs = startDate.getTime() - createdDate.getTime();
        if (diffMs <= 3 * 3600 * 1000) {
          target = new Date(
            Math.min(
              createdDate.getTime() + 30 * 60 * 1000,
              Math.max(createdDate.getTime() + 15 * 60 * 1000, startDate.getTime() - 15 * 60 * 1000)
            )
          );
        } else {
          target = new Date(startDate.getTime() - 2 * 3600 * 1000);
        }
      } else {
        const date24h = new Date(createdDate.getTime() + 24 * 3600 * 1000);
        const startMinus2h = new Date(startDate.getTime() - 2 * 3600 * 1000);
        target = date24h.getTime() < startMinus2h.getTime() ? date24h : startMinus2h;
      }
    }
  }

  if (!target && dateDebut) {
    const startDate = new Date(dateDebut);
    if (!isNaN(startDate.getTime())) {
      target = new Date(startDate.getTime() - 2 * 3600 * 1000);
    }
  }

  if (!target) {
    return 'dans un délai restreint';
  }

  try {
    const formatted = target.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const hours = target.getHours().toString().padStart(2, '0');
    const minutes = target.getMinutes().toString().padStart(2, '0');
    const capitalizedDay = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    return `${capitalizedDay} à ${hours}:${minutes}`;
  } catch {
    return 'dans un délai restreint';
  }
};

export const OwnerBookingLifecyclePanel: React.FC<OwnerBookingLifecyclePanelProps> = ({
  statut,
  dateDebut,
  creeLe,
  tacitCheckinDeadlineLe,
  hasOwnerCheckin,
  hasTenantCheckin,
  absenceSignalee,
  submitting,
  onOpenConfirm,
  onOpenCheckin,
  onOpenCheckout,
  onOpenSignalNoshow,
  onOpenDispute,
  onOpenCancel,
}) => {
  // Calcul de la règle No-Show T+2h
  const { canSignalNoshow, noshowAvailableTimeStr } = useMemo(() => {
    if (!dateDebut) return { canSignalNoshow: false, noshowAvailableTimeStr: '' };
    const start = new Date(dateDebut);
    const twoHoursAfter = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const now = new Date();
    const can = now >= twoHoursAfter;
    const timeStr = twoHoursAfter.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return { canSignalNoshow: can, noshowAvailableTimeStr: timeStr };
  }, [dateDebut]);

  const upperStatut = (statut ?? '').toUpperCase();
  const isPayee = upperStatut === 'PAYEE';
  const isConfirmee = upperStatut === 'CONFIRMEE';
  const isEnCours = upperStatut === 'EN_COURS';
  const isTerminee = upperStatut === 'TERMINEE';
  const isAnnulee = upperStatut === 'ANNULEE';
  const isLitige = upperStatut === 'LITIGE';
  const isRefusee = upperStatut === 'REFUSEE';
  const isEnAttentePaiement = upperStatut === 'EN_ATTENTE_PAIEMENT';

  // Configuration dynamique des titres, sous-titres et icônes pour TOUS les statuts
  const statusInfo = useMemo(() => {
    if (isPayee) {
      return {
        title: 'Nouvelle réservation à confirmer',
        subtitle: 'Le locataire a réglé son acompte en ligne. Validez la réservation pour fixer le rendez-vous.',
        icon: <CarFront size={18} color="#FFFFFF" />,
        iconBg: '#041912',
      };
    }
    if (isConfirmee) {
      return {
        title: 'Préparation de la remise des clés',
        subtitle: hasOwnerCheckin
          ? 'Check-in effectué. En attente de la confirmation du locataire.'
          : 'Effectuez l’état des lieux de départ et la remise des clés lors de la prise en charge.',
        icon: <Key size={18} color="#FFFFFF" />,
        iconBg: '#041912',
      };
    }
    if (isEnCours) {
      return {
        title: 'Location en cours',
        subtitle: 'Le locataire profite du véhicule. Clôturez la location lors de la restitution.',
        icon: <CarFront size={18} color="#FFFFFF" />,
        iconBg: '#041912',
      };
    }
    if (isTerminee) {
      return {
        title: 'Location terminée & clôturée 🎉',
        subtitle: 'La restitution a été effectuée avec succès. Vos gains ont été crédités sur votre wallet AutoLoc.',
        icon: <CheckCircle2 size={18} color="#047857" />,
        iconBg: '#DCFCE7',
      };
    }
    if (isAnnulee) {
      return {
        title: 'Réservation annulée',
        subtitle: 'Cette réservation a été annulée. Aucun versement supplémentaire ne sera réalisé.',
        icon: <XCircle size={18} color="#DC2626" />,
        iconBg: '#FEF2F2',
      };
    }
    if (isLitige) {
      return {
        title: 'Litige en cours de traitement ⚖️',
        subtitle: 'Un dossier de litige est ouvert. Le service client AutoLoc examine les photos d’état des lieux.',
        icon: <AlertTriangle size={18} color="#D97706" />,
        iconBg: '#FFFBEB',
      };
    }
    if (isRefusee) {
      return {
        title: 'Prise en charge refusée',
        subtitle: 'Le locataire a signalé une non-conformité lors du check-in. Dossier pris en charge par AutoLoc.',
        icon: <ShieldAlert size={18} color="#DC2626" />,
        iconBg: '#FEF2F2',
      };
    }
    if (isEnAttentePaiement) {
      return {
        title: 'Paiement en attente',
        subtitle: 'Le locataire est en cours de règlement de son acompte de réservation.',
        icon: <Clock size={18} color="#D97706" />,
        iconBg: '#FFFBEB',
      };
    }

    return {
      title: 'Suivi de la réservation',
      subtitle: 'Dossier archivé et sécurisé par AutoLoc.',
      icon: <CarFront size={18} color="#64748B" />,
      iconBg: '#F1F5F9',
    };
  }, [isPayee, isConfirmee, isEnCours, isTerminee, isAnnulee, isLitige, isRefusee, isEnAttentePaiement, hasOwnerCheckin]);

  return (
    <View style={styles.card}>
      {/* Header section with dynamic status title, icon, and explanation */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: statusInfo.iconBg }]}>
          {statusInfo.icon}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{statusInfo.title}</Text>
          <Text style={styles.subtitle}>{statusInfo.subtitle}</Text>
        </View>
      </View>

      {/* Contextual Status Banner for Archived / Finished states */}
      {isTerminee && (
        <View style={styles.completedBadgeBox}>
          <Sparkles size={14} color="#047857" />
          <Text style={styles.completedBadgeText}>
            Paiement sécurisé · Gains crédités sur votre portefeuille AutoLoc
          </Text>
        </View>
      )}

      {isAnnulee && (
        <View style={styles.annuleeBadgeBox}>
          <XCircle size={14} color="#991B1B" />
          <Text style={styles.annuleeBadgeText}>
            Dossier d'annulation archivé conformément à la politique AutoLoc
          </Text>
        </View>
      )}

      {isLitige && (
        <View style={styles.litigeBadgeBox}>
          <AlertTriangle size={14} color="#92400E" />
          <Text style={styles.litigeBadgeText}>
            Instruction en cours · Payout temporairement suspendu
          </Text>
        </View>
      )}

      {isPayee && (
        <View style={styles.deadlineBadgeBox}>
          <Clock size={14} color="#D97706" />
          <Text style={styles.deadlineBadgeText}>
            Délai d'acceptation : valider avant le{' '}
            <Text style={styles.boldText}>
              {formatConfirmationDeadline(creeLe, dateDebut, tacitCheckinDeadlineLe)}
            </Text>
          </Text>
        </View>
      )}

      {/* Main Action Buttons */}
      <View style={styles.actionsStack}>
        {isPayee && (
          <TouchableOpacity
            disabled={submitting}
            onPress={onOpenConfirm}
            style={styles.primaryAction}
            activeOpacity={0.8}
          >
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.primaryActionText} numberOfLines={1}>
              {submitting ? 'Confirmation…' : 'Confirmer la réservation'}
            </Text>
          </TouchableOpacity>
        )}

        {isConfirmee && !hasOwnerCheckin && (
          <TouchableOpacity
            disabled={submitting}
            onPress={onOpenCheckin}
            style={styles.primaryAction}
            activeOpacity={0.8}
          >
            <Key size={16} color="#FFFFFF" />
            <Text style={styles.primaryActionText} numberOfLines={1}>
              {submitting ? 'Check-in en cours…' : 'Remise des clés (Check-in)'}
            </Text>
          </TouchableOpacity>
        )}

        {isEnCours && (
          <TouchableOpacity
            disabled={submitting}
            onPress={onOpenCheckout}
            style={styles.primaryAction}
            activeOpacity={0.8}
          >
            <LogOut size={16} color="#FFFFFF" />
            <Text style={styles.primaryActionText} numberOfLines={1}>
              {submitting ? 'Clôture en cours…' : 'Restitution du véhicule (Check-out)'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Cancellation Button for Owner */}
        {(isPayee || isConfirmee) && onOpenCancel && (
          <TouchableOpacity
            disabled={submitting}
            onPress={onOpenCancel}
            style={styles.cancelOwnerAction}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelOwnerActionText}>Annuler cette réservation</Text>
          </TouchableOpacity>
        )}

        {/* Emergency Actions Section for CONFIRMEE */}
        {isConfirmee && (
          <View style={styles.emergencyBlock}>
            <Text style={styles.emergencySectionTitle}>Signalements d’urgence (Départ)</Text>

            {/* No-Show Button with Timing Rule */}
            {absenceSignalee ? (
              <View style={styles.flaggedBadge}>
                <AlertOctagon size={16} color="#DC2626" style={styles.badgeIcon} />
                <Text style={styles.flaggedBadgeText}>
                  Absence locataire déjà signalée (No-show)
                </Text>
              </View>
            ) : canSignalNoshow ? (
              <TouchableOpacity
                disabled={submitting}
                onPress={onOpenSignalNoshow}
                style={styles.dangerAction}
                activeOpacity={0.8}
              >
                <AlertOctagon size={16} color="#B91C1C" />
                <Text style={styles.dangerActionText}>
                  Signaler l’absence du locataire (No-show)
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.disabledActionBox}>
                <Clock size={16} color="#64748B" style={styles.disabledIcon} />
                <Text style={styles.disabledActionText}>
                  Signalement No-show disponible à partir de <Text style={styles.timeHighlight}>{noshowAvailableTimeStr}</Text> (T+2h)
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Secondary Action for EN_COURS */}
        {isEnCours && (
          <TouchableOpacity
            disabled={submitting}
            onPress={onOpenDispute}
            style={styles.dangerAction}
            activeOpacity={0.8}
          >
            <AlertTriangle size={16} color="#B91C1C" />
            <Text style={styles.dangerActionText}>Signaler un litige / dommage</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: '#072A20',
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 3,
  },
  completedBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  completedBadgeText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#047857',
    lineHeight: 17,
  },
  annuleeBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  annuleeBadgeText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 17,
  },
  litigeBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  litigeBadgeText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  actionsStack: {
    gap: 10,
  },
  primaryAction: {
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: '#041912', // Fond sombre pur (pas de vert émeraude)
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.20,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryActionText: {
    color: '#FFFFFF', // Écriture Blanc Pur
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'center',
  },
  cancelOwnerAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },
  cancelOwnerActionText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12.5,
    color: '#DC2626',
    textDecorationLine: 'underline',
  },
  emergencyBlock: {
    marginTop: 8,
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  emergencySectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  dangerAction: {
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dangerActionText: {
    color: '#B91C1C',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    flexShrink: 1,
    textAlign: 'center',
  },
  warningAction: {
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  warningActionText: {
    color: '#D97706',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    flexShrink: 1,
    textAlign: 'center',
  },
  disabledActionBox: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  disabledIcon: {
    marginTop: 1,
  },
  disabledActionText: {
    flex: 1,
    color: '#475569',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  timeHighlight: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#072A20',
  },
  flaggedBadge: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flaggedBadgeText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 17,
  },
  flaggedBadgeAmber: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flaggedBadgeTextAmber: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  deadlineBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  deadlineBadgeText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  boldText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#78350F',
  },
  badgeIcon: {
    marginTop: 1,
  },
});
