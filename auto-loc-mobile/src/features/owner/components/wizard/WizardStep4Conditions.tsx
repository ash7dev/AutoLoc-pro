import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Shield,
  Fuel,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react-native';
import {
  useFonts as useFraunces,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  useFonts as useInter,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

export interface Step4Data {
  assurance: string;
  carburantCondition: string;
  zoneConduite?: string;
  reglesSpecifiques: string;
}

interface WizardStep4ConditionsProps {
  data: Step4Data;
  onChange: (updated: Partial<Step4Data>) => void;
}

const INSURANCE_OPTIONS = [
  {
    value: 'Locataire responsable',
    title: 'Locataire responsable (Standard)',
    desc: 'En cas de dommage ou sinistre responsable, le locataire prend en charge les réparations.',
    badge: 'Formule Standard',
  },
  {
    value: 'Incluse (tous risques)',
    title: 'Assurance Tous Risques Incluse',
    desc: 'Votre véhicule bénéficie d’une protection complète Tous Risques AutoLoc.',
    badge: 'Protection Maximale',
  },
];

const FUEL_CONDITIONS = [
  {
    value: 'Plein à plein',
    title: '⛽ Plein à plein',
    desc: 'Le véhicule est remis avec le plein et doit être restitué avec le plein.',
  },
  {
    value: 'Niveau identique',
    title: '📊 Niveau identique',
    desc: 'Le véhicule doit être rendu avec exactement le même niveau de carburant qu’au départ.',
  },
];

const QUICK_TAGS = [
  'Non-fumeur 🚭',
  'Pas d’animaux 🐾',
  'Restitution propre ✨',
  'Permis de +3 ans requis 🪪',
  'Code de la route 🚗',
];

export const WizardStep4Conditions: React.FC<WizardStep4ConditionsProps> = ({
  data,
  onChange,
}) => {
  const [frauncesLoaded] = useFraunces({ Fraunces_600SemiBold });
  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const selectedAssurance = data.assurance || 'Locataire responsable';
  const selectedFuel = data.carburantCondition || 'Plein à plein';
  const currentRules = data.reglesSpecifiques || '';

  const addQuickRuleTag = (ruleTag: string) => {
    if (currentRules.includes(ruleTag)) return;
    const newRules = currentRules ? `${currentRules} · ${ruleTag}` : ruleTag;
    onChange({ reglesSpecifiques: newRules });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Editorial Hero Header */}
      <View style={styles.heroHeader}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.heroBadgeDot} />
          <Text style={styles.heroBadgeText}>ASSURANCE & CONDITIONS</Text>
        </View>
        <Text
          style={[
            styles.heroTitle,
            frauncesLoaded && { fontFamily: 'Fraunces_600SemiBold' },
          ]}
        >
          Protection & Consignes
        </Text>
        <Text style={styles.heroSubtitle}>
          Définissez la formule d’assurance et vos consignes de restitution du véhicule.
        </Text>
      </View>

      {/* SECTION 1: COUVERTURE D'ASSURANCE */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Shield size={18} color="#059669" />
          <Text style={styles.sectionTitleWithIcon}>Formule d’Assurance *</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Choisissez le niveau de responsabilité en cas de sinistre ou dommage.
        </Text>

        <View style={styles.optionsStack}>
          {INSURANCE_OPTIONS.map((opt) => {
            const isSelected = selectedAssurance === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.insuranceCard,
                  isSelected && styles.insuranceCardActive,
                ]}
                onPress={() => onChange({ assurance: opt.value })}
                activeOpacity={0.8}
              >
                <View style={styles.insuranceTopRow}>
                  <Text style={styles.insuranceTitle}>{opt.title}</Text>
                  <View
                    style={[
                      styles.badgePill,
                      isSelected && styles.badgePillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        isSelected && styles.badgeTextActive,
                      ]}
                    >
                      {opt.badge}
                    </Text>
                  </View>
                </View>

                <Text style={styles.insuranceDesc}>{opt.desc}</Text>

                {isSelected && (
                  <View style={styles.selectedRow}>
                    <CheckCircle2 size={16} color="#059669" />
                    <Text style={styles.selectedText}>Formule sélectionnée</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info Reassurance */}
        <View style={styles.infoBox}>
          <Sparkles size={16} color="#059669" style={{ marginTop: 2 }} />
          <Text style={styles.infoBoxText}>
            {selectedAssurance === 'Incluse (tous risques)'
              ? "En cas de sinistre, le locataire s'acquitte uniquement de la franchise assurance."
              : "En cas d'incident, un contrat de constat contradictoire est établi au départ et au retour."}
          </Text>
        </View>
      </View>

      {/* SECTION 2: POLITIQUE DE CARBURANT */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Fuel size={18} color="#0284C7" />
          <Text style={styles.sectionTitleWithIcon}>Politique de Carburant</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Condition exigée au locataire lors de la restitution.
        </Text>

        <View style={styles.optionsStack}>
          {FUEL_CONDITIONS.map((f) => {
            const isSelected = selectedFuel === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.fuelOptionCard,
                  isSelected && styles.fuelOptionCardActive,
                ]}
                onPress={() => onChange({ carburantCondition: f.value })}
                activeOpacity={0.8}
              >
                <View style={styles.radioRow}>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterActive,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.radioTextCol}>
                    <Text style={styles.radioLabel}>{f.title}</Text>
                    <Text style={styles.radioSub}>{f.desc}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* SECTION 3: RÈGLES SPÉCIFIQUES & CONSIGNES (OPTIONNEL) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <FileText size={18} color="#7C3AED" />
          <Text style={styles.sectionTitleWithIcon}>
            Consignes d’utilisation (optionnel)
          </Text>
        </View>
        <Text style={styles.sectionDesc}>
          Laissez vos instructions ou consignes particulières pour le locataire.
        </Text>

        <TextInput
          style={styles.textArea}
          multiline={true}
          numberOfLines={4}
          value={currentRules}
          onChangeText={(text) => onChange({ reglesSpecifiques: text })}
          placeholder="Ex: Voiture non-fumeur, merci de ne pas consommer de nourriture à l'intérieur..."
          placeholderTextColor="#94A3B8"
          textAlignVertical="top"
        />

        {/* Quick Tag Pills */}
        <Text style={styles.quickTagsTitle}>Ajouter une consigne rapide :</Text>
        <View style={styles.quickTagsRow}>
          {QUICK_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={styles.quickTagChip}
              onPress={() => addQuickRuleTag(tag)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickTagText}>+ {tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroHeader: {
    marginBottom: 4,
    gap: 6,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  heroBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#051B14',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    lineHeight: 20,
  },

  // Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  sectionTitleWithIcon: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginBottom: 12,
  },

  optionsStack: {
    gap: 10,
  },

  // Insurance Card
  insuranceCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  insuranceCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  insuranceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  insuranceTitle: {
    fontSize: 14.5,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
    flex: 1,
  },
  badgePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePillActive: {
    backgroundColor: '#DCFCE7',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748B',
  },
  badgeTextActive: {
    color: '#047857',
  },
  insuranceDesc: {
    fontSize: 12.5,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    lineHeight: 18,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  selectedText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#047857',
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#475569',
    lineHeight: 17,
  },

  // Fuel Cards
  fuelOptionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fuelOptionCardActive: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0284C7',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioOuterActive: {
    borderColor: '#0284C7',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0284C7',
  },
  radioTextCol: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#0F172A',
  },
  radioSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },

  // Rules Text Area
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#0F172A',
    minHeight: 90,
  },

  // Quick Tags
  quickTagsTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 6,
  },
  quickTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickTagChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickTagText: {
    fontSize: 11.5,
    fontFamily: 'Inter_600SemiBold',
    color: '#475569',
  },
});
