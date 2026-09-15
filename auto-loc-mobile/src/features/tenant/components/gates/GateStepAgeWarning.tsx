import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import { AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

interface GateStepAgeWarningProps {
  vehicleMinimumAge?: number;
  userAge?: number | null;
  onClose: () => void;
}

const COLORS = {
  bg: '#FFFFFF',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  ink: '#041912',
  inkMuted: '#64748B',
  border: '#E2E8F0',
};

export const GateStepAgeWarning: React.FC<GateStepAgeWarningProps> = ({
  vehicleMinimumAge = 21,
  userAge,
  onClose,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <AlertTriangle size={36} color={COLORS.danger} />
        </View>

        <Text style={styles.title}>Âge minimum non atteint</Text>
        <Text style={styles.subtitle}>
          Ce véhicule exige un âge minimum de <Text style={styles.bold}>{vehicleMinimumAge} ans</Text> selon les conditions définies par l'hôte et l'assurance AutoLoc.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Votre âge enregistré : <Text style={styles.bold}>{userAge !== null ? `${userAge} ans` : 'Non renseigné'}</Text>
          </Text>
        </View>

        <Text style={styles.suggestionText}>
          Nous vous invitons à parcourir les véhicules de notre catalogue accessibles sans restriction d'âge.
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <ArrowLeft size={18} color="#FFFFFF" />
          <Text style={styles.closeButtonText}>Explorer d'autres véhicules</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'space-between',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 22,
    color: theme.primitives.forest[800],
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    color: COLORS.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  bold: {
    fontFamily: theme.typography.fontFamily.bold,
    color: COLORS.ink,
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13.5,
    color: COLORS.inkMuted,
  },
  suggestionText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: COLORS.inkMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  closeButton: {
    backgroundColor: '#16A34A',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  closeButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    fontSize: 15,
  },
});

