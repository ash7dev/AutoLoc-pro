import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Clock3, LockKeyhole, Phone, ShieldCheck, UserRound } from 'lucide-react-native';
import { theme } from '../../../core/theme';

interface BookingHostContactCardProps {
  statut: string;
  dateDebut: string | Date;
  host?: { prenom?: string; nom?: string; telephone?: string };
}

export const canRevealHostContact = (statut: string, dateDebut: string | Date) => {
  if (statut === 'ANNULEE' || statut === 'TERMINEE') return false;
  if (statut === 'EN_COURS' || statut === 'LITIGE') return true;
  return statut === 'CONFIRMEE' && new Date(dateDebut).getTime() - Date.now() <= 24 * 60 * 60 * 1000;
};

export const BookingHostContactCard: React.FC<BookingHostContactCardProps> = ({ statut, dateDebut, host }) => {
  const isRevealed = canRevealHostContact(statut, dateDebut);
  const fullName = `${host?.prenom || 'Votre'} ${host?.nom || 'hôte'}`.trim();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}><UserRound size={17} color="#0F766E" /></View>
        <View style={styles.headerCopy}><Text style={styles.eyebrow}>VOTRE HÔTE</Text><Text style={styles.title}>{fullName}</Text></View>
        <View style={styles.verified}><ShieldCheck size={14} color="#047857" /><Text style={styles.verifiedText}>Vérifié</Text></View>
      </View>

      {isRevealed && host?.telephone ? (
        <View style={styles.contactAvailable}>
          <View style={styles.contactIcon}><Phone size={15} color="#047857" /></View>
          <View style={styles.contactCopy}><Text style={styles.contactLabel}>Coordonnée de l’hôte</Text><Text selectable style={styles.phone}>{host.telephone}</Text></View>
          <Text style={styles.contactHint}>Disponible</Text>
        </View>
      ) : (
        <View style={styles.locked}>
          <View style={styles.lockedIcon}><LockKeyhole size={15} color="#64748B" /></View>
          <View style={styles.lockedCopy}><Text style={styles.lockedTitle}>Coordonnées protégées</Text><Text style={styles.lockedText}>{statut === 'CONFIRMEE' ? 'Elles apparaîtront 24 h avant la prise en charge.' : 'Elles apparaîtront une fois la réservation confirmée.'}</Text></View>
          <Clock3 size={16} color="#94A3B8" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, padding: 16, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFDF5' },
  headerCopy: { flex: 1 },
  eyebrow: { color: '#64748B', fontFamily: theme.typography.fontFamily.bold, fontSize: 9, letterSpacing: .8 },
  title: { color: '#072A20', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 16, marginTop: 2 },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 99, backgroundColor: '#ECFDF5' },
  verifiedText: { color: '#047857', fontFamily: theme.typography.fontFamily.bold, fontSize: 10 },
  contactAvailable: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: '#F0FDFA', borderRadius: 14, borderWidth: 1, borderColor: '#CCFBF1' },
  contactIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#CCFBF1' },
  contactCopy: { flex: 1 },
  contactLabel: { color: '#64748B', fontFamily: theme.typography.fontFamily.medium, fontSize: 10 },
  phone: { color: '#0F172A', fontFamily: theme.typography.fontFamily.bold, fontSize: 14, marginTop: 2 },
  contactHint: { color: '#047857', fontFamily: theme.typography.fontFamily.bold, fontSize: 10 },
  locked: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, backgroundColor: '#F8FAFC', borderRadius: 14 },
  lockedIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#E2E8F0' },
  lockedCopy: { flex: 1 },
  lockedTitle: { color: '#334155', fontFamily: theme.typography.fontFamily.semiBold, fontSize: 12 },
  lockedText: { color: '#64748B', fontFamily: theme.typography.fontFamily.regular, fontSize: 11, lineHeight: 15, marginTop: 2 },
});
