import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ShieldCheck, Clock, Circle, ArrowRight, UserCheck, PhoneCall, FileText, Award } from 'lucide-react-native';
import { GateStep } from '../../hooks/useBookingGate';
import { theme } from '../../../../core/theme';

interface BookingPreGateOverviewProps {
  vehicleTitle: string;
  missingSteps: GateStep[];
  onStart: () => void;
  onCancel: () => void;
  customTitle?: string;
  customSubtitle?: string;
}

export const BookingPreGateOverview: React.FC<BookingPreGateOverviewProps> = ({
  vehicleTitle,
  missingSteps,
  onStart,
  onCancel,
  customTitle,
  customSubtitle,
}) => {
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
          subtitle: 'Confirmation par SMS / WhatsApp',
          icon: PhoneCall,
        };
      case 'KYC':
        return {
          title: 'Pièce d\'identité & Selfie',
          subtitle: 'CNI / Passeport + contrôle biométrique',
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
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cardStackWrapper}>
        {/* Layer 1 : Carte d'arrière-plan en décalé */}
        <View style={styles.backAccentCard} />

        {/* Layer 2 : Carte Principale Flottante Blanc Pur */}
        <View style={styles.frontGlassCard}>
          {/* Header Icon & Badges */}
          <View style={styles.cardHeaderBox}>
            <View style={styles.shieldIconWrapper}>
              <ShieldCheck size={32} color="#059669" strokeWidth={2.2} />
            </View>

            <View style={styles.badgeKycGlass}>
              <ShieldCheck size={12} color="#059669" />
              <Text style={styles.badgeKycText}>PRÉ-REQUIS DE RÉSERVATION</Text>
            </View>

            <Text style={styles.mainTitle}>
              {customTitle || 'Dernière étape avant réservation'}
            </Text>
            <Text style={styles.subTitle}>
              {customSubtitle || (
                <>
                  Pour votre sécurité et celle du propriétaire, complétez votre profil pour réserver{' '}
                  <Text style={styles.vehicleHighlight}>{vehicleTitle}</Text>.
                </>
              )}
            </Text>
          </View>

          {/* Carte Estimatif Temps */}
          <View style={styles.timeEstimateCard}>
            <Clock size={16} color="#059669" />
            <Text style={styles.timeEstimateText}>
              Temps estimé : <Text style={styles.timeBold}>~2 minutes</Text> • Valide à vie
            </Text>
          </View>

          {/* Checklist des Étapes Restantes */}
          <View style={styles.stepsCard}>
            <Text style={styles.stepsSectionTitle}>Vérifications à effectuer :</Text>

            {actualSteps.map((step, index) => {
              const info = getStepInfo(step);
              const Icon = info.icon;
              return (
                <View key={step} style={styles.stepRow}>
                  <View style={styles.stepIconBubble}>
                    <Icon size={18} color="#059669" />
                  </View>
                  <View style={styles.stepTextContent}>
                    <Text style={styles.stepItemTitle}>
                      {index + 1}. {info.title}
                    </Text>
                    <Text style={styles.stepItemSubtitle}>{info.subtitle}</Text>
                  </View>
                  <Circle size={16} color="#CBD5E1" strokeWidth={2} />
                </View>
              );
            })}
          </View>

          {/* Note de protection des données */}
          <View style={styles.trustBadge}>
            <ShieldCheck size={14} color="#64748B" />
            <Text style={styles.trustText}>
              Données chiffrées & vérifiées sous la charte de confidentialité AutoLoc.
            </Text>
          </View>

          {/* Boutons d'Action */}
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={onStart}
              activeOpacity={0.85}
            >
              <Text style={styles.startButtonText}>Commencer la vérification</Text>
              <View style={styles.emeraldArrowCircle}>
                <ArrowRight size={13} color="#4ADE80" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Annuler pour le moment</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.35)',
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
  },
  cardHeaderBox: {
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  shieldIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
  },
  badgeKycGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 6,
    marginBottom: theme.spacing[2],
  },
  badgeKycText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    letterSpacing: 0.8,
    color: '#059669',
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 22,
    lineHeight: 28,
    color: '#041912',
    textAlign: 'center',
  },
  subTitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 4,
  },
  vehicleHighlight: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#041912',
  },
  timeEstimateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 8,
    marginBottom: theme.spacing[3],
  },
  timeEstimateText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#041912',
    flex: 1,
  },
  timeBold: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#059669',
  },
  stepsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: theme.spacing[3],
  },
  stepsSectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#041912',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIconBubble: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepTextContent: {
    flex: 1,
    marginRight: 8,
  },
  stepItemTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#041912',
  },
  stepItemSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: theme.spacing[4],
  },
  trustText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  actionGroup: {
    gap: 10,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(4, 25, 18, 0.90)',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  startButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  emeraldArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cancelButton: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#64748B',
  },
});

