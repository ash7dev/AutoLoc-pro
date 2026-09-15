import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Download, ExternalLink, FileText, ShieldCheck } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { apiClient } from '../../../core/api/apiClient';

type ContractAccess = { viewUrl: string; downloadUrl: string; expiresInSeconds: number };

type LoadingAction = 'view' | 'download' | null;

interface BookingContractCardProps {
  reservationId: string;
  statut: string;
}

const STATUTS_ELIGIBLES = ['PAYEE', 'CONFIRMEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'];

export const BookingContractCard: React.FC<BookingContractCardProps> = ({ reservationId, statut }) => {
  const isEligible = STATUTS_ELIGIBLES.includes(statut);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (!isEligible) return null;

  const openContract = async (action: 'view' | 'download') => {
    setLoadingAction(action);
    try {
      const { data: access } = await apiClient.get<ContractAccess>(`/reservations/${reservationId}/contract-access`);
      const targetUrl = action === 'view' ? access.viewUrl : access.downloadUrl;

      const canOpen = await Linking.canOpenURL(targetUrl);
      if (!canOpen) {
        throw new Error(`URL non ouvrable: ${targetUrl}`);
      }
      await Linking.openURL(targetUrl);
    } catch (error) {
      console.warn('[BookingContractCard] Échec ouverture contrat:', error);
      Alert.alert('Contrat indisponible', 'Nous ne pouvons pas ouvrir votre contrat pour le moment. Réessayez dans un instant.');
    } finally {
      if (isMountedRef.current) {
        setLoadingAction(null);
      }
    }
  };

  const isBusy = loadingAction !== null;

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <FileText size={20} color="#A7F3D0" />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Contrat de location</Text>
          <View style={styles.secureBadge}>
            <ShieldCheck size={11} color="#A7F3D0" />
            <Text style={styles.secureBadgeText}>Signé</Text>
          </View>
        </View>
        <Text style={styles.text}>Document officiel et horodaté, accessible via lien sécurisé.</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Consulter le contrat de location"
          accessibilityState={{ disabled: isBusy }}
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
          accessibilityState={{ disabled: isBusy }}
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
    </View>
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
  copy: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(167,243,208,0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  secureBadgeText: {
    color: '#A7F3D0',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
  },
  text: {
    color: '#D1FAE5',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
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