import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { User, ShieldCheck, LogOut, ChevronRight, Settings, CreditCard, HelpCircle, Sparkles, Key } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../core/theme';
import { useAppStore } from '../../../core/store/useAppStore';
import { TenantHeader, AutoButton } from '../../../shared/components';

export const TenantProfileScreen: React.FC = () => {
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);

  const getInitials = () => {
    if (user?.prenom && user?.nom) {
      return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
    }
    return 'AL';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <TenantHeader
        variant="MANAGEMENT"
        title="Mon Profil"
        subtitle="Gérez vos informations & statut KYC"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* MobileProfileHero (Forest-950 Surface #041912 / #072A20) */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={['#072A20', '#041912']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroTopRow}>
              {/* Avatar Ring (64px) */}
              <View style={styles.avatarRing}>
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarInitials}>{getInitials()}</Text>
                </View>
              </View>

              <View style={styles.heroMainInfo}>
                {/* Nom et Prénom : Fraunces_600SemiBold (18px, Blanc #F8FBF4) */}
                <Text style={styles.heroName}>
                  {user?.prenom ? `${user.prenom} ${user.nom}` : 'Utilisateur AutoLoc'}
                </Text>

                {/* Email / Téléphone : Inter_500Medium (12px, #A8D5C1) */}
                <Text style={styles.heroContact}>
                  {user?.telephone || user?.email || '+221 77 000 00 00'}
                </Text>

                {/* Pastille Rôle : Inter_700Bold (10px, Émeraude-300 #86EFAC) */}
                <View style={styles.roleTag}>
                  <Sparkles size={11} color={theme.primitives.emerald[300]} />
                  <Text style={styles.roleTagText}>ESPACE VOYAGEUR SÉNÉGAL</Text>
                </View>
              </View>
            </View>

            {/* Badges de Qualification & Statut */}
            <View style={styles.heroBadgesRow}>
              <View style={styles.kycBadgePill}>
                <ShieldCheck size={13} color={theme.primitives.emerald[300]} />
                <Text style={styles.kycBadgeText}>IDENTITÉ VÉRIFIÉE (KYC)</Text>
              </View>

              <View style={styles.terangaClubPill}>
                <Key size={13} color="#F59E0B" />
                <Text style={styles.terangaClubText}>🔑 CLUB TERANGA CLÉ D'OR</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Banner Switch Role -> Devenir Hôte / Propriétaire */}
        <View style={styles.ownerCard}>
          <Text style={styles.sectionTitle}>Vous avez un véhicule à louer ?</Text>
          <Text style={styles.sectionSubtitle}>
            Proposez votre voiture à Dakar et gérez vos revenus sur votre espace Hôte dédié.
          </Text>
          <AutoButton title="Devenir Hôte AutoLoc" variant="action" size="md" style={styles.ownerBtn} />
        </View>

        {/* Cartes d'Information & Sécurité */}
        <View style={styles.menuGroup}>
          <Text style={styles.menuGroupHeader}>SÉCURITÉ & PARAMÈTRES</Text>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <ShieldCheck size={20} color={theme.colors.brand.main} />
            <View style={styles.menuTextStack}>
              <Text style={styles.menuTitle}>Vérification d'identité (KYC)</Text>
              <Text style={styles.menuDesc}>Permis de conduire et pièce d'identité validés</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <CreditCard size={20} color={theme.colors.text.secondary} />
            <View style={styles.menuTextStack}>
              <Text style={styles.menuTitle}>Moyens de Paiement</Text>
              <Text style={styles.menuDesc}>Wave, Orange Money, Carte Bancaire</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Settings size={20} color={theme.colors.text.secondary} />
            <View style={styles.menuTextStack}>
              <Text style={styles.menuTitle}>Paramètres du compte</Text>
              <Text style={styles.menuDesc}>Langue, notifications et confidentialité</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <HelpCircle size={20} color={theme.colors.text.secondary} />
            <View style={styles.menuTextStack}>
              <Text style={styles.menuTitle}>Support & Assistance 24/7</Text>
              <Text style={styles.menuDesc}>Assistance téléphonique et centre d'aide</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Bouton Déconnexion Fantôme */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <LogOut size={18} color={theme.colors.status.error} />
          <Text style={styles.logoutText}>Se déconnecter de la session</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  container: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
    paddingBottom: 110,
  },
  heroContainer: {
    borderRadius: theme.radius.card, // 20px (radius-card)
    overflow: 'hidden',
    ...theme.elevation.card,
  },
  heroGradient: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.primitives.emerald[300],
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#041912',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontFamily: theme.typography.fontFamily.displaySemiBold, // Fraunces_600SemiBold (22px)
    fontSize: 22,
    color: theme.primitives.emerald[300], // #86EFAC
  },
  heroMainInfo: {
    flex: 1,
    gap: 3,
  },
  heroName: {
    fontFamily: theme.typography.fontFamily.displaySemiBold, // Fraunces_600SemiBold (18px)
    fontSize: 18,
    color: '#F8FBF4', // text.inverseDisplay
  },
  heroContact: {
    fontFamily: theme.typography.fontFamily.medium, // Inter_500Medium (12px)
    fontSize: 12,
    color: '#A8D5C1',
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  roleTagText: {
    fontFamily: theme.typography.fontFamily.bold, // Inter_700Bold (10px)
    fontSize: 10,
    letterSpacing: 0.5,
    color: theme.primitives.emerald[300], // #86EFAC
  },
  heroBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: theme.spacing[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  kycBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(134, 239, 172, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full, // Pilule 9999px
    gap: 5,
  },
  kycBadgeText: {
    fontFamily: theme.typography.fontFamily.semiBold, // Inter_600SemiBold (11px)
    fontSize: 10,
    color: theme.primitives.emerald[300],
  },
  terangaClubPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full, // Pilule 9999px
    gap: 5,
  },
  terangaClubText: {
    fontFamily: theme.typography.fontFamily.bold, // Inter_700Bold (11px)
    fontSize: 10,
    color: '#FDE68A',
  },
  ownerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.card, // 20px (radius-card)
    padding: theme.spacing[4],
    gap: theme.spacing[2],
    borderWidth: 1,
    borderColor: '#E4EBDB',
    ...theme.elevation.card,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold, // Fraunces_600SemiBold (17px)
    fontSize: 17,
    color: theme.primitives.forest[800],
  },
  sectionSubtitle: {
    fontFamily: theme.typography.fontFamily.regular, // Inter_400Regular (12-13px)
    fontSize: 12.5,
    color: '#5F6B59', // neutral-600
    lineHeight: 18,
  },
  ownerBtn: {
    marginTop: theme.spacing[2],
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.card, // 20px (radius-card)
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    ...theme.elevation.card,
  },
  menuGroupHeader: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#7D8975',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
    gap: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F6EA',
  },
  menuTextStack: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontFamily: theme.typography.fontFamily.semiBold, // Inter_600SemiBold
    fontSize: theme.typography.fontSize.sm,
    color: theme.primitives.forest[800],
  },
  menuDesc: {
    fontFamily: theme.typography.fontFamily.regular, // Inter_400Regular (12px)
    fontSize: 11.5,
    color: '#5F6B59', // neutral-600
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.status.errorBg,
    borderWidth: 1,
    borderColor: theme.colors.status.errorBorder,
    padding: theme.spacing[3],
    borderRadius: theme.radius.full, // Pilule 9999px
    gap: theme.spacing[2],
  },
  logoutText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.status.error,
  },
});
