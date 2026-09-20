import React from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileCheck,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';

interface BookingLifecycleRulesModalProps {
  visible: boolean;
  modePaiement?: string;
  onClose: () => void;
}

export const BookingLifecycleRulesModal: React.FC<BookingLifecycleRulesModalProps> = ({
  visible,
  modePaiement,
  onClose,
}) => {
  const isDeposit = modePaiement === 'ACOMPTE_SOLDE_CHECKIN';

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={styles.sheetHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}>
                <BookOpen size={22} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.badgeGreenGlass}>
                  <ShieldCheck size={11} color="#059669" />
                  <Text style={styles.badgeGreenText}>GUIDE & GARANTIES AUTOLOC</Text>
                </View>
                <Text style={styles.title}>Règles de votre location</Text>
                <Text style={styles.subtitle}>Processus de prise en charge & sécurité</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <RuleItem
              number="1"
              title="Réservation & Coordonnées"
              text="Les coordonnées de l’hôte sont déverrouillées 24h avant la prise en charge et restent accessibles tout au long de votre location."
            />

            <RuleItem
              number="2"
              title="État des lieux au départ (Check-in)"
              text="L’hôte prend au moins 4 photos sous différents angles. Vous inspectez le véhicule avant de confirmer la remise des clés."
            />

            <RuleItem
              number="3"
              title="Principe de Double Validation"
              text="La location passe officiellement en cours uniquement après les validations successives de l’hôte et de vous-même. En cas d’anomalie, refusez la prise en charge."
            />

            <RuleItem
              number="4"
              title={isDeposit ? 'Acompte en ligne & Solde en main propre' : 'Règlement 100% sécurisé'}
              text={
                isDeposit
                  ? 'L’acompte est réglé en ligne via Wave/Orange Money. Le solde restant est remis à l’hôte lors de la remise des clés.'
                  : 'L’intégralité de votre paiement est séquestrée et protégée par AutoLoc jusqu’à la confirmation du départ.'
              }
            />

            {/* Notice card */}
            <View style={styles.noticeCard}>
              <ShieldCheck size={18} color="#059669" />
              <Text style={styles.noticeText}>
                Les règles d’annulation et d’assurance sont calculées automatiquement en temps réel par le serveur AutoLoc lors de vos démarches.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Action Bar */}
          <SafeAreaView style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.submitBtn} activeOpacity={0.85}>
              <CheckCircle2 size={18} color="#FFFFFF" />
              <Text style={styles.submitText}>J’ai compris les règles</Text>
              <View style={styles.emeraldArrowCircle}>
                <ChevronRight size={14} color="#A7F3D0" />
              </View>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const RuleItem = ({ number, title, text }: { number: string; title: string; text: string }) => (
  <View style={styles.ruleCard}>
    <View style={styles.ruleNumberCircle}>
      <Text style={styles.ruleNumberText}>{number}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.ruleTitle}>{title}</Text>
      <Text style={styles.ruleText}>{text}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 25, 18, 0.72)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGreenGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    gap: 4,
    marginBottom: 4,
  },
  badgeGreenText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 8.5,
    letterSpacing: 0.6,
    color: '#059669',
  },
  title: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 17,
    color: '#072A20',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 18,
    gap: 14,
  },

  ruleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ruleNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  ruleNumberText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#059669',
  },
  ruleTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
    color: '#072A20',
  },
  ruleText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16.5,
  },

  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 12,
  },
  noticeText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#047857',
    lineHeight: 16,
  },

  footer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 20,
  },
  submitBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  emeraldArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(5, 150, 105, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
