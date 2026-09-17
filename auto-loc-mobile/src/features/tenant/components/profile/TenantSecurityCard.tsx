import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Check,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { AutoInput } from '../../../../shared/components/AutoInput';
import { theme } from '../../../../core/theme';
import { TenantProfile, updateLoginSecurity } from '../../api/tenantProfileApi';

interface TenantSecurityCardProps {
  profile: TenantProfile;
  onUpdated: (patch: Partial<TenantProfile>) => Promise<void> | void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function TenantSecurityCard({
  profile,
  onUpdated,
}: TenantSecurityCardProps) {
  const [email, setEmail] = useState(profile.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailChanged =
    email.trim().toLowerCase() !== (profile.email || '').toLowerCase();
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };
  const passwordValid =
    rules.length && rules.upper && rules.number && password === confirmPassword;
  const canSave =
    !loading &&
    ((emailChanged && EMAIL_PATTERN.test(email.trim())) || passwordValid);

  const save = async () => {
    setError(null);
    if (emailChanged && !EMAIL_PATTERN.test(email.trim())) {
      setError('Saisissez une adresse e-mail valide.');
      return;
    }
    if (password && !passwordValid) {
      setError(
        'Le mot de passe doit respecter tous les critères et être confirmé.'
      );
      return;
    }
    if (!canSave) return;
    try {
      setLoading(true);
      const result = await updateLoginSecurity({
        ...(emailChanged ? { email: email.trim().toLowerCase() } : {}),
        ...(password ? { password } : {}),
      });
      setPassword('');
      setConfirmPassword('');
      await onUpdated(result.emailUpdated ? { email: result.email } : {});
      Alert.alert('Identifiants mis à jour', result.message);
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Impossible de mettre à jour vos identifiants.'
      );
    } finally {
      setLoading(false);
    }
  };

  const hasEmail = Boolean(profile.email);

  return (
    <View style={styles.card}>
      {/* 1. En-tête avec Badge Sombre Icon et Pastille Statut */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.darkIconBadge}>
            <ShieldCheck size={18} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <View style={styles.titleTextGroup}>
            <Text style={styles.title}>Sécurité & identifiants</Text>
            <Text style={styles.subtitle}>
              {hasEmail
                ? 'E-mail et mot de passe de connexion'
                : 'Configurez vos identifiants de connexion'}
            </Text>
          </View>
        </View>

        <View style={hasEmail ? styles.statusBadgeActive : styles.statusBadgeSms}>
          <KeyRound
            size={11}
            color={hasEmail ? '#047857' : '#B45309'}
            strokeWidth={2.2}
          />
          <Text
            style={hasEmail ? styles.statusTextActive : styles.statusTextSms}
          >
            {hasEmail ? 'E-mail actif' : 'SMS'}
          </Text>
        </View>
      </View>

      {/* 2. Bannière de recommandation si e-mail manquant */}
      {!hasEmail ? (
        <View style={styles.noticeBanner}>
          <Sparkles size={14} color="#B45309" strokeWidth={2.2} />
          <Text style={styles.noticeText}>
            Ajoutez un e-mail et un mot de passe pour vous connecter rapidement sans dépendre du SMS.
          </Text>
        </View>
      ) : null}

      {/* 3. Formulaire de saisie */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <AutoInput
            label="ADRESSE E-MAIL DE CONNEXION"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Mail size={16} color="#64748B" strokeWidth={2} />}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <AutoInput
            label={hasEmail ? 'NOUVEAU MOT DE PASSE' : 'DÉFINIR UN MOT DE PASSE'}
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon={<LockKeyhole size={16} color="#64748B" strokeWidth={2} />}
            editable={!loading}
          />
        </View>

        {password.length > 0 ? (
          <>
            <View style={styles.rulesContainer}>
              {Object.entries({
                '8+ caractères': rules.length,
                '1 majuscule': rules.upper,
                '1 chiffre': rules.number,
              }).map(([ruleLabel, valid]) => (
                <View
                  key={ruleLabel}
                  style={[styles.rulePill, valid && styles.rulePillValid]}
                >
                  {valid ? (
                    <Check size={11} color="#047857" strokeWidth={2.5} />
                  ) : null}
                  <Text
                    style={[styles.ruleText, valid && styles.ruleTextValid]}
                  >
                    {ruleLabel}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <AutoInput
                label="CONFIRMER LE MOT DE PASSE"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                error={
                  confirmPassword && confirmPassword !== password
                    ? 'Les mots de passe ne correspondent pas.'
                    : undefined
                }
                leftIcon={<LockKeyhole size={16} color="#64748B" strokeWidth={2} />}
                editable={!loading}
              />
            </View>
          </>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Bouton Enregistrer */}
        <TouchableOpacity
          accessibilityRole="button"
          disabled={!canSave}
          onPress={save}
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Enregistrer les identifiants</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    flexShrink: 1,
  },
  darkIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    flexShrink: 0,
  },
  titleTextGroup: {
    flex: 1,
    flexShrink: 1,
    gap: 2,
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: '#041912',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#64748B',
  },
  statusBadgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    flexShrink: 0,
    alignSelf: 'center',
  },
  statusTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#047857',
  },
  statusBadgeSms: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    flexShrink: 0,
    alignSelf: 'center',
  },
  statusTextSms: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#B45309',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  noticeText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#B45309',
    lineHeight: 16,
  },
  formContainer: {
    gap: 10,
  },
  inputGroup: {
    gap: 2,
  },
  rulesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: -2,
    marginBottom: 4,
  },
  rulePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rulePillValid: {
    backgroundColor: '#ECFDF5',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  ruleText: {
    fontSize: 10.5,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#64748B',
  },
  ruleTextValid: {
    color: '#047857',
    fontFamily: theme.typography.fontFamily.bold,
  },
  errorText: {
    color: '#DC2626',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    marginTop: 2,
  },
  saveBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#041912',
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
  },
});
