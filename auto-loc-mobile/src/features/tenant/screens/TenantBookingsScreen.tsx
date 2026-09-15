import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Calendar, CheckCircle, MapPin } from 'lucide-react-native';
import { formatCurrency } from '@autoloc/shared';
import { theme } from '../../../core/theme';
import { TenantHeader, AutoCard } from '../../../shared/components';

export const TenantBookingsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <TenantHeader
        variant="MANAGEMENT"
        title="Mes Réservations"
        subtitle="Suivi de vos locations et acomptes réglés"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Carte Réservation Principale */}
        <AutoCard variant="elevated" style={styles.bookingCard}>
          <View style={styles.statusRow}>
            <Text style={styles.bookingId}>RÉSERVATION #AL-9842</Text>
            <View style={styles.confirmedBadge}>
              <CheckCircle size={12} color={theme.colors.brand.main} />
              <Text style={styles.confirmedBadgeText}>CONFIRMÉE</Text>
            </View>
          </View>

          <View style={styles.carRow}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80' }}
              style={styles.carThumb}
            />
            <View style={styles.carInfo}>
              {/* Titre Logement/Véhicule : Fraunces_600SemiBold (Plafond 600) */}
              <Text style={styles.carName}>Toyota Land Cruiser Prado VX</Text>
              
              {/* dates & lieux */}
              <View style={styles.dateRow}>
                <Calendar size={12} color={theme.colors.brand.main} />
                <Text style={styles.carDates}>20 Sep 2026 - 25 Sep 2026 (5 nuits)</Text>
              </View>
              <View style={styles.locRow}>
                <MapPin size={12} color={theme.colors.text.tertiary} />
                <Text style={styles.carLocation}>Almadies, Dakar</Text>
              </View>
            </View>
          </View>

          {/* Carte Récapitulatif Sombre Surface Forest-950 (#072A20) */}
          <View style={styles.recapCardDark}>
            <View style={styles.recapHeaderRow}>
              <Text style={styles.recapBlockTitle}>DÉTAIL DU RÈGLEMENT</Text>
              <Text style={styles.recapDiscountLabel}>-10% REMISE LONG SÉJOUR</Text>
            </View>

            <View style={styles.recapLine}>
              <Text style={styles.recapLabel}>Acompte 30% réglé (Orange Money) :</Text>
              <Text style={styles.recapPaidVal}>{formatCurrency(67500)}</Text>
            </View>

            <View style={styles.recapLine}>
              <Text style={styles.recapLabel}>Solde à la remise des clés :</Text>
              <Text style={styles.recapRemainingVal}>{formatCurrency(157500)}</Text>
            </View>

            <View style={styles.recapDivider} />

            {/* Total à Payer : Fraunces_600SemiBold en Émeraude Lumineux #86EFAC */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Séjour :</Text>
              <Text style={styles.totalValue}>{formatCurrency(225000)}</Text>
            </View>
          </View>
        </AutoCard>
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
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.card, // 20px (radius-card)
    padding: theme.spacing[4],
    gap: theme.spacing[4],
    borderWidth: 1,
    borderColor: '#E4EBDB',
    ...theme.elevation.card,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingId: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#7D8975',
    letterSpacing: 0.5,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.brand.subtle,
    borderWidth: 1,
    borderColor: theme.colors.brand.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full, // Pilule 9999px
    gap: 5,
  },
  confirmedBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: theme.colors.brand.main,
  },
  carRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    alignItems: 'center',
  },
  carThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  carInfo: {
    flex: 1,
    gap: 4,
  },
  carName: {
    fontFamily: theme.typography.fontFamily.displaySemiBold, // Fraunces_600SemiBold (17px)
    fontSize: 17,
    color: theme.primitives.forest[800], // forest-950 (#041912)
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  carDates: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: theme.colors.brand.main,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  carLocation: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#5F6B59',
  },
  recapCardDark: {
    backgroundColor: '#072A20', // Forest Night Surface (#072A20)
    borderRadius: 16,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  recapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapBlockTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#A8D5C1',
    letterSpacing: 0.5,
  },
  recapDiscountLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: theme.primitives.emerald[300], // Émeraude lumineux
  },
  recapLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#A8D5C1',
  },
  recapPaidVal: {
    fontFamily: theme.typography.fontFamily.bold,
    fontVariant: ['tabular-nums'],
    fontSize: 13,
    color: '#FFFFFF',
  },
  recapRemainingVal: {
    fontFamily: theme.typography.fontFamily.bold,
    fontVariant: ['tabular-nums'],
    fontSize: 13,
    color: theme.primitives.emerald[300],
  },
  recapDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  totalValue: {
    fontFamily: theme.typography.fontFamily.displaySemiBold, // Fraunces_600SemiBold (18px)
    fontVariant: ['tabular-nums'],
    fontSize: 18,
    color: theme.primitives.emerald[300], // Émeraude lumineux (#86EFAC)
  },
});
