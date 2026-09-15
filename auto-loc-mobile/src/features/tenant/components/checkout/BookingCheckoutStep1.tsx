import React from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView } from 'react-native';
import { ArrowRight, AlertTriangle } from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { BookingVehicleSummaryCard } from './BookingVehicleSummaryCard';
import { BookingDateSelector } from './BookingDateSelector';
import { BookingAddonsSelector } from './BookingAddonsSelector';
import { BookingPriceBreakdownCard } from './BookingPriceBreakdownCard';
import { BookingCancellationPolicyCard } from './BookingCancellationPolicyCard';
import { AutoButton } from '../../../../shared/components/AutoButton';

interface BookingCheckoutStep1Props {
  vehicle: {
    id: string;
    marque: string;
    modele: string;
    annee?: number;
    typeStr?: string;
    ville?: string;
    photoUrl?: string;
    tenantPricePerDay: number;
    joursMinimum?: number;
    hasDelivery?: boolean;
    fraisLivraison?: number;
    autoriseHorsDakar?: boolean;
    supplementHorsDakarParJour?: number;
    transmission?: string;
    carburant?: string;
    nombrePlaces?: number;
    note?: number;
  };
  dateDebut?: string;
  dateFin?: string;
  nbJours: number;
  isDatesBlocked?: boolean;
  onDatesChange: (start: string, end?: string) => void;

  isDeliverySelected: boolean;
  onToggleDelivery: (val: boolean) => void;

  isHorsDakarSelected: boolean;
  onToggleHorsDakar: (val: boolean) => void;

  selectedCurrency?: string;
  onNext: () => void;
}

export const BookingCheckoutStep1: React.FC<BookingCheckoutStep1Props> = ({
  vehicle,
  dateDebut,
  dateFin,
  nbJours,
  isDatesBlocked = false,
  onDatesChange,
  isDeliverySelected,
  onToggleDelivery,
  isHorsDakarSelected,
  onToggleHorsDakar,
  selectedCurrency = 'XOF',
  onNext,
}) => {
  return (
    <View style={styles.rootContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Vignette Synthèse Véhicule Hero Showcase */}
        <BookingVehicleSummaryCard
          photoUrl={vehicle.photoUrl}
          marque={vehicle.marque}
          modele={vehicle.modele}
          annee={vehicle.annee}
          typeStr={vehicle.typeStr}
          ville={vehicle.ville}
          tenantPricePerDay={vehicle.tenantPricePerDay}
          selectedCurrency={selectedCurrency}
          note={vehicle.note}
          transmission={vehicle.transmission}
          carburant={vehicle.carburant}
          nombrePlaces={vehicle.nombrePlaces}
        />

        {/* 2. Sélection & Modification des Dates */}
        <BookingDateSelector
          vehicleId={vehicle.id}
          dateDebut={dateDebut}
          dateFin={dateFin}
          joursMinimum={vehicle.joursMinimum}
          onDatesChange={onDatesChange}
        />

        {/* Avertissement d'indisponibilité des dates présélectionnées */}
        {isDatesBlocked && (
          <View style={styles.blockedAlertCard}>
            <AlertTriangle size={18} color="#DC2626" />
            <View style={styles.blockedAlertTextGroup}>
              <Text style={styles.blockedAlertTitle}>Véhicule indisponible</Text>
              <Text style={styles.blockedAlertSub}>
                Ce véhicule est déjà réservé sur la période sélectionnée. Veuillez appuyer sur le calendrier ci-dessus pour modifier vos dates.
              </Text>
            </View>
          </View>
        )}

        {/* 3. Options & Services Additionnels (Livraison, Hors Dakar) */}
        <BookingAddonsSelector
          hasDelivery={vehicle.hasDelivery}
          fraisLivraison={vehicle.fraisLivraison}
          isDeliverySelected={isDeliverySelected}
          onToggleDelivery={onToggleDelivery}
          autoriseHorsDakar={vehicle.autoriseHorsDakar}
          supplementHorsDakarParJour={vehicle.supplementHorsDakarParJour}
          isHorsDakarSelected={isHorsDakarSelected}
          onToggleHorsDakar={onToggleHorsDakar}
          nbJours={nbJours}
          selectedCurrency={selectedCurrency}
        />

        {/* 4. Bloc Récapitulatif des Frais en Fond Sombre #041912 */}
        <BookingPriceBreakdownCard
          tenantPricePerDay={vehicle.tenantPricePerDay}
          nbJours={nbJours}
          isDeliverySelected={isDeliverySelected}
          fraisLivraison={vehicle.fraisLivraison}
          isHorsDakarSelected={isHorsDakarSelected}
          supplementHorsDakarParJour={vehicle.supplementHorsDakarParJour}
          selectedCurrency={selectedCurrency}
        />

        {/* 5. Politiques et Règlements d'Annulation */}
        <BookingCancellationPolicyCard />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Barre d'Action Fixe Inférieure */}
      <SafeAreaView style={styles.footerSafeArea}>
        <View style={styles.footerRow}>
          <AutoButton
            title={isDatesBlocked ? "Dates indisponibles" : "Continuer vers le paiement"}
            variant="action"
            rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
            onPress={onNext}
            disabled={isDatesBlocked}
            size="lg"
            style={styles.ctaButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Page principale en fond blanc pur (#FFFFFF)
  },
  scrollContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  blockedAlertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: theme.radius.lg,
    padding: theme.spacing[4],
    gap: 12,
  },
  blockedAlertTextGroup: {
    flex: 1,
    gap: 2,
  },
  blockedAlertTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#991B1B',
  },
  blockedAlertSub: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#B91C1C',
    lineHeight: 17,
  },
  footerSafeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E4EBDB',
  },
  footerRow: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  ctaButton: {
    width: '100%',
  },
});
