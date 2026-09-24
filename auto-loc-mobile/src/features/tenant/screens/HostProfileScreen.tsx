import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  ShieldCheck,
  Award,
  Star,
  Clock,
  Car,
  CheckCircle2,
  Share2,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { useNavigation } from '../../../core/navigation/RootNavigator';
import { fetchHostPublicProfile, PublicHostProfile } from '../api/tenantProfileApi';
import { AirbnbVehicleCard } from '../components/AirbnbVehicleCard';
import { HostProfileSkeleton } from '../components/HostProfileSkeleton';
import { VehicleFeedItem } from '../types';

interface HostProfileScreenProps {
  hostId: string;
  onBack?: () => void;
}

export const HostProfileScreen: React.FC<HostProfileScreenProps> = ({ hostId, onBack }) => {
  const { goBack, navigateToVehicleDetail } = useNavigation();
  const [profileData, setProfileData] = useState<PublicHostProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | string>('ALL');

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchHostPublicProfile(hostId);
        if (mounted) {
          setProfileData(data);
        }
      } catch (err: any) {
        console.error('Erreur chargement profil hôte:', err);
        if (mounted) {
          setError(err?.response?.data?.message || 'Impossible de charger le profil de cet hôte.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (hostId) {
      loadData();
    }
    return () => {
      mounted = false;
    };
  }, [hostId]);

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  const handleVehiclePress = (vehicle: VehicleFeedItem) => {
    navigateToVehicleDetail(vehicle.id, vehicle);
  };

  if (loading) {
    return <HostProfileSkeleton />;
  }

  if (error || !profileData) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar style="dark" />
        <View style={styles.errorIconBox}>
          <Car size={32} color="#EF4444" />
        </View>
        <Text style={styles.errorTitle}>Profil introuvable</Text>
        <Text style={styles.errorSubtitle}>{error || "Cet hôte n'existe pas ou n'est plus actif."}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleBackPress}>
          <Text style={styles.retryButtonText}>Retourner</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { host, vehicles, reviews } = profileData;
  const isSuperhost = host.isSuperhost;
  const memberYear = host.membreDepuis ? new Date(host.membreDepuis).getFullYear() : 2024;

  // Filtrage des véhicules par type si disponible
  const filteredVehicles = selectedFilter === 'ALL'
    ? vehicles
    : vehicles.filter(v => v.type?.toUpperCase() === selectedFilter.toUpperCase());

  // Extrait les types uniques pour les filtres
  const availableTypes = Array.from(new Set(vehicles.map(v => v.type).filter(Boolean)));

  return (
    <View style={styles.rootContainer}>
      <StatusBar style="light" />

      {/* Header Bar Flottant */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={handleBackPress} style={styles.headerIconBtn} activeOpacity={0.8}>
          <ChevronLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Profil Hôte AutoLoc
        </Text>
        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.8}>
          <Share2 size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── HERO SECTION HÔTE (DARK FOREST) ─── */}
        <View style={styles.heroCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri:
                    host.avatarUrl && host.avatarUrl.trim() !== ''
                      ? host.avatarUrl
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(host.prenom)}&background=041912&color=4ADE80&bold=true&size=256`,
                }}
                style={styles.avatarImage}
              />
              {isSuperhost && (
                <View style={styles.superhostBadge}>
                  <Award size={14} color="#FFFFFF" />
                </View>
              )}
            </View>

            <View style={styles.hostIdentity}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.hostName}>{host.nomCompletAffiche}</Text>
                <CheckCircle2 size={18} color="#10B981" />
              </View>

              <View style={styles.tagPillRow}>
                {isSuperhost ? (
                  <View style={styles.superhostPill}>
                    <Award size={11} color="#F5C451" />
                    <Text style={styles.superhostPillText}>SUPERHOST</Text>
                  </View>
                ) : (
                  <View style={styles.verifiedPill}>
                    <ShieldCheck size={11} color="#4ADE80" />
                    <Text style={styles.verifiedPillText}>HÔTE VÉRIFIÉ</Text>
                  </View>
                )}
                <View style={styles.memberSincePill}>
                  <Calendar size={11} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.memberSinceText}>Depuis {memberYear}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ─── STATISTIQUES CLÉS DE L'HÔTE ─── */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={styles.statIconRow}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.statValue}>
                  {host.noteProprietaire > 0 ? host.noteProprietaire.toFixed(1) : '5.0'}
                </Text>
              </View>
              <Text style={styles.statLabel}>{host.totalAvis} avis</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statValueBig}>{host.totalLocations}</Text>
              <Text style={styles.statLabel}>locations</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <View style={styles.statIconRow}>
                <Clock size={14} color="#4ADE80" />
                <Text style={styles.statValue}>{host.tauxReponse}%</Text>
              </View>
              <Text style={styles.statLabel}>réponse {host.tempsReponse}</Text>
            </View>
          </View>
        </View>

        {/* ─── BANNIÈRE DE GARANTIES ET SÉCURITÉ ─── */}
        <View style={styles.guaranteesCard}>
          <View style={styles.guaranteeItem}>
            <ShieldCheck size={20} color="#10B981" />
            <View style={styles.guaranteeTextCol}>
              <Text style={styles.guaranteeTitle}>Identité & Permis Vérifiés</Text>
              <Text style={styles.guaranteeSub}>Documents officiels contrôlés par AutoLoc Security</Text>
            </View>
          </View>

          <View style={styles.guaranteeItem}>
            <Sparkles size={20} color="#10B981" />
            <View style={styles.guaranteeTextCol}>
              <Text style={styles.guaranteeTitle}>Contrat Digital & Assurance</Text>
              <Text style={styles.guaranteeSub}>État des lieux photo et couverture souscrite</Text>
            </View>
          </View>
        </View>

        {/* ─── CARDS DE SES ANNONCES / VÉHICULES ─── */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Car size={20} color="#041912" />
              <Text style={styles.sectionTitle}>Annonces de {host.prenom}</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{vehicles.length}</Text>
            </View>
          </View>

          {/* Filtres par types si multiple */}
          {availableTypes.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterPill, selectedFilter === 'ALL' && styles.filterPillActive]}
                onPress={() => setSelectedFilter('ALL')}
              >
                <Text style={[styles.filterPillText, selectedFilter === 'ALL' && styles.filterPillTextActive]}>
                  Tous ({vehicles.length})
                </Text>
              </TouchableOpacity>

              {availableTypes.map((t) => {
                const count = vehicles.filter((v) => v.type === t).length;
                return (
                  <TouchableOpacity
                    key={`filter-${t}`}
                    style={[styles.filterPill, selectedFilter === t && styles.filterPillActive]}
                    onPress={() => setSelectedFilter(t as string)}
                  >
                    <Text style={[styles.filterPillText, selectedFilter === t && styles.filterPillTextActive]}>
                      {t} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Feed des cartes véhicules */}
          {filteredVehicles.length > 0 ? (
            <View style={styles.vehiclesList}>
              {filteredVehicles.map((veh) => (
                <AirbnbVehicleCard
                  key={veh.id}
                  vehicle={veh}
                  onPress={handleVehiclePress}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyVehiclesBox}>
              <Car size={28} color="#94A3B8" />
              <Text style={styles.emptyVehiclesText}>Aucun véhicule disponible dans cette catégorie.</Text>
            </View>
          )}
        </View>

        {/* ─── SECTION AVIS DES LOCATAIRES ─── */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MessageSquare size={20} color="#041912" />
              <Text style={styles.sectionTitle}>Avis des locataires</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{reviews.length}</Text>
            </View>
          </View>

          {reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {reviews.map((rev) => (
                <View key={rev.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.authorWrapper}>
                      {rev.auteurAvatar ? (
                        <Image source={{ uri: rev.auteurAvatar }} style={styles.authorAvatar} />
                      ) : (
                        <View style={styles.authorAvatarPlaceholder}>
                          <Text style={styles.authorAvatarInitial}>{(rev.auteurNom[0] || 'L').toUpperCase()}</Text>
                        </View>
                      )}
                      <View>
                        <Text style={styles.authorName}>{rev.auteurNom}</Text>
                        <Text style={styles.reviewVehicleTag}>Véhicule : {rev.vehiculeConcerne}</Text>
                      </View>
                    </View>

                    <View style={styles.ratingBadge}>
                      <Star size={11} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingBadgeText}>{rev.note.toFixed(1)}</Text>
                    </View>
                  </View>

                  <Text style={styles.reviewComment}>{rev.commentaire}</Text>

                  <Text style={styles.reviewDate}>
                    {new Date(rev.creeLe).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyReviewsBox}>
              <Star size={24} color="#CBD5E1" />
              <Text style={styles.emptyReviewsText}>Cet hôte n'a pas encore reçu d'avis écrits.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#041912',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#0F172A',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#041912',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  headerBar: {
    backgroundColor: '#041912',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },

  scrollContent: {
    paddingBottom: 24,
  },

  /* HERO CARD */
  heroCard: {
    backgroundColor: '#041912',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: '#10B981',
  },
  avatarPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#063B2B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#10B981',
  },
  avatarInitial: {
    color: '#4ADE80',
    fontSize: 26,
    fontWeight: '800',
  },
  superhostBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1.5,
    borderColor: '#041912',
  },

  hostIdentity: {
    flex: 1,
    gap: 4,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hostName: {
    color: '#FFFFFF',
    fontSize: 21,
    fontFamily: theme.typography.fontFamily.displayBold,
    letterSpacing: -0.3,
  },
  tagPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  superhostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 196, 81, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.4)',
  },
  superhostPillText: {
    color: '#F5C451',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  verifiedPillText: {
    color: '#4ADE80',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  memberSincePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberSinceText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '500',
  },

  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  statValueBig: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  /* GUARANTEES CARD */
  guaranteesCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  guaranteeTextCol: {
    flex: 1,
  },
  guaranteeTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
  },
  guaranteeSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },

  /* SECTION CONTAINER */
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
  },
  countBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  countBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },

  filterScroll: {
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#041912',
    borderColor: '#041912',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  vehiclesList: {
    gap: 16,
  },
  emptyVehiclesBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyVehiclesText: {
    color: '#64748B',
    fontSize: 13,
  },

  /* REVIEWS */
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  authorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  authorAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorAvatarInitial: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  authorName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  reviewVehicleTag: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  ratingBadgeText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewComment: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  reviewDate: {
    color: '#94A3B8',
    fontSize: 11,
  },
  emptyReviewsBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyReviewsText: {
    color: '#64748B',
    fontSize: 13,
  },
});
