import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
  AlertTriangle,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { apiClient } from '../../../core/api/apiClient';

type ContractAccess = { viewUrl: string; downloadUrl: string; expiresInSeconds: number };
type LoadingAction = 'view' | 'download' | null;

interface BookingContractCardProps {
  reservationId: string;
  statut: string;
}

export const BookingContractCard: React.FC<BookingContractCardProps> = ({ reservationId, statut }) => {
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const normalizedStatus = statut?.toUpperCase() ?? '';

  // 1. VERROU PAIEMENT EN ATTENTE
  const isPendingPayment = normalizedStatus === 'EN_ATTENTE_PAIEMENT' || normalizedStatus === 'INITIEE';

  // 2. VERROU ATTENTE CONFIRMATION HÔTE
  const isPendingHost = normalizedStatus === 'PAYEE';

  // 3. LOCATION TERMINÉE (EXPIRED / ARCHIVED)
  const isCompleted = normalizedStatus === 'TERMINEE';

  // 4. CONTRAT SCELLÉ (LITIGE, ANNULEE)
  const isSealed = ['LITIGE', 'ANNULEE'].includes(normalizedStatus);

  const handlePressLocked = (type: 'PAYMENT' | 'HOST' | 'COMPLETED' | 'SEALED') => {
    if (type === 'PAYMENT') {
      Alert.alert(
        'Contrat verrouillé',
        'Le contrat de location légal sera généré, horodaté et téléchargeable dès que le paiement aura été confirmé.',
        [{ text: 'J’ai compris', style: 'default' }]
      );
    } else if (type === 'HOST') {
      Alert.alert(
        'Contrat en cours de finalisation',
        'Votre paiement est bien confirmé ! Le contrat sera accessible dès que le propriétaire aura validé la réservation.',
        [{ text: 'J’ai compris', style: 'default' }]
      );
    } else if (type === 'COMPLETED') {
      Alert.alert(
        'Location terminée & expirée',
        'Cette location est officiellement terminée. Le contrat légal demeure archivé pour vos garanties et justificatifs. Tout lien temporaire d’accès expire automatiquement au bout de 5 minutes.',
        [{ text: 'J’ai compris', style: 'default' }]
      );
    } else if (type === 'SEALED') {
      Alert.alert(
        'Contrat scellé & archivé',
        'Cette réservation a été annulée ou fait l’objet d’un litige. Le document reste scellé et conservé à des fins de preuve et de conformité.',
        [{ text: 'J’ai compris', style: 'default' }]
      );
    }
  };

  const openInSecureAppBrowser = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: '#04150F',
        controlsColor: '#A7F3D0',
        dismissButtonStyle: 'close',
        readerMode: false,
        enableBarCollapsing: true,
        showInRecents: false,
      });
    } catch {
      await Linking.openURL(url);
    }
  };

  const openContract = async (action: 'view' | 'download') => {
    if (isPendingPayment) {
      return handlePressLocked('PAYMENT');
    }
    if (isPendingHost) {
      return handlePressLocked('HOST');
    }

    setLoadingAction(action);
    try {
      // Demande du token d'accès sécurisé temporaire (5 min) au serveur NestJS
      const { data: access } = await apiClient.get<ContractAccess>(`/reservations/${reservationId}/contract-access`);
      const targetUrl = action === 'view' ? access.viewUrl : access.downloadUrl;

      // Si la location est terminée ou annulée, informer l'utilisateur via une Alert avant l'ouverture
      if (isCompleted) {
        Alert.alert(
          'Location terminée (Contrat archivé)',
          'Cette location est terminée et expirée. Le lien temporaire d’accès est éphémère (valable 5 minutes pour des raisons de sécurité). Souhaitez-vous quand même ouvrir le document archivé ?',
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: action === 'view' ? 'Consulter' : 'Télécharger',
              style: 'default',
              onPress: async () => {
                await openInSecureAppBrowser(targetUrl);
              },
            },
          ]
        );
        return;
      }

      if (isSealed) {
        Alert.alert(
          'Réservation annulée (Contrat scellé)',
          'Cette réservation a été annulée. Le contrat d’origine est conservé scellé à titre d’historique légal. Souhaitez-vous le consulter ?',
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: action === 'view' ? 'Consulter' : 'Télécharger',
              style: 'default',
              onPress: async () => {
                await openInSecureAppBrowser(targetUrl);
              },
            },
          ]
        );
        return;
      }

      await openInSecureAppBrowser(targetUrl);
    } catch (error: any) {
      console.warn('[BookingContractCard] Échec ouverture contrat:', error);
      const isForbiddenOrExpired =
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        error?.response?.status === 410;

      Alert.alert(
        isForbiddenOrExpired ? 'Lien d’accès expiré' : 'Contrat indisponible',
        error?.response?.data?.message ||
          (isForbiddenOrExpired
            ? 'Le lien d’accès au contrat a expiré ou n’est plus valide. Cliquez à nouveau sur Consulter ou Télécharger pour générer un nouvel accès sécurisé.'
            : 'Impossible d’accéder au contrat sécurisé pour le moment. Veuillez réessayer dans quelques instants.'),
        [{ text: 'D’accord', style: 'default' }]
      );
    } finally {
      if (isMountedRef.current) {
        setLoadingAction(null);
      }
    }
  };

  const isBusy = loadingAction !== null;

  // RENDU : CAS 1 - VERROU PAIEMENT EN ATTENTE (ALERT ON PRESS)
  if (isPendingPayment) {
    return (
      <TouchableOpacity
        onPress={() => handlePressLocked('PAYMENT')}
        activeOpacity={0.85}
        style={[styles.card, styles.cardLocked]}
      >
        <View style={styles.iconBoxLocked}>
          <Lock size={20} color="#D97706" />
        </View>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={styles.titleLocked}>Contrat de location</Text>
            <View style={styles.badgeLocked}>
              <Lock size={10} color="#D97706" />
              <Text style={styles.badgeLockedText}>VERROUILLÉ</Text>
            </View>
          </View>
          <Text style={styles.textLocked}>
            Appuyez pour voir les conditions de déverrouillage.
          </Text>
        </View>
        <View style={styles.lockBtnInfo}>
          <Lock size={14} color="#D97706" />
        </View>
      </TouchableOpacity>
    );
  }

  // RENDU : CAS 2 - VERROU EN ATTENTE DE CONFIRMATION HÔTE (ALERT ON PRESS)
  if (isPendingHost) {
    return (
      <TouchableOpacity
        onPress={() => handlePressLocked('HOST')}
        activeOpacity={0.85}
        style={[styles.card, styles.cardPending]}
      >
        <View style={styles.iconBoxPending}>
          <FileCheck2 size={20} color="#60A5FA" />
        </View>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Contrat en préparation</Text>
            <View style={styles.badgePending}>
              <Text style={styles.badgePendingText}>PAIEMENT CONFIRMÉ</Text>
            </View>
          </View>
          <Text style={styles.text}>
            Appuyez pour voir l’état de validation de l’hôte.
          </Text>
        </View>
        <View style={styles.lockBtnInfoPending}>
          <Lock size={14} color="#60A5FA" />
        </View>
      </TouchableOpacity>
    );
  }

  // RENDU : CAS 3, 4 & 5 - CONTRAT ACTIF, TERMINÉ OU SCELLÉ
  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => {
        if (isCompleted) handlePressLocked('COMPLETED');
        else if (isSealed) handlePressLocked('SEALED');
      }}
      style={[styles.card, isSealed && styles.cardSealed]}
    >
      <View style={[styles.iconBox, isSealed && styles.iconBoxSealed]}>
        {isSealed ? (
          <ShieldAlert size={20} color="#FECACA" />
        ) : isCompleted ? (
          <FileCheck2 size={20} color="#A7F3D0" />
        ) : (
          <FileText size={20} color="#A7F3D0" />
        )}
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            {isCompleted ? 'Contrat de location (Expiré)' : 'Contrat de location'}
          </Text>
          <View style={[styles.secureBadge, isSealed && styles.secureBadgeSealed]}>
            {isSealed ? <ShieldAlert size={11} color="#FECACA" /> : <ShieldCheck size={11} color="#A7F3D0" />}
            <Text style={[styles.secureBadgeText, isSealed && styles.secureBadgeTextSealed]}>
              {isSealed ? 'SCELLÉ' : isCompleted ? 'TERMINÉE' : 'SIGNÉ & CERTIFIÉ'}
            </Text>
          </View>
        </View>
        <Text style={styles.text}>
          {isSealed
            ? 'Document archivé et scellé. Accessible à titre d’historique.'
            : isCompleted
            ? 'Location terminée. Contrat archivé accessible par accès temporaire.'
            : 'Document officiel horodaté, accessible via lien temporaire sécurisé.'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Consulter le contrat de location"
          disabled={isBusy}
          onPress={() => openContract('view')}
          activeOpacity={0.8}
          style={[styles.viewBtn, isBusy && loadingAction !== 'view' && styles.btnDisabled]}
        >
          {loadingAction === 'view' ? (
            <ActivityIndicator size="small" color="#072A20" />
          ) : (
            <>
              <ExternalLink size={13} color="#072A20" />
              <Text style={styles.viewText}>Consulter</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Télécharger le contrat de location"
          disabled={isBusy}
          onPress={() => openContract('download')}
          activeOpacity={0.8}
          style={[styles.downloadBtn, isBusy && loadingAction !== 'download' && styles.btnDisabled]}
        >
          {loadingAction === 'download' ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Download size={13} color="#FFFFFF" />
              <Text style={styles.downloadText}>Télécharger</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: '#072A20',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#072A20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLocked: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  cardPending: {
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  cardSealed: {
    backgroundColor: '#450A0A',
    borderWidth: 1.5,
    borderColor: '#7F1D1D',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  iconBoxLocked: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  iconBoxPending: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  iconBoxSealed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  title: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
  },
  titleLocked: {
    color: '#92400E',
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(167,243,208,0.18)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  secureBadgeText: {
    color: '#A7F3D0',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 8.5,
  },
  secureBadgeSealed: {
    backgroundColor: 'rgba(239,68,68,0.25)',
  },
  secureBadgeTextSealed: {
    color: '#FECACA',
  },
  badgeLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeLockedText: {
    color: '#B45309',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 8.5,
  },
  badgePending: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgePendingText: {
    color: '#60A5FA',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 8.5,
  },
  text: {
    color: '#D1FAE5',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  textLocked: {
    color: '#B45309',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  lockBtnInfo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBtnInfoPending: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: 6,
  },
  viewBtn: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#A7F3D0',
  },
  viewText: {
    color: '#072A20',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  downloadBtn: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  downloadText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  btnDisabled: {
    opacity: 0.4,
  },
});