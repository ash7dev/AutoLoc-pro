import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera,
  Check,
  Disc,
  Gauge,
  Lock,
  Luggage,
  MapPin,
  Minus,
  Plus,
  Radio,
  ShieldCheck,
  Sliders,
  Snowflake,
  Sparkles,
  Sun,
  Usb,
  Users,
  Wifi,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface Step2Data {
  nombrePlaces: number; // Défaut: 5 (Min 1, Max 50)
  ageMinimum: number;   // Défaut: 21 (Min 18, Max 30)
  joursMinimum: number; // Défaut: 1 (Min 1, Max 30)
  equipements: string[];
}

interface WizardStep2SpecsProps {
  data: Step2Data;
  onChange: (partial: Partial<Step2Data>) => void;
}

export interface EquipmentOption {
  id: string;
  label: string;
  sub: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  tag?: string;
}

// ----------------------------------------------------------------------------
// Static data
// ----------------------------------------------------------------------------

export const EQUIPMENTS_LIST: EquipmentOption[] = [
  { id: 'CLIMATISATION', label: 'Climatisation', sub: 'Air conditionné A/C', icon: Snowflake, tag: 'Recommandé SN' },
  { id: 'BLUETOOTH', label: 'Bluetooth Audio', sub: 'Musique & mains libres', icon: Radio },
  { id: 'GPS', label: 'CarPlay / GPS', sub: 'Écran tactile & cartes', icon: MapPin },
  { id: 'CAMERA_RECUL', label: 'Caméra de recul', sub: 'Assistance stationnement', icon: Camera },
  { id: 'REGULATEUR_VITESSE', label: 'Régulateur', sub: 'Vitesse constante', icon: Gauge },
  { id: 'TOIT_OUVRANT', label: 'Toit ouvrant', sub: 'Panoramique / Électrique', icon: Sun },
  { id: 'SIEGE_ENFANT', label: 'Siège enfant', sub: 'Fixation Isofix / Bébé', icon: ShieldCheck },
  { id: 'COFFRE_GRAND', label: 'Grand coffre', sub: 'Volume supérieur à 400L', icon: Luggage },
  { id: 'RADAR_RECUL', label: 'Radars de recul', sub: 'Capteurs de proximité', icon: Wifi },
  { id: 'USB_CHARGER', label: 'Prises USB-C', sub: 'Chargeur à bord', icon: Usb },
  { id: 'ROUE_SECOURS', label: 'Roue de secours', sub: 'Cric & clé démontage', icon: Disc, tag: 'Utile Pistes' },
  { id: 'ALARME', label: 'Alarme & Anti-vol', sub: 'Centralisation à distance', icon: Lock },
];

const COLORS = {
  primary: '#059669',
  primaryDark: '#047857',
  primarySoft: '#ECFDF5',
  primaryBorder: '#A7F3D0',
  ink: '#0F172A',
  inkSoft: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  white: '#FFFFFF',
};

// ----------------------------------------------------------------------------
// Stepper Counter Primitive
// ----------------------------------------------------------------------------

