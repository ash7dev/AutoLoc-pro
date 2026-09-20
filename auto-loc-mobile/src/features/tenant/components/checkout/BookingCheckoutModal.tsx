import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { BookingCheckoutHeader } from './BookingCheckoutHeader';
import { BookingCheckoutStep1 } from './BookingCheckoutStep1';
import { BookingCheckoutStep2 } from './BookingCheckoutStep2';
import { PaymentMode } from './BookingPaymentModeSelector';
import { PaymentGateway } from './BookingPaymentGatewaySelector';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../../../../core/store/useAppStore';
import { apiClient } from '../../../../core/api/apiClient';

export interface BookingCheckoutModalProps {
  visible: boolean;
  onClose: () => void;
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
    proposeLivraisonDakar?: boolean;
    fraisLivraisonDakar?: number;
    proposeLivraisonAibd?: boolean;
    fraisLivraisonAibd?: number;
    hasDelivery?: boolean;
    fraisLivraison?: number;
    autoriseHorsDakar?: boolean;
    supplementHorsDakarParJour?: number;
    transmission?: string;
    carburant?: string;
    nombrePlaces?: number;
    note?: number;
  };
  initialDateDebut?: string;
  initialDateFin?: string;
  onBookingSuccess?: (reservationId: string) => void;
}

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  visible,
  onClose,
  vehicle,
  initialDateDebut,
  initialDateFin,
  onBookingSuccess,
}) => {
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);

  const [step, setStep] = useState<1 | 2>(1);
  const [dateDebut, setDateDebut] = useState<string | undefined>(initialDateDebut);
  const [dateFin, setDateFin] = useState<string | undefined>(initialDateFin);
  const [typeLivraison, setTypeLivraison] = useState<'AUCUNE' | 'DAKAR' | 'AIBD'>('AUCUNE');
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [isHorsDakarSelected, setIsHorsDakarSelected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [blockedRanges, setBlockedRanges] = useState<Array<{ from: string; to: string }>>([]);

  // Chargement des dates bloquées du véhicule à l'ouverture de la modale
  useEffect(() => {
    if (visible && vehicle.id) {
      apiClient
        .get<{ blockedRanges: Array<{ from: string; to: string }> }>(`/vehicles/${vehicle.id}/blocked-dates`)
        .then((res) => {
          if (res.data?.blockedRanges) {
            setBlockedRanges(res.data.blockedRanges);
          }
        })
        .catch((err) => {
          console.warn('Erreur lors du chargement des dates bloquées:', err);
        });
    }
  }, [visible, vehicle.id]);

  // Vérification de la disponibilité des dates présélectionnées ou modifiées
  const isDatesBlocked = React.useMemo(() => {
    if (!dateDebut || !blockedRanges || blockedRanges.length === 0) return false;

    const parseIsoDate = (s: string): Date => {
      const parts = s.split('T')[0].split('-').map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    };

    const start = parseIsoDate(dateDebut);
    const end = dateFin ? parseIsoDate(dateFin) : start;

    for (const range of blockedRanges) {
      if (!range.from || !range.to) continue;
      const rStart = parseIsoDate(range.from);
      const rEnd = parseIsoDate(range.to);

      if (start <= rEnd && end >= rStart) {
        return true;
      }
    }

    return false;
  }, [dateDebut, dateFin, blockedRanges]);

  // Pré-remplissage des dates par défaut si non fournies
  useEffect(() => {
    if (visible) {
      setStep(1);
      setIsProcessing(false);

      const minDays = vehicle.joursMinimum || 1;
      let startStr = initialDateDebut;
      let endStr = initialDateFin;

      if (!startStr) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        startStr = tomorrow.toISOString().split('T')[0];
      }

      if (!endStr && startStr) {
        const s = new Date(`${startStr}T00:00:00`);
        s.setDate(s.getDate() + minDays);
        endStr = s.toISOString().split('T')[0];
      }

      setDateDebut(startStr);
      setDateFin(endStr);
    }
  }, [visible, initialDateDebut, initialDateFin, vehicle.joursMinimum]);

  // Calcul du nombre de jours
  const calculateDays = (): number => {
    if (!dateDebut || !dateFin) return vehicle.joursMinimum || 1;
    const s = new Date(`${dateDebut}T00:00:00`).getTime();
    const e = new Date(`${dateFin}T00:00:00`).getTime();
    return Math.max(1, Math.round((e - s) / (1000 * 3600 * 24)));
  };

  const nbJours = calculateDays();

  // Calcul du montant total
  const numTenantPrice = Number(vehicle.tenantPricePerDay) || 0;
  const numSupplementHorsDakar = Number(vehicle.supplementHorsDakarParJour) || 0;

  let deliveryTotal = 0;
  if (typeLivraison === 'DAKAR') {
    deliveryTotal = Number(vehicle.fraisLivraisonDakar ?? vehicle.fraisLivraison ?? 0);
  } else if (typeLivraison === 'AIBD') {
    deliveryTotal = Number(vehicle.fraisLivraisonAibd ?? 0);
  }

  const rentalBaseTotal = numTenantPrice * nbJours;
  const horsDakarTotal = isHorsDakarSelected ? numSupplementHorsDakar * nbJours : 0;
  const grandTotal = rentalBaseTotal + deliveryTotal + horsDakarTotal;

  const handleHeaderBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onClose();
    }
  };

  const handleDatesChange = (start: string, end?: string) => {
    setDateDebut(start);
    const minDays = vehicle.joursMinimum || 1;
    if (start && (!end || end <= start)) {
      const s = new Date(`${start}T00:00:00`);
      s.setDate(s.getDate() + minDays);
      setDateFin(s.toISOString().split('T')[0]);
    } else {
      setDateFin(end);
    }
  };

  const handleSubmitPayment = async (params: {
    paymentMode: PaymentMode;
    paymentGateway: PaymentGateway;
    phoneNumber: string;
  }) => {
    if (!dateDebut || !dateFin) {
      Alert.alert('Erreur', 'Veuillez sélectionner des dates de réservation valides.');
      return;
    }

    if (isDatesBlocked) {
      Alert.alert('Dates indisponibles', 'Ce véhicule est déjà réservé sur la période sélectionnée. Veuillez modifier vos dates.');
      return;
    }

    setIsProcessing(true);

    try {
      const phoneClean = params.phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
      const modePaiementStr = params.paymentMode === 'DEPOSIT_30' ? 'ACOMPTE_SOLDE_CHECKIN' : 'TOTAL_EN_LIGNE';

      const payload = {
        vehiculeId: vehicle.id,
        dateDebut,
        dateFin,
        fournisseur: params.paymentGateway,
        idempotencyKey: `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        targetPayment: params.paymentGateway,
        payerPhone: phoneClean,
        modePaiement: modePaiementStr,
        typeLivraison,
        ...(typeLivraison !== 'AUCUNE' ? { adresseLivraison: adresseLivraison.trim() || (typeLivraison === 'AIBD' ? 'Aéroport AIBD' : 'Livraison Dakar') } : {}),
        ...(isHorsDakarSelected ? { horsDakar: true } : {}),
      };

      const response = await apiClient.post<{ reservationId: string; paymentUrl?: string | null }>(
        '/reservations',
        payload
      );

      const { reservationId, paymentUrl } = response.data;

      // Invalidation croisée synchrone des caches Tenant & Owner
      queryClient.invalidateQueries({ queryKey: ['tenantBookings'] });
      queryClient.invalidateQueries({ queryKey: ['owner', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['owner', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['mobileTenantFeed'] });
      queryClient.invalidateQueries({ queryKey: ['exploreVehiclesFeed'] });

      setIsProcessing(false);
      onClose();

      if (paymentUrl) {
        try {
          await Linking.openURL(paymentUrl);
        } catch (linkErr) {
          console.warn('Impossible d\'ouvrir l\'URL de paiement:', linkErr);
        }
      }

      Alert.alert(
        'Réservation Initiée !',
        `Votre réservation ${reservationId} pour ${vehicle.marque} ${vehicle.modele} a été enregistrée. Veuillez valider la notification de paiement sur votre téléphone.`,
        [
          {
            text: 'Voir mes réservations',
            onPress: () => {
              if (onBookingSuccess) onBookingSuccess(reservationId);
            },
          },
        ]
      );
    } catch (err: any) {
      setIsProcessing(false);
      const serverMsg = err?.response?.data?.message;
      const displayMsg = Array.isArray(serverMsg)
        ? serverMsg.join(', ')
        : (serverMsg || err.message || 'Impossible de valider la réservation.');
      Alert.alert('Erreur de réservation', displayMsg);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.rootSafeArea}>
        {/* En-tête Dynamique avec indicateur d'étape */}
        <BookingCheckoutHeader
          step={step}
          title={step === 1 ? 'Récapitulatif de la réservation' : 'Modalités de paiement'}
          onBack={handleHeaderBack}
          onClose={onClose}
        />

        {/* Étape 1 : Récapitulatif, Dates, Options & Frais */}
        {step === 1 && (
          <BookingCheckoutStep1
            vehicle={vehicle}
            dateDebut={dateDebut}
            dateFin={dateFin}
            nbJours={nbJours}
            isDatesBlocked={isDatesBlocked}
            onDatesChange={handleDatesChange}
            typeLivraison={typeLivraison}
            onSelectTypeLivraison={setTypeLivraison}
            adresseLivraison={adresseLivraison}
            onAdresseLivraisonChange={setAdresseLivraison}
            isHorsDakarSelected={isHorsDakarSelected}
            onToggleHorsDakar={setIsHorsDakarSelected}
            selectedCurrency={selectedCurrency}
            onNext={() => setStep(2)}
          />
        )}

        {/* Étape 2 : Modalités 30%/100%, Provider Wave/OM/CB, Consentement & Paiement */}
        {step === 2 && (
          <BookingCheckoutStep2
            grandTotal={grandTotal}
            userPhone={user?.telephone || ''}
            selectedCurrency={selectedCurrency}
            onSubmitPayment={handleSubmitPayment}
            isProcessing={isProcessing}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rootSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fond blanc pur (#FFFFFF)
  },
});
