import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, CarFront, CheckCircle2, ChevronRight, Clock3, Images, LogIn, ShieldCheck } from 'lucide-react-native';
import { theme } from '../../../core/theme';

interface Props {
  statut: string;
  hasOwnerCheckin: boolean;
  hasTenantCheckin: boolean;
  checkinPhotoCount: number;
  submitting: boolean;
  canCancel: boolean;
  onConfirmCheckin: () => void;
  onRefuseCheckin: () => void;
  onCancel: () => void;
  onShowRules: () => void;
}

export const TenantBookingLifecyclePanel: React.FC<Props> = ({
  statut,
  hasOwnerCheckin,
  hasTenantCheckin,
  checkinPhotoCount,
  submitting,
  canCancel,
  onConfirmCheckin,
  onRefuseCheckin,
  onCancel,
  onShowRules,
}) => {
  const isConfirmed = statut === 'CONFIRMEE';
  const canConfirm = isConfirmed && hasOwnerCheckin && !hasTenantCheckin;
  const waitingForHost = isConfirmed && !hasOwnerCheckin;
  const isInProgress = statut === 'EN_COURS';
  const isDispute = statut === 'LITIGE';

  const title = isDispute
    ? 'Litige en cours'
    : isInProgress
      ? 'Location en cours'
      : canConfirm
        ? 'Votre validation est requise'
        : waitingForHost
          ? 'Check-in en préparation'
          : 'Suivi de la location';

  const subtitle = isDispute
    ? 'Les actions de location sont suspendues pendant l’examen du dossier par l’équipe AutoLoc.'
    : isInProgress
      ? 'Profitez de votre trajet. L’hôte effectuera le check-out lors de la restitution du véhicule.'
      : canConfirm
        ? 'Inspectez le véhicule et vérifiez les photos transmises avant de valider la prise en charge.'
        : waitingForHost
          ? checkinPhotoCount
            ? 'L’hôte a transmis ses photos. Nous attendons sa confirmation officielle de départ.'
            : 'L’hôte doit déposer l’état des lieux de départ et valider le check-in avant votre confirmation.'
          : 'Retrouvez ici l’état d’avancement et les prochaines étapes de votre réservation.';

  const Icon = isDispute ? AlertTriangle : isInProgress ? CarFront : canConfirm ? LogIn : Clock3;
  const accentColor = isDispute ? '#DC2626' : isInProgress ? '#059669' : canConfirm ? '#F59E0B' : theme.colors.brand.main;

  const handleRefuseCheckin = () => {
    Alert.alert(
      'Signaler un véhicule non conforme',
      'Cette action ouvre un litige et suspend le déroulement normal de la location. Confirmez-vous ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Signaler', style: 'destructive', onPress: onRefuseCheckin },
      ]
    );
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Annuler cette réservation',
      'Cette action est définitive. Selon les conditions applicables, des frais d’annulation peuvent s’appliquer.',
      [
        { text: 'Retour', style: 'cancel' },
        { text: 'Annuler la réservation', style: 'destructive', onPress: onCancel },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Accent Bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: isDispute ? '#FEF2F2' : '#ECFDF5' }]}>
          <Icon size={18} color={accentColor} />
        </View>

        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {isConfirmed ? (
              <View style={[styles.stepBadge, canConfirm && styles.stepBadgeActive]}>
                <Text style={[styles.stepBadgeText, canConfirm && styles.stepBadgeTextActive]}>
                  {canConfirm ? 'À VALIDER' : 'EN COURS'}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {/* Stepper Progress Bar */}
      {isConfirmed ? (
        <View
          style={styles.stepperContainer}
          accessibilityLabel={`Étape ${canConfirm ? 3 : hasOwnerCheckin ? 2 : 1} sur 3`}
        >
          <View style={styles.stepperRow}>
            <ProgressStep label="Confirmation" complete number={1} />
            <View style={[styles.connectorLine, hasOwnerCheckin && styles.connectorLineDone]} />
            <ProgressStep label="État des lieux hôte" complete={hasOwnerCheckin} active={waitingForHost} number={2} />
            <View style={[styles.connectorLine, hasTenantCheckin && styles.connectorLineDone]} />
            <ProgressStep label="Votre validation" complete={hasTenantCheckin} active={canConfirm} number={3} />
          </View>
        </View>
      ) : null}

      {/* Photos Banner */}
      {checkinPhotoCount > 0 && isConfirmed ? (
        <View style={styles.photosPill}>
          <Images size={15} color={theme.colors.brand.main} />
          <Text style={styles.photosText}>
            {checkinPhotoCount} photo{checkinPhotoCount > 1 ? 's' : ''} d’état des lieux disponible{checkinPhotoCount > 1 ? 's' : ''}
          </Text>
        </View>
      ) : null}

      {/* Action Buttons */}
      {canConfirm ? (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Confirmer la prise en charge du véhicule"
            accessibilityState={{ disabled: submitting, busy: submitting }}
            disabled={submitting}
            onPress={onConfirmCheckin}
            activeOpacity={0.8}
            style={[styles.primaryBtn, submitting && styles.btnDisabled]}
          >
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>{submitting ? 'Validation…' : 'Confirmer la prise en charge'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Signaler un véhicule non conforme"
            accessibilityState={{ disabled: submitting }}
            disabled={submitting}
            onPress={handleRefuseCheckin}
            activeOpacity={0.8}
            style={[styles.dangerBtn, submitting && styles.btnDisabled]}
          >
            <AlertTriangle size={15} color="#B91C1C" />
            <Text style={styles.dangerBtnText}>Signaler un véhicule non conforme</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Active Rental Banner */}
      {isInProgress ? (
        <View style={styles.infoBanner}>
          <ShieldCheck size={16} color="#059669" />
          <Text style={styles.infoBannerText}>
            Votre contrat et les garanties AutoLoc restent actifs durant toute la durée de la location.
          </Text>
        </View>
      ) : null}

      {/* Footer / Cancellation & Rules Link */}
      {canCancel ? (
        <View style={styles.footer}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Annuler cette réservation"
            accessibilityState={{ disabled: submitting }}
            disabled={submitting}
            onPress={handleCancelBooking}
            style={[styles.cancelBtn, submitting && styles.btnDisabled]}
          >
            <Text style={styles.cancelBtnText}>Annuler cette réservation</Text>
            <ChevronRight size={13} color="#B91C1C" />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voir les conditions d’annulation"
            onPress={onShowRules}
            style={styles.rulesBtn}
          >
            <Text style={styles.rulesBtnText}>Conditions d’annulation</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const ProgressStep = ({
  label,
  complete,
  active = false,
  number,
}: {
  label: string;
  complete: boolean;
  active?: boolean;
  number: number;
}) => (
  <View style={styles.stepItem}>
    <View
      style={[
        styles.stepDot,
        complete && styles.stepDotDone,
        active && styles.stepDotActive,
      ]}
    >
      {complete ? (
        <CheckCircle2 size={12} color="#FFFFFF" />
      ) : (
        <Text style={[styles.stepNumber, active && styles.stepNumberActive]}>{number}</Text>
      )}
    </View>
    <Text
      style={[
        styles.stepLabel,
        (complete || active) && styles.stepLabelActive,
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    color: '#072A20',
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
  },
  stepBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  stepBadgeActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  stepBadgeText: {
    color: '#047857',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  stepBadgeTextActive: {
    color: '#B45309',
  },
  subtitle: {
    color: '#64748B',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  stepperContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: theme.colors.brand.main,
    borderColor: theme.colors.brand.main,
  },
  stepDotActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  stepNumber: {
    color: '#64748B',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    color: '#94A3B8',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#072A20',
    fontFamily: theme.typography.fontFamily.bold,
  },
  connectorLine: {
    height: 2,
    flex: 0.8,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  connectorLineDone: {
    backgroundColor: theme.colors.brand.main,
  },
  photosPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  photosText: {
    flex: 1,
    color: '#047857',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  primaryBtn: {
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.brand.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.colors.brand.main,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
  },
  dangerBtn: {
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  dangerBtnText: {
    color: '#B91C1C',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  infoBannerText: {
    flex: 1,
    color: '#047857',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cancelBtnText: {
    color: '#B91C1C',
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
  },
  rulesBtn: {},
  rulesBtnText: {
    color: '#64748B',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});