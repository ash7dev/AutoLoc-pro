import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HelpCircle, LogOut } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { useAppStore } from '../../../core/store/useAppStore';
import { secureStorage } from '../../../core/storage/secureStore';
import { AutoButton, TenantHeader } from '../../../shared/components';
import { ReservationGateModal } from '../components/gates/ReservationGateModal';
import { TenantBecomeHostCard } from '../components/profile/TenantBecomeHostCard';
import { TenantProfileHero } from '../components/profile/TenantProfileHero';
import { TenantProfileInformationCard } from '../components/profile/TenantProfileInformationCard';
import { TenantSecurityCard } from '../components/profile/TenantSecurityCard';
import { TenantVerificationCard } from '../components/profile/TenantVerificationCard';
import { becomeAutoLocHost, fetchTenantProfile, TenantProfile } from '../api/tenantProfileApi';
import { calculateAge, GateStep } from '../hooks/useBookingGate';

function verificationSteps(profile: TenantProfile): GateStep[] {
  const steps: GateStep[] = [];
  if (!profile.profileCompleted || !profile.prenom || !profile.nom || !profile.dateNaissance) steps.push('PROFILE');
  if (!profile.phoneVerified) steps.push('PHONE');
  if (profile.statutKyc === 'NON_VERIFIE' || profile.statutKyc === 'REJETE') steps.push('KYC');
  if (!profile.permisUrl) steps.push('PERMIS');
  return steps.length ? ['PREGATE', ...steps] : [];
}

export const TenantProfileScreen: React.FC = () => {
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const setAuth = useAppStore((state) => state.setAuth);
  const logout = useAppStore((state) => state.logout);
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gateVisible, setGateVisible] = useState(false);
  const [gateSteps, setGateSteps] = useState<GateStep[]>([]);

  const syncProfile = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const next = await fetchTenantProfile();
      setProfile(next);
      await updateUserProfile({
        prenom: next.prenom, nom: next.nom, email: next.email, telephone: next.telephone,
        avatarUrl: next.avatarUrl || undefined, dateNaissance: next.dateNaissance || undefined,
        statutKyc: next.statutKyc, permisUrl: next.permisUrl, phoneVerified: next.phoneVerified, role: next.role,
      });
    } catch {
      if (!silent) Alert.alert('Profil indisponible', 'Vérifiez votre connexion puis réessayez.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [updateUserProfile]);

  useEffect(() => { syncProfile(); }, [syncProfile]);

  const openVerification = (steps = profile ? verificationSteps(profile) : []) => {
    if (!profile) return;
    if (profile.statutKyc === 'EN_ATTENTE' && steps.length === 0) {
      Alert.alert('Dossier en cours', 'Votre identité est en cours de vérification. Nous vous notifierons dès validation.');
      return;
    }
    if (steps.length === 0) { Alert.alert('Compte prêt', 'Vos éléments de vérification sont à jour.'); return; }
    setGateSteps(steps);
    setGateVisible(true);
  };

  const becomeHost = async () => {
    const result = await becomeAutoLocHost();
    // /auth/switch-role émet des jetons portant le nouveau rôle : on les
    // persiste et on remplace la session en mémoire dans la même opération.
    await secureStorage.setRefreshToken(result.refreshToken);
    await setAuth(result.accessToken, {
      id: profile!.id,
      prenom: profile!.prenom,
      nom: profile!.nom,
      email: profile!.email,
      telephone: profile!.telephone,
      avatarUrl: profile!.avatarUrl || undefined,
      dateNaissance: profile!.dateNaissance || undefined,
      statutKyc: profile!.statutKyc,
      permisUrl: profile!.permisUrl,
      phoneVerified: profile!.phoneVerified,
      role: result.role,
    });
    setProfile((current) => current ? { ...current, role: result.role } : current);
  };

  if (loading && !profile) return <SafeAreaView style={styles.safeArea}><StatusBar style="dark" /><TenantHeader variant="MANAGEMENT" title="Mon profil" subtitle="Votre compte AutoLoc" /><View style={styles.loading}><ActivityIndicator color={theme.colors.brand.main} /><Text style={styles.loadingText}>Préparation de votre profil…</Text></View></SafeAreaView>;
  if (!profile) return <SafeAreaView style={styles.safeArea}><View style={styles.loading}><Text style={styles.loadingText}>Impossible de charger le profil.</Text><AutoButton title="Réessayer" onPress={() => syncProfile()} /></View></SafeAreaView>;

  return <SafeAreaView style={styles.safeArea}>
    <StatusBar style="dark" />
    <TenantHeader variant="MANAGEMENT" title="Mon profil" subtitle="Mon compte et mes vérifications" />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); syncProfile(true); }} tintColor={theme.colors.brand.main} />}>
      <TenantProfileHero profile={profile} onVerificationPress={() => openVerification()} onAvatarUpdated={async (avatarUrl) => { setProfile({ ...profile, avatarUrl }); await updateUserProfile({ avatarUrl }); }} />
      <TenantBecomeHostCard
        isHost={profile.role === 'PROPRIETAIRE'}
        listingsCount={profile.annoncesCount ?? profile.listingsCount ?? 0}
        onConfirm={becomeHost}
      />
      <TenantVerificationCard profile={profile} onPress={() => openVerification()} />
      <TenantProfileInformationCard profile={profile} onPhonePress={() => openVerification(['PREGATE', 'PHONE'])} onUpdated={async (partial) => { setProfile({ ...profile, ...partial }); await syncProfile(true); }} />
      <TenantSecurityCard profile={profile} onUpdated={async (partial) => {
        setProfile({ ...profile, ...partial });
        if (partial.email) await updateUserProfile({ email: partial.email });
      }} />
      <View style={styles.assistance}><HelpCircle size={19} color={theme.colors.brand.main} /><View style={styles.assistanceText}><Text style={styles.assistanceTitle}>Besoin d’aide ?</Text><Text style={styles.assistanceDescription}>Notre équipe AutoLoc est disponible pour vous accompagner.</Text></View></View>
      <AutoButton title="Se déconnecter" variant="ghost" leftIcon={<LogOut size={17} color={theme.colors.text.primary} />} onPress={() => Alert.alert('Déconnexion', 'Voulez-vous fermer cette session ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Se déconnecter', style: 'destructive', onPress: logout }])} />
    </ScrollView>
    <ReservationGateModal visible={gateVisible} vehicleTitle="Votre compte AutoLoc" missingSteps={gateSteps} userAge={calculateAge(profile.dateNaissance || undefined)} onClose={() => setGateVisible(false)} onAllCompleted={() => { setGateVisible(false); syncProfile(true); }} />
  </SafeAreaView>;
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.surface.page },
  content: { padding: theme.spacing[4], paddingBottom: 118, gap: theme.spacing[4] },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  loadingText: { fontFamily: theme.typography.fontFamily.medium, color: theme.colors.text.secondary, fontSize: 13 },
  assistance: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', padding: theme.spacing[4], backgroundColor: theme.colors.brand.subtle, borderWidth: 1, borderColor: theme.colors.brand.border, borderRadius: theme.radius.card },
  assistanceText: { flex: 1 }, assistanceTitle: { fontFamily: theme.typography.fontFamily.semiBold, color: theme.colors.text.primary, fontSize: 14 },
  assistanceDescription: { fontFamily: theme.typography.fontFamily.regular, color: theme.colors.text.secondary, fontSize: 12, lineHeight: 18, marginTop: 2 },
});
