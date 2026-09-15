import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Download, ExternalLink, FileText, ShieldCheck } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { apiClient } from '../../../core/api/apiClient';

type ContractAccess = { viewUrl: string; downloadUrl: string; expiresInSeconds: number };

export const BookingContractCard: React.FC<{ reservationId: string; statut: string }> = ({ reservationId, statut }) => {
  const isEligible = ['PAYEE', 'CONFIRMEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'].includes(statut);
  const [loadingAction, setLoadingAction] = useState<'view' | 'download' | null>(null);
  if (!isEligible) return null;

  const openContract = async (action: 'view' | 'download') => {
    try {
      setLoadingAction(action);
      const { data: access } = await apiClient.get<ContractAccess>(`/reservations/${reservationId}/contract-access`);
      await Linking.openURL(action === 'view' ? access.viewUrl : access.downloadUrl);
    } catch {
      Alert.alert('Contrat indisponible', 'Nous ne pouvons pas ouvrir votre contrat pour le moment. Réessayez dans un instant.');
    } finally {
      setLoadingAction(null);
    }
  };

  return <View style={styles.card}><View style={styles.icon}><FileText size={20} color="#A7F3D0" /></View><View style={styles.copy}><Text style={styles.title}>Contrat de location</Text><Text style={styles.text}>Document privé et horodaté, accessible via un lien sécurisé temporaire.</Text></View><View style={styles.actions}><TouchableOpacity accessibilityRole="button" disabled={loadingAction !== null} onPress={() => openContract('view')} style={styles.view}>{loadingAction === 'view' ? <ActivityIndicator size="small" color="#072A20" /> : <><ExternalLink size={14} color="#072A20" /><Text style={styles.viewText}>Consulter</Text></>}</TouchableOpacity><TouchableOpacity accessibilityRole="button" disabled={loadingAction !== null} onPress={() => openContract('download')} style={styles.download}>{loadingAction === 'download' ? <ActivityIndicator size="small" color="#FFFFFF" /> : <><Download size={14} color="#FFFFFF" /><Text style={styles.downloadText}>Télécharger</Text></>}</TouchableOpacity></View></View>;
};
const styles = StyleSheet.create({ card: { borderRadius: 18, backgroundColor: '#072A20', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 11 }, icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.1)' }, copy: { flex: 1 }, title: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 15 }, text: { color: '#A7F3D0', fontFamily: theme.typography.fontFamily.regular, fontSize: 11, marginTop: 2, lineHeight: 15 }, actions: { gap: 6 }, view: { flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9, paddingVertical: 7, borderRadius: 14, backgroundColor: '#D1FAE5' }, viewText: { color: '#072A20', fontFamily: theme.typography.fontFamily.bold, fontSize: 10 }, download: { flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9, paddingVertical: 7, borderRadius: 14, backgroundColor: 'rgba(255,255,255,.14)' }, downloadText: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.bold, fontSize: 10 } });
