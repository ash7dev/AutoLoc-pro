import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatutKyc, StatutReservation } from '@autoloc/shared';
import { theme } from '../../core/theme';

export interface AutoBadgeProps {
  label?: string;
  status?: StatutKyc | StatutReservation | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export const AutoBadge: React.FC<AutoBadgeProps> = ({
  label,
  status = 'info',
  size = 'md',
}) => {
  let badgeLabel = label || status;
  let bg = theme.colors.status.infoBg;
  let color = theme.colors.status.info;

  if (status === StatutKyc.VERIFIE || status === StatutReservation.CONFIRMEE || status === StatutReservation.PAYEE || status === 'success') {
    bg = theme.colors.status.successBg;
    color = theme.colors.status.success;
    if (!label) badgeLabel = status === StatutKyc.VERIFIE ? 'Vérifié' : 'Payé/Confirmé';
  } else if (status === StatutKyc.EN_ATTENTE || status === StatutReservation.EN_ATTENTE_PAIEMENT || status === 'warning') {
    bg = theme.colors.status.warningBg;
    color = theme.colors.status.warning;
    if (!label) badgeLabel = 'En attente';
  } else if (status === StatutKyc.REJETE || status === StatutReservation.ANNULEE || status === 'error') {
    bg = theme.colors.status.errorBg;
    color = theme.colors.status.error;
    if (!label) badgeLabel = status === StatutKyc.REJETE ? 'Rejeté' : 'Annulé';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }, styles[`size_${size}`]]}>
      <Text style={[styles.text, { color }, styles[`textSize_${size}`]]}>
        {badgeLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  size_sm: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  size_md: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
  },
  text: {
    fontFamily: theme.typography.fontFamily.semiBold,
    textTransform: 'uppercase',
  },
  textSize_sm: {
    fontSize: theme.typography.fontSize['2xs'],
    letterSpacing: 0.5,
  },
  textSize_md: {
    fontSize: theme.typography.fontSize.xs,
    letterSpacing: 0.8,
  },
});
