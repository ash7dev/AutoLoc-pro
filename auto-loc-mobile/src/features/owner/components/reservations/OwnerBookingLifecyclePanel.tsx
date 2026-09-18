import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertOctagon, AlertTriangle, CarFront, CheckCircle2, ChevronRight, Clock, Key, LogOut, Users } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

interface OwnerBookingLifecyclePanelProps {
  statut: string;
  dateDebut?: string;
  hasOwnerCheckin: boolean;
  hasTenantCheckin: boolean;
  absenceSignalee?: boolean;
  occupantsSignales?: boolean;
  submitting: boolean;
  onOpenConfirm: () => void;
  onOpenCheckin: () => void;
  onOpenCheckout: () => void;
  onOpenSignalNoshow: () => void;
  onOpenSignalOverload: () => void;
  onOpenDispute: () => void;
  onOpenCancel?: () => void;
}

export const OwnerBookingLifecyclePanel: React.FC<OwnerBookingLifecyclePanelProps> = ({
  statut,
  dateDebut,
  hasOwnerCheckin,
  hasTenantCheckin,
  absenceSignalee,
  occupantsSignales,
  submitting,
  onOpenConfirm,
  onOpenCheckin,
  onOpenCheckout,
  onOpenSignalNoshow,
  onOpenSignalOverload,
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

  const isPayee = statut === 'PAYEE';
  const isConfirmee = statut === 'CONFIRMEE';
  const isEnCours = statut === 'EN_COURS';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <CarFront size={18} color={theme.colors.brand.main} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {isPayee
              ? 'Nouvelle réservation à confirmer'
              : isConfirmee
              ? 'Préparation de la remise des clés'
              : isEnCours
              ? 'Location en cours'
              : 'Suivi de la location'}
          </Text>
          <Text style={styles.subtitle}>
            {isPayee
              ? 'Le locataire a réglé son acompte. Validez sa réservation.'
              : isConfirmee
              ? hasOwnerCheckin
                ? 'Check-in effectué. En attente de la confirmation du locataire.'
                : 'Effectuez l’état des lieux de départ lors de la remise des clés.'
              : isEnCours
              ? 'Le locataire profite du véhicule. Clôturez à la restitution.'
              : 'Dossier archivé.'}
          </Text>
        </View>
      </View>

      {/* Main Action Buttons */}
      <View style={styles.actionsStack}>
        {isPayee && (
          <TouchableOpacity
            disabled={submitting}
            onPress={onOpenConfirm}
            style={styles.primaryAction}
          >
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>
              {submitting ? 'Confirmation…' : 'Confirmer la réservation'}
            </Text>
          </TouchableOpacity>
        )}

        {isConfirmee && !hasOwnerCheckin && (
          <TouchableOpacity
            disabled={submitting}
            onPress={onOpenCheckin}
            style={styles.primaryAction}
          >
            <Key size={16} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>
              {submitting ? 'Check-in en cours…' : 'Remise des clés (Check-in)'}
            </Text>
          </TouchableOpacity>
        )}

        {isEnCours && (
          <TouchableOpacity
            disabled={submitting}
            onPress={onOpenCheckout}
            style={styles.primaryAction}
          >
            <LogOut size={16} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>
              {submitting ? 'Clôture en cours…' : 'Restitution du véhicule (Check-out)'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Cancellation Button for Owner (Before start) */}
        {(isPayee || isConfirmee) && onOpenCancel && (
          <TouchableOpacity
            disabled={submitting}
            onPress={onOpenCancel}
            style={styles.cancelOwnerAction}
          >
            <Text style={styles.cancelOwnerActionText}>Annuler cette réservation</Text>
          </TouchableOpacity>
        )}

        {/* Secondary Emergency Actions for CONFIRMEE */}
        {isConfirmee && (
          <View style={styles.emergencyBlock}>
            <Text style={styles.emergencySectionTitle}>Signalements d’urgence (Départ)</Text>

            {/* No-Show Button with Timing Rule */}
            {absenceSignalee ? (
              <View style={styles.flaggedBadge}>
                <AlertOctagon size={14} color="#DC2626" />
                <Text style={styles.flaggedBadgeText}>Absence locataire déjà signalée (No-show)</Text>
              </View>
            ) : canSignalNoshow ? (
              <TouchableOpacity
                disabled={submitting}
                onPress={onOpenSignalNoshow}
                style={styles.dangerAction}
              >
                <AlertOctagon size={15} color="#B91C1C" />
                <Text style={styles.dangerActionText}>Signaler l’absence du locataire (No-show)</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.disabledActionBox}>
                <Clock size={14} color="#94A3B8" />
                <Text style={styles.disabledActionText}>
                  Signalement No-show disponible à partir de {noshowAvailableTimeStr} (T+2h)
                </Text>
              </View>
            )}

            {/* Overload Button */}
            {occupantsSignales ? (
              <View style={styles.flaggedBadge}>
                <Users size={14} color="#D97706" />
                <Text style={styles.flaggedBadgeText}>Dépassement de voyageurs déjà signalé</Text>
              </View>
            ) : (
              <TouchableOpacity
                disabled={submitting}
                onPress={onOpenSignalOverload}
                style={styles.warningAction}
              >
                <Users size={15} color="#D97706" />
                <Text style={styles.warningActionText}>Signaler un dépassement d’occupants</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Secondary Action for EN_COURS */}
        {isEnCours && (
          <TouchableOpacity
            disabled={submitting}
            onPress={onOpenDispute}
            style={styles.dangerAction}
          >
            <AlertTriangle size={15} color="#B91C1C" />
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
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: '#072A20',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 2,
  },
  actionsStack: {
    gap: 10,
  },
  primaryAction: {
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.brand.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
  },
  cancelOwnerAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  cancelOwnerActionText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#DC2626',
    textDecorationLine: 'underline',
  },
  emergencyBlock: {
    marginTop: 6,
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  emergencySectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dangerAction: {
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 12,
  },
  dangerActionText: {
    color: '#B91C1C',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },
  warningAction: {
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 12,
  },
  warningActionText: {
    color: '#D97706',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },
  disabledActionBox: {
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  disabledActionText: {
    color: '#64748B',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
  },
  flaggedBadge: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flaggedBadgeText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#991B1B',
  },
});
