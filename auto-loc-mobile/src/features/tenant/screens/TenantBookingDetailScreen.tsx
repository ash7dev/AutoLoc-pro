import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, RefreshControl, SafeAreaView, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Image } from 'expo-image';
import {
  AlertTriangle, ArrowLeft, CalendarDays, CarFront, CheckCircle2, ChevronRight,
  CircleDollarSign, Clock3, MapPin, ShieldCheck, X,
} from 'lucide-react-native';
import { formatCurrency } from '@autoloc/shared';
import { theme } from '../../../core/theme';
import { useTenantBookingDetail } from '../hooks/useTenantBookingDetail';
import { BookingHostContactCard } from '../components/BookingHostContactCard';
import { BookingEtatLieuxPhotos } from '../components/BookingEtatLieuxPhotos';
import { TenantBookingStickyAction } from '../components/TenantBookingStickyAction';
import { TenantBookingLifecyclePanel } from '../components/TenantBookingLifecyclePanel';
import { BookingLifecycleRulesModal } from '../components/BookingLifecycleRulesModal';
import { BookingEtatLieuxGalleryModal } from '../components/BookingEtatLieuxGalleryModal';
import { BookingContractCard } from '../components/BookingContractCard';
import { BookingCancellationPreviewModal } from '../components/BookingCancellationPreviewModal';
import { BookingPaymentPendingCard } from '../components/BookingPaymentPendingCard';
import { RefuseVehicleEvidenceModal } from '../components/RefuseVehicleEvidenceModal';
import { TacitCheckinCountdownCard } from '../components/TacitCheckinCountdownCard';
import { BookingCompletionPanel } from '../components/BookingCompletionPanel';
import { BookingTimelineSection } from '../components/BookingTimelineSection';
import { TenantBookingDetailSkeleton } from '../components/TenantBookingDetailSkeleton';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80';

type Props = { reservationId: string; onBack: () => void };
type ModalMode = 'CANCEL' | 'REFUSE' | null;

const statusConfig: Record<string, { label: string; tone: 'success' | 'warning' | 'info' | 'danger' | 'neutral'; detail: string }> = {
  EN_ATTENTE_PAIEMENT: { label: 'Paiement en attente', tone: 'warning', detail: 'Votre réservation sera traitée après confirmation du paiement.' },
  PAYEE: { label: 'Paiement confirmé', tone: 'info', detail: 'L’hôte doit encore confirmer la réservation.' },
  CONFIRMEE: { label: 'Réservation confirmée', tone: 'success', detail: 'Préparez votre remise de clés avec l’hôte.' },
  EN_COURS: { label: 'Location en cours', tone: 'info', detail: 'Votre location est active.' },
  TERMINEE: { label: 'Location terminée', tone: 'neutral', detail: 'Merci d’avoir choisi AutoLoc.' },
  ANNULEE: { label: 'Réservation annulée', tone: 'danger', detail: 'Consultez le détail du remboursement ci-dessous.' },
  LITIGE: { label: 'Litige en cours', tone: 'danger', detail: 'Notre équipe examine votre signalement.' },
};

const formatDate = (value?: string | Date) => value ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const TenantBookingDetailScreen: React.FC<Props> = ({ reservationId, onBack }) => {
  const { booking, loading, refreshing, error, submitting, refetch, cancel, confirmCheckin, refuseCheckin } = useTenantBookingDetail(reservationId);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [checkinModalVisible, setCheckinModalVisible] = useState(false);
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [cancellationModalVisible, setCancellationModalVisible] = useState(false);
  const [evidenceModalVisible, setEvidenceModalVisible] = useState(false);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  const status = statusConfig[booking?.statut?.toUpperCase() ?? ''] ?? statusConfig.EN_ATTENTE_PAIEMENT;
  const photo = useMemo(() => {
    const first = booking?.vehicule?.photos?.[0];
    return typeof first === 'string' ? first : first?.url || booking?.vehicule?.photoUrl || FALLBACK_IMAGE;
  }, [booking]);
  const total = Number(booking?.prixTotal ?? 0);
  const paid = Number(booking?.montantPayeEnLigne ?? booking?.paiement?.montant ?? 0);
  const balance = Number(booking?.montantSoldeCheckin ?? 0);
  const isCancellable = ['EN_ATTENTE_PAIEMENT', 'PAYEE', 'CONFIRMEE'].includes(booking?.statut ?? '');
  const canCheckin = booking?.statut === 'CONFIRMEE' && Boolean(booking.checkinProprietaireLe) && !booking.checkinLocataireLe;

  const submitModal = async () => {
    if (modalMode === 'REFUSE') {
      if (!reason.trim()) return Alert.alert('Motif requis', 'Décrivez le problème constaté.');
      if (await refuseCheckin(reason.trim(), comment.trim())) setModalMode(null);
    }
  };
  const openModal = (mode: ModalMode) => { setReason(''); setComment(''); setModalMode(mode); };

  if (loading) return <TenantBookingDetailSkeleton onBack={onBack} />;
  if (!booking) return <ErrorState message={error} onBack={onBack} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={theme.colors.brand.main} />}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityLabel="Retour aux réservations"><ArrowLeft size={19} color="#072A20" /></TouchableOpacity>
          <Text style={styles.reference}>RÉF. #{booking.id.slice(0, 8).toUpperCase()}</Text>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroBadgeRow}><StatusBadge config={status} /><Text style={styles.createdAt}>Créée le {formatDate(booking.creeLe)}</Text></View>
          <Text style={styles.heroEyebrow}>{booking.vehicule?.type || 'VÉHICULE'} · {booking.vehicule?.ville || 'Sénégal'}</Text>
          <Text style={styles.heroTitle}>{booking.vehicule?.marque} {booking.vehicule?.modele}</Text>
          <Text style={styles.heroDescription}>{status.detail}</Text>
          <View style={styles.heroDates}>
            <DateBlock label="PRISE EN CHARGE" value={formatDate(booking.dateDebut)} />
            <View style={styles.duration}><CalendarDays size={15} color="#A7F3D0" /><Text style={styles.durationValue}>{booking.nbJours || 1}</Text><Text style={styles.durationLabel}>JOUR{(booking.nbJours || 1) > 1 ? 'S' : ''}</Text></View>
            <DateBlock label="RETOUR" value={formatDate(booking.dateFin)} />
          </View>
          <View style={styles.totalHero}><Text style={styles.totalHeroLabel}>TOTAL DE LA LOCATION</Text><Text style={styles.totalHeroValue}>{formatCurrency(total)}</Text></View>
        </View>

        <View style={styles.vehicleCard}>
          <Image source={{ uri: photo }} contentFit="cover" style={styles.vehicleImage} />
          <View style={styles.vehicleBody}><Text style={styles.vehicleName}>{booking.vehicule?.marque} {booking.vehicule?.modele}</Text><Text style={styles.vehicleMeta}>{booking.vehicule?.annee || '—'} · {booking.vehicule?.type || 'Véhicule'}</Text><View style={styles.locationRow}><MapPin size={13} color={theme.colors.brand.main} /><Text style={styles.locationText}>{booking.adresseLivraison || booking.vehicule?.ville || 'Lieu communiqué par l’hôte'}</Text></View></View>
        </View>

        <BookingContractCard reservationId={booking.id} statut={booking.statut} />

        {error ? <InlineNotice text={error} /> : null}
        {booking.statut === 'EN_ATTENTE_PAIEMENT' ? <BookingPaymentPendingCard paymentUrl={booking.paymentUrl} /> : null}
        {booking.statut === 'CONFIRMEE' && booking.checkinProprietaireLe && !booking.checkinLocataireLe ? <TacitCheckinCountdownCard deadline={booking.tacitCheckinDeadlineLe} /> : null}
        <TenantBookingLifecyclePanel
          statut={booking.statut}
          hasOwnerCheckin={Boolean(booking.checkinProprietaireLe)}
          hasTenantCheckin={Boolean(booking.checkinLocataireLe)}
          checkinPhotoCount={(booking.photosEtatLieu || []).filter((photo) => photo.type === 'CHECKIN').length}
          submitting={submitting}
          canCancel={isCancellable}
          onConfirmCheckin={() => setCheckinModalVisible(true)}
          onRefuseCheckin={() => setEvidenceModalVisible(true)}
          onCancel={() => setCancellationModalVisible(true)}
          onShowRules={() => setRulesModalVisible(true)}
        />

        <Section title="Règlement & garanties" icon={<CircleDollarSign size={17} color="#A7F3D0" />} dark>
          <MoneyLine label={booking.modePaiement === 'ACOMPTE_SOLDE_CHECKIN' ? 'Acompte réglé en ligne' : 'Montant réglé en ligne'} value={paid} />
          {balance > 0 ? <MoneyLine label="Solde à la remise des clés" value={balance} /> : null}
          {booking.fraisLivraison ? <MoneyLine label="Frais de livraison" value={Number(booking.fraisLivraison)} /> : null}
          <View style={styles.moneyDivider} /><MoneyLine label="Total de la location" value={total} prominent />
          <View style={styles.guarantee}><ShieldCheck size={16} color="#A7F3D0" /><Text style={styles.guaranteeText}>{booking.modePaiement === 'ACOMPTE_SOLDE_CHECKIN' ? 'Le solde est remis au propriétaire lors du check-in.' : 'Votre paiement est tracé et sécurisé par AutoLoc.'}</Text></View>
        </Section>

        <BookingHostContactCard statut={booking.statut} dateDebut={booking.dateDebut} host={booking.proprietaire} />
        <BookingEtatLieuxPhotos photos={booking.photosEtatLieu} onPress={() => setGalleryModalVisible(true)} />

        {booking.litige ? <Section title="Suivi du litige" icon={<AlertTriangle size={17} color="#DC2626" />}><Text style={styles.bodyText}>{booking.litige.description || booking.litige.commentaire || booking.litige.motif || 'Votre dossier est en cours de traitement par AutoLoc.'}</Text></Section> : null}
        {booking.statut === 'TERMINEE' ? <BookingCompletionPanel reservationId={booking.id} existingReview={booking.avis?.[0]} /> : null}
        <BookingTimelineSection events={booking.historique || []} />
        {booking.statut === 'ANNULEE' && booking.raisonAnnulation ? <Section title="Annulation" icon={<X size={17} color="#DC2626" />}><Text style={styles.bodyText}>{booking.raisonAnnulation}</Text></Section> : null}
        <View style={styles.support}><Text style={styles.supportTitle}>Besoin d’aide pour cette location ?</Text><Text style={styles.supportText}>Notre équipe est disponible pour vous accompagner à chaque étape.</Text></View>
      </ScrollView>
      <TenantBookingStickyAction visible={canCheckin} loading={submitting} onPress={() => setCheckinModalVisible(true)} />
      <CheckinConfirmationModal visible={checkinModalVisible} loading={submitting} onClose={() => setCheckinModalVisible(false)} onConfirm={async () => { if (await confirmCheckin()) setCheckinModalVisible(false); }} />
      <BookingLifecycleRulesModal visible={rulesModalVisible} modePaiement={booking.modePaiement} onClose={() => setRulesModalVisible(false)} />
      <BookingEtatLieuxGalleryModal visible={galleryModalVisible} photos={booking.photosEtatLieu || []} onClose={() => setGalleryModalVisible(false)} />
      <BookingCancellationPreviewModal visible={cancellationModalVisible} reservationId={booking.id} submitting={submitting} onClose={() => setCancellationModalVisible(false)} onConfirm={async (reason) => { if (await cancel(reason)) setCancellationModalVisible(false); }} />
      <RefuseVehicleEvidenceModal visible={evidenceModalVisible} reservationId={booking.id} submitting={submitting} onClose={() => setEvidenceModalVisible(false)} onSubmit={refuseCheckin} />
      <ReasonModal mode={modalMode} reason={reason} comment={comment} submitting={submitting} onReason={setReason} onComment={setComment} onClose={() => setModalMode(null)} onSubmit={submitModal} />
    </SafeAreaView>
  );
};

const StatusBadge = ({ config }: { config: ReturnType<typeof getStatus> }) => <View style={[styles.statusBadge, getStatusToneStyle(config.tone)]}><CheckCircle2 size={13} color={config.tone === 'danger' ? '#FECACA' : '#D1FAE5'} /><Text style={styles.statusText}>{config.label}</Text></View>;
const getStatus = (status: string) => statusConfig[status] ?? statusConfig.EN_ATTENTE_PAIEMENT;
const DateBlock = ({ label, value }: { label: string; value: string }) => <View style={styles.dateBlock}><Text style={styles.dateLabel}>{label}</Text><Text style={styles.dateValue}>{value}</Text></View>;
const MoneyLine = ({ label, value, prominent = false }: { label: string; value: number; prominent?: boolean }) => <View style={styles.moneyLine}><Text style={[styles.moneyLabel, prominent && styles.moneyLabelProminent]}>{label}</Text><Text style={[styles.moneyValue, prominent && styles.moneyValueProminent]}>{formatCurrency(value)}</Text></View>;
const InlineNotice = ({ text }: { text: string }) => <View style={styles.inlineNotice}><AlertTriangle size={16} color="#B45309" /><Text style={styles.inlineNoticeText}>{text}</Text></View>;
const Section = ({ title, icon, dark = false, children }: { title: string; icon: React.ReactNode; dark?: boolean; children: React.ReactNode }) => <View style={[styles.section, dark && styles.sectionDark]}><View style={styles.sectionHeader}><View style={[styles.sectionIcon, dark && styles.sectionIconDark]}>{icon}</View><Text style={[styles.sectionTitle, dark && styles.sectionTitleDark]}>{title}</Text></View>{children}</View>;
const ActionPanel = ({ status, waitingForHost, canCheckin, submitting, onCheckin, onRefuse, onCancel, cancellable }: any) => <View style={styles.actionPanel}><View style={styles.actionHeading}><View style={styles.actionIcon}><CarFront size={18} color={theme.colors.brand.main} /></View><View><Text style={styles.actionTitle}>{status === 'EN_COURS' ? 'Votre location est en cours' : 'Prochaine étape'}</Text><Text style={styles.actionSubtitle}>{waitingForHost ? 'L’hôte doit d’abord confirmer l’état des lieux.' : canCheckin ? 'Vérifiez le véhicule puis confirmez la remise des clés.' : 'Toutes les informations utiles sont réunies ici.'}</Text></View></View>{canCheckin ? <><TouchableOpacity disabled={submitting} onPress={onCheckin} style={styles.primaryAction}><CheckCircle2 size={16} color="#FFFFFF" /><Text style={styles.primaryActionText}>{submitting ? 'Confirmation…' : 'Confirmer la remise des clés'}</Text></TouchableOpacity><TouchableOpacity disabled={submitting} onPress={onRefuse} style={styles.dangerAction}><AlertTriangle size={15} color="#B91C1C" /><Text style={styles.dangerActionText}>Signaler un véhicule non conforme</Text></TouchableOpacity></> : null}{cancellable ? <TouchableOpacity disabled={submitting} onPress={onCancel} style={styles.cancelAction}><Text style={styles.cancelActionText}>Annuler cette réservation</Text><ChevronRight size={14} color="#B91C1C" /></TouchableOpacity> : null}</View>;
const LoadingState = ({ onBack }: { onBack: () => void }) => <SafeAreaView style={styles.safeArea}><View style={styles.loadingState}><TouchableOpacity onPress={onBack} style={styles.backButton}><ArrowLeft size={19} color="#072A20" /></TouchableOpacity><ActivityIndicator color={theme.colors.brand.main} size="large" /><Text style={styles.bodyText}>Chargement de votre réservation…</Text></View></SafeAreaView>;
const ErrorState = ({ message, onBack, onRetry }: { message: string | null; onBack: () => void; onRetry: () => void }) => <SafeAreaView style={styles.safeArea}><View style={styles.errorState}><AlertTriangle size={36} color="#B45309" /><Text style={styles.errorTitle}>Réservation indisponible</Text><Text style={styles.bodyText}>{message || 'Une erreur est survenue.'}</Text><TouchableOpacity onPress={onRetry} style={styles.primaryAction}><Text style={styles.primaryActionText}>Réessayer</Text></TouchableOpacity><TouchableOpacity onPress={onBack}><Text style={styles.backText}>Retour aux réservations</Text></TouchableOpacity></View></SafeAreaView>;
const CheckinConfirmationModal = ({ visible, loading, onClose, onConfirm }: { visible: boolean; loading: boolean; onClose: () => void; onConfirm: () => void }) => {
  const [inspected, setInspected] = useState(false);
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={styles.modalCard}><View style={styles.modalHeader}><Text style={styles.modalTitle}>Confirmer la prise en charge</Text><TouchableOpacity onPress={onClose}><X size={20} color="#334155" /></TouchableOpacity></View><Text style={styles.modalText}>Vérifiez le véhicule et les photos d’état des lieux avant de confirmer. Cette action démarre votre location.</Text><TouchableOpacity onPress={() => setInspected((value) => !value)} style={checkinStyles.row}><View style={[checkinStyles.checkbox, inspected && checkinStyles.checked]}>{inspected ? <CheckCircle2 size={15} color="#FFFFFF" /> : null}</View><Text style={checkinStyles.text}>J’ai inspecté le véhicule et vérifié l’état des lieux transmis par l’hôte.</Text></TouchableOpacity><TouchableOpacity disabled={!inspected || loading} onPress={onConfirm} style={[styles.modalPrimary, (!inspected || loading) && checkinStyles.disabled]}><Text style={styles.modalPrimaryText}>{loading ? 'Validation…' : 'Valider la prise en charge'}</Text></TouchableOpacity></View></View></Modal>;
};
const ReasonModal = ({ mode, reason, comment, submitting, onReason, onComment, onClose, onSubmit }: any) => <Modal visible={Boolean(mode)} transparent animationType="fade" onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={styles.modalCard}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{mode === 'CANCEL' ? 'Annuler la réservation' : 'Signaler un problème'}</Text><TouchableOpacity onPress={onClose}><X size={20} color="#334155" /></TouchableOpacity></View><Text style={styles.modalText}>{mode === 'CANCEL' ? 'Votre demande est soumise à la politique d’annulation AutoLoc.' : 'Décrivez le problème avant de valider votre refus du véhicule.'}</Text><TextInput value={reason} onChangeText={onReason} placeholder={mode === 'CANCEL' ? 'Motif d’annulation' : 'Motif du refus'} multiline style={styles.textInput} /><TextInput value={comment} onChangeText={onComment} placeholder="Précisions (facultatif)" multiline style={styles.textInput} /><TouchableOpacity disabled={submitting} onPress={onSubmit} style={styles.modalPrimary}><Text style={styles.modalPrimaryText}>{submitting ? 'Envoi…' : 'Confirmer'}</Text></TouchableOpacity></View></View></Modal>;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' }, content: { padding: 16, gap: 16, paddingBottom: 40 }, topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' }, reference: { fontFamily: theme.typography.fontFamily.mono, fontSize: 11, color: '#475569', fontWeight: '700' }, hero: { backgroundColor: '#072A20', borderRadius: 24, padding: 20, gap: 12, overflow: 'hidden' }, heroBadgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }, status_success: { backgroundColor: 'rgba(16,185,129,0.28)' }, status_warning: { backgroundColor: 'rgba(245,158,11,0.28)' }, status_info: { backgroundColor: 'rgba(59,130,246,0.28)' }, status_danger: { backgroundColor: 'rgba(220,38,38,0.30)' }, status_neutral: { backgroundColor: 'rgba(148,163,184,0.28)' }, statusText: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.bold, fontSize: 11 }, createdAt: { color: '#A7F3D0', fontFamily: theme.typography.fontFamily.medium, fontSize: 11 }, heroEyebrow: { color: '#A7F3D0', fontFamily: theme.typography.fontFamily.bold, fontSize: 10, letterSpacing: .9 }, heroTitle: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 27 }, heroDescription: { color: '#D1FAE5', fontFamily: theme.typography.fontFamily.regular, fontSize: 13, lineHeight: 19 }, heroDates: { flexDirection: 'row', alignItems: 'stretch', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)', borderRadius: 14, overflow: 'hidden', marginTop: 4 }, dateBlock: { flex: 1, padding: 12, alignItems: 'center' }, dateLabel: { color: '#A7F3D0', fontFamily: theme.typography.fontFamily.bold, fontSize: 8, letterSpacing: .6, textAlign: 'center' }, dateValue: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.semiBold, fontSize: 12, marginTop: 5, textAlign: 'center' }, duration: { width: 58, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,.16)', backgroundColor: 'rgba(255,255,255,.05)', gap: 2 }, durationValue: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.bold, fontSize: 16 }, durationLabel: { color: '#A7F3D0', fontFamily: theme.typography.fontFamily.bold, fontSize: 8 }, totalHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 3 }, totalHeroLabel: { color: '#A7F3D0', fontFamily: theme.typography.fontFamily.bold, fontSize: 10, letterSpacing: .7 }, totalHeroValue: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 22 }, vehicleCard: { flexDirection: 'row', overflow: 'hidden', borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' }, vehicleImage: { width: 110, minHeight: 118 }, vehicleBody: { flex: 1, padding: 14, gap: 5, justifyContent: 'center' }, vehicleName: { color: '#072A20', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 17 }, vehicleMeta: { color: '#64748B', fontFamily: theme.typography.fontFamily.regular, fontSize: 12 }, locationRow: { flexDirection: 'row', gap: 5, alignItems: 'flex-start', marginTop: 3 }, locationText: { flex: 1, color: '#475569', fontFamily: theme.typography.fontFamily.medium, fontSize: 11, lineHeight: 16 }, section: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, padding: 16, gap: 14 }, sectionDark: { backgroundColor: '#072A20', borderColor: '#072A20' }, sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 }, sectionIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' }, sectionIconDark: { backgroundColor: 'rgba(255,255,255,.1)' }, sectionTitle: { color: '#072A20', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 16 }, sectionTitleDark: { color: '#FFFFFF' }, moneyLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 }, moneyLabel: { flex: 1, color: '#A7F3D0', fontFamily: theme.typography.fontFamily.regular, fontSize: 13 }, moneyLabelProminent: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.bold }, moneyValue: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.semiBold, fontSize: 13 }, moneyValueProminent: { fontSize: 18, fontFamily: theme.typography.fontFamily.displaySemiBold }, moneyDivider: { height: 1, backgroundColor: 'rgba(255,255,255,.16)' }, guarantee: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', padding: 11, backgroundColor: 'rgba(255,255,255,.06)', borderRadius: 12 }, guaranteeText: { flex: 1, color: '#D1FAE5', fontFamily: theme.typography.fontFamily.regular, fontSize: 12, lineHeight: 17 }, hostRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, hostAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' }, hostAvatarText: { color: '#166534', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 17 }, hostInfo: { flex: 1 }, hostName: { color: '#072A20', fontFamily: theme.typography.fontFamily.semiBold, fontSize: 14 }, hostSubtitle: { color: '#64748B', fontFamily: theme.typography.fontFamily.regular, fontSize: 12, marginTop: 2 }, callButton: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 11, paddingVertical: 9, borderRadius: 18, backgroundColor: '#ECFDF5' }, callText: { color: '#072A20', fontFamily: theme.typography.fontFamily.bold, fontSize: 12 }, actionPanel: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, padding: 16, gap: 12 }, actionHeading: { flexDirection: 'row', gap: 10 }, actionIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' }, actionTitle: { color: '#072A20', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 16 }, actionSubtitle: { color: '#64748B', fontFamily: theme.typography.fontFamily.regular, fontSize: 12, lineHeight: 17, marginTop: 2, paddingRight: 10 }, primaryAction: { minHeight: 46, borderRadius: 23, backgroundColor: theme.colors.brand.main, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 }, primaryActionText: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.bold, fontSize: 13 }, dangerAction: { minHeight: 43, borderRadius: 21, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 12 }, dangerActionText: { color: '#B91C1C', fontFamily: theme.typography.fontFamily.bold, fontSize: 12 }, cancelAction: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }, cancelActionText: { color: '#B91C1C', fontFamily: theme.typography.fontFamily.semiBold, fontSize: 12 }, timelineRow: { flexDirection: 'row', gap: 10, minHeight: 48 }, timelineRail: { alignItems: 'center', width: 14 }, timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.brand.main, marginTop: 2 }, timelineLine: { flex: 1, width: 1, backgroundColor: '#D1FAE5', marginVertical: 3 }, timelineTitle: { color: '#072A20', fontFamily: theme.typography.fontFamily.semiBold, fontSize: 13 }, timelineDate: { color: '#64748B', fontFamily: theme.typography.fontFamily.regular, fontSize: 11, marginTop: 2 }, bodyText: { color: '#64748B', fontFamily: theme.typography.fontFamily.regular, fontSize: 13, lineHeight: 19 }, support: { padding: 17, borderRadius: 18, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#BBF7D0' }, supportTitle: { color: '#072A20', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 15 }, supportText: { color: '#475569', fontFamily: theme.typography.fontFamily.regular, fontSize: 12, lineHeight: 18, marginTop: 4 }, inlineNotice: { flexDirection: 'row', gap: 8, padding: 13, borderRadius: 14, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' }, inlineNoticeText: { flex: 1, color: '#92400E', fontFamily: theme.typography.fontFamily.medium, fontSize: 12, lineHeight: 17 }, loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 }, errorState: { flex: 1, padding: 28, justifyContent: 'center', alignItems: 'center', gap: 14 }, errorTitle: { color: '#072A20', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 20 }, backText: { color: theme.colors.brand.main, fontFamily: theme.typography.fontFamily.bold, fontSize: 13 }, modalBackdrop: { flex: 1, backgroundColor: 'rgba(4,25,18,.65)', justifyContent: 'center', padding: 20 }, modalCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20, gap: 13 }, modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, modalTitle: { color: '#072A20', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 19 }, modalText: { color: '#64748B', fontFamily: theme.typography.fontFamily.regular, fontSize: 13, lineHeight: 19 }, textInput: { minHeight: 64, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', padding: 12, textAlignVertical: 'top', fontFamily: theme.typography.fontFamily.regular, color: '#0F172A' }, modalPrimary: { minHeight: 47, alignItems: 'center', justifyContent: 'center', backgroundColor: '#072A20', borderRadius: 24 }, modalPrimaryText: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.bold, fontSize: 13 },
});

const getStatusToneStyle = (tone: 'success' | 'warning' | 'info' | 'danger' | 'neutral') => {
  if (tone === 'success') return styles.status_success;
  if (tone === 'warning') return styles.status_warning;
  if (tone === 'info') return styles.status_info;
  if (tone === 'danger') return styles.status_danger;
  return styles.status_neutral;
};

const checkinStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 12, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  checkbox: { width: 21, height: 21, borderRadius: 6, borderWidth: 1, borderColor: '#94A3B8', alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: theme.colors.brand.main, borderColor: theme.colors.brand.main },
  text: { flex: 1, color: '#334155', fontFamily: theme.typography.fontFamily.medium, fontSize: 12, lineHeight: 17 },
  disabled: { opacity: .45 },
});
