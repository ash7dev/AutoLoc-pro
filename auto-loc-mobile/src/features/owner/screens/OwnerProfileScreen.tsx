import React, { useState } from 'react';
import { Alert, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HelpCircle, LogOut } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { useAppStore } from '../../../core/store/useAppStore';
import { AutoButton, OwnerHeader } from '../../../shared/components';
import { ReservationGateModal } from '../../tenant/components/gates/ReservationGateModal';
import { TenantBecomeHostCard } from '../../tenant/components/profile/TenantBecomeHostCard';
import { TenantProfileHero } from '../../tenant/components/profile/TenantProfileHero';
import { TenantProfileInformationCard } from '../../tenant/components/profile/TenantProfileInformationCard';
import { TenantSecurityCard } from '../../tenant/components/profile/TenantSecurityCard';
import { TenantVerificationCard } from '../../tenant/components/profile/TenantVerificationCard';
import { TenantProfile } from '../../tenant/api/tenantProfileApi';
import { useTenantProfile } from '../../tenant/hooks/useTenantProfile';
import { OwnerProfileSkeleton } from '../components/OwnerProfileSkeleton';
import { calculateAge, GateStep } from '../../tenant/hooks/useBookingGate';

interface OwnerProfileScreenProps {
  onSwitchToTenant?: () => void;
  onBack?: () => void;
}

function verificationSteps(profile: TenantProfile): GateStep[] {
  const steps: GateStep[] = [];
  if (!profile.profileCompleted || !profile.prenom || !profile.nom || !profile.dateNaissance) steps.push('PROFILE');
  if (!profile.phoneVerified) steps.push('PHONE');
  if (profile.statutKyc === 'NON_VERIFIE' || profile.statutKyc === 'REJETE') steps.push('KYC');
  if (!profile.permisUrl) steps.push('PERMIS');
  return steps.length ? ['PREGATE', ...steps] : [];
}

export const OwnerProfileScreen: React.FC<OwnerProfileScreenProps> = ({
  onSwitchToTenant,
  onBack,
}) => {
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const logout = useAppStore((state) => state.logout);

  const { data: profile, isLoading, isRefetching, refetch } = useTenantProfile();

  const [gateVisible, setGateVisible] = useState(false);
  const [gateSteps, setGateSteps] = useState<GateStep[]>([]);

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

  if (isLoading && !profile) {
    return <OwnerProfileSkeleton />;
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Impossible de charger le profil.</Text>
          <AutoButton title="Réessayer" onPress={() => refetch()} />
          <AutoButton title="Se déconnecter" variant="ghost" onPress={logout} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <OwnerHeader
        variant="MANAGEMENT"
        title="Mon Profil Hôte"
        subtitle="Mon compte et basculement de mode"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={theme.colors.brand.main}
          />
        }
      >
        {/* Hero Card du Profil avec le badge ESPACE PROPRIÉTAIRE */}
        <TenantProfileHero
          profile={profile}
          isOwnerMode={true}
          onVerificationPress={() => openVerification()}
          onAvatarUpdated={async (avatarUrl) => {
            await updateUserProfile({ avatarUrl });
            refetch();
          }}
        />

        {/* Carte de Basculement vers le Mode Locataire */}
        <TenantBecomeHostCard
          currentMode="OWNER"
          isHost={true}
          onSwitchToTenant={onSwitchToTenant}
        />

        {/* Composants de vérification, infos personnelles et sécurité */}
        <TenantVerificationCard profile={profile} onPress={() => openVerification()} />
        <TenantProfileInformationCard
          profile={profile}
          onUpdated={async (partial) => {
            await updateUserProfile({
              prenom: partial.prenom,
              nom: partial.nom,
              dateNaissance: partial.dateNaissance || undefined,
            });
            const res = await refetch();
            const updatedProfile = res.data;
            if (updatedProfile) {
              const missing = verificationSteps(updatedProfile);
              if (missing.length > 0) {
                Alert.alert(
                  'Vérification requise 🛡️',
                  'Vos informations ont été enregistrées. Une vérification d’identité (KYC) est nécessaire pour débloquer ou maintenir vos accès.',
                  [
                    { text: 'Plus tard', style: 'cancel' },
                    {
                      text: 'Vérifier mon identité ⚡️',
                      onPress: () => openVerification(missing),
                    },
                  ]
                );
              } else {
                Alert.alert('Profil mis à jour', 'Vos informations personnelles ont été enregistrées avec succès.');
              }
            }
          }}
        />
        <TenantSecurityCard
          profile={profile}
          onUpdated={async (partial) => {
            if (partial.email) await updateUserProfile({ email: partial.email });
            refetch();
          }}
        />

        <View style={styles.assistance}>
          <HelpCircle size={19} color={theme.colors.brand.main} />
          <View style={styles.assistanceText}>
            <Text style={styles.assistanceTitle}>Assistance Hôte 24/7</Text>
            <Text style={styles.assistanceDescription}>
              Besoin d’aide avec un véhicule ou une réservation ? Notre équipe support est à votre disposition.
            </Text>
          </View>
        </View>

        <AutoButton
          title="Se déconnecter"
          variant="ghost"
          leftIcon={<LogOut size={17} color={theme.colors.text.primary} />}
          onPress={() =>
            Alert.alert('Déconnexion', 'Voulez-vous fermer cette session ?', [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Se déconnecter', style: 'destructive', onPress: logout },
            ])
          }
        />
      </ScrollView>

      <ReservationGateModal
        visible={gateVisible}
        vehicleTitle="Votre compte AutoLoc Hôte"
        missingSteps={gateSteps}
        userAge={calculateAge(profile.dateNaissance || undefined)}
        onClose={() => setGateVisible(false)}
        onAllCompleted={() => {
          setGateVisible(false);
          refetch();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.surface.page },
  content: { padding: theme.spacing[4], paddingBottom: 118, gap: theme.spacing[4] },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  loadingText: { fontFamily: theme.typography.fontFamily.medium, color: theme.colors.text.secondary, fontSize: 13 },
  assistance: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'flex-start',
    padding: theme.spacing[4],
    backgroundColor: theme.colors.brand.subtle,
    borderWidth: 1,
    borderColor: theme.colors.brand.border,
    borderRadius: theme.radius.card,
  },
  assistanceText: { flex: 1 },
  assistanceTitle: { fontFamily: theme.typography.fontFamily.semiBold, color: theme.colors.text.primary, fontSize: 14 },
  assistanceDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
});
