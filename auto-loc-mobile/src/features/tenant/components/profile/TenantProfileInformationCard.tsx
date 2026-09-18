import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CalendarDays,
  Calendar,
  ChevronRight,
  ChevronDown,
  Mail,
  Pencil,
  Phone,
  UserRound,
  User,
  X,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { AutoInput, AutoButton, DatePickerField } from '../../../../shared/components';
import { TenantProfile, updateTenantProfile } from '../../api/tenantProfileApi';

const { width: screenWidth } = Dimensions.get('window');

interface TenantProfileInformationCardProps {
  profile: TenantProfile;
  onUpdated: (profile: Partial<TenantProfile>) => Promise<void> | void;
  onPhonePress: () => void;
}

const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

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
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prenom, setPrenom] = useState(profile.prenom || '');
  const [nom, setNom] = useState(profile.nom || '');
  const [dateNaissance, setDateNaissance] = useState(
    profile.dateNaissance?.slice(0, 10) || ''
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPrenom(profile.prenom || '');
      setNom(profile.nom || '');
      setDateNaissance(profile.dateNaissance?.slice(0, 10) || '');
      setError(null);
    }
  }, [open, profile]);

  const formatFrenchDate = (isoStr: string) => {
    if (!isoStr || isoStr.length !== 10) return null;
    const parts = isoStr.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return `${d} ${MOIS_NOMS[m - 1]} ${y}`;
  };

  const getAge = (isoStr: string) => {
    if (!isoStr || isoStr.length !== 10) return null;
    const birthDate = new Date(isoStr);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formattedDisplayDate = formatFrenchDate(dateNaissance);
  const userAge = getAge(dateNaissance);
  const isFormValid = prenom.trim().length > 0 && nom.trim().length > 0 && dateNaissance.length === 10;

  const save = async () => {
    if (!prenom.trim() || !nom.trim()) {
      setError('Veuillez renseigner votre prénom et votre nom.');
      return;
    }
    if (!dateNaissance || dateNaissance.length !== 10) {
      setError('Veuillez sélectionner votre date de naissance.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const updated = await updateTenantProfile({
        prenom: prenom.trim(),
        nom: nom.trim(),
        dateNaissance: dateNaissance.trim() || null,
      });
      await onUpdated(updated);
      setOpen(false);
      Alert.alert('Profil mis à jour', 'Vos informations personnelles ont été enregistrées avec succès.');
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

  function setDatePickerVisible(arg0: boolean) {
    throw new Error('Function not implemented.');
  }

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

      {/* Modal d'édition FULL-SCREEN Centré (Exactement comme Login/Register) */}
      <Modal
        visible={open}
        animationType="fade"
        transparent={false}
        onRequestClose={() => !saving && setOpen(false)}
      >
        <View style={styles.modalContainer}>
          <StatusBar style="light" animated />

          {/* 1. Fond Sombre Émeraude & Aura Lumineuse (Identique Login/Register) */}
          <View style={StyleSheet.absoluteFill}>
            <LinearGradient
              colors={['#062017', '#04150F', '#020B08']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.auraGlow} />
          </View>

          {/* 2. Content Safe Area Wrapper */}
          <View
            style={[
              styles.safeWrapper,
              {
                paddingTop: Math.max(insets.top, 20) + 8,
                paddingBottom: Math.max(insets.bottom, 16) + 8,
              },
            ]}
          >
            {/* Top Header Navigation Glass */}
            <View style={styles.topHeaderRow}>
              <TouchableOpacity
                style={styles.glassCloseBtn}
                onPress={() => !saving && setOpen(false)}
                activeOpacity={0.8}
              >
                <X size={18} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>

              <View style={styles.skipGlassPill}>
                <ShieldCheck size={12} color="#4ADE80" />
                <Text style={styles.skipGlassText}>ÉDITION PROFIL</Text>
              </View>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.flexOne}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              >
                {/* STACK CARDS SUPERPOSÉES (Identique Login/Register) */}
                <View style={styles.cardStackWrapper}>
                  {/* Card d'arrière-plan en décalé */}
                  <View style={styles.backAccentCard} />

                  {/* Card Principale Translucide Blanc */}
                  <View style={styles.frontGlassCard}>
                    {/* Header Card : Logo & Titre */}
                    <View style={styles.cardHeaderBox}>
                      <View style={styles.logoContainer}>
                        <Image
                          source={require('../../../../../assets/logo.png')}
                          style={styles.logoImage}
                          resizeMode="contain"
                        />
                      </View>

                      <View style={styles.badgeKycGlass}>
                        <ShieldCheck size={12} color="#059669" />
                        <Text style={styles.badgeKycText}>INFORMATIONS OFFICIELLES</Text>
                      </View>

                      <Text style={styles.mainTitle}>Modifier mon profil</Text>
                      <Text style={styles.subtitle}>
                        Mettez à jour vos informations personnelles de compte
                      </Text>
                    </View>

                    {/* Bannière Erreur */}
                    {error ? (
                      <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={() => setError(null)}>
                          <Text style={styles.errorClose}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    {/* Formulaire */}
                    <View style={styles.formStack}>
                      <AutoInput
                        label="Prénom"
                        placeholder="Ex. Amadou"
                        value={prenom}
                        onChangeText={(t) => { setError(null); setPrenom(t); }}
                        leftIcon={<User size={18} color={theme.colors.text.tertiary} />}
                        autoCapitalize="words"
                      />

                      <AutoInput
                        label="Nom de famille"
                        placeholder="Ex. Diallo"
                        value={nom}
                        onChangeText={(t) => { setError(null); setNom(t); }}
                        leftIcon={<User size={18} color={theme.colors.text.tertiary} />}
                        autoCapitalize="characters"
                      />

                      {/* Sélecteur de date inline (JJ/MM/AAAA) */}
                      <DatePickerField
                        label="Date de naissance"
                        value={dateNaissance}
                        onChange={(isoStr) => {
                          setError(null);
                          setDateNaissance(isoStr);
                        }}
                      />

                      {/* Bouton de confirmation */}
                      <AutoButton
                        title="Enregistrer les modifications"
                        variant="dark"
                        rightIcon={
                          <View style={styles.emeraldArrowCircle}>
                            <ArrowRight size={13} color="#4ADE80" />
                          </View>
                        }
                        loading={saving}
                        disabled={saving || !isFormValid}
                        onPress={save}
                        size="md"
                        style={styles.submitBtn}
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </View>
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

  /* Modal Full-Screen Centré Identique à Login/Register */
  modalContainer: {
    flex: 1,
    backgroundColor: '#04150F',
  },
  auraGlow: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: screenWidth * 0.9,
    height: screenWidth * 0.9,
    borderRadius: (screenWidth * 0.9) / 2,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
  },
  safeWrapper: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[2],
  },
  glassCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipGlassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
  },
  skipGlassText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[2],
    paddingBottom: Platform.OS === 'ios' ? 160 : 120,
    flexGrow: 1,
  },
  cardStackWrapper: {
    position: 'relative',
    marginVertical: theme.spacing[2],
  },
  backAccentCard: {
    position: 'absolute',
    top: -6,
    left: 8,
    right: 8,
    bottom: -6,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  frontGlassCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.80)',
    borderRadius: 28,
    padding: theme.spacing[5],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  cardHeaderBox: {
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
  },
  logoImage: {
    width: 160,
    height: 48,
  },
  badgeKycGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 6,
    marginBottom: theme.spacing[2],
  },
  badgeKycText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    letterSpacing: 0.8,
    color: '#059669',
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 26,
    lineHeight: 32,
    color: '#041912',
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.status.errorBg,
    borderColor: theme.colors.status.errorBorder,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[3],
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.status.error,
    flex: 1,
  },
  errorClose: {
    fontSize: 16,
    color: theme.colors.status.error,
    paddingLeft: 8,
  },
  formStack: {
    gap: 0,
  },
  dateFieldWrapper: {
    marginBottom: theme.spacing[4],
    width: '100%',
  },
  dateLabel: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.1,
    color: '#041912',
    marginBottom: 6,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface.canvas,
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[4],
    minHeight: 52,
  },
  dateInputValid: {
    borderColor: '#059669',
    backgroundColor: '#FFFFFF',
  },
  dateRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  placeholderDateText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.tertiary,
  },
  dateTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formattedDateText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  ageSubtext: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#059669',
  },
  submitBtn: {
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(4, 25, 18, 0.90)',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    marginTop: theme.spacing[2],
  },
  emeraldArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});
