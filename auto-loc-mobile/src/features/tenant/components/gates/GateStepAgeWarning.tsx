import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AlertTriangle, ArrowLeft, ShieldAlert } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

interface GateStepAgeWarningProps {
  vehicleMinimumAge?: number;
  userAge?: number | null;
  onClose: () => void;
}

export const GateStepAgeWarning: React.FC<GateStepAgeWarningProps> = ({
  vehicleMinimumAge = 21,
  userAge,
  onClose,
}) => {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cardStackWrapper}>
        <View style={styles.backAccentCard} />

        <View style={styles.frontGlassCard}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconCircle}>
              <AlertTriangle size={30} color="#EF4444" />
            </View>

            <View style={styles.badgeWarningGlass}>
              <ShieldAlert size={12} color="#DC2626" />
              <Text style={styles.badgeWarningText}>RESTRICTION D'ÂGE</Text>
            </View>

            <Text style={styles.mainTitle}>Âge minimum non atteint</Text>
            <Text style={styles.subtitle}>
              Ce véhicule exige un âge minimum de <Text style={styles.bold}>{vehicleMinimumAge} ans</Text> selon les conditions d'assurance AutoLoc.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Votre âge enregistré : <Text style={styles.bold}>{userAge !== null ? `${userAge} ans` : 'Non renseigné'}</Text>
            </Text>
          </View>

          <Text style={styles.suggestionText}>
            Nous vous invitons à parcourir les autres véhicules de notre catalogue accessibles sans cette restriction d'âge.
          </Text>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <ArrowLeft size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.closeButtonText}>Explorer d'autres véhicules</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
    flexGrow: 1,
    justifyContent: 'center',
  },
  cardStackWrapper: {
    position: 'relative',
    marginVertical: theme.spacing[2],
  },
  backAccentCard: {
    position: 'absolute',
    top: -6,
    left: 8,
    right: 8,
    bottom: -6,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.30)',
  },
  frontGlassCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.80)',
    borderRadius: 28,
    padding: theme.spacing[5],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
    alignItems: 'center',
  },
  cardHeaderBox: {
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
  },
  badgeWarningGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 6,
    marginBottom: theme.spacing[2],
  },
  badgeWarningText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    letterSpacing: 0.8,
    color: '#DC2626',
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 22,
    lineHeight: 28,
    color: '#041912',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 19,
  },
  bold: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#041912',
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  infoText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#64748B',
  },
  suggestionText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: theme.spacing[4],
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: '100%',
    borderRadius: 25,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(4, 25, 18, 0.90)',
    gap: 8,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  closeButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
});


