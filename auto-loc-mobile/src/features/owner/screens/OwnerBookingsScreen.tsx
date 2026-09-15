import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Search, Calendar, CheckCircle2, Clock } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { OwnerHeader } from '../../../shared/components';
import { OwnerBookingCard } from '../components/OwnerBookingCard';
import { ownerApi, OwnerBooking } from '../api/ownerApi';

interface OwnerBookingsScreenProps {
  onSwitchToTenant?: () => void;
  onProfilePress?: () => void;
}

export const OwnerBookingsScreen: React.FC<OwnerBookingsScreenProps> = ({
  onSwitchToTenant,
  onProfilePress,
}) => {
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = async () => {
    try {
      const data = await ownerApi.getOwnerBookings();
      setBookings(data);
    } catch {
      // Handled via mock
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleApprove = async (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, statut: 'CONFIRMED' } : b))
    );
    await ownerApi.respondToBookingRequest(bookingId, true);
    Alert.alert('Réservation acceptée !', 'Le locataire a été informé par SMS & Notification.');
  };

  const handleReject = async (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, statut: 'REJECTED' } : b))
    );
    await ownerApi.respondToBookingRequest(bookingId, false);
    Alert.alert('Demande refusée', 'Le locataire sera remboursé automatiquement.');
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.codeReservation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vehicleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.locataireName.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'ALL') return matchesSearch;
    return matchesSearch && b.statut === activeFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <OwnerHeader
        variant="MANAGEMENT"
        title="Réservations & Contrats"
        subtitle={`${bookings.length} réservations enregistrées`}
        onProfilePress={onProfilePress}
      />

      <View style={styles.container}>
        {/* Barre de Recherche */}
        <View style={styles.searchBox}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par code, véhicule ou locataire..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filtres par statut de réservation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {[
            { id: 'ALL', label: `Toutes (${bookings.length})` },
            {
              id: 'PENDING_APPROVAL',
              label: `En attente (${bookings.filter((b) => b.statut === 'PENDING_APPROVAL').length})`,
            },
            { id: 'IN_PROGRESS', label: 'En cours' },
            { id: 'COMPLETED', label: 'Terminées' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.id as any)}
            >
              <Text style={[styles.filterText, activeFilter === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Liste des Réservations */}
        <ScrollView
          contentContainerStyle={styles.scrollList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadBookings();
              }}
              tintColor={theme.colors.brand.main}
            />
          }
        >
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <OwnerBookingCard
                key={booking.id}
                booking={booking}
                onApprove={handleApprove}
                onReject={handleReject}
                onDetailPress={(id) =>
                  Alert.alert('Détails Réservation', `Consultation du contrat ${booking.codeReservation}`)
                }
              />
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Calendar size={36} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Aucune réservation dans cette catégorie</Text>
              <Text style={styles.emptySubtitle}>
                Les nouvelles demandes de location et réservations actives s'afficheront ici.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
    paddingTop: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#1F2937',
  },
  filtersScroll: {
    marginBottom: 12,
    maxHeight: 38,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#051B14',
    borderColor: '#051B14',
  },
  filterText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#6B7280',
  },
  filterTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  scrollList: {
    paddingBottom: 110,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: '#374151',
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
