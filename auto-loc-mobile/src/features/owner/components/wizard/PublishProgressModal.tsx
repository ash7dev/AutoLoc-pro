import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Rocket,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CloudUpload,
  Check,
  ArrowRight,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';

interface PublishProgressModalProps {
  visible: boolean;
  progress: number; // 0 to 100
  statusText: string;
  isSuccess: boolean;
  onFinish: () => void;
}

export const PublishProgressModal: React.FC<PublishProgressModalProps> = ({
  visible,
  progress,
  statusText,
  isSuccess,
  onFinish,
}) => {
  if (!visible) return null;

  const currentPercent = Math.min(Math.max(progress, 0), 100);

  // Étape 1 : 0-35%, Étape 2 : 36-75%, Étape 3 : 76-100%
  const step1Done = currentPercent >= 35;
  const step2Done = currentPercent >= 75;
  const step3Done = currentPercent >= 100;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.glassCard}>
          {/* Security Badge Pill */}
          <View style={styles.securityPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.securityPillText}>TRAITEMENT SÉCURISÉ AUTOLOC</Text>
          </View>

          {/* Central Hero Icon Badge */}
          <View style={[styles.iconBadge, isSuccess && styles.iconBadgeSuccess]}>
            {isSuccess ? (
              <CheckCircle2 size={36} color="#4ADE80" strokeWidth={2.2} />
            ) : (
              <CloudUpload size={32} color="#4ADE80" strokeWidth={2.2} />
            )}
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>
            {isSuccess ? 'Annonce Publiée !' : 'Publication de votre annonce'}
          </Text>

          {/* Large Percentage */}
          <View style={styles.percentageRow}>
            <Text style={styles.percentageNumber}>{currentPercent}</Text>
            <Text style={styles.percentageSymbol}>%</Text>
          </View>

          {/* High-Gloss Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${currentPercent}%` }]} />
          </View>

          {/* Current Status Message */}
          <View style={styles.statusBox}>
            {!isSuccess && <ActivityIndicator size="small" color="#059669" style={{ marginRight: 8 }} />}
            <Text style={styles.statusText}>{statusText}</Text>
          </View>

          {/* Live Step Progression Checklist */}
          <View style={styles.checklistCard}>
            {/* Step 1 */}
            <View style={styles.checkItem}>
              <View style={[styles.checkCircle, step1Done && styles.checkCircleDone]}>
                {step1Done ? (
                  <Check size={11} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  <View style={styles.checkDotActive} />
                )}
              </View>
              <Text style={[styles.checkLabel, step1Done && styles.checkLabelDone]}>
                Conformité & Données du véhicule
              </Text>
            </View>

            {/* Step 2 */}
            <View style={styles.checkItem}>
              <View style={[styles.checkCircle, step2Done && styles.checkCircleDone]}>
                {step2Done ? (
                  <Check size={11} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  step1Done && <View style={styles.checkDotActive} />
                )}
              </View>
              <Text style={[styles.checkLabel, step2Done && styles.checkLabelDone]}>
                Photos HD & Documents administratifs
              </Text>
            </View>

            {/* Step 3 */}
            <View style={styles.checkItem}>
              <View style={[styles.checkCircle, step3Done && styles.checkCircleDone]}>
                {step3Done ? (
                  <Check size={11} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  step2Done && <View style={styles.checkDotActive} />
                )}
              </View>
              <Text style={[styles.checkLabel, step3Done && styles.checkLabelDone]}>
                Finalisation & Mise en ligne publique
              </Text>
            </View>
          </View>

          {/* Premium CTA Button on Success */}
          {isSuccess && (
            <TouchableOpacity
              style={styles.finishBtn}
              onPress={onFinish}
              activeOpacity={0.85}
            >
              <Sparkles size={16} color="#4ADE80" />
              <Text style={styles.finishBtnText}>Accéder à mon annonce</Text>
              <View style={styles.emeraldArrowCircle}>
                <ArrowRight size={13} color="#4ADE80" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 25, 18, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glassCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 16,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  securityPillText: {
    fontSize: 9.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#047857',
    letterSpacing: 0.6,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#041912',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  iconBadgeSuccess: {
    borderColor: '#4ADE80',
  },
  modalTitle: {
    fontSize: 19,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
    marginBottom: 12,
  },
  percentageNumber: {
    fontSize: 42,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#059669',
    letterSpacing: -1,
  },
  percentageSymbol: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#059669',
    marginLeft: 2,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F0FDF4',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 5,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  statusText: {
    fontSize: 12.5,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748B',
    textAlign: 'center',
  },
  checklistCard: {
    width: '100%',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: '#059669',
  },
  checkDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  checkLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#94A3B8',
    flex: 1,
  },
  checkLabelDone: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#041912',
    borderRadius: 24,
    height: 50,
    paddingHorizontal: 20,
    width: '100%',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(4, 25, 18, 0.9)',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  finishBtnText: {
    fontSize: 14.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#FFFFFF',
  },
  emeraldArrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