const StepperCounter: React.FC<{
  label: string;
  subLabel?: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  icon?: React.ReactNode;
  onIncrement: () => void;
  onDecrement: () => void;
}> = ({ label, subLabel, value, min, max, unit, icon, onIncrement, onDecrement }) => (
  <View style={styles.stepperCard}>
    <View style={styles.stepperTextCol}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon}
        <Text style={styles.stepperLabel}>{label}</Text>
      </View>
      {Boolean(subLabel) && <Text style={styles.stepperSub}>{subLabel}</Text>}
    </View>

    <View style={styles.stepperControls}>
      <TouchableOpacity
        style={[styles.stepperBtn, value <= min && styles.stepperBtnDisabled]}
        disabled={value <= min}
        onPress={onDecrement}
        activeOpacity={0.7}
      >
        <Minus size={16} color={value <= min ? '#CBD5E1' : COLORS.ink} strokeWidth={2.5} />
      </TouchableOpacity>

      <View style={styles.stepperValueBox}>
        <Text style={styles.stepperValueText}>{value}</Text>
        <Text style={styles.stepperUnitText}>{unit}</Text>
      </View>

      <TouchableOpacity
        style={[styles.stepperBtn, styles.stepperBtnActive, value >= max && styles.stepperBtnDisabled]}
        disabled={value >= max}
        onPress={onIncrement}
        activeOpacity={0.7}
      >
        <Plus size={16} color={COLORS.white} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  </View>
);

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export const WizardStep2Specs: React.FC<WizardStep2SpecsProps> = ({ data, onChange }) => {
  const selectedCount = data.equipements.length;

  const toggleEquipement = (id: string) => {
    const exists = data.equipements.includes(id);
    if (exists) {
      onChange({ equipements: data.equipements.filter((e) => e !== id) });
    } else {
      onChange({ equipements: [...data.equipements, id] });
    }
  };

  const summaryText = useMemo(() => {
    const parts = [
      `${data.nombrePlaces} places`,
      `Conducteur ${data.ageMinimum}+ ans`,
      `Min. ${data.joursMinimum} j.`,
      `${selectedCount} équipement${selectedCount > 1 ? 's' : ''}`,
    ];
    return parts.join(' · ');
  }, [data, selectedCount]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Hero Header */}
      <View style={styles.heroHeader}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.heroBadge}>
            <Sliders size={13} color={COLORS.primaryDark} />
            <Text style={styles.heroBadgeText}>Étape 02 · Spécifications & Équipements</Text>
          </View>
          <View style={styles.completionPill}>
            <Text style={styles.completionText}>{selectedCount} options</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>Capacité et équipements à bord</Text>
        <Text style={styles.heroSubtitle}>
          Indiquez le nombre de places et sélectionnez les options de confort présentes dans le véhicule.
        </Text>
      </View>

      {/* Synthesis Pill */}
      <View style={styles.summaryCard}>
        <Sparkles size={16} color={COLORS.primaryDark} />
        <Text style={styles.summaryText}>{summaryText}</Text>
      </View>

      {/* Nombre de places */}
      <View style={styles.fieldGroup}>
        <Text style={styles.sectionLabel}>Capacité d'accueil</Text>
        <StepperCounter
          label="Nombre de places"
          subLabel="Conducteur compris"
          value={data.nombrePlaces}
          min={1}
          max={50}
          unit="pl."
          icon={<Users size={18} color={COLORS.primaryDark} />}
          onDecrement={() => onChange({ nombrePlaces: Math.max(1, data.nombrePlaces - 1) })}
          onIncrement={() => onChange({ nombrePlaces: Math.min(50, data.nombrePlaces + 1) })}
        />
      </View>

      {/* Conditions d'accès */}
      <View style={styles.fieldGroup}>
        <Text style={styles.sectionLabel}>Conditions d'accès</Text>
        <View style={{ gap: 10 }}>
          <StepperCounter
            label="Âge minimum conducteur"
            subLabel="Recommandé : 21 ans"
            value={data.ageMinimum}
            min={18}
            max={30}
            unit="ans"
            icon={<ShieldCheck size={18} color={COLORS.primaryDark} />}
            onDecrement={() => onChange({ ageMinimum: Math.max(18, data.ageMinimum - 1) })}
            onIncrement={() => onChange({ ageMinimum: Math.min(30, data.ageMinimum + 1) })}
          />

          <StepperCounter
            label="Durée minimum de location"
            subLabel="Nombre de jours requis"
            value={data.joursMinimum}
            min={1}
            max={30}
            unit="j."
            icon={<Gauge size={18} color={COLORS.primaryDark} />}
            onDecrement={() => onChange({ joursMinimum: Math.max(1, data.joursMinimum - 1) })}
            onIncrement={() => onChange({ joursMinimum: Math.min(30, data.joursMinimum + 1) })}
          />
        </View>
      </View>

      {/* Équipements */}
      <View style={styles.fieldGroup}>
        <View style={styles.equipHeaderRow}>
          <Text style={styles.sectionLabel}>Équipements & Confort</Text>
          <Text style={styles.equipCountText}>{selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}</Text>
        </View>
        <Text style={styles.inputHelp}>Sélectionnez toutes les options présentes dans votre véhicule.</Text>

        <View style={styles.equipGrid}>
          {EQUIPMENTS_LIST.map((item) => {
            const isSelected = data.equipements.includes(item.id);
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.equipCard, isSelected && styles.equipCardActive]}
                activeOpacity={0.8}
                onPress={() => toggleEquipement(item.id)}
              >
                <View style={styles.equipCardHeader}>
                  <View style={[styles.equipIconBox, isSelected && styles.equipIconBoxActive]}>
                    <Icon size={18} color={isSelected ? COLORS.white : COLORS.inkSoft} />
                  </View>
                  {isSelected && (
                    <View style={styles.equipCheckBadge}>
                      <Check size={10} color={COLORS.white} strokeWidth={3} />
                    </View>
                  )}
                </View>

                <View style={{ gap: 2 }}>
                  <Text style={[styles.equipLabel, isSelected && styles.equipLabelActive]} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={styles.equipSub} numberOfLines={1}>
                    {item.sub}
                  </Text>
                </View>

                {Boolean(item.tag) && (
                  <View style={[styles.equipTag, isSelected && styles.equipTagActive]}>
                    <Text style={[styles.equipTagText, isSelected && styles.equipTagTextActive]}>{item.tag}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: 20, paddingBottom: 40, gap: 22 },

  heroHeader: { gap: 8, marginBottom: 4 },
  heroBadgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: COLORS.primaryDark,
    letterSpacing: 0.2,
  },
  completionPill: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  completionText: { fontFamily: theme.typography.fontFamily.bold, fontSize: 11, color: COLORS.muted },
  heroTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 22,
    color: COLORS.ink,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13.5,
    color: COLORS.muted,
    lineHeight: 19,
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  summaryText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: COLORS.primaryDark,
  },

  fieldGroup: { gap: 8 },
  sectionLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  inputHelp: { fontFamily: theme.typography.fontFamily.regular, fontSize: 12, color: COLORS.muted, marginBottom: 4 },

  // Steppers
  stepperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stepperTextCol: { gap: 2, flex: 1 },
  stepperLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: COLORS.ink,
  },
  stepperSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: COLORS.muted,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepperBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
  },
  stepperValueBox: {
    alignItems: 'center',
    minWidth: 44,
  },
  stepperValueText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
    color: COLORS.ink,
  },
  stepperUnitText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10.5,
    color: COLORS.muted,
  },

  // Equipment Grid
  equipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  equipCountText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11.5,
    color: COLORS.primaryDark,
  },
  equipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  equipCard: {
    width: '48.5%',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 12,
    minHeight: 104,
    justifyContent: 'space-between',
  },
  equipCardActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primaryBorder,
  },
  equipCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  equipIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  equipIconBoxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  equipCheckBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: COLORS.ink,
  },
  equipLabelActive: {
    color: COLORS.primaryDark,
  },
  equipSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: COLORS.muted,
  },
  equipTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  equipTagActive: {
    backgroundColor: '#A7F3D0',
  },
  equipTagText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: COLORS.inkSoft,
  },
  equipTagTextActive: {
    color: COLORS.primaryDark,
  },
});
