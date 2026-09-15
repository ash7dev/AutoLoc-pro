import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock3, LockKeyhole, MessageCircle, Phone, UserRound } from 'lucide-react-native';
import { theme } from '../../../core/theme';

interface BookingHostContactCardProps {
  reservationId: string;
  statut: string;
  dateDebut: string | Date;
  host?: { prenom?: string; nom?: string; telephone?: string };
}

export const canRevealHostContact = (statut: string, dateDebut: string | Date) => {
  if (statut === 'ANNULEE' || statut === 'TERMINEE') return false;
  if (statut === 'EN_COURS' || statut === 'LITIGE') return true;
  if (statut !== 'CONFIRMEE') return false;
  return new Date(dateDebut).getTime() - Date.now() <= 24 * 60 * 60 * 1000;
};

export const BookingHostContactCard: React.FC<BookingHostContactCardProps> = ({ reservationId, statut, dateDebut, host }) => {
  const isRevealed = canRevealHostContact(statut, dateDebut);
  const fullName = `${host?.prenom || 'Votre'} ${host?.nom || 'hôte'}`.trim();
  const contactHost = async (channel: 'PHONE' | 'WHATSAPP') => {
    if (!host?.telephone) return;
    const phone = host.telephone.replace(/\s+/g, '');
    const url = channel === 'PHONE'
      ? `tel:${phone}`
      : `https://wa.me/${phone.replace(/^\+/, '')}?text=${encodeURIComponent(`Bonjour ${host.prenom || ''}, je vous contacte au sujet de la réservation #${reservationId.slice(0, 8).toUpperCase()} sur AutoLoc.`)}`;
    await Linking.openURL(url);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}><View style={styles.icon}><UserRound size={17} color={theme.colors.brand.main} /></View><Text style={styles.title}>Votre hôte</Text></View>
      <View style={styles.row}><View style={styles.avatar}><Text style={styles.avatarText}>{(host?.prenom || 'A').charAt(0)}</Text></View><View style={styles.info}><Text style={styles.name}>{fullName}</Text><Text style={styles.subtitle}>Hôte AutoLoc</Text></View></View>
      {isRevealed && host?.telephone ? (
        <View style={styles.revealed}><View style={styles.phoneLine}><Phone size={15} color={theme.colors.brand.main} /><Text style={styles.phone}>{host.telephone}</Text></View><View style={styles.actions}><TouchableOpacity style={styles.callButton} onPress={() => contactHost('PHONE')}><Phone size={14} color="#072A20" /><Text style={styles.callText}>Appeler</Text></TouchableOpacity><TouchableOpacity style={styles.whatsappButton} onPress={() => contactHost('WHATSAPP')}><MessageCircle size={14} color="#FFFFFF" /><Text style={styles.whatsappText}>WhatsApp</Text></TouchableOpacity></View></View>
      ) : (
        <View style={styles.locked}><LockKeyhole size={15} color="#64748B" /><View style={styles.lockedCopy}><Text style={styles.lockedTitle}>Coordonnées protégées</Text><Text style={styles.lockedText}>{statut === 'CONFIRMEE' ? 'Elles seront disponibles 24 h avant la prise en charge.' : 'Elles seront disponibles après confirmation de la réservation.'}</Text></View><Clock3 size={15} color="#94A3B8" /></View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({ card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, padding: 16, gap: 14 }, header: { flexDirection: 'row', alignItems: 'center', gap: 9 }, icon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFDF5' }, title: { color: '#072A20', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 16 }, row: { flexDirection: 'row', alignItems: 'center', gap: 10 }, avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DCFCE7' }, avatarText: { color: '#166534', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 17 }, info: { flex: 1 }, name: { color: '#072A20', fontFamily: theme.typography.fontFamily.semiBold, fontSize: 14 }, subtitle: { color: '#64748B', fontFamily: theme.typography.fontFamily.regular, fontSize: 12, marginTop: 2 }, revealed: { gap: 10, borderTopWidth: 1, borderColor: '#E2E8F0', paddingTop: 12 }, phoneLine: { flexDirection: 'row', alignItems: 'center', gap: 7 }, phone: { color: '#072A20', fontFamily: theme.typography.fontFamily.bold, fontSize: 14 }, actions: { flexDirection: 'row', gap: 8 }, callButton: { flex: 1, minHeight: 40, borderRadius: 20, backgroundColor: '#ECFDF5', flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' }, callText: { color: '#072A20', fontFamily: theme.typography.fontFamily.bold, fontSize: 12 }, whatsappButton: { flex: 1, minHeight: 40, borderRadius: 20, backgroundColor: '#16A34A', flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' }, whatsappText: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.bold, fontSize: 12 }, locked: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 11, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }, lockedCopy: { flex: 1 }, lockedTitle: { color: '#334155', fontFamily: theme.typography.fontFamily.semiBold, fontSize: 12 }, lockedText: { color: '#64748B', fontFamily: theme.typography.fontFamily.regular, fontSize: 11, lineHeight: 15, marginTop: 1 } });
