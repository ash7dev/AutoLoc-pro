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

  // Étape 1 : 0-30%, Étape 2 : 31-75%, Étape 3 : 76-100%
  const step1Done = currentPercent >= 35;
  const step2Done = currentPercent >= 75;
  const step3Done = currentPercent >= 100;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.glassCard}>
          {/* Top Security Pill */}
          <View style={styles.securityPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.securityPillText}>TRAITEMENT SÉCURISÉ AUTOLOC</Text>
          </View>

          {/* Central Hero Icon Circle */}
          <View style={[styles.iconCircle, isSuccess && styles.iconCircleSuccess]}>
            {isSuccess ? (
              <CheckCircle2 size={42} color="#059669" strokeWidth={2.2} />
            ) : (
              <CloudUpload size={36} color="#059669" strokeWidth={2} />
            )}
          </View>

          {/* Title & Large Percentage */}
          <Text style={styles.modalTitle}>
            {isSuccess ? '🎉 Annonce Publiée !' : 'Publication de votre annonce'}
          </Text>

          <View style={styles.percentageRow}>
            <Text style={styles.percentageNumber}>{currentPercent}</Text>
            <Text style={styles.percentageSymbol}>%</Text>
          </View>

          {/* Premium High-Gloss Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${currentPercent}%` },
              ]}
            />
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
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
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
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  step1Done && <View style={styles.checkDotActive} />
                )}
              </View>
              <Text style={[styles.checkLabel, step2Done && styles.checkLabelDone]}>
                Photos HD & Papiers administratifs
              </Text>
            </View>

            {/* Step 3 */}
            <View style={styles.checkItem}>
              <View style={[styles.checkCircle, step3Done && styles.checkCircleDone]}>
                {step3Done ? (
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
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
              <Sparkles size={18} color="#FFFFFF" />
              <Text style={styles.finishBtnText}>Accéder à mon annonce</Text>
              <ArrowRight size={18} color="#FFFFFF" />
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
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
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
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  securityPillText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
    letterSpacing: 0.6,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#D1FAE5',
  },
  iconCircleSuccess: {
    backgroundColor: '#D1FAE5',
    borderColor: '#6EE7B7',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    marginBottom: 12,
  },
  percentageNumber: {
    fontSize: 44,
    fontFamily: 'Inter_700Bold',
    color: '#059669',
    letterSpacing: -1.5,
  },
  percentageSymbol: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#059669',
    marginLeft: 2,
  },
  progressTrack: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 6,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#475569',
    textAlign: 'center',
  },
  checklistCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
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
    fontFamily: 'Inter_500Medium',
    color: '#94A3B8',
    flex: 1,
  },
  checkLabelDone: {
    fontFamily: 'Inter_600SemiBold',
    color: '#0F172A',
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#051B14',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 24,
    width: '100%',
    marginTop: 12,
    shadowColor: '#051B14',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  finishBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
});
