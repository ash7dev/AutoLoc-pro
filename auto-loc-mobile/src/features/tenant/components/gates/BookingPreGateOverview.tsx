import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { ShieldCheck, Clock, CheckCircle2, Circle, ArrowRight, UserCheck, PhoneCall, FileText, Award } from 'lucide-react-native';
import { GateStep } from '../../hooks/useBookingGate';
import { theme } from '../../../../core/theme';

interface BookingPreGateOverviewProps {
  vehicleTitle: string;
  missingSteps: GateStep[];
  onStart: () => void;
  onCancel: () => void;
}

const COLORS = {
  bg: '#FFFFFF',
  accent: '#16A34A',
  accentLight: '#F0FDF4',
  ink: '#041912',
  inkMuted: '#64748B',
  border: '#E2E8F0',
  surface: '#F8FAFC',
};

export const BookingPreGateOverview: React.FC<BookingPreGateOverviewProps> = ({
  vehicleTitle,
  missingSteps,
  onStart,
  onCancel,
}) => {
  // Filtrer la porte PREGATE de la liste des étapes restantes
  const actualSteps = missingSteps.filter((step) => step !== 'PREGATE');

  const getStepInfo = (step: GateStep) => {
    switch (step) {
      case 'PROFILE':
        return {
          title: 'Informations personnelles',
          subtitle: 'Prénom, nom et date de naissance',
          icon: UserCheck,
        };
      case 'PHONE':
        return {
          title: 'Vérification téléphone',
          subtitle: 'Confirmation par code SMS OTP',
          icon: PhoneCall,
        };
      case 'KYC':
        return {
          title: 'Pièce d\'identité & Selfie',
          subtitle: 'CNI/Passeport recto-verso + contrôle biométrique',
          icon: ShieldCheck,
        };
      case 'PERMIS':
        return {
          title: 'Permis de conduire',
          subtitle: 'Photo lisible de votre permis',
          icon: Award,
        };
      default:
        return {
          title: 'Vérification requise',
          subtitle: 'Validation nécessaire',
          icon: FileText,
        };
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Icône & Titre d'Annonce */}
        <View style={styles.headerBadgeContainer}>
          <View style={styles.shieldIconWrapper}>
            <ShieldCheck size={36} color={COLORS.accent} strokeWidth={2.2} />
          </View>
          <Text style={styles.mainTitle}>Dernière étape avant réservation</Text>
          <Text style={styles.subTitle}>
            Pour votre sécurité et celle du propriétaire, veuillez compléter votre profil pour réserver <Text style={{ fontWeight: '700', color: COLORS.ink }}>{vehicleTitle}</Text>.
          </Text>
        </View>

        {/* Temps estimé */}
        <View style={styles.timeEstimateCard}>
          <Clock size={18} color={COLORS.accent} style={{ marginRight: 8 }} />
          <Text style={styles.timeEstimateText}>
            Durée estimée : <Text style={{ fontWeight: '700', color: COLORS.accent }}>~2 minutes</Text> • Une seule fois pour toutes vos réservations
          </Text>
        </View>

        {/* Checklist des Étapes */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Checklist de vérification :</Text>

          {actualSteps.map((step, index) => {
            const info = getStepInfo(step);
            const Icon = info.icon;
            return (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepIconBubble}>
                  <Icon size={20} color={COLORS.accent} />
                </View>
                <View style={styles.stepTextContent}>
                  <Text style={styles.stepItemTitle}>{index + 1}. {info.title}</Text>
                  <Text style={styles.stepItemSubtitle}>{info.subtitle}</Text>
                </View>
                <Circle size={18} color="#CBD5E1" strokeWidth={2} />
              </View>
            );
          })}
        </View>

        {/* Informations de confidentialité */}
        <View style={styles.trustBadge}>
          <ShieldCheck size={16} color={COLORS.inkMuted} />
          <Text style={styles.trustText}>
            Vos données sont cryptées et protégées conformément aux normes RGPD & AutoLoc.
          </Text>
        </View>
      </ScrollView>

      {/* Barre d'Action Inférieure */}
      <View style={styles.footerBar}>
        <Pressable style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>Commencer la vérification</Text>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>

        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Annuler pour le moment</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerBadgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shieldIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 22,
    color: theme.primitives.forest[800],
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subTitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    color: COLORS.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  timeEstimateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 20,
  },
  timeEstimateText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: COLORS.ink,
    flex: 1,
    lineHeight: 18,
  },
  stepsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  stepsTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepTextContent: {
    flex: 1,
    marginRight: 8,
  },
  stepItemTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: 2,
  },
  stepItemSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  trustText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: COLORS.inkMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  footerBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    gap: 10,
  },
  startButton: {
    backgroundColor: COLORS.accent,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    fontSize: 16,
  },
  cancelButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    color: COLORS.inkMuted,
    fontSize: 14,
  },
});
