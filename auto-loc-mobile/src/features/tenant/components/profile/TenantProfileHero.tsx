import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../../core/theme';
import { TenantProfile, uploadTenantAvatar } from '../../api/tenantProfileApi';

interface TenantProfileHeroProps {
  profile: TenantProfile;
  onAvatarUpdated: (avatarUrl: string) => Promise<void> | void;
  onVerificationPress: () => void;
  isOwnerMode?: boolean;
}

export function TenantProfileHero({ profile, onAvatarUpdated, onVerificationPress, isOwnerMode = false }: TenantProfileHeroProps) {
  const [uploading, setUploading] = useState(false);
  const initials = `${profile.prenom?.[0] || 'A'}${profile.nom?.[0] || ''}`.toUpperCase();
  const verified = profile.statutKyc === 'VERIFIE';

  const chooseAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Autorisation requise', 'Autorisez vos photos pour ajouter une image de profil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]?.uri) return;

    try {
      setUploading(true);
      const avatarUrl = await uploadTenantAvatar(result.assets[0].uri);
      await onAvatarUpdated(avatarUrl);
    } catch (error) {
      Alert.alert('Photo non enregistrée', 'Nous n’avons pas pu mettre à jour votre photo. Réessayez.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <LinearGradient colors={theme.gradients.forestNight} style={styles.card}>
      <View style={styles.glow} />
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Modifier ma photo de profil"
          disabled={uploading}
          onPress={chooseAvatar}
          style={styles.avatarButton}
        >
          <View style={styles.avatarRing}>
            {uploading ? <ActivityIndicator color={theme.primitives.emerald[300]} /> : profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : <Text style={styles.initials}>{initials}</Text>}
          </View>
          <View style={styles.cameraBadge}><Camera size={13} color={theme.primitives.forest[800]} /></View>
        </Pressable>
        <View style={styles.identity}>
          <Text style={styles.name} numberOfLines={1}>{profile.prenom || 'Votre'} {profile.nom || 'profil'}</Text>
          <Text style={styles.contact} numberOfLines={1}>{profile.telephone || profile.email}</Text>
          <View style={styles.rolePill}>
            <Sparkles size={12} color={theme.primitives.emerald[300]} />
            <Text style={styles.roleText}>{isOwnerMode ? 'ESPACE PROPRIÉTAIRE' : 'ESPACE LOCATAIRE'}</Text>
          </View>
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={onVerificationPress} style={[styles.statusPill, verified ? styles.statusSuccess : styles.statusPending]}>
        {verified ? <ShieldCheck size={15} color={theme.primitives.emerald[300]} /> : <ShieldAlert size={15} color={theme.primitives.amber[300]} />}
        <Text style={[styles.statusText, verified ? styles.statusSuccessText : styles.statusPendingText]}>
          {verified ? 'Identité vérifiée' : 'Vérification à compléter'}
        </Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: theme.radius.card, padding: theme.spacing[4], overflow: 'hidden', gap: theme.spacing[4], ...theme.elevation.card },
  glow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -64, top: -88, backgroundColor: 'rgba(74, 222, 128, 0.10)' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4] },
  avatarButton: { position: 'relative' },
  avatarRing: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: theme.primitives.emerald[300], padding: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primitives.forest[800] },
  avatar: { width: '100%', height: '100%', borderRadius: 32 },
  initials: { fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 23, color: theme.primitives.emerald[300] },
  cameraBadge: { position: 'absolute', right: -2, bottom: -2, width: 25, height: 25, borderRadius: 13, backgroundColor: theme.primitives.emerald[300], alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.primitives.forest[800] },
  identity: { flex: 1, gap: 4 },
  name: { color: '#F8FBF4', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 19 },
  contact: { color: '#A8D5C1', fontFamily: theme.typography.fontFamily.medium, fontSize: 12 },
  rolePill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, marginTop: 2 },
  roleText: { color: theme.primitives.emerald[300], fontFamily: theme.typography.fontFamily.bold, fontSize: 10, letterSpacing: 0.7 },
  statusPill: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6, borderRadius: theme.radius.full, paddingHorizontal: 11, paddingVertical: 7, borderWidth: 1 },
  statusSuccess: { backgroundColor: 'rgba(74, 222, 128, 0.12)', borderColor: 'rgba(74, 222, 128, 0.28)' },
  statusPending: { backgroundColor: 'rgba(251, 191, 36, 0.12)', borderColor: 'rgba(251, 191, 36, 0.28)' },
  statusText: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: 11 },
  statusSuccessText: { color: theme.primitives.emerald[300] },
  statusPendingText: { color: theme.primitives.amber[300] },
});
