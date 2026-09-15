import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, X } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

interface BookingCheckoutHeaderProps {
  step: 1 | 2;
  title: string;
  onBack: () => void;
  onClose: () => void;
}

export const BookingCheckoutHeader: React.FC<BookingCheckoutHeaderProps> = ({
  step,
  title,
  onBack,
  onClose,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityLabel="Retour"
      >
        <ArrowLeft size={20} color={theme.primitives.forest[800]} />
      </TouchableOpacity>

      <View style={styles.centerContent}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Étape {step} sur 2</Text>
        </View>
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onClose}
        activeOpacity={0.7}
        accessibilityLabel="Fermer"
      >
        <X size={20} color={theme.primitives.forest[800]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4EBDB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    backgroundColor: '#F1F6EA',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing[2],
  },
  stepBadge: {
    backgroundColor: theme.colors.brand.subtle,
    borderWidth: 1,
    borderColor: theme.colors.brand.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    marginBottom: 2,
  },
  stepBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: theme.colors.brand.main,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  titleText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 17,
    color: theme.primitives.forest[800],
    letterSpacing: -0.2,
  },
});
