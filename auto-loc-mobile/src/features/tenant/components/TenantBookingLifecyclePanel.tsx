import React from 'react';
import { AlertTriangle, CarFront, CheckCircle2, Clock3, Images, LogIn, ShieldCheck } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export const TenantBookingLifecyclePanel: React.FC<Props> = ({ statut, hasOwnerCheckin, hasTenantCheckin, checkinPhotoCount, submitting, canCancel, onConfirmCheckin, onRefuseCheckin, onCancel, onShowRules }) => {
  const isConfirmed = statut === 'CONFIRMEE';
  const canConfirm = isConfirmed && hasOwnerCheckin && !hasTenantCheckin;
  const waitingForHost = isConfirmed && !hasOwnerCheckin;
  const isInProgress = statut === 'EN_COURS';
  const isDispute = statut === 'LITIGE';
  const title = isDispute ? 'Litige en cours' : isInProgress ? 'Location en cours' : canConfirm ? 'Votre validation est requise' : waitingForHost ? 'Check-in en préparation' : 'Suivi de la location';
  const subtitle = isDispute ? 'Les actions de location sont suspendues pendant l’examen du dossier.' : isInProgress ? 'Profitez du véhicule. L’hôte effectuera le check-out lors de la restitution.' : canConfirm ? 'Inspectez le véhicule et confirmez la prise en charge seulement si tout est conforme.' : waitingForHost ? (checkinPhotoCount ? 'L’hôte a ajouté les photos ; nous attendons encore sa confirmation officielle.' : 'L’hôte doit déposer l’état des lieux et confirmer le check-in avant votre validation.') : 'Retrouvez ici les prochaines actions disponibles pour cette réservation.';
  const Icon = isDispute ? AlertTriangle : isInProgress ? CarFront : canConfirm ? LogIn : Clock3;

  return <View style={styles.card}>
    <View style={styles.accent} />
    <View style={styles.header}><View style={styles.icon}><Icon size={18} color={isDispute ? '#B91C1C' : theme.colors.brand.main} /></View><View style={styles.copy}><View style={styles.titleRow}><Text style={styles.title}>{title}</Text>{isConfirmed ? <View style={styles.stepChip}><Text style={styles.stepText}>ÉTAPE 3</Text></View> : null}</View><Text style={styles.subtitle}>{subtitle}</Text></View></View>
    {isConfirmed ? <View style={styles.progress}><ProgressStep label="Réservation confirmée" complete /><ProgressStep label="État des lieux hôte" complete={hasOwnerCheckin} /><ProgressStep label="Votre validation" complete={hasTenantCheckin} active={canConfirm} /></View> : null}
    {checkinPhotoCount > 0 && isConfirmed ? <View style={styles.photos}><Images size={16} color={theme.colors.brand.main} /><Text style={styles.photosText}>{checkinPhotoCount} photo{checkinPhotoCount > 1 ? 's' : ''} d’état des lieux disponible{checkinPhotoCount > 1 ? 's' : ''}</Text></View> : null}
    {canConfirm ? <View style={styles.actions}><TouchableOpacity disabled={submitting} onPress={onConfirmCheckin} style={styles.primary}><CheckCircle2 size={16} color="#FFFFFF" /><Text style={styles.primaryText}>{submitting ? 'Validation…' : 'Confirmer la prise en charge'}</Text></TouchableOpacity><TouchableOpacity disabled={submitting} onPress={onRefuseCheckin} style={styles.danger}><AlertTriangle size={15} color="#B91C1C" /><Text style={styles.dangerText}>Le véhicule n’est pas conforme</Text></TouchableOpacity></View> : null}
    {isInProgress ? <View style={styles.info}><ShieldCheck size={16} color="#047857" /><Text style={styles.infoText}>Vos informations de réservation et de règlement restent disponibles pendant toute la location.</Text></View> : null}
    {canCancel ? <View style={styles.cancel}><TouchableOpacity disabled={submitting} onPress={onCancel}><Text style={styles.cancelText}>Annuler ma réservation</Text></TouchableOpacity><TouchableOpacity onPress={onShowRules}><Text style={styles.rulesText}>Règles et remboursement</Text></TouchableOpacity></View> : null}
  </View>;
};

const ProgressStep = ({ label, complete, active = false }: { label: string; complete: boolean; active?: boolean }) => <View style={styles.progressStep}><View style={[styles.dot, complete && styles.dotDone, active && styles.dotActive]}>{complete ? <CheckCircle2 size={11} color="#FFFFFF" /> : null}</View><Text style={[styles.progressLabel, (complete || active) && styles.progressLabelActive]} numberOfLines={1}>{label}</Text></View>;
const styles = StyleSheet.create({ card: { overflow: 'hidden', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }, accent: { height: 4, backgroundColor: theme.colors.brand.main }, header: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 11 }, icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFDF5' }, copy: { flex: 1 }, titleRow: { flexDirection: 'row', gap: 7, alignItems: 'center', flexWrap: 'wrap' }, title: { color: '#072A20', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 16 }, stepChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, backgroundColor: '#ECFDF5' }, stepText: { color: '#047857', fontFamily: theme.typography.fontFamily.bold, fontSize: 9, letterSpacing: .5 }, subtitle: { color: '#64748B', fontFamily: theme.typography.fontFamily.regular, fontSize: 12, lineHeight: 17, marginTop: 3 }, progress: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 5 }, progressStep: { flex: 1, alignItems: 'center', gap: 5 }, dot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }, dotDone: { backgroundColor: theme.colors.brand.main }, dotActive: { backgroundColor: '#F59E0B' }, progressLabel: { color: '#94A3B8', fontFamily: theme.typography.fontFamily.medium, fontSize: 9, textAlign: 'center' }, progressLabelActive: { color: '#334155', fontFamily: theme.typography.fontFamily.semiBold }, photos: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 16, marginBottom: 0, padding: 11, borderRadius: 12, backgroundColor: '#F8FAFC' }, photosText: { flex: 1, color: '#334155', fontFamily: theme.typography.fontFamily.medium, fontSize: 12 }, actions: { padding: 16, gap: 8 }, primary: { minHeight: 47, borderRadius: 24, backgroundColor: '#072A20', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, primaryText: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.bold, fontSize: 13 }, danger: { minHeight: 42, borderRadius: 21, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, dangerText: { color: '#B91C1C', fontFamily: theme.typography.fontFamily.bold, fontSize: 12 }, info: { flexDirection: 'row', gap: 8, margin: 16, padding: 11, borderRadius: 12, backgroundColor: '#ECFDF5' }, infoText: { flex: 1, color: '#065F46', fontFamily: theme.typography.fontFamily.medium, fontSize: 12, lineHeight: 17 }, cancel: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between' }, cancelText: { color: '#B91C1C', fontFamily: theme.typography.fontFamily.semiBold, fontSize: 12 }, rulesText: { color: '#64748B', fontFamily: theme.typography.fontFamily.medium, fontSize: 11, textDecorationLine: 'underline' } });
