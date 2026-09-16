import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  SafeAreaView,
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
} from 'lucide-react-native';
import { theme } from '../../core/theme';
import { useAppStore, PendingIntentAction } from '../../core/store/useAppStore';
import { AutoButton } from './index';

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
          iconColor: '#10B981',
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
          iconColor: '#10B981',
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
          iconColor: '#10B981',
          badgeText: 'RÉSERVATION INSTANTANÉE',
          title: 'Finalisez votre Réservation',
          subtitle: 'Connectez-vous pour verser l’acompte garanti de 30% et bloquer les dates.',
          highlights: [
            'Acompte sécurisé par Mobile Money (Orange Money, Wave)',
            'Garantie annulation et assistance 24/7 incluse',
          ],
        };
      case 'ADD_FAVORITE':
        return {
          icon: Heart,
          iconColor: '#EF4444',
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
          iconColor: '#10B981',
          badgeText: 'DEVENIR HÔTE AUTOLOC',
          title: 'Publiez votre Véhicule',
          subtitle: 'Connectez-vous pour ajouter votre véhicule et générer des revenus de location.',
          highlights: [
            'Rentabilisez votre véhicule en toute sécurité avec assurance incluse',
            'Gestion simple de vos disponibilités et réservations',
          ],
        };
      default:
        return {
          icon: Lock,
          iconColor: '#10B981',
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
            <View style={styles.bottomSheet}>
              {/* Poignée de glissement */}
              <View style={styles.handleBar} />

              {/* Bouton de fermeture X */}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal} activeOpacity={0.7}>
                <X size={18} color={theme.colors.text.secondary} />
              </TouchableOpacity>

              {/* Badge supérieur & Icône contextuelle */}
              <View style={styles.headerGroup}>
                <View style={styles.iconCircle}>
                  <IconComponent size={28} color={context.iconColor} />
                </View>
                <View style={styles.contextBadge}>
                  <ShieldCheck size={12} color="#10B981" />
                  <Text style={styles.contextBadgeText}>{context.badgeText}</Text>
                </View>
              </View>

              {/* Titre & Sous-titre */}
              <Text style={styles.title}>{context.title}</Text>
              <Text style={styles.subtitle}>{context.subtitle}</Text>

              {/* Encadré d'avantages explicites */}
              <View style={styles.highlightsBox}>
                {context.highlights.map((text, idx) => (
                  <View key={idx} style={styles.highlightRow}>
                    <CheckCircle2 size={15} color="#10B981" />
                    <Text style={styles.highlightText}>{text}</Text>
                  </View>
                ))}
              </View>

              {/* Boutons d'Action */}
              <SafeAreaView style={styles.buttonStack}>
                <AutoButton
                  title="Créer un compte en 30 sec"
                  leftIcon={<UserPlus size={18} color="#FFFFFF" />}
                  onPress={handleRegister}
                  size="lg"
                  style={styles.primaryBtn}
                />

                <AutoButton
                  title="J'ai déjà un compte (Se connecter)"
                  variant="outline"
                  leftIcon={<LogIn size={18} color={theme.colors.brand.main} />}
                  onPress={handleLogin}
                  size="lg"
                />

                <TouchableOpacity style={styles.cancelButton} onPress={closeModal} activeOpacity={0.7}>
                  <Text style={styles.cancelText}>Continuer à explorer en mode invité</Text>
                </TouchableOpacity>
              </SafeAreaView>
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
    backgroundColor: 'rgba(5, 27, 20, 0.65)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[6],
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  handleBar: {
    width: 44,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: theme.spacing[3],
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing[4],
    right: theme.spacing[4],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGroup: {
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2F1D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    gap: 4,
  },
  contextBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#10B981',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize['2xl'],
    color: '#051B14',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.xs,
    marginBottom: theme.spacing[4],
    paddingHorizontal: theme.spacing[2],
  },
  highlightsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: theme.radius.xl,
    padding: theme.spacing[3],
    gap: theme.spacing[2],
    marginBottom: theme.spacing[5],
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: theme.colors.text.primary,
  },
  buttonStack: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: '#051B14',
  },
  cancelButton: {
    paddingVertical: theme.spacing[2],
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textDecorationLine: 'underline',
  },
});
