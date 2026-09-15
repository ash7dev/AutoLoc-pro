import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, KeyRound, LockKeyhole, Mail, ShieldCheck } from 'lucide-react-native';
import { AutoInput } from '../../../../shared/components/AutoInput';
import { theme } from '../../../../core/theme';
import { TenantProfile, updateLoginSecurity } from '../../api/tenantProfileApi';

interface TenantSecurityCardProps {
  profile: TenantProfile;
  onUpdated: (patch: Partial<TenantProfile>) => Promise<void> | void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function TenantSecurityCard({ profile, onUpdated }: TenantSecurityCardProps) {
  const [email, setEmail] = useState(profile.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailChanged = email.trim().toLowerCase() !== profile.email.toLowerCase();
  const rules = { length: password.length >= 8, upper: /[A-Z]/.test(password), number: /\d/.test(password) };
  const passwordValid = rules.length && rules.upper && rules.number && password === confirmPassword;
  const canSave = !loading && ((emailChanged && EMAIL_PATTERN.test(email.trim())) || passwordValid);

  const save = async () => {
    setError(null);
    if (emailChanged && !EMAIL_PATTERN.test(email.trim())) { setError('Saisissez une adresse e-mail valide.'); return; }
    if (password && !passwordValid) { setError('Le mot de passe doit respecter tous les critères et être confirmé.'); return; }
    if (!canSave) return;
    try {
      setLoading(true);
      const result = await updateLoginSecurity({ ...(emailChanged ? { email: email.trim().toLowerCase() } : {}), ...(password ? { password } : {}) });
      setPassword('');
      setConfirmPassword('');
      await onUpdated(result.emailUpdated ? { email: result.email } : {});
      Alert.alert('Identifiants mis à jour', result.message);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || requestError?.message || 'Impossible de mettre à jour vos identifiants.');
    } finally { setLoading(false); }
  };

  return <View style={styles.card}>
    <View style={styles.header}><View style={styles.icon}><ShieldCheck size={19} color={theme.colors.brand.main} /></View><View style={styles.headerText}><Text style={styles.title}>Sécurité & identifiants</Text><Text style={styles.subtitle}>{profile.email ? 'E-mail et mot de passe de connexion' : 'Ajoutez un e-mail et un mot de passe'}</Text></View><View style={[styles.badge, profile.email ? styles.badgeActive : styles.badgeSms]}><KeyRound size={12} color={profile.email ? theme.colors.status.success : theme.colors.status.warning} /><Text style={[styles.badgeText, { color: profile.email ? theme.colors.status.success : theme.colors.status.warning }]}>{profile.email ? 'E-mail actif' : 'SMS'}</Text></View></View>
    {!profile.email ? <View style={styles.notice}><Text style={styles.noticeText}>Ajoutez un e-mail et un mot de passe pour pouvoir vous connecter aussi sans SMS.</Text></View> : null}
    <AutoInput label="Adresse e-mail de connexion" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} leftIcon={<Mail size={17} color={theme.colors.text.tertiary} />} editable={!loading} />
    <AutoInput label={profile.email ? 'Nouveau mot de passe' : 'Définir un mot de passe'} value={password} onChangeText={setPassword} isPassword leftIcon={<LockKeyhole size={17} color={theme.colors.text.tertiary} />} editable={!loading} />
    {password.length > 0 ? <><View style={styles.rules}>{Object.entries({ '8 caractères': rules.length, '1 majuscule': rules.upper, '1 chiffre': rules.number }).map(([label, valid]) => <View key={label} style={[styles.rule, valid && styles.ruleValid]}>{valid ? <Check size={11} color={theme.primitives.forest[800]} /> : null}<Text style={[styles.ruleText, valid && styles.ruleTextValid]}>{label}</Text></View>)}</View><AutoInput label="Confirmer le mot de passe" value={confirmPassword} onChangeText={setConfirmPassword} isPassword error={confirmPassword && confirmPassword !== password ? 'Les mots de passe ne correspondent pas.' : undefined} leftIcon={<LockKeyhole size={17} color={theme.colors.text.tertiary} />} editable={!loading} /></> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <Pressable accessibilityRole="button" disabled={!canSave} onPress={save} style={[styles.button, !canSave && styles.buttonDisabled]}>{loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Enregistrer les identifiants</Text>}</Pressable>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.surface.card, borderRadius: theme.radius.card, padding: theme.spacing[4], borderWidth: 1, borderColor: theme.colors.border.default, ...theme.elevation.sm }, header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }, icon: { width: 38, height: 38, borderRadius: 13, backgroundColor: theme.colors.brand.subtle, alignItems: 'center', justifyContent: 'center' }, headerText: { flex: 1 }, title: { fontFamily: theme.typography.fontFamily.displaySemiBold, color: theme.colors.text.primary, fontSize: 17 }, subtitle: { fontFamily: theme.typography.fontFamily.regular, color: theme.colors.text.secondary, fontSize: 11, marginTop: 2 }, badge: { flexDirection: 'row', gap: 4, alignItems: 'center', borderRadius: theme.radius.full, paddingHorizontal: 8, paddingVertical: 5 }, badgeActive: { backgroundColor: theme.colors.status.successBg }, badgeSms: { backgroundColor: theme.colors.status.warningBg }, badgeText: { fontFamily: theme.typography.fontFamily.bold, fontSize: 10 }, notice: { padding: 11, borderRadius: theme.radius.md, backgroundColor: theme.colors.status.warningBg, marginBottom: 14 }, noticeText: { fontFamily: theme.typography.fontFamily.regular, color: theme.colors.text.secondary, fontSize: 12, lineHeight: 18 }, rules: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: -7, marginBottom: 12 }, rule: { flexDirection: 'row', gap: 4, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 5, borderRadius: theme.radius.full, backgroundColor: theme.colors.surface.subtle }, ruleValid: { backgroundColor: theme.colors.brand.subtle }, ruleText: { fontSize: 10, fontFamily: theme.typography.fontFamily.medium, color: theme.colors.text.tertiary }, ruleTextValid: { color: theme.primitives.forest[800] }, error: { color: theme.colors.status.error, fontFamily: theme.typography.fontFamily.medium, fontSize: 12, marginBottom: 12 }, button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.full, backgroundColor: theme.primitives.emerald[600], ...theme.elevation.brandGlowSm }, buttonDisabled: { opacity: 0.5 }, buttonText: { fontFamily: theme.typography.fontFamily.bold, color: '#FFFFFF', fontSize: 13 },
});
