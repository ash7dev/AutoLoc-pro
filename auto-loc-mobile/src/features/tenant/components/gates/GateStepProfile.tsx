import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { User, Calendar, ArrowRight, ChevronDown, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { useAppStore } from '../../../../core/store/useAppStore';
import { apiClient } from '../../../../core/api/apiClient';
import { DatePickerField } from '../../../../shared/components/DatePickerField';
import { theme } from '../../../../core/theme';

interface GateStepProfileProps {
  onSuccess: () => void;
}

const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const GateStepProfile: React.FC<GateStepProfileProps> = ({ onSuccess }) => {
  const user = useAppStore((state) => state.user);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);

  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [nom, setNom] = useState(user?.nom || '');
  const [dateNaissance, setDateNaissance] = useState(user?.dateNaissance || '');
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!prenom.trim() || !nom.trim()) {
      Alert.alert('Champs requis', 'Veuillez saisir votre prénom et votre nom.');
      return;
    }

    if (!dateNaissance || dateNaissance.length !== 10) {
      Alert.alert('Date de naissance requise', 'Veuillez sélectionner votre date de naissance.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.patch('/users/me/profile', {
        prenom: prenom.trim(),
        nom: nom.trim(),
        dateNaissance: dateNaissance.trim(),
      });

      await updateUserProfile({
        prenom: prenom.trim(),
        nom: nom.trim(),
        dateNaissance: dateNaissance.trim(),
      });

      onSuccess();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erreur lors de la sauvegarde du profil.';
      Alert.alert('Erreur', typeof msg === 'string' ? msg : 'Données invalides.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cardStackWrapper}>
        <View style={styles.backAccentCard} />

        <View style={styles.frontGlassCard}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconCircle}>
              <User size={30} color="#059669" />
            </View>

            <View style={styles.badgeKycGlass}>
              <ShieldCheck size={12} color="#059669" />
              <Text style={styles.badgeKycText}>INFORMATIONS OFFICIELLES</Text>
            </View>

            <Text style={styles.mainTitle}>Identité personnelle</Text>
            <Text style={styles.subtitle}>
              Renseignez vos informations telles qu'elles apparaissent sur vos documents officiels.
            </Text>
          </View>

          {/* Form Stack */}
          <View style={styles.formStack}>
            {/* Prénom */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Prénom</Text>
              <View style={[styles.inputWrapper, prenom.trim().length > 0 && styles.inputWrapperValid]}>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Amadou"
                  placeholderTextColor="#94A3B8"
                  value={prenom}
                  onChangeText={setPrenom}
                  autoCapitalize="words"
                />
                {prenom.trim().length > 0 && <CheckCircle2 size={16} color="#059669" />}
              </View>
            </View>

            {/* Nom */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nom de famille</Text>
              <View style={[styles.inputWrapper, nom.trim().length > 0 && styles.inputWrapperValid]}>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Diallo"
                  placeholderTextColor="#94A3B8"
                  value={nom}
                  onChangeText={setNom}
                  autoCapitalize="characters"
                />
                {nom.trim().length > 0 && <CheckCircle2 size={16} color="#059669" />}
              </View>
            </View>

            {/* Date de Naissance Inline (JJ/MM/AAAA) */}
            <DatePickerField
              label="Date de naissance"
              value={dateNaissance}
              onChange={setDateNaissance}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, (!isFormValid || submitting) && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={!isFormValid || submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Enregistrer et continuer</Text>
                  <View style={styles.emeraldArrowCircle}>
                    <ArrowRight size={13} color="#4ADE80" strokeWidth={2.5} />
                  </View>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
    flexGrow: 1,
    justifyContent: 'center',
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
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
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
    fontSize: 22,
    lineHeight: 28,
    color: '#041912',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  formStack: {
    gap: theme.spacing[3],
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#041912',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputWrapperValid: {
    borderColor: '#059669',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14.5,
    color: '#041912',
  },
  dateRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  placeholderText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    color: '#94A3B8',
  },
  dateTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formattedDateText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 14,
    color: '#041912',
  },
  ageSubtext: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#059669',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
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
  btnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
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
    marginLeft: 8,
  },
});

