import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

export const BookingCancellationPolicyCard: React.FC = () => {
  return (
    <View style={styles.cardContainer}>
      {/* En-tête : Titre Display */}
      <View style={styles.headerRow}>
        <ShieldCheck size={18} color={theme.colors.brand.main} />
        <Text style={styles.sectionTitle}>Conditions d'annulation</Text>
      </View>

      {/* Liste des paliers d'annulation avec badges de pourcentage */}
      <View style={styles.policyList}>
        {/* Palier 1 : Avant confirmation */}
        <View style={styles.policyCardItem}>
          <View style={styles.policyTextGroup}>
            <Text style={styles.policyTitle}>Avant confirmation de l'hôte</Text>
            <Text style={styles.policySubtitle}>
              Remboursement intégral immédiat si la demande est annulée
            </Text>
          </View>
          <View style={[styles.percentagePill, styles.pillGreen]}>
            <Text style={[styles.percentagePillText, styles.pillTextGreen]}>100%</Text>
          </View>
        </View>

        {/* Palier 2 : Plus de 5 jours */}
        <View style={styles.policyCardItem}>
          <View style={styles.policyTextGroup}>
            <Text style={styles.policyTitle}>Plus de 5 jours avant</Text>
            <Text style={styles.policySubtitle}>
              100% du tarif de base de location remboursé
            </Text>
          </View>
          <View style={[styles.percentagePill, styles.pillGreen]}>
            <Text style={[styles.percentagePillText, styles.pillTextGreen]}>100%</Text>
          </View>
        </View>

        {/* Palier 3 : 3 à 5 jours */}
        <View style={styles.policyCardItem}>
          <View style={styles.policyTextGroup}>
            <Text style={styles.policyTitle}>De 3 à 5 jours avant</Text>
            <Text style={styles.policySubtitle}>
              75% du montant total remboursé
            </Text>
          </View>
          <View style={[styles.percentagePill, styles.pillYellow]}>
            <Text style={[styles.percentagePillText, styles.pillTextYellow]}>75%</Text>
          </View>
        </View>

        {/* Palier 4 : 24h à 72h */}
        <View style={styles.policyCardItem}>
          <View style={styles.policyTextGroup}>
            <Text style={styles.policyTitle}>De 24h à 72h avant (1 à 3j)</Text>
            <Text style={styles.policySubtitle}>
              50% du montant total remboursé
            </Text>
          </View>
          <View style={[styles.percentagePill, styles.pillOrange]}>
            <Text style={[styles.percentagePillText, styles.pillTextOrange]}>50%</Text>
          </View>
        </View>

        {/* Palier 5 : Moins de 24h */}
        <View style={styles.policyCardItem}>
          <View style={styles.policyTextGroup}>
            <Text style={styles.policyTitle}>Moins de 24h du départ</Text>
            <Text style={styles.policySubtitle}>
              Aucun remboursement pour annulation tardive
            </Text>
          </View>
          <View style={[styles.percentagePill, styles.pillRed]}>
            <Text style={[styles.percentagePillText, styles.pillTextRed]}>0%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: '#E4EBDB',
    padding: theme.spacing[4],
    gap: 14,
    ...theme.elevation.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: theme.primitives.forest[800],
  },
  policyList: {
    gap: 8,
  },
  policyCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FBF4',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    borderRadius: theme.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  policyTextGroup: {
    flex: 1,
    gap: 2,
  },
  policyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: theme.primitives.forest[800],
  },
  policySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10.5,
    color: '#5F6B59',
  },
  percentagePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 46,
  },
  pillGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  pillTextGreen: {
    color: '#166534',
  },
  pillYellow: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  pillTextYellow: {
    color: '#B45309',
  },
  pillOrange: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FED7AA',
  },
  pillTextOrange: {
    color: '#C2410C',
  },
  pillRed: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  pillTextRed: {
    color: '#B91C1C',
  },
  percentagePillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
});
