import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Info,
  ShieldAlert,
  X,
  XCircle,
} from 'lucide-react-native';
import { apiClient } from '../../../core/api/apiClient';
import { theme } from '../../../core/theme';
import { formatCurrency } from '../../../core/utils/currency';

interface CancellationQuote {
  canCancel: boolean;
  isOwner?: boolean;
  refundPercentage: number;
  refundAmount: string;
  commissionRetained: string;
  ownerPenaltyAmount?: string;
  ownerPenaltyPercentage?: number;
  warnings: string[];
}

interface BookingCancellationPreviewModalProps {
  visible: boolean;
  reservationId: string;
  vehicleName?: string;
  statut?: string;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export const BookingCancellationPreviewModal: React.FC<BookingCancellationPreviewModalProps> = ({
  visible,
  reservationId,
  vehicleName,
  statut,
  submitting,
  onClose,
  onConfirm,
}) => {
  const [quote, setQuote] = useState<CancellationQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setReason('');
    setQuote(null);
    setError(null);
    setDone(false);
    setLoading(true);

    apiClient
      .get<CancellationQuote>(`/reservations/${reservationId}/cancellation-quote`)
      .then((r) => setQuote(r.data))
      .catch((e) =>
        setError(e?.response?.data?.message || 'Impossible de calculer la politique d’annulation.')
      )
      .finally(() => setLoading(false));
  }, [reservationId, visible]);

  const canSubmit = reason.trim().length >= 5 && !submitting && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    try {
      await onConfirm(reason.trim());
      setDone(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'L’annulation a échoué.');
    }
  };

  if (!visible) return null;

  const isOwner = quote?.isOwner;
  const ownerPenalty = Number(quote?.ownerPenaltyAmount || 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={styles.sheetHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconBox, isOwner && ownerPenalty > 0 ? styles.headerIconRed : styles.headerIconAmber]}>
                <XCircle size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Annuler la réservation</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {vehicleName ? `Réf. ${reservationId.slice(0, 8).toUpperCase()} · ${vehicleName}` : `Réf. ${reservationId.slice(0, 8).toUpperCase()}`}
                </Text>
              </View>
            </View>
            <TouchableOpacity disabled={submitting} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {done ? (
              /* Success confirmation state */
              <View style={styles.doneContainer}>
                <View style={styles.doneIconCircle}>
                  <CheckCircle2 size={36} color="#FFFFFF" />
                </View>
                <Text style={styles.doneTitle}>Réservation annulée</Text>
                <Text style={styles.doneSubtitle}>
                  La réservation a bien été annulée. Notification envoyée aux parties concernées.
                </Text>
              </View>
            ) : loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={theme.colors.brand.main} size="large" />
                <Text style={styles.loadingText}>Calcul des règles d’annulation en cours…</Text>
              </View>
            ) : (
              <>
                {/* Contextual Warning Policy Box */}
                {quote ? (
                  isOwner ? (
                    /* OWNER CANCELLATION WARNING */
                    <View style={[styles.policyBox, ownerPenalty > 0 ? styles.policyBoxRed : styles.policyBoxGreen]}>
                      <View style={styles.policyHeader}>
                        <ShieldAlert size={16} color={ownerPenalty > 0 ? '#DC2626' : '#059669'} />
                        <Text style={[styles.policyTitle, ownerPenalty > 0 ? styles.policyTitleRed : styles.policyTitleGreen]}>
                          {ownerPenalty > 0 ? 'ATTENTION : PÉNALITÉ PROPRIÉTAIRE' : 'ANNULATION PROPRIÉTAIRE'}
                        </Text>
                      </View>

                      {ownerPenalty > 0 ? (
                        <View style={{ gap: 4 }}>
                          <Text style={styles.policyAmountRed}>
                            Pénalité : {formatCurrency(ownerPenalty)} ({quote.ownerPenaltyPercentage}%)
                          </Text>
                          <Text style={styles.policySubRed}>
                            Une pénalité de {quote.ownerPenaltyPercentage}% sera appliquée sur votre compte et le locataire sera intégralement remboursé (100%).
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.policySubGreen}>
                          Annulation effectuée plus de 7 jours avant le début. Aucune pénalité ne vous sera appliquée. Le locataire est remboursé intégralement.
                        </Text>
                      )}

                      {quote.warnings.map((w, idx) => (
                        <Text key={idx} style={styles.policyWarningBullet}>
                          • {w}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    /* TENANT CANCELLATION WARNING */
                    <View style={styles.policyBoxAmber}>
                      <View style={styles.policyHeader}>
                        <DollarSign size={16} color="#D97706" />
                        <Text style={styles.policyTitleAmber}>REMBOURSEMENT ESTIMÉ LOCATAIRE</Text>
                      </View>
                      <Text style={styles.policyAmountAmber}>
                        {formatCurrency(Number(quote.refundAmount))}
                      </Text>
                      <Text style={styles.policySubAmber}>
                        Remboursement de {quote.refundPercentage}% du montant réglé selon le barème AutoLoc.
                      </Text>

                      {quote.warnings.map((w, idx) => (
                        <Text key={idx} style={styles.policyWarningBulletAmber}>
                          • {w}
                        </Text>
                      ))}
                    </View>
                  )
                ) : null}

                {/* Reason Input Field */}
                <View style={styles.reasonSection}>
                  <View style={styles.reasonLabelRow}>
                    <Text style={styles.reasonLabel}>Motif d’annulation</Text>
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </View>

                  <TextInput
                    value={reason}
                    onChangeText={setReason}
                    placeholder="Expliquez la raison de votre annulation (ex: imprévu, panne mécanique, urgence...)"
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    style={styles.reasonInput}
                  />

                  <View style={styles.reasonFooterRow}>
                    {reason.trim().length > 0 && reason.trim().length < 5 ? (
                      <Text style={styles.reasonErrorText}>
                        • 5 caractères minimum requis
                      </Text>
                    ) : <View />}
                    <Text style={styles.reasonCounterText}>{reason.length}/500</Text>
                  </View>
                </View>

                {/* Error Banner */}
                {error && (
                  <View style={styles.errorBox}>
                    <AlertTriangle size={15} color="#DC2626" />
                    <Text style={styles.errorBoxText}>{error}</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Footer Action Bar */}
          {!done && (
            <View style={styles.footer}>
              <TouchableOpacity disabled={submitting || loading} onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Conserver</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!canSubmit || quote?.canCancel === false}
                onPress={handleSubmit}
                style={[
                  styles.submitBtn,
                  (!canSubmit || quote?.canCancel === false) && styles.submitBtnDisabled,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <ChevronRight size={18} color="#FFFFFF" />
                    <Text style={styles.submitText}>Confirmer l’annulation</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 25, 18, 0.72)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconRed: {
    backgroundColor: '#EF4444',
  },
  headerIconAmber: {
    backgroundColor: '#F59E0B',
  },
  title: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 17,
    color: '#072A20',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 18,
    gap: 14,
  },

  loadingContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#64748B',
  },

  doneContainer: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  doneIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 18,
    color: '#072A20',
  },
  doneSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },

  /* Policy warning boxes */
  policyBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  policyBoxRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  policyBoxGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  policyBoxAmber: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  policyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  policyTitleRed: { color: '#DC2626' },
  policyTitleGreen: { color: '#047857' },
  policyTitleAmber: { color: '#D97706', fontFamily: theme.typography.fontFamily.bold, fontSize: 11 },
  policyAmountRed: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 20,
    color: '#B91C1C',
  },
  policySubRed: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#991B1B',
    lineHeight: 16,
  },
  policySubGreen: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#065F46',
    lineHeight: 16,
  },
  policyAmountAmber: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 22,
    color: '#B45309',
  },
  policySubAmber: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#92400E',
    lineHeight: 16,
  },
  policyWarningBullet: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#7F1D1D',
  },
  policyWarningBulletAmber: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#78350F',
  },

  /* Reason section */
  reasonSection: {
    gap: 6,
  },
  reasonLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reasonLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  requiredAsterisk: {
    color: '#DC2626',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },
  reasonInput: {
    minHeight: 90,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    padding: 12,
    textAlignVertical: 'top',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#0F172A',
  },
  reasonFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  reasonErrorText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#DC2626',
  },
  reasonCounterText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#94A3B8',
  },

  /* Error Box */
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
  },
  errorBoxText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11.5,
    color: '#B91C1C',
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#475569',
  },
  submitBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
});
