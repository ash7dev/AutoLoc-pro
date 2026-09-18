import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {
  Shield,
  Fuel,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
    title: 'Locataire responsable',
    desc: 'Le locataire prend en charge les réparations en cas de sinistre.',
    badge: 'Standard',
  },
  {
    value: 'Incluse (tous risques)',
    title: 'Tous Risques Incluse',
    desc: 'Le véhicule dispose déjà d’une assurance Tous Risques pour la location.',
    badge: 'Tous Risques',
  },
];

const FUEL_CONDITIONS = [
  {
    value: 'Plein à plein',
    title: '⛽ Plein à plein',
    desc: 'Restitution avec le plein',
  },
  {
    value: 'Niveau identique',
    title: '📊 Niveau identique',
    desc: 'Restitution à niveau égal',
  },
];

const QUICK_TAGS = [
  'Non-fumeur 🚭',
  'Pas d’animaux 🐾',
  'Restitution propre ✨',
  'Permis +3 ans 🪪',
];

export const WizardStep4Conditions: React.FC<WizardStep4ConditionsProps> = ({
  data,
  onChange,
}) => {
  const selectedAssurance = data.assurance || 'Locataire responsable';
  const selectedFuel = data.carburantCondition || 'Plein à plein';
  const currentRules = data.reglesSpecifiques || '';

  const [rulesExpanded, setRulesExpanded] = useState(Boolean(currentRules));

  const toggleRules = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRulesExpanded((prev) => !prev);
  };

  const addQuickRuleTag = (ruleTag: string) => {
    if (currentRules.includes(ruleTag)) return;
    const newRules = currentRules ? `${currentRules} · ${ruleTag}` : ruleTag;
    onChange({ reglesSpecifiques: newRules });
  };

  return (
    <View style={styles.container}>
      {/* Hero Header d'étape Centré Luxury */}
      <View style={styles.centeredHeroHeader}>
        <View style={styles.centeredIconBadge}>
          <Shield size={22} color="#4ADE80" strokeWidth={2.2} />
        </View>
        <Text style={styles.centeredHeroTitle} numberOfLines={1} adjustsFontSizeToFit>
          Protection & Consignes
        </Text>
        <Text style={styles.centeredHeroSubtitle}>
          Assurance et consignes de restitution
        </Text>
      </View>

      {/* SECTION 1: COUVERTURE D'ASSURANCE */}
      <View style={styles.sectionCard}>
        <View style={styles.labelWithIcon}>
          <Shield size={16} color="#059669" strokeWidth={2.2} />
          <Text style={styles.sectionTitle}>Formule d’Assurance *</Text>
        </View>

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
                  <Text style={[styles.insuranceTitle, isSelected && styles.insuranceTitleActive]}>
                    {opt.title}
                  </Text>
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
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* SECTION 2: POLITIQUE DE CARBURANT */}
      <View style={styles.sectionCard}>
        <View style={styles.labelWithIcon}>
          <Fuel size={16} color="#059669" strokeWidth={2.2} />
          <Text style={styles.sectionTitle}>Politique de Carburant</Text>
        </View>

        <View style={styles.fuelGrid}>
          {FUEL_CONDITIONS.map((f) => {
            const isSelected = selectedFuel === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.fuelChipCard,
                  isSelected && styles.fuelChipCardActive,
                ]}
                onPress={() => onChange({ carburantCondition: f.value })}
                activeOpacity={0.8}
              >
                <Text style={[styles.fuelChipTitle, isSelected && styles.fuelChipTitleActive]}>
                  {f.title}
                </Text>
                <Text style={styles.fuelChipSub}>{f.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* SECTION 3: ACCORDÉON CONSIGNES SPÉCIFIQUES */}
      <View style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={toggleRules}
          activeOpacity={0.7}
        >
          <View style={styles.accordionLeft}>
            <FileText size={16} color="#059669" strokeWidth={2.2} />
            <Text style={styles.sectionTitle} numberOfLines={1}>
              Consignes d’utilisation
            </Text>
            <View style={styles.optionalPill}>
              <Text style={styles.optionalPillText}>Optionnel</Text>
            </View>
          </View>
          {rulesExpanded ? (
            <ChevronUp size={18} color="#059669" />
          ) : (
            <ChevronDown size={18} color="#64748B" />
          )}
        </TouchableOpacity>

        {rulesExpanded && (
          <View style={styles.accordionBody}>
            <TextInput
              style={styles.textArea}
              multiline={true}
              numberOfLines={3}
              value={currentRules}
              onChangeText={(text) => onChange({ reglesSpecifiques: text })}
              placeholder="Ex: Voiture non-fumeur, merci de ne pas manger à l'intérieur..."
              placeholderTextColor="#94A3B8"
              textAlignVertical="top"
            />

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
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    gap: 16,
  },

  centeredHeroHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  centeredIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#041912',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  centeredHeroTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 21.5,
    lineHeight: 28,
    color: '#041912',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  centeredHeroSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13.5,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 300,
  },

  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  // Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
    letterSpacing: -0.3,
  },

  optionsStack: {
    gap: 10,
  },

  // Insurance Card
  insuranceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  insuranceCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  insuranceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  insuranceTitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#0F172A',
    flex: 1,
  },
  insuranceTitleActive: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#047857',
  },
  badgePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgePillActive: {
    backgroundColor: '#041912',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#64748B',
  },
  badgeTextActive: {
    color: '#4ADE80',
    fontFamily: theme.typography.fontFamily.displaySemiBold,
  },
  insuranceDesc: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748B',
    lineHeight: 16,
  },

  // Fuel Grid (Side-by-side)
  fuelGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  fuelChipCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  fuelChipCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  fuelChipTitle: {
    fontSize: 13.5,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#0F172A',
    marginBottom: 2,
  },
  fuelChipTitleActive: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#047857',
  },
  fuelChipSub: {
    fontSize: 11.5,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748B',
  },

  // Accordion
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
    flexShrink: 1,
  },
  optionalPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  optionalPillText: {
    fontSize: 10.5,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#64748B',
  },
  accordionBody: {
    marginTop: 4,
    gap: 10,
  },

  // Rules Text Area
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 13.5,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#0F172A',
    minHeight: 80,
  },

  // Quick Tags
  quickTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickTagChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  quickTagText: {
    fontSize: 11.5,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#475569',
  },
});
