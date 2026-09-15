import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BadgeCheck, ChevronRight, Clock3, CreditCard, ShieldCheck, ShieldX, Smartphone } from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { TenantProfile } from '../../api/tenantProfileApi';

interface TenantVerificationCardProps { profile: TenantProfile; onPress: () => void; }

function Item({ icon: Icon, label, detail, done }: { icon: typeof ShieldCheck; label: string; detail: string; done: boolean }) {
  return <View style={styles.item}>
    <View style={[styles.icon, done ? styles.iconDone : styles.iconTodo]}><Icon size={17} color={done ? theme.colors.status.success : theme.colors.status.warning} /></View>
    <View style={styles.itemText}><Text style={styles.label}>{label}</Text><Text style={styles.detail}>{detail}</Text></View>
    {done ? <BadgeCheck size={18} color={theme.colors.status.success} /> : <ChevronRight size={18} color={theme.colors.text.tertiary} />}
  </View>;
}

export function TenantVerificationCard({ profile, onPress }: TenantVerificationCardProps) {
  const kycVerified = profile.statutKyc === 'VERIFIE';
  const kycPending = profile.statutKyc === 'EN_ATTENTE';
  const completed = Number(profile.phoneVerified) + Number(kycVerified) + Number(Boolean(profile.permisUrl));
  const kycLabel = kycVerified ? 'Identité confirmée' : kycPending ? 'Dossier en cours d’examen' : profile.statutKyc === 'REJETE' ? 'Dossier à soumettre à nouveau' : 'Pièce d’identité et selfie requis';

  return <View style={styles.card}>
    <View style={styles.header}><View><Text style={styles.title}>Vérification du compte</Text><Text style={styles.subtitle}>{completed}/3 éléments validés pour réserver sereinement</Text></View><View style={styles.counter}><Text style={styles.counterText}>{completed}/3</Text></View></View>
    <View style={styles.progress}><View style={[styles.progressFill, { width: `${(completed / 3) * 100}%` }]} /></View>
    <Pressable accessibilityRole="button" accessibilityLabel="Gérer la vérification de mon compte" onPress={onPress}>
      <Item icon={Smartphone} label="Téléphone" detail={profile.phoneVerified ? 'Numéro confirmé' : 'Confirmez votre numéro par SMS'} done={profile.phoneVerified} />
      <Item icon={kycPending ? Clock3 : kycVerified ? ShieldCheck : ShieldX} label="Identité" detail={kycLabel} done={kycVerified} />
      <Item icon={CreditCard} label="Permis de conduire" detail={profile.permisUrl ? 'Permis enregistré' : 'Ajoutez un permis valide'} done={Boolean(profile.permisUrl)} />
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.surface.card, borderRadius: theme.radius.card, padding: theme.spacing[4], borderWidth: 1, borderColor: theme.colors.border.default, gap: theme.spacing[3], ...theme.elevation.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, title: { fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 17, color: theme.colors.text.primary }, subtitle: { marginTop: 3, fontFamily: theme.typography.fontFamily.regular, fontSize: 12, color: theme.colors.text.secondary },
  counter: { backgroundColor: theme.colors.brand.subtle, borderRadius: theme.radius.full, paddingHorizontal: 10, paddingVertical: 5 }, counterText: { color: theme.colors.brand.main, fontFamily: theme.typography.fontFamily.bold, fontSize: 11 },
  progress: { height: 6, borderRadius: 3, backgroundColor: theme.colors.surface.subtle, overflow: 'hidden' }, progressFill: { height: '100%', borderRadius: 3, backgroundColor: theme.colors.status.success },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderTopWidth: 1, borderColor: theme.colors.border.subtle }, icon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, iconDone: { backgroundColor: theme.colors.status.successBg }, iconTodo: { backgroundColor: theme.colors.status.warningBg }, itemText: { flex: 1 }, label: { color: theme.colors.text.primary, fontFamily: theme.typography.fontFamily.semiBold, fontSize: 13 }, detail: { color: theme.colors.text.secondary, fontFamily: theme.typography.fontFamily.regular, fontSize: 11, marginTop: 2 },
});
