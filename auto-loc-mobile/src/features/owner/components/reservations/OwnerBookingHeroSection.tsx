import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays, CheckCircle2 } from 'lucide-react-native';
import { formatCurrency } from '@autoloc/shared';
import { theme } from '../../../../core/theme';

export interface OwnerBookingHeroSectionProps {
  statut: string;
  creeLe?: string | Date;
  vehicleType?: string;
  vehicleVille?: string;
  vehicleMarque?: string;
  vehicleModele?: string;
  dateDebut?: string | Date;
  dateFin?: string | Date;
  nbJours?: number;
  montantProprietaire: number;
}

const statusConfig: Record<
  string,
  { label: string; tone: 'success' | 'warning' | 'info' | 'danger' | 'neutral'; detail: string }
> = {
  EN_ATTENTE_PAIEMENT: {
    label: 'Paiement en attente',
    tone: 'warning',
    detail: 'Le locataire a initié sa demande de réservation.',
  },
  PAYEE: {
    label: 'Demande à confirmer',
    tone: 'warning',
    detail: 'Acompte/Paiement réglé. Vous devez valider cette réservation.',
  },
  CONFIRMEE: {
    label: 'Réservation confirmée',
    tone: 'success',
    detail: 'Préparez le véhicule et effectuez la remise des clés.',
  },
  EN_COURS: {
    label: 'Location en cours',
    tone: 'info',
    detail: 'Votre véhicule est actuellement loué.',
  },
  TERMINEE: {
    label: 'Location terminée',
    tone: 'neutral',
    detail: 'Location clôturée. Vos gains sont crédités sur votre wallet.',
  },
  ANNULEE: {
    label: 'Réservation annulée',
    tone: 'danger',
    detail: 'Réservation annulée selon le barème de la politique AutoLoc.',
  },
  LITIGE: {
    label: 'Litige en cours',
    tone: 'danger',
    detail: 'Dossier transmis au service client AutoLoc.',
  },
};

const formatDate = (value?: string | Date) =>
  value ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const OwnerBookingHeroSection: React.FC<OwnerBookingHeroSectionProps> = ({
  statut,
  creeLe,
  vehicleType,
  vehicleVille,
  vehicleMarque,
  vehicleModele,
  dateDebut,
  dateFin,
  nbJours = 1,
  montantProprietaire,
}) => {
  const config = statusConfig[statut?.toUpperCase() ?? ''] ?? statusConfig.EN_ATTENTE_PAIEMENT;

  return (
    <View style={styles.hero}>
      {/* Top row: Badge and Creation Date */}
      <View style={styles.heroBadgeRow}>
        <View style={[styles.statusBadge, getStatusToneStyle(config.tone)]}>
          <CheckCircle2 size={13} color={config.tone === 'danger' ? '#FECACA' : '#D1FAE5'} />
          <Text style={styles.statusText} numberOfLines={1}>
            {config.label}
          </Text>
        </View>
        <Text style={styles.createdAt} numberOfLines={1}>
          Créée le {formatDate(creeLe)}
        </Text>
      </View>

      {/* Vehicle Type & Location Subhead */}
      <Text style={styles.heroEyebrow} numberOfLines={1}>
        {(vehicleType || 'VÉHICULE').toUpperCase()} · {vehicleVille || 'Sénégal'}
      </Text>

      {/* Title */}
      <Text style={styles.heroTitle} numberOfLines={2}>
        {vehicleMarque} {vehicleModele}
      </Text>

      {/* Description */}
      <Text style={styles.heroDescription}>{config.detail}</Text>

      {/* Dates & Duration Card */}
      <View style={styles.heroDates}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>DÉPART</Text>
          <Text style={styles.dateValue} numberOfLines={1}>
            {formatDate(dateDebut)}
          </Text>
        </View>

        <View style={styles.duration}>
          <CalendarDays size={15} color="#A7F3D0" />
          <Text style={styles.durationValue}>{nbJours}</Text>
          <Text style={styles.durationLabel}>JOUR{nbJours > 1 ? 'S' : ''}</Text>
        </View>

        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>RETOUR</Text>
          <Text style={styles.dateValue} numberOfLines={1}>
            {formatDate(dateFin)}
          </Text>
        </View>
      </View>

      {/* Total Earnings Hero Banner */}
      <View style={styles.totalHero}>
        <Text style={styles.totalHeroLabel}>GAIN NET PROPRIÉTAIRE</Text>
        <Text style={styles.totalHeroValue}>{formatCurrency(montantProprietaire)}</Text>
      </View>
    </View>
  );
};

const getStatusToneStyle = (tone: 'success' | 'warning' | 'info' | 'danger' | 'neutral') => {
  if (tone === 'success') return styles.status_success;
  if (tone === 'warning') return styles.status_warning;
  if (tone === 'info') return styles.status_info;
  if (tone === 'danger') return styles.status_danger;
  return styles.status_neutral;
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#072A20',
    borderRadius: 24,
    padding: 20,
    gap: 12,
    overflow: 'hidden',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexShrink: 1,
  },
  status_success: { backgroundColor: 'rgba(16,185,129,0.28)' },
  status_warning: { backgroundColor: 'rgba(245,158,11,0.28)' },
  status_info: { backgroundColor: 'rgba(59,130,246,0.28)' },
  status_danger: { backgroundColor: 'rgba(220,38,38,0.30)' },
  status_neutral: { backgroundColor: 'rgba(148,163,184,0.28)' },
  statusText: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.bold, fontSize: 11, flexShrink: 1 },
  createdAt: { color: '#A7F3D0', fontFamily: theme.typography.fontFamily.medium, fontSize: 11 },
  heroEyebrow: { color: '#A7F3D0', fontFamily: theme.typography.fontFamily.bold, fontSize: 10.5, letterSpacing: 0.9 },
  heroTitle: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.displayBold, fontSize: 26, lineHeight: 32 },
  heroDescription: { color: '#D1FAE5', fontFamily: theme.typography.fontFamily.regular, fontSize: 13, lineHeight: 19 },
  heroDates: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.16)',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  dateBlock: { flex: 1, padding: 12, alignItems: 'center', justifyContent: 'center' },
  dateLabel: { color: '#A7F3D0', fontFamily: theme.typography.fontFamily.bold, fontSize: 8.5, letterSpacing: 0.6, textAlign: 'center' },
  dateValue: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.semiBold, fontSize: 12.5, marginTop: 4, textAlign: 'center' },
  duration: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,.16)',
    backgroundColor: 'rgba(255,255,255,.06)',
    gap: 2,
    paddingVertical: 6,
  },
  durationValue: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.bold, fontSize: 16 },
  durationLabel: { color: '#A7F3D0', fontFamily: theme.typography.fontFamily.bold, fontSize: 8 },
  totalHero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  totalHeroLabel: { color: '#A7F3D0', fontFamily: theme.typography.fontFamily.bold, fontSize: 10, letterSpacing: 0.8 },
  totalHeroValue: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.displayBold, fontSize: 22 },
});
