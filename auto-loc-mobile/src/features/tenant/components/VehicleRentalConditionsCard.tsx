import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
} from 'react-native';
import {
  ShieldCheck,
  Fuel,
  Globe,
  FileText,
  Lock,
  CheckCircle2,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { CurrencyCode } from '../../../core/utils/currency';

interface VehicleRentalConditionsCardProps {
  assurance?: string | null;
  carburantCondition?: string | null;
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number | null;
  fraisLivraison?: number | null;
  zoneConduite?: string | null;
  reglesSpecifiques?: string | null;
  selectedCurrency?: CurrencyCode;
}

export const VehicleRentalConditionsCard: React.FC<VehicleRentalConditionsCardProps> = ({
  assurance,
  carburantCondition,
  zoneConduite,
  reglesSpecifiques,
}) => {
  const conditions = [
    {
      icon: ShieldCheck,
      title: 'Assurance & Protection',
      detail: assurance || 'Assurance Tiers & Assistance 24/7 incluses',
      badgeText: 'Inclus',
    },
    {
      icon: Fuel,
      title: 'Politique Carburant',
      detail: carburantCondition || 'Niveau identique au départ (Plein à plein)',
      badgeText: 'Plein à plein',
    },
  ];

  if (zoneConduite) {
    conditions.push({
      icon: Globe,
      title: 'Zone de Conduite',
      detail: zoneConduite,
      badgeText: 'Réglementé',
    });
  }

  if (reglesSpecifiques) {
    conditions.push({
      icon: FileText,
      title: 'Consignes de l’Hôte',
      detail: reglesSpecifiques,
      badgeText: 'Important',
    });
  }

  return (
    <View style={styles.container}>
      {/* En-tête de Section */}
      <View style={styles.headerRow}>
        <View style={styles.titleIconBadge}>
          <ShieldCheck size={14} color="#4ADE80" strokeWidth={2.25} />
        </View>
        <Text style={styles.sectionTitle}>Conditions & Garanties</Text>
      </View>

      {/* Grille des cartes de conditions (Identique à Options & Services) */}
      <View style={styles.cardsStack}>
        {conditions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <View key={idx} style={styles.conditionCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <Icon size={13} color="#4ADE80" strokeWidth={2.25} />
                </View>
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  {item.badgeText && (
                    <View style={styles.badgePill}>
                      <CheckCircle2 size={11} color="#059669" />
                      <Text style={styles.badgeText}>{item.badgeText}</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.optionDescription}>{item.detail}</Text>
            </View>
          );
        })}

        {/* Carte Garantie & Réservation Sécurisée (Fond Noir Obsidian) */}
        <View style={styles.secureDarkCard}>
          <View style={styles.cardHeader}>
            <View style={styles.secureIconCircle}>
              <Lock size={13} color="#4ADE80" strokeWidth={2.25} />
            </View>
            <View style={styles.cardHeaderContent}>
              <Text style={styles.secureTitle}>Réservation sécurisée</Text>
              <View style={styles.securePill}>
                <Text style={styles.securePillText}>30% d'acompte</Text>
              </View>
            </View>
          </View>
          <Text style={styles.secureDescription}>
            Via Mobile Money (Wave, Orange Money)
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  titleIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  sectionTitle: {
    fontSize: 17.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
    letterSpacing: -0.3,
    flex: 1,
  },
  cardsStack: {
    gap: 12,
  },
  conditionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4EBDB',
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  cardHeaderContent: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 15,
    color: '#041912',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#059669',
  },
  optionDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: '#5F6B59',
    lineHeight: 18,
    marginLeft: 42,
  },
  /* Carte Noire Obsidian Réservation Sécurisée */
  secureDarkCard: {
    backgroundColor: '#041912',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.30)',
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  secureIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  secureTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  securePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(74, 222, 128, 0.18)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.40)',
  },
  securePillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#4ADE80',
  },
  secureDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 18,
    marginLeft: 42,
  },
});