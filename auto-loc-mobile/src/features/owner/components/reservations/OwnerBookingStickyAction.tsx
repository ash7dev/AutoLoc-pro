import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, ChevronRight, Key, LogOut, Sparkles } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

export interface OwnerBookingStickyActionProps {
  statut: string;
  hasOwnerCheckin: boolean;
  submitting: boolean;
  onOpenConfirm: () => void;
  onOpenCheckin: () => void;
  onOpenCheckout: () => void;
}

export const OwnerBookingStickyAction: React.FC<OwnerBookingStickyActionProps> = ({
  statut,
  hasOwnerCheckin,
  submitting,
  onOpenConfirm,
  onOpenCheckin,
  onOpenCheckout,
}) => {
  const insets = useSafeAreaInsets();
  const upperStatut = (statut ?? '').toUpperCase();
  const isPayee = upperStatut === 'PAYEE';
  const isConfirmee = upperStatut === 'CONFIRMEE' && !hasOwnerCheckin;
  const isEnCours = upperStatut === 'EN_COURS';

  const isVisible = isPayee || isConfirmee || isEnCours;

  if (!isVisible) return null;

  const renderActionContent = () => {
    if (isPayee) {
      return {
        hint: '⚡ Acompte réglé en ligne · Validation requise',
        label: submitting ? 'Confirmation en cours…' : 'Confirmer la réservation',
        icon: <CheckCircle2 size={18} color="#FFFFFF" />,
        onPress: onOpenConfirm,
      };
    }

    if (isConfirmee) {
      return {
        hint: '🔑 Prise en charge · Effectuez le check-in au départ',
        label: submitting ? 'Check-in en cours…' : 'Remise des clés (Check-in)',
        icon: <Key size={18} color="#FFFFFF" />,
        onPress: onOpenCheckin,
      };
    }

    if (isEnCours) {
      return {
        hint: '🚗 Location active · Restitution & clôture du dossier',
        label: submitting ? 'Check-out en cours…' : 'Restitution du véhicule (Check-out)',
        icon: <LogOut size={18} color="#FFFFFF" />,
        onPress: onOpenCheckout,
      };
    }

    return null;
  };

  const action = renderActionContent();
  if (!action) return null;

  return (
    <View
      style={[
        styles.stickyContainer,
        { paddingBottom: Math.max(insets.bottom, 14) },
      ]}
    >
      {/* Contextual top hint badge in dark glass */}
      <View style={styles.hintBadge}>
        <Sparkles size={12} color="#34D399" />
        <Text style={styles.hintText} numberOfLines={1}>
          {action.hint}
        </Text>
      </View>

      {/* Main Sticky Action Button: Pure Dark Background + Crisp White Text */}
      <TouchableOpacity
        disabled={submitting}
        onPress={action.onPress}
        activeOpacity={0.88}
        style={[styles.button, submitting && styles.disabledButton]}
      >
        <View style={styles.iconCircle}>
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            action.icon
          )}
        </View>

        <Text style={styles.buttonText} numberOfLines={1}>
          {action.label}
        </Text>

        {!submitting && (
          <View style={styles.arrowCircle}>
            <ChevronRight size={14} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  stickyContainer: {
    backgroundColor: '#04150F', // Dark Forest Background étendu jusqu'en bas
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.22)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  hintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
  },
  hintText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#A7F3D0',
    letterSpacing: 0.1,
  },
  button: {
    minHeight: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#041912', // Pure Dark Background
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 10,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.65,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.40)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF', // Écriture blanc pur
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    letterSpacing: 0.2,
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});



