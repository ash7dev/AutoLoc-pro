import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ShieldCheck,
  Fuel,
  Navigation,
  MapPin,
  FileText,
  Lock,
} from 'lucide-react-native';
import { CurrencyCode, formatConvertedPrice } from '../../../core/utils/currency';

interface VehicleRentalConditionsCardProps {
  assurance?: string | null;
  carburantCondition?: string | null;
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number | null;
  fraisLivraison?: number | null;
  selectedCurrency: CurrencyCode;
}

const COLORS = {
  accent: '#16A34A',
  accentDeep: '#0F7A38',
  tint: '#ECFDF5',
  tintBorder: '#A7F3D0',
  ink: '#041912',
  inkTitle: '#22271F',
  inkDetail: '#5F6B59',
  rowDivider: '#F1F6EA',
  cardBorder: '#E4EBDB',
  secureBg: '#F4FBF6',
  secureBorder: '#D3EFDD',
};

export const VehicleRentalConditionsCard: React.FC<VehicleRentalConditionsCardProps> = ({
  assurance,
  carburantCondition,
  autoriseHorsDakar,
  supplementHorsDakarParJour,
  fraisLivraison,
  selectedCurrency,
}) => {
  const supplementVal = supplementHorsDakarParJour ? Number(supplementHorsDakarParJour) : 0;
  const formattedSupplement = supplementVal > 0
    ? formatConvertedPrice(supplementVal, selectedCurrency)
    : null;

  const livraisonVal = fraisLivraison != null ? Number(fraisLivraison) : null;
  const formattedLivraison = livraisonVal != null && livraisonVal > 0
    ? formatConvertedPrice(livraisonVal, selectedCurrency)
    : null;

  const conditions = [
    {
      icon: ShieldCheck,
      title: 'Assurance & Protection',
      detail: assurance || 'Assurance Tiers & Assistance incluses',
    },
    {
      icon: Fuel,
      title: 'Politique Carburant',
      detail: carburantCondition || 'Niveau identique au départ',
    },
    {
      icon: Navigation,
      title: 'Voyage Hors Dakar',
      detail: autoriseHorsDakar
        ? formattedSupplement
          ? `Autorisé (+${formattedSupplement} / jour)`
          : 'Autorisé sans supplément'
        : 'Uniquement dans la région de Dakar',
    },
    {
      icon: MapPin,
      title: 'Livraison du véhicule',
      detail:
        livraisonVal === 0
          ? 'Livraison gratuite sur demande'
          : formattedLivraison
            ? `Disponible sur demande (${formattedLivraison})`
            : 'À récupérer sur place au point de rendez-vous',
    },
  ];

  return (
    <View style={styles.container}>
      {/* En-tête de Section */}
      <View style={styles.headerRow}>
        <LinearGradient
          colors={[COLORS.accent, COLORS.accentDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.titleIconBadge}
        >
          <FileText size={14} color="#FFFFFF" strokeWidth={2.25} />
        </LinearGradient>
        <Text style={styles.sectionTitle}>Conditions & Garanties</Text>
      </View>

      <View style={styles.cardBox}>
        {conditions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <View
              key={idx}
              style={[
                styles.conditionRow,
                idx === conditions.length - 1 && styles.lastRegularRow,
              ]}
            >
              <View style={styles.iconCircle}>
                <Icon size={15} color={COLORS.accentDeep} strokeWidth={2.25} />
              </View>
              <View style={styles.conditionTextContainer}>
                <Text style={styles.conditionTitle}>{item.title}</Text>
                <Text style={styles.conditionDetail}>{item.detail}</Text>
              </View>
            </View>
          );
        })}

        {/* Ligne mise en avant : Réservation sécurisée */}
        <View style={styles.secureRow}>
          <View style={styles.secureIconCircle}>
            <Lock size={15} color={COLORS.accentDeep} strokeWidth={2.5} />
          </View>
          <View style={styles.conditionTextContainer}>
            <View style={styles.secureTitleRow}>
              <Text style={styles.conditionTitle}>Réservation sécurisée</Text>
              <View style={styles.securePill}>
                <Text style={styles.securePillText}>30% d'acompte</Text>
              </View>
            </View>
            <Text style={styles.conditionDetail}>
              Via Mobile Money (Wave, Orange Money) ou Carte bancaire
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 22,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  titleIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accentDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.ink,
    letterSpacing: -0.3,
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#0F1F14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rowDivider,
  },
  lastRegularRow: {
    borderBottomWidth: 0,
    paddingBottom: 14,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.tint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.tintBorder,
    marginTop: 2,
  },
  conditionTextContainer: {
    flex: 1,
  },
  conditionTitle: {
    color: COLORS.inkTitle,
    fontSize: 13,
    fontWeight: '700',
  },
  conditionDetail: {
    color: COLORS.inkDetail,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginHorizontal: -16,
    marginBottom: -8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.secureBg,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.secureBorder,
  },
  secureIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.tintBorder,
    marginTop: 2,
  },
  secureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  securePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.tintBorder,
  },
  securePillText: {
    color: COLORS.accentDeep,
    fontSize: 10,
    fontWeight: '700',
  },
});