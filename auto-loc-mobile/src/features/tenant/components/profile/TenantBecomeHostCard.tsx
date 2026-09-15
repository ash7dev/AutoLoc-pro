import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CarFront, Check, Sparkles, X } from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { useNavigation } from '../../../../core/navigation/RootNavigator';
import { AutoButton } from '../../../../shared/components/AutoButton';

interface TenantBecomeHostCardProps { isHost: boolean; onConfirm: () => Promise<void>; }

export function TenantBecomeHostCard({ isHost, onConfirm }: TenantBecomeHostCardProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { switchToOwnerSpace } = useNavigation();

  const confirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      setOpen(false);
      switchToOwnerSpace();
    } catch {
      Alert.alert('Activation impossible', 'Nous n’avons pas pu activer votre espace Hôte. Réessayez dans quelques instants.');
    } finally {
      setLoading(false);
    }
  };

  if (isHost) {
    return (
      <View style={styles.activeCard}>
        <Check size={18} color={theme.colors.status.success} />
        <View style={{ flex: 1 }}>
          <Text style={styles.activeTitle}>Espace Hôte activé</Text>
          <Text style={styles.activeText}>Votre compte peut désormais proposer des véhicules.</Text>
        </View>
        <AutoButton
          title="Espace Hôte ⚡️"
          variant="secondary"
          size="sm"
          onPress={switchToOwnerSpace}
        />
      </View>
    );
  }

  return <><View style={styles.card}><View style={styles.icon}><CarFront size={22} color={theme.primitives.emerald[300]} /></View><View style={styles.text}><Text style={styles.title}>Vous avez un véhicule à louer ?</Text><Text style={styles.subtitle}>Créez votre espace Hôte et développez vos revenus avec AutoLoc.</Text></View><AutoButton title="Devenir Hôte" variant="action" size="sm" onPress={() => setOpen(true)} leftIcon={<Sparkles size={15} color="#FFFFFF" />} /></View>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => !loading && setOpen(false)}><View style={styles.overlay}><View style={styles.modal}><Pressable style={styles.close} disabled={loading} onPress={() => setOpen(false)}><X size={17} color={theme.colors.text.secondary} /></Pressable><View style={styles.modalIcon}><CarFront size={24} color={theme.colors.brand.main} /></View><Text style={styles.modalTitle}>Activer mon espace Hôte</Text><Text style={styles.modalText}>Votre compte restera aussi utilisable comme locataire. Vous pourrez ajouter un véhicule lorsque votre dossier sera prêt.</Text><AutoButton title="Activer l’espace Hôte" variant="action" loading={loading} onPress={confirm} /><AutoButton title="Pas maintenant" variant="ghost" disabled={loading} onPress={() => setOpen(false)} /></View></View></Modal></>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.primitives.forest[800], borderRadius: theme.radius.card, padding: theme.spacing[4], gap: 12, ...theme.elevation.card }, icon: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(74, 222, 128, .13)', alignItems: 'center', justifyContent: 'center' }, text: { gap: 4 }, title: { color: '#F8FBF4', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 17 }, subtitle: { color: '#A8D5C1', fontFamily: theme.typography.fontFamily.regular, fontSize: 12, lineHeight: 18 }, activeCard: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: theme.spacing[4], backgroundColor: theme.colors.status.successBg, borderRadius: theme.radius.card, borderWidth: 1, borderColor: theme.colors.status.successBorder }, activeTitle: { fontFamily: theme.typography.fontFamily.semiBold, color: theme.colors.text.primary, fontSize: 14 }, activeText: { color: theme.colors.text.secondary, fontSize: 12, marginTop: 2 }, overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: theme.colors.surface.overlay }, modal: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: theme.radius.card, padding: 24, gap: 14 }, close: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }, modalIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.brand.subtle }, modalTitle: { fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 20, color: theme.colors.text.primary }, modalText: { fontFamily: theme.typography.fontFamily.regular, fontSize: 13, lineHeight: 20, color: theme.colors.text.secondary },
});
