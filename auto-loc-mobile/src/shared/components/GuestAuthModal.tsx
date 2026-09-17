import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {
  Lock,
  LogIn,
  UserPlus,
  X,
  ShieldCheck,
  Calendar,
  User,
  Car,
  Heart,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import { theme } from '../../core/theme';
import { useAppStore, PendingIntentAction } from '../../core/store/useAppStore';
import { AutoButton } from './AutoButton';

const { width: screenWidth } = Dimensions.get('window');

interface GuestAuthModalProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export const GuestAuthModal: React.FC<GuestAuthModalProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
}) => {
  const visible = useAppStore((state) => state.guestAuthModalVisible);
  const reason = useAppStore((state) => state.guestAuthModalReason);
  const pendingIntent = useAppStore((state) => state.pendingIntent);
  const closeModal = useAppStore((state) => state.closeGuestAuthModal);

  if (!visible) {
    return null;
  }

  const action: PendingIntentAction = pendingIntent?.action || 'VIEW_PROFILE';

  // Contenu contextuel dynamique selon l'action de l'utilisateur
  const getContextDetails = () => {
    switch (action) {
      case 'VIEW_BOOKINGS':
        return {
          icon: Calendar,
          iconColor: '#4ADE80',
          badgeText: 'GESTION DE MES LOCATIONS',
          title: 'Accédez à vos Réservations',
          subtitle: 'Suivez le statut de vos contrats, acomptes réglés et la remise des clés.',
          highlights: [
            'Contrats et reçus de paiement Orange Money / Wave',
            'Notifications en temps réel sur l’état de votre véhicule',
          ],
        };
      case 'VIEW_PROFILE':
        return {
          icon: User,
          iconColor: '#4ADE80',
          badgeText: 'ESPACE CLIENT SÉCURISÉ',
          title: 'Mon Profil & Statut KYC',
          subtitle: 'Gérez vos pièces d’identité, votre permis de conduire et vos préférences.',
          highlights: [
            'Vérification d’identité KYC rapide en un instant',
            'Passage simplifié entre l’Espace Locataire et Hôte',
          ],
        };
      case 'BOOK_VEHICLE':
        return {
          icon: Car,
          iconColor: '#4ADE80',
          badgeText: 'RÉSERVATION INSTANTANÉE',
          title: 'Finalisez votre Réservation',
          subtitle: 'Connectez-vous pour verser l’acompte garanti et bloquer les dates.',
          highlights: [
            'Acompte sécurisé par Mobile Money (Orange Money, Wave)',
            'Garantie annulation et assistance 24/7 incluse',
          ],
        };
      case 'ADD_FAVORITE':
        return {
          icon: Heart,
          iconColor: '#F87171',
          badgeText: 'FAVORIS & SÉLECTION',
          title: 'Enregistrez ce Véhicule',
          subtitle: 'Retrouvez facilement ce véhicule et recevez des alertes de baisse de prix.',
          highlights: [
            'Liste de favoris synchronisée sur mobile et web',
            'Accès prioritaire lors des offres promotionnelles',
          ],
        };
      case 'ADD_VEHICLE':
        return {
          icon: Car,
          iconColor: '#4ADE80',
          badgeText: 'DEVENIR HÔTE AUTOLOC',
          title: 'Publiez votre Véhicule',
          subtitle: 'Connectez-vous pour ajouter votre véhicule et générer des revenus.',
          highlights: [
            'Rentabilisez votre véhicule en toute sécurité avec assurance incluse',
            'Gestion simple de vos disponibilités et réservations',
          ],
        };
      default:
        return {
          icon: Lock,
          iconColor: '#4ADE80',
          badgeText: 'AUTOLOC PREMIUM',
          title: 'Rejoignez AutoLoc',
          subtitle: reason || 'Connectez-vous ou créez un compte en 30 secondes.',
          highlights: [
            'Accès à l’ensemble des services et offres vérifiées',
            'Conservation de vos critères de recherche en cours',
          ],
        };
    }
  };

  const context = getContextDetails();
  const IconComponent = context.icon;

  const handleLogin = () => {
    closeModal();
    onNavigateToLogin();
  };

  const handleRegister = () => {
    closeModal();
    onNavigateToRegister();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={closeModal}
    >
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetWrapper}>
              {/* Card d'Arrière-Plan Décalée (Back Accent Glow Sheet) */}
              <View style={styles.backAccentSheet} />

              {/* Card Principale (Front Floating Pure White Sheet) */}
              <View style={styles.frontGlassSheet}>
                {/* Poignée de Glissement (Drag Handle) */}
                <View style={styles.handleBar} />

                {/* Bouton de Fermeture X Cercle */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                  activeOpacity={0.7}
                >
                  <X size={16} color="#041912" strokeWidth={2.5} />
                </TouchableOpacity>

                {/* En-tête : Icône Badge & Titres */}
                <View style={styles.headerGroup}>
                  <View style={styles.iconOuterRing}>
                    <View style={styles.iconInnerCircle}>
                      <IconComponent size={28} color={context.iconColor} />
                    </View>
                  </View>

                  <View style={styles.contextBadge}>
                    <ShieldCheck size={12} color="#059669" />
                    <Text style={styles.contextBadgeText}>{context.badgeText}</Text>
                  </View>

                  <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>{context.title}</Text>
                </View>

                {/* Cartouche d'Avantages Explicites */}
                <View style={styles.highlightsBox}>
                  {context.highlights.map((text, idx) => (
                    <View key={idx} style={styles.highlightRow}>
                      <View style={styles.checkIconBadge}>
                        <CheckCircle2 size={14} color="#059669" />
                      </View>
                      <Text style={styles.highlightText}>{text}</Text>
                    </View>
                  ))}
                </View>

                {/* Pile de Boutons d'Action Luxury */}
                <SafeAreaView style={styles.buttonStack}>
                  {/* Action Principale : Inscription */}
                  <TouchableOpacity
                    style={styles.primaryActionBtn}
                    onPress={handleRegister}
                    activeOpacity={0.85}
                  >
                    <View style={styles.btnContentRow}>
                      <UserPlus size={18} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>Créer un compte en 30 sec</Text>
                    </View>
                    <View style={styles.emeraldArrowCircle}>
                      <ArrowRight size={13} color="#4ADE80" />
                    </View>
                  </TouchableOpacity>

                  {/* Action Secondaire : Connexion */}
                  <TouchableOpacity
                    style={styles.secondaryOutlineBtn}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                  >
                    <LogIn size={18} color="#041912" />
                    <Text style={styles.secondaryBtnText}>J'ai déjà un compte (Se connecter)</Text>
                  </TouchableOpacity>

                  {/* Annulation / Continuer en invité */}
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeModal}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelText}>Continuer à explorer en mode invité</Text>
                  </TouchableOpacity>
                </SafeAreaView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 21, 15, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    position: 'relative',
    width: '100%',
  },
  backAccentSheet: {
    position: 'absolute',
    top: -6,
    left: 12,
    right: 12,
    bottom: -6,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.40)',
  },
  frontGlassSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerGroup: {
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  iconOuterRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#041912',
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.40)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  iconInnerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 6,
    marginBottom: 10,
  },
  contextBadgeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    letterSpacing: 0.8,
    color: '#059669',
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 21,
    lineHeight: 26,
    color: '#041912',
    textAlign: 'center',
    paddingHorizontal: 4,
    width: '100%',
  },
  highlightsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#1F2937',
  },
  buttonStack: {
    width: '100%',
    gap: 10,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#041912',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(4, 25, 18, 0.90)',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryBtnText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 14,
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
  },
  secondaryOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  secondaryBtnText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#041912',
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 2,
  },
  cancelText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
});
