import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CalendarDays,
  ChevronRight,
  Mail,
  Pencil,
  Phone,
  UserRound,
  X,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { TenantProfile, updateTenantProfile } from '../../api/tenantProfileApi';

interface TenantProfileInformationCardProps {
  profile: TenantProfile;
  onUpdated: (profile: Partial<TenantProfile>) => Promise<void> | void;
  onPhonePress: () => void;
}

function FieldRow({
  icon: Icon,
  label,
  value,
  action,
  verified,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  value: string;
  action?: () => void;
  verified?: boolean;
}) {
  return (
    <TouchableOpacity
      disabled={!action}
      onPress={action}
      activeOpacity={action ? 0.75 : 1}
      style={styles.fieldRow}
      accessibilityRole={action ? 'button' : undefined}
      accessibilityLabel={`${label}: ${value}`}
    >
      <View style={styles.fieldIconBadge}>
        <Icon size={13} color="#4ADE80" strokeWidth={2.25} />
      </View>

      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue} numberOfLines={1}>
          {value || 'Non renseigné'}
        </Text>
      </View>

      {verified !== undefined ? (
        verified ? (
          <View style={styles.badgeVerifiedPill}>
            <CheckCircle2 size={12} color="#047857" strokeWidth={2.2} />
            <Text style={styles.badgeVerifiedText}>Confirmé</Text>
          </View>
        ) : (
          <View style={styles.badgeActionPill}>
            <Text style={styles.badgeActionText}>Vérifier</Text>
            <ChevronRight size={12} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        )
      ) : action ? (
        <ChevronRight size={16} color="#94A3B8" strokeWidth={2} />
      ) : null}
    </TouchableOpacity>
  );
}

export function TenantProfileInformationCard({
  profile,
  onUpdated,
  onPhonePress,
}: TenantProfileInformationCardProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prenom, setPrenom] = useState(profile.prenom);
  const [nom, setNom] = useState(profile.nom);
  const [dateNaissance, setDateNaissance] = useState(
    profile.dateNaissance?.slice(0, 10) || ''
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPrenom(profile.prenom);
      setNom(profile.nom);
      setDateNaissance(profile.dateNaissance?.slice(0, 10) || '');
      setError(null);
    }
  }, [open, profile]);

  const save = async () => {
    if (
      !prenom.trim() ||
      !nom.trim() ||
      (dateNaissance && !/^\d{4}-\d{2}-\d{2}$/.test(dateNaissance))
    ) {
      setError('Renseignez votre nom et une date au format AAAA-MM-JJ.');
      return;
    }
    try {
      setSaving(true);
      const updated = await updateTenantProfile({
        prenom: prenom.trim(),
        nom: nom.trim(),
        dateNaissance: dateNaissance || null,
      });
      await onUpdated(updated);
      setOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'La mise à jour a échoué.');
    } finally {
      setSaving(false);
    }
  };

  const fullName = `${profile.prenom || ''} ${profile.nom || ''}`.trim();
  const birthDateFormatted = profile.dateNaissance
    ? new Date(profile.dateNaissance).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    : '';

  return (
    <>
      <View style={styles.card}>
        {/* En-tête avec Badge Sombre Icon et Bouton Modifier */}
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <View style={styles.darkIconBadge}>
              <UserRound size={18} color="#4ADE80" strokeWidth={2.25} />
            </View>
            <View style={styles.titleTextGroup}>
              <Text style={styles.title}>Informations personnelles</Text>
              <Text style={styles.subtitle}>Données d’identité et de contact</Text>
            </View>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Modifier mes informations"
            onPress={() => setOpen(true)}
            style={styles.editBtn}
            activeOpacity={0.8}
          >
            <Pencil size={12} color="#041912" strokeWidth={2.2} />
            <Text style={styles.editBtnText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* Champs de données */}
        <View style={styles.fieldsContainer}>
          <FieldRow icon={UserRound} label="IDENTITÉ" value={fullName} />
          <FieldRow icon={Mail} label="ADRESSE E-MAIL" value={profile.email} />
          <FieldRow
            icon={Phone}
            label="NUMÉRO DE TÉLÉPHONE"
            value={profile.telephone}
            action={onPhonePress}
            verified={profile.phoneVerified}
          />
          <FieldRow
            icon={CalendarDays}
            label="DATE DE NAISSANCE"
            value={birthDateFormatted}
          />
        </View>
      </View>

      {/* Modal / Bottom Sheet d'édition */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => !saving && setOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => !saving && setOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleGroup}>
                <View style={styles.darkIconBadgeSheet}>
                  <Pencil size={16} color="#4ADE80" strokeWidth={2.25} />
                </View>
                <View>
                  <Text style={styles.sheetTitle}>Modifier mon identité</Text>
                  <Text style={styles.sheetSubtitle}>
                    Mettez à jour vos informations enregistrées
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                disabled={saving}
                onPress={() => setOpen(false)}
                style={styles.closeBtn}
              >
                <X size={18} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.form}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PRÉNOM</Text>
                <TextInput
                  value={prenom}
                  onChangeText={setPrenom}
                  autoCapitalize="words"
                  style={styles.input}
                  placeholder="Ex. Awa"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NOM</Text>
                <TextInput
                  value={nom}
                  onChangeText={setNom}
                  autoCapitalize="characters"
                  style={styles.input}
                  placeholder="Ex. Ndiaye"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>DATE DE NAISSANCE (AAAA-MM-JJ)</Text>
                <TextInput
                  value={dateNaissance}
                  onChangeText={setDateNaissance}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                  style={styles.input}
                  placeholder="1995-08-24"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                disabled={saving}
                onPress={save}
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Enregistrer les modifications</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
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
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexShrink: 0,
    alignSelf: 'center',
  },
  editBtnText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 11.5,
    color: '#041912',
  },
  fieldsContainer: {
    gap: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },
  fieldContent: {
    flex: 1,
    gap: 2,
  },
  fieldLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
    color: '#041912',
  },
  badgeVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  badgeVerifiedText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#047857',
  },
  badgeActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#041912',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeActionText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#FFFFFF',
  },
  /* Modal Styles */
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(4, 25, 18, 0.55)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 16,
  },
  handle: {
    alignSelf: 'center',
    height: 4,
    width: 38,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  sheetTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  darkIconBadgeSheet: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  sheetTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 18,
    color: '#041912',
  },
  sheetSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: 12,
  },
  inputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 0.6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    color: '#041912',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
  },
  error: {
    color: '#DC2626',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
  },
  saveBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#041912',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },
  saveBtnDisabled: {
    opacity: 0.65,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
  },
});
