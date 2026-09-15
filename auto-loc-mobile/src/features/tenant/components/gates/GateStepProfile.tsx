import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { User, Calendar, ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react-native';
import { useAppStore } from '../../../../core/store/useAppStore';
import { apiClient } from '../../../../core/api/apiClient';
import { CustomDatePickerModal } from '../../../../shared/components/CustomDatePickerModal';
import { theme } from '../../../../core/theme';

interface GateStepProfileProps {
  onSuccess: () => void;
}

const COLORS = {
  bg: '#FFFFFF',
  accent: '#16A34A',
  accentLight: '#F0FDF4',
  ink: '#041912',
  inkMuted: '#64748B',
  border: '#E2E8F0',
  surface: '#F8FAFC',
};

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
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Helper de formatage convivial (ex: 1998-08-14 -> 14 Août 1998)
  const formatFrenchDate = (isoStr: string) => {
    if (!isoStr || isoStr.length !== 10) return null;
    const parts = isoStr.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return `${d} ${MOIS_NOMS[m - 1]} ${y}`;
  };

  // Helper de calcul de l'âge
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
      // 1. Envoyer au serveur backend NestJS via l'endpoint de profil
      await apiClient.post('/auth/complete-profile', {
        prenom: prenom.trim(),
        nom: nom.trim(),
        dateNaissance: dateNaissance.trim(),
      });

      // 2. Mettre à jour immédiatement le store local (Optimistic Instant Update)
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.iconCircle}>
          <User size={32} color={COLORS.accent} />
        </View>

        <Text style={styles.title}>Informations personnelles</Text>
        <Text style={styles.subtitle}>
          Ces informations doivent correspondre exactement à votre pièce d'identité officielle pour la réservation.
        </Text>

        {/* Champ Prénom */}
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
            {prenom.trim().length > 0 && <CheckCircle2 size={16} color={COLORS.accent} />}
          </View>
        </View>

        {/* Champ Nom */}
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
            {nom.trim().length > 0 && <CheckCircle2 size={16} color={COLORS.accent} />}
          </View>
        </View>

        {/* Champ Date de Naissance (Sélecteur Sur-Mesure Moderne) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Date de naissance</Text>
          <Pressable 
            style={[
              styles.inputWrapper, 
              { justifyContent: 'space-between', height: 52 },
              formattedDisplayDate && styles.inputWrapperValid
            ]}
            onPress={() => setDatePickerVisible(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Calendar size={18} color={COLORS.accent} style={{ marginRight: 10 }} />
              {formattedDisplayDate ? (
                <View style={styles.dateTextGroup}>
                  <Text style={styles.formattedDateText}>{formattedDisplayDate}</Text>
                  {userAge !== null && (
                    <Text style={styles.ageSubtext}>({userAge} ans)</Text>
                  )}
                </View>
              ) : (
                <Text style={styles.placeholderText}>Sélectionnez votre date de naissance</Text>
              )}
            </View>
            <ChevronDown size={18} color={COLORS.inkMuted} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Modal Sélecteur de Date de Naissance Sur-Mesure */}
      <CustomDatePickerModal
        visible={datePickerVisible}
        value={dateNaissance}
        onConfirm={(formattedDate) => setDateNaissance(formattedDate)}
        onClose={() => setDatePickerVisible(false)}
      />

      {/* Bouton de Validation */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.submitButton, (!isFormValid || submitting) && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={!isFormValid || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Enregistrer et continuer</Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 22,
    color: theme.primitives.forest[800],
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13.5,
    color: COLORS.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: COLORS.ink,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputWrapperValid: {
    borderColor: COLORS.accent,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 15,
    color: COLORS.ink,
  },
  placeholderText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14.5,
    color: '#94A3B8',
  },
  dateTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formattedDateText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: COLORS.ink,
  },
  ageSubtext: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: COLORS.accent,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    fontSize: 15.5,
  },
});
