import React, { useMemo } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  ChevronRight,
  FileCheck,
  Lock,
  MessageSquare,
  Phone,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';

export interface OwnerTenantContactCardProps {
  reservationId?: string;
  prenom?: string;
  nom?: string;
  telephone?: string;
  kycStatus?: string | null;
  statut?: string;
  dateDebut?: string | Date;
  onInspectDocs: () => void;
}

export const OwnerTenantContactCard: React.FC<OwnerTenantContactCardProps> = ({
  reservationId,
  prenom,
  nom,
  telephone,
  kycStatus,
  statut,
  dateDebut,
  onInspectDocs,
}) => {
  const isVerified = kycStatus === 'VERIFIE';
  const isPending = kycStatus === 'EN_ATTENTE';

  // Règle AutoLoc de confidentialité des documents KYC :
  // Inaccessibles après la fin ou l'annulation de la réservation
  const isEndedOrCancelled = useMemo(() => {
    const st = (statut ?? '').toUpperCase();
    return ['TERMINEE', 'ANNULEE', 'EXPIREE', 'REFUSEE'].includes(st);
  }, [statut]);

  const handleInspectPress = () => {
    if (isEndedOrCancelled) {
      Alert.alert(
        'Accès expiré & confidentiel 🔒',
        "Pour des raisons de protection des données personnelles (RGPD) et de confidentialité, les pièces d'identité et justificatifs KYC du locataire ne sont plus consultables pour les réservations terminées ou annulées.",
        [{ text: 'J’ai compris', style: 'default' }]
      );
      return;
    }
    onInspectDocs();
  };

  // Règle AutoLoc Web & Mobile de confidentialité du numéro de téléphone :
  // Masqué pour ANNULEE, TERMINEE, PAYEE, EN_ATTENTE_PAIEMENT
  // Visible si (EN_COURS, LITIGE) OU (CONFIRMEE <= 24h avant le début)
  const isPhoneVisible = useMemo(() => {
    if (!telephone) return false;
    const st = (statut ?? '').toUpperCase();
    if (['ANNULEE', 'TERMINEE', 'PAYEE', 'INITIEE', 'EN_ATTENTE_PAIEMENT'].includes(st)) {
      return false;
    }
    if (st === 'EN_COURS' || st === 'LITIGE') return true;
    if (st === 'CONFIRMEE') {
      if (!dateDebut) return false;
      const debut = new Date(dateDebut);
      const now = new Date();
      const diffHours = (debut.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours <= 24;
    }
    return false;
  }, [telephone, statut, dateDebut]);

  const handleCall = () => {
    if (telephone) {
      Linking.openURL(`tel:${telephone.replace(/\s+/g, '')}`);
    }
  };

  const handleWhatsApp = () => {
    if (telephone) {
      const cleanPhone = telephone.replace(/\s+/g, '');
      const ref = reservationId ? reservationId.slice(0, 8).toUpperCase() : '';
      const text = encodeURIComponent(
        `Bonjour ${prenom || ''}, je vous contacte concernant la réservation ${ref} sur AutoLoc.`
      );
      Linking.openURL(`https://wa.me/${cleanPhone}?text=${text}`);
    }
  };

  return (
    <View style={styles.card}>
      {/* Section Header Tag */}
      <View style={styles.cardHeader}>
        <View style={styles.sectionBadge}>
          <User size={13} color="#059669" />
          <Text style={styles.sectionTitle}>LOCATAIRE</Text>
        </View>
        <View
          style={[
            styles.kycStatusBadge,
            isVerified ? styles.kycVerifiedBg : isPending ? styles.kycPendingBg : styles.kycUnverifiedBg,
          ]}
        >
          {isVerified ? (
            <ShieldCheck size={12} color="#047857" />
          ) : (
            <ShieldAlert size={12} color={isPending ? '#B45309' : '#DC2626'} />
          )}
          <Text
            style={[
              styles.kycStatusText,
              isVerified ? styles.kycVerifiedText : isPending ? styles.kycPendingText : styles.kycUnverifiedText,
            ]}
          >
            {isVerified ? 'Identité Vérifiée' : isPending ? 'KYC En cours' : 'Non Vérifié'}
          </Text>
        </View>
      </View>

      {/* Main Profile Row */}
      <View style={styles.profileRow}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarRing}>
            <Text style={styles.avatarInitial}>{prenom?.charAt(0) || 'L'}</Text>
          </View>
          {isVerified && (
            <View style={styles.avatarCheckBadge}>
              <ShieldCheck size={10} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.profileMeta}>
          <Text style={styles.fullName}>
            {prenom} {nom}
          </Text>
          <Text style={styles.tenantRoleHint}>Conducteur principal désigné</Text>
        </View>
      </View>

      {/* Phone Contact Block */}
      {isPhoneVisible && telephone ? (
        <View style={styles.phoneContainer}>
          <View style={styles.phoneLeft}>
            <View style={styles.phoneIconCircle}>
              <Phone size={14} color="#059669" />
            </View>
            <View>
              <Text style={styles.phoneLabel}>Téléphone locataire</Text>
              <Text style={styles.phoneNumber}>{telephone}</Text>
            </View>
          </View>

          <View style={styles.contactButtonsRow}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleWhatsApp} style={styles.whatsAppPill}>
              <MessageSquare size={13} color="#FFFFFF" />
              <Text style={styles.whatsAppText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={handleCall} style={styles.callCircle}>
              <Phone size={13} color="#047857" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.maskedPhoneContainer}>
          <View style={styles.maskedHeader}>
            <View style={styles.maskedPhoneLeft}>
              <Phone size={14} color="#64748B" />
              <Text style={styles.maskedNumber}>+221 •• ••• •• ••</Text>
            </View>
            <View style={styles.lockTag}>
              <Lock size={10} color="#475569" />
              <Text style={styles.lockTagText}>
                {statut === 'CONFIRMEE' ? '24h avant' : 'Masqué'}
              </Text>
            </View>
          </View>
          <Text style={styles.maskedPolicyText}>
            🔒 Le numéro sera déverrouillé 24h avant la prise en charge pour des raisons de confidentialité.
          </Text>
        </View>
      )}

      {/* KYC Documents Inspection Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleInspectPress}
        style={[styles.inspectBtn, isEndedOrCancelled && styles.inspectBtnLocked]}
      >
        <View style={[styles.inspectIconBox, isEndedOrCancelled && styles.inspectIconBoxLocked]}>
          {isEndedOrCancelled ? (
            <Lock size={16} color="#94A3B8" />
          ) : (
            <FileCheck size={16} color="#34D399" />
          )}
        </View>

        <View style={styles.inspectTextContainer}>
          <Text style={styles.inspectBtnTitle} numberOfLines={1} ellipsizeMode="tail">
            {isEndedOrCancelled ? 'Documents du locataire (Accès fermé)' : 'Inspecter les documents du locataire'}
          </Text>
          <Text style={styles.inspectBtnSub} numberOfLines={1} ellipsizeMode="tail">
            {isEndedOrCancelled ? 'Accès expiré pour des raisons de confidentialité (RGPD)' : 'Vérifier la pièce d’identité, selfie & permis'}
          </Text>
        </View>

        <ChevronRight size={18} color={isEndedOrCancelled ? '#64748B' : '#34D399'} style={styles.inspectChevron} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#047857',
    letterSpacing: 0.8,
  },
  kycStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  kycVerifiedBg: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  kycPendingBg: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  kycUnverifiedBg: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },

  kycStatusText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
  },
  kycVerifiedText: { color: '#047857' },
  kycPendingText: { color: '#B45309' },
  kycUnverifiedText: { color: '#DC2626' },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 20,
    color: '#059669',
  },
  avatarCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMeta: {
    flex: 1,
  },
  fullName: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 17,
    color: '#072A20',
    letterSpacing: -0.2,
  },
  tenantRoleHint: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },

  /* Visible Phone Container */
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  phoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  phoneIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phoneNumber: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#047857',
    marginTop: 1,
  },
  contactButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  whatsAppPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  whatsAppText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11.5,
    color: '#FFFFFF',
  },
  callCircle: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Masked Phone Container */
  maskedPhoneContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  maskedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  maskedPhoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  maskedNumber: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#64748B',
    letterSpacing: 1,
  },
  lockTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lockTagText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#475569',
    textTransform: 'uppercase',
  },
  maskedPolicyText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },

  /* Inspection Button - Dark theme & layout fix */
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#041E15',
    borderWidth: 1,
    borderColor: '#064E3B',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  inspectIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inspectTextContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  inspectBtnTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  inspectBtnSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: '#A7F3D0',
    marginTop: 1,
  },
  inspectBtnLocked: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  inspectIconBoxLocked: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  inspectChevron: {
    flexShrink: 0,
  },
});
