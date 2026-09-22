import React, { useMemo } from 'react';
import {
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
  Zap,
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
  onIncrement: () => void;
  onDecrement: () => void;
}> = ({ label, subLabel, value, min, max, unit, onIncrement, onDecrement }) => (
  <View style={styles.stepperCard}>
    <View style={styles.stepperTextCol}>
      <Text style={styles.stepperLabel}>{label}</Text>
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
        <Plus size={16} color="#4ADE80" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  </View>
);

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

const ESSENTIAL_EQUIPMENT_IDS = ['CLIMATISATION', 'BLUETOOTH', 'USB_CHARGER', 'ROUE_SECOURS'];

export const WizardStep2Specs: React.FC<WizardStep2SpecsProps> = ({ data, onChange }) => {
  const selectedCount = data.equipements.length;

  const areAllEssentialsSelected = useMemo(() => {
    return ESSENTIAL_EQUIPMENT_IDS.every((id) => data.equipements.includes(id));
  }, [data.equipements]);

  const toggleEssentials = () => {
    if (areAllEssentialsSelected) {
      onChange({
        equipements: data.equipements.filter((id) => !ESSENTIAL_EQUIPMENT_IDS.includes(id)),
      });
    } else {
      const merged = Array.from(new Set([...data.equipements, ...ESSENTIAL_EQUIPMENT_IDS]));
      onChange({ equipements: merged });
    }
  };

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

  // Pair up equipment items into pairs for flawless 2-column horizontal rows
  const equipmentPairs = useMemo(() => {
    const pairs: EquipmentOption[][] = [];
    for (let i = 0; i < EQUIPMENTS_LIST.length; i += 2) {
      pairs.push(EQUIPMENTS_LIST.slice(i, i + 2));
    }
    return pairs;
  }, []);

  return (
    <View style={styles.container}>
      {/* Hero Header d'étape Centré Luxury */}
      <View style={styles.centeredHeroHeader}>
        <View style={styles.centeredIconBadge}>
          <Sliders size={22} color="#4ADE80" strokeWidth={2.2} />
        </View>
        <Text style={styles.centeredHeroTitle}>Spécifications & Confort</Text>
        <Text style={styles.centeredHeroSubtitle}>
          Indiquez la capacité d'accueil et les équipements à bord
        </Text>
      </View>

      {/* Synthesis Pill */}
      <View style={styles.summaryCard}>
        <Sparkles size={16} color={COLORS.primaryDark} />
        <Text style={styles.summaryText} numberOfLines={1} ellipsizeMode="tail">{summaryText}</Text>
      </View>

      {/* Nombre de places */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelWithIcon}>
          <Users size={16} color="#059669" strokeWidth={2.2} />
          <Text style={styles.sectionLabel}>Capacité d'accueil</Text>
        </View>
        <StepperCounter
          label="Nombre de places"
          subLabel="Conducteur compris"
          value={data.nombrePlaces}
          min={1}
          max={50}
          unit="pl."
          onDecrement={() => onChange({ nombrePlaces: Math.max(1, data.nombrePlaces - 1) })}
          onIncrement={() => onChange({ nombrePlaces: Math.min(50, data.nombrePlaces + 1) })}
        />
      </View>

      {/* Conditions d'accès */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelWithIcon}>
          <ShieldCheck size={16} color="#059669" strokeWidth={2.2} />
          <Text style={styles.sectionLabel}>Conditions d'accès</Text>
        </View>
        <View style={{ gap: 10 }}>
          <StepperCounter
            label="Âge minimum conducteur"
            subLabel="Recommandé : 21 ans"
            value={data.ageMinimum}
            min={18}
            max={30}
            unit="ans"
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
            onDecrement={() => onChange({ joursMinimum: Math.max(1, data.joursMinimum - 1) })}
            onIncrement={() => onChange({ joursMinimum: Math.min(30, data.joursMinimum + 1) })}
          />
        </View>
      </View>

      {/* Équipements */}
      <View style={styles.fieldGroup}>
        <View style={styles.equipHeaderRow}>
          <View style={styles.labelWithIcon}>
            <Sliders size={16} color="#059669" strokeWidth={2.2} />
            <Text style={styles.sectionLabel}>Équipements & Confort</Text>
          </View>
          <Text style={styles.equipCountText}>{selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}</Text>
        </View>
        <Text style={styles.inputHelp}>Sélectionnez toutes les options présentes dans votre véhicule.</Text>

        {/* Quick Select Shortcut Bar */}
        <View style={styles.quickSelectBar}>
          <TouchableOpacity
            style={[
              styles.quickSelectBtn,
              areAllEssentialsSelected && styles.quickSelectBtnActive,
            ]}
            activeOpacity={0.8}
            onPress={toggleEssentials}
          >
            <Zap size={14} color={areAllEssentialsSelected ? '#4ADE80' : '#047857'} strokeWidth={2.5} />
            <Text
              style={[
                styles.quickSelectBtnText,
                areAllEssentialsSelected && styles.quickSelectBtnTextActive,
              ]}
            >
              {areAllEssentialsSelected ? 'Indispensables cochés' : 'Sélectionner les indispensables (Clim, Bluetooth, USB, Roue)'}
            </Text>
          </TouchableOpacity>

          {selectedCount > 0 && (
            <TouchableOpacity
              style={styles.clearSelectBtn}
              activeOpacity={0.7}
              onPress={() => onChange({ equipements: [] })}
            >
              <Text style={styles.clearSelectBtnText}>Tout effacer</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ gap: 10 }}>
          {equipmentPairs.map((pair, rowIndex) => (
            <View key={rowIndex} style={styles.cardRow2Col}>
              {pair.map((item) => {
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
                        <Icon size={18} color={isSelected ? '#4ADE80' : COLORS.inkSoft} />
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
          ))}
        </View>
      </View>
    </View>
  );
};

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, gap: 22 },

  centeredHeroHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    fontSize: 24,
    lineHeight: 30,
    color: '#041912',
    textAlign: 'center',
    letterSpacing: -0.4,
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

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 12.5,
    color: COLORS.primaryDark,
  },

  fieldGroup: { gap: 8 },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sectionLabel: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15.5,
    color: '#041912',
    letterSpacing: -0.3,
  },
  inputHelp: { fontFamily: theme.typography.fontFamily.regular, fontSize: 12, color: COLORS.muted, marginBottom: 4 },

  // Steppers
  stepperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stepperTextCol: { gap: 2, flex: 1 },
  stepperLabel: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
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
    backgroundColor: '#041912',
    borderColor: '#041912',
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
    fontFamily: theme.typography.fontFamily.displaySemiBold,
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
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  cardRow2Col: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  equipCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 12,
    minHeight: 104,
    justifyContent: 'space-between',
  },
  equipCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  equipCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  equipIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  equipIconBoxActive: {
    backgroundColor: '#041912',
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  equipCheckBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipLabel: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
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
  quickSelectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
    marginTop: 2,
  },
  quickSelectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  quickSelectBtnActive: {
    backgroundColor: '#041912',
    borderColor: '#041912',
  },
  quickSelectBtnText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 11.5,
    color: '#047857',
  },
  quickSelectBtnTextActive: {
    color: '#4ADE80',
  },
  clearSelectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clearSelectBtnText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#64748B',
  },
});
