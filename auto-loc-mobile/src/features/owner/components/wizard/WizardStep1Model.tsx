import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BatteryCharging,
  Calendar,
  Car,
  Check,
  ChevronRight,
  Droplets,
  FileText,
  Fuel,
  Gauge,
  Plus,
  Search,
  Shield,
  Sliders,
  Sparkles,
  Truck,
  Users,
  X,
  Zap,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { POPULAR_MAKES_2026, VEHICLE_CATALOG, VEHICLE_TYPES, detectCategoryFromModel } from '../vehicleCatalog';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface Step1Data {
  marque: string;
  modele: string;
  annee: number;
  type: string;
  transmission: 'AUTOMATIQUE' | 'MANUELLE';
  carburant: 'ESSENCE' | 'DIESEL' | 'HYBRIDE' | 'ELECTRIQUE';
  immatriculation: string;
}

interface WizardStep1ModelProps {
  data: Step1Data;
  onChange: (partial: Partial<Step1Data>) => void;
}

// ----------------------------------------------------------------------------
// Static data
// ----------------------------------------------------------------------------

const YEARS = Array.from({ length: 17 }, (_, i) => 2026 - i);
const ALL_MAKES = Object.keys(VEHICLE_CATALOG).sort();
const ALPHABET = Array.from(new Set(ALL_MAKES.map((m) => m[0].toUpperCase()))).sort();

const TRANSMISSIONS: {
  id: Step1Data['transmission'];
  label: string;
  sub: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}[] = [
  { id: 'AUTOMATIQUE', label: 'Automatique', sub: 'Auto / Séquentielle', icon: Gauge },
  { id: 'MANUELLE', label: 'Manuelle', sub: 'Boîte mécanique', icon: Sliders },
];

const FUELS: {
  id: Step1Data['carburant'];
  label: string;
  sub: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}[] = [
  { id: 'ESSENCE', label: 'Essence', sub: 'Super / SP95-98', icon: Fuel },
  { id: 'DIESEL', label: 'Diesel', sub: 'Gazole / HVO', icon: Droplets },
  { id: 'HYBRIDE', label: 'Hybride', sub: 'Essence + Électrique', icon: BatteryCharging },
  { id: 'ELECTRIQUE', label: 'Électrique', sub: '100% EV', icon: Zap },
];

const TYPE_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  CITADINE: Car,
  BERLINE: Car,
  SUV: Shield,
  FOUR_X_FOUR: Shield,
  PICKUP: Truck,
  MINIVAN: Users,
  LUXE: Sparkles,
  UTILITAIRE: Truck,
};

// Plate format used on Senegalese cartes grises: DK-1234-BA
const PLATE_REGEX = /^[A-Z]{2}-\d{4}-[A-Z]{2}$/;

function formatPlate(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const letters1 = clean.slice(0, 2).replace(/[0-9]/g, '');
  const digits = clean.slice(letters1.length, letters1.length + 4).replace(/[^0-9]/g, '');
  const rest = clean.slice(letters1.length + digits.length);
  const letters2 = rest.slice(0, 2).replace(/[0-9]/g, '');

  let out = letters1;
  if (digits.length) out += (out.length ? '-' : '') + digits;
  if (letters2.length) out += (out.length ? '-' : '') + letters2;
  return out;
}

// Extension point: wire up expo-haptics (or your preferred haptics lib) here.
// Left as a no-op so this file has zero new dependencies out of the box.
function triggerHaptic() { }

// ----------------------------------------------------------------------------
// Small reusable primitives
// ----------------------------------------------------------------------------

/** Press-scale wrapper used everywhere a chip/card/row is tappable. */
const Pressy: React.FC<{
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  children: React.ReactNode;
}> = ({ onPress, disabled, style, children }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={disabled}
      style={style}
      onPress={() => {
        triggerHaptic();
        onPress();
      }}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style?.flex ? { flex: style.flex } : { width: '100%' }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

/** Small circular checkmark badge that pops in — used to show a field is complete. */
const DoneBadge: React.FC = () => (
  <View style={styles.doneBadge}>
    <Check size={11} color="#FFFFFF" strokeWidth={3} />
  </View>
);

/** A tappable row that opens a selection sheet (Marque / Modèle / Année). */
const FieldRow: React.FC<{
  icon?: React.ReactNode;
  placeholder: string;
  value?: string;
  disabled?: boolean;
  onPress: () => void;
}> = ({ icon, placeholder, value, disabled, onPress }) => (
  <Pressy onPress={onPress} disabled={disabled}>
    <View
      style={[
        styles.selectTrigger,
        Boolean(value) && styles.selectTriggerActive,
        disabled && styles.selectTriggerDisabled,
      ]}
    >
      <View style={styles.selectTriggerLeft}>
        {icon}
        <Text
          numberOfLines={1}
          style={[
            styles.selectTriggerText,
            value ? styles.selectTriggerTextSelected : styles.selectTriggerTextPlaceholder,
          ]}
        >
          {value || placeholder}
        </Text>
      </View>
      <View style={styles.selectTriggerRight}>
        {Boolean(value) && <DoneBadge />}
        <ChevronRight size={17} color={value ? COLORS.primaryDark : COLORS.muted} />
      </View>
    </View>
  </Pressy>
);

// ----------------------------------------------------------------------------
// Palette (kept local so this file stays a drop-in replacement)
// ----------------------------------------------------------------------------

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
  danger: '#DC2626',
};

// ----------------------------------------------------------------------------
// Main component
// ----------------------------------------------------------------------------

export const WizardStep1Model: React.FC<WizardStep1ModelProps> = ({ data, onChange }) => {
  const [marqueSheetOpen, setMarqueSheetOpen] = useState(false);
  const [modeleSheetOpen, setModeleSheetOpen] = useState(false);
  const [anneeSheetOpen, setAnneeSheetOpen] = useState(false);
  const [categorieSheetOpen, setCategorieSheetOpen] = useState(false);

  const [marqueSearch, setMarqueSearch] = useState('');
  const [modeleSearch, setModeleSearch] = useState('');
  const [customMarqueInput, setCustomMarqueInput] = useState('');
  const [customModeleInput, setCustomModeleInput] = useState('');

  const sectionListRef = useRef<SectionList>(null);

  const availableModels = useMemo(
    () => (data.marque && VEHICLE_CATALOG[data.marque]) || [],
    [data.marque]
  );

  const filteredModels = useMemo(() => {
    if (!modeleSearch.trim()) return availableModels;
    const q = modeleSearch.toLowerCase();
    return availableModels.filter((m) => m.toLowerCase().includes(q));
  }, [availableModels, modeleSearch]);

  const marqueSections = useMemo(() => {
    const q = marqueSearch.trim().toLowerCase();
    const source = q ? ALL_MAKES.filter((m) => m.toLowerCase().includes(q)) : ALL_MAKES;
    const byLetter: Record<string, string[]> = {};
    source.forEach((make) => {
      const letter = make[0].toUpperCase();
      if (!byLetter[letter]) byLetter[letter] = [];
      byLetter[letter].push(make);
    });
    return Object.keys(byLetter)
      .sort()
      .map((letter) => ({ title: letter, data: byLetter[letter] }));
  }, [marqueSearch]);

  const completedCount = useMemo(() => {
    return [
      data.marque,
      data.modele,
      Boolean(data.annee),
      data.type,
      data.transmission,
      data.carburant,
      PLATE_REGEX.test(data.immatriculation || ''),
    ].filter(Boolean).length;
  }, [data]);

  const handleSelectMarque = (make: string) => {
    onChange({ marque: make, modele: '' });
    setMarqueSheetOpen(false);
    setMarqueSearch('');
  };

  const handleSelectModele = (model: string) => {
    const suggestedType = detectCategoryFromModel(data.marque, model);
    onChange({
      modele: model,
      ...(suggestedType ? { type: suggestedType } : {}),
    });
    setModeleSheetOpen(false);
    setModeleSearch('');
  };

  const handleCustomMarqueSubmit = () => {
    const value = (customMarqueInput || marqueSearch).trim();
    if (!value) return;
    onChange({ marque: value, modele: '' });
    setCustomMarqueInput('');
    setMarqueSheetOpen(false);
    setMarqueSearch('');
  };

  const handleCustomModeleSubmit = () => {
    if (!customModeleInput.trim()) return;
    const model = customModeleInput.trim();
    const suggestedType = detectCategoryFromModel(data.marque, model);
    onChange({
      modele: model,
      ...(suggestedType ? { type: suggestedType } : {}),
    });
    setCustomModeleInput('');
    setModeleSheetOpen(false);
  };

  const plateValid = PLATE_REGEX.test(data.immatriculation || '');

  return (
    <View style={styles.content}>
      {/* Hero Header d'étape Centré Luxury (Style Airbnb / Revolut) */}
      <View style={styles.centeredHeroHeader}>
        <View style={styles.centeredIconBadge}>
          <Car size={22} color="#4ADE80" strokeWidth={2.2} />
        </View>
        <Text style={styles.centeredHeroTitle}>Votre véhicule</Text>
        <Text style={styles.centeredHeroSubtitle}>
          Indiquez la marque, le modèle et l'immatriculation
        </Text>
      </View>

      {/* Aperçu en direct, une fois marque + modèle connus */}
      {Boolean(data.marque && data.modele) && (
        <View style={styles.previewCard}>
          <View style={styles.previewIconBox}>
            <Car size={20} color={COLORS.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.previewTitle} numberOfLines={1}>
              {data.annee ? `${data.annee} · ` : ''}
              {data.marque} {data.modele}
            </Text>
            <Text style={styles.previewSubtitle} numberOfLines={1}>
              {[
                data.transmission === 'AUTOMATIQUE' ? 'Automatique' : data.transmission === 'MANUELLE' ? 'Manuelle' : null,
                FUELS.find((f) => f.id === data.carburant)?.label,
                VEHICLE_TYPES.find((t) => t.id === data.type)?.label,
              ]
                .filter(Boolean)
                .join(' · ') || 'Complétez les détails ci-dessous'}
            </Text>
          </View>
        </View>
      )}

      {/* Marque */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelWithIcon}>
          <Car size={16} color="#059669" strokeWidth={2.2} />
          <Text style={styles.label}>Marque</Text>
        </View>
        <FieldRow
          icon={<Car size={18} color={data.marque ? COLORS.primaryDark : COLORS.faint} />}
          placeholder="Toyota, Jetour, Mazda…"
          value={data.marque}
          onPress={() => setMarqueSheetOpen(true)}
        />
      </View>

      {/* Modèle */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelWithIcon}>
          <Sliders size={16} color="#059669" strokeWidth={2.2} />
          <Text style={styles.label}>Modèle</Text>
        </View>
        <FieldRow
          placeholder={data.marque ? `Un modèle ${data.marque}…` : "Choisissez d'abord une marque"}
          value={data.modele}
          disabled={!data.marque}
          onPress={() => (data.marque ? setModeleSheetOpen(true) : setMarqueSheetOpen(true))}
        />
      </View>

      {/* Année */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelWithIcon}>
          <Calendar size={16} color="#059669" strokeWidth={2.2} />
          <Text style={styles.label}>Année de mise en circulation</Text>
        </View>
        <FieldRow
          icon={<Gauge size={18} color={data.annee ? COLORS.primaryDark : COLORS.faint} />}
          placeholder="Sélectionner l'année"
          value={data.annee ? String(data.annee) : ''}
          onPress={() => setAnneeSheetOpen(true)}
        />
      </View>

      {/* Type de véhicule / Catégorie */}
      <View style={styles.fieldGroup}>
        <View style={styles.categoryHeaderRow}>
          <View style={styles.labelWithIcon}>
            <Shield size={16} color="#059669" strokeWidth={2.2} />
            <Text style={styles.label}>Catégorie du véhicule</Text>
          </View>
          {Boolean(data.type && data.modele) && (
            <View style={styles.autoSuggestBadge}>
              <Sparkles size={11} color={COLORS.primaryDark} />
              <Text style={styles.autoSuggestBadgeText}>Détecté auto</Text>
            </View>
          )}
        </View>
        <FieldRow
          icon={<Shield size={18} color={data.type ? COLORS.primaryDark : COLORS.faint} />}
          placeholder="Sélectionner la catégorie"
          value={VEHICLE_TYPES.find((t) => t.id === data.type)?.label}
          onPress={() => setCategorieSheetOpen(true)}
        />
      </View>

      {/* Transmission */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelWithIcon}>
          <Gauge size={16} color="#059669" strokeWidth={2.2} />
          <Text style={styles.label}>Transmission</Text>
        </View>
        <View style={styles.cardRow2Col}>
          {TRANSMISSIONS.map((tr) => {
            const isSelected = data.transmission === tr.id;
            const Icon = tr.icon;
            return (
              <Pressy key={tr.id} onPress={() => onChange({ transmission: tr.id })} style={{ flex: 1 }}>
                <View style={[styles.selectCard, isSelected && styles.selectCardActive]}>
                  <View style={styles.selectCardHeader}>
                    <View style={[styles.selectCardIconBox, isSelected && styles.selectCardIconBoxActive]}>
                      <Icon size={18} color={isSelected ? '#4ADE80' : COLORS.inkSoft} />
                    </View>
                    {isSelected && (
                      <View style={styles.selectCardCheck}>
                        <Check size={10} color={COLORS.white} strokeWidth={3} />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.selectCardTitle, isSelected && styles.selectCardTitleActive]} numberOfLines={1}>
                    {tr.label}
                  </Text>
                  <Text style={styles.selectCardSub} numberOfLines={1}>
                    {tr.sub}
                  </Text>
                </View>
              </Pressy>
            );
          })}
        </View>
      </View>

      {/* Carburant */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelWithIcon}>
          <Fuel size={16} color="#059669" strokeWidth={2.2} />
          <Text style={styles.label}>Carburant</Text>
        </View>
        <View style={{ gap: 10 }}>
          <View style={styles.cardRow2Col}>
            {FUELS.slice(0, 2).map((f) => {
              const isSelected = data.carburant === f.id;
              const Icon = f.icon;
              return (
                <Pressy key={f.id} onPress={() => onChange({ carburant: f.id })} style={{ flex: 1 }}>
                  <View style={[styles.selectCard, isSelected && styles.selectCardActive]}>
                    <View style={styles.selectCardHeader}>
                      <View style={[styles.selectCardIconBox, isSelected && styles.selectCardIconBoxActive]}>
                        <Icon size={18} color={isSelected ? '#4ADE80' : COLORS.inkSoft} />
                      </View>
                      {isSelected && (
                        <View style={styles.selectCardCheck}>
                          <Check size={10} color={COLORS.white} strokeWidth={3} />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.selectCardTitle, isSelected && styles.selectCardTitleActive]} numberOfLines={1}>
                      {f.label}
                    </Text>
                    <Text style={styles.selectCardSub} numberOfLines={1}>
                      {f.sub}
                    </Text>
                  </View>
                </Pressy>
              );
            })}
          </View>
          <View style={styles.cardRow2Col}>
            {FUELS.slice(2, 4).map((f) => {
              const isSelected = data.carburant === f.id;
              const Icon = f.icon;
              return (
                <Pressy key={f.id} onPress={() => onChange({ carburant: f.id })} style={{ flex: 1 }}>
                  <View style={[styles.selectCard, isSelected && styles.selectCardActive]}>
                    <View style={styles.selectCardHeader}>
                      <View style={[styles.selectCardIconBox, isSelected && styles.selectCardIconBoxActive]}>
                        <Icon size={18} color={isSelected ? '#4ADE80' : COLORS.inkSoft} />
                      </View>
                      {isSelected && (
                        <View style={styles.selectCardCheck}>
                          <Check size={10} color={COLORS.white} strokeWidth={3} />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.selectCardTitle, isSelected && styles.selectCardTitleActive]} numberOfLines={1}>
                      {f.label}
                    </Text>
                    <Text style={styles.selectCardSub} numberOfLines={1}>
                      {f.sub}
                    </Text>
                  </View>
                </Pressy>
              );
            })}
          </View>
        </View>
      </View>

      {/* Immatriculation */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <View style={styles.labelWithIcon}>
            <FileText size={16} color="#059669" strokeWidth={2.2} />
            <Text style={styles.label}>Immatriculation</Text>
          </View>
          <Text style={styles.inputHelp}>Format : DK-1234-BA</Text>
        </View>
        <View style={[styles.senegalPlateContainer, plateValid && styles.senegalPlateValid]}>
          <View style={styles.plateFlagBand}>
            <Text style={styles.plateCountryCode}>SN</Text>
            <View style={styles.snStar} />
          </View>
          <TextInput
            style={styles.senegalPlateInput}
            placeholder="DK-0000-AA"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
            maxLength={10}
            value={data.immatriculation}
            onChangeText={(text) => onChange({ immatriculation: formatPlate(text) })}
          />
          {plateValid && (
            <View style={styles.plateCheckBadge}>
              <Check size={13} color={COLORS.white} strokeWidth={3} />
            </View>
          )}
        </View>
      </View>

      {/* ---------------------------------------------------------------- */}
      {/* SHEET — Marque                                                    */}
      {/* ---------------------------------------------------------------- */}
      <Modal
        visible={marqueSheetOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setMarqueSheetOpen(false)}
      >
        <SafeAreaView style={styles.sheetSafeArea}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Marque du véhicule</Text>
            <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setMarqueSheetOpen(false)}>
              <X size={19} color={COLORS.ink} />
            </TouchableOpacity>
          </View>

          <View style={styles.sheetSearchPad}>
            <View style={styles.searchBox}>
              <Search size={16} color={COLORS.faint} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une marque…"
                placeholderTextColor={COLORS.faint}
                value={marqueSearch}
                onChangeText={setMarqueSearch}
                autoFocus
              />
              {marqueSearch.length > 0 && (
                <TouchableOpacity onPress={() => setMarqueSearch('')}>
                  <X size={16} color={COLORS.faint} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {!marqueSearch.trim() && (
            <View style={styles.popularSection}>
              <Text style={styles.popularTitle}>Marques populaires</Text>
              <View style={styles.popularGrid}>
                {POPULAR_MAKES_2026.slice(0, 10).map((make) => {
                  const isSelected = data.marque === make;
                  return (
                    <Pressy key={make} onPress={() => handleSelectMarque(make)}>
                      <View style={[styles.popularChip, isSelected && styles.popularChipActive]}>
                        <Text style={[styles.popularChipText, isSelected && styles.popularChipTextActive]}>
                          {make}
                        </Text>
                      </View>
                    </Pressy>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.sheetListRow}>
            <SectionList
              ref={sectionListRef}
              style={{ flex: 1 }}
              sections={marqueSections}
              keyExtractor={(item) => item}
              stickySectionHeadersEnabled
              contentContainerStyle={styles.sheetListContent}
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderText}>{section.title}</Text>
                </View>
              )}
              renderItem={({ item }) => {
                const isSelected = data.marque === item;
                return (
                  <TouchableOpacity
                    style={[styles.sheetItemRow, isSelected && styles.sheetItemRowActive]}
                    onPress={() => handleSelectMarque(item)}
                  >
                    <Text style={[styles.sheetItemText, isSelected && styles.sheetItemTextActive]}>{item}</Text>
                    {isSelected && <Check size={18} color={COLORS.primaryDark} />}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.sheetEmptyBox}>
                  <Text style={styles.sheetEmptyText}>Aucune marque pour « {marqueSearch} »</Text>
                  <View style={styles.customAddContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Saisir la marque…"
                      placeholderTextColor={COLORS.faint}
                      value={customMarqueInput || marqueSearch}
                      onChangeText={setCustomMarqueInput}
                    />
                    <TouchableOpacity style={styles.customSubmitBtn} onPress={handleCustomMarqueSubmit}>
                      <Plus size={16} color={COLORS.white} />
                      <Text style={styles.customSubmitText}>Utiliser cette marque</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              }
            />

            {!marqueSearch.trim() && marqueSections.length > 3 && (
              <View style={styles.alphaIndex}>
                {ALPHABET.map((letter) => (
                  <TouchableOpacity
                    key={letter}
                    hitSlop={{ top: 3, bottom: 3, left: 6, right: 6 }}
                    onPress={() => {
                      const index = marqueSections.findIndex((s) => s.title === letter);
                      if (index >= 0) {
                        sectionListRef.current?.scrollToLocation({
                          sectionIndex: index,
                          itemIndex: 0,
                          viewOffset: 0,
                          animated: true,
                        });
                      }
                    }}
                  >
                    <Text style={styles.alphaIndexLetter}>{letter}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* ---------------------------------------------------------------- */}
      {/* SHEET — Modèle                                                    */}
      {/* ---------------------------------------------------------------- */}
      <Modal
        visible={modeleSheetOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModeleSheetOpen(false)}
      >
        <SafeAreaView style={styles.sheetSafeArea}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Modèle</Text>
              <Text style={styles.sheetSubtitle}>{data.marque}</Text>
            </View>
            <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setModeleSheetOpen(false)}>
              <X size={19} color={COLORS.ink} />
            </TouchableOpacity>
          </View>

          <View style={styles.sheetSearchPad}>
            <View style={styles.searchBox}>
              <Search size={16} color={COLORS.faint} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Rechercher un modèle ${data.marque}…`}
                placeholderTextColor={COLORS.faint}
                value={modeleSearch}
                onChangeText={setModeleSearch}
                autoFocus
              />
              {modeleSearch.length > 0 && (
                <TouchableOpacity onPress={() => setModeleSearch('')}>
                  <X size={16} color={COLORS.faint} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <FlatList
            data={filteredModels}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.sheetListContent}
            renderItem={({ item }) => {
              const isSelected = data.modele === item;
              return (
                <TouchableOpacity
                  style={[styles.sheetItemRow, isSelected && styles.sheetItemRowActive]}
                  onPress={() => handleSelectModele(item)}
                >
                  <Text style={[styles.sheetItemText, isSelected && styles.sheetItemTextActive]}>{item}</Text>
                  {isSelected && <Check size={18} color={COLORS.primaryDark} />}
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={
              <View style={styles.customAddFooter}>
                <Text style={styles.customFooterTitle}>Modèle non listé ?</Text>
                <View style={styles.customAddRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Saisir un autre modèle…"
                    placeholderTextColor={COLORS.faint}
                    value={customModeleInput}
                    onChangeText={setCustomModeleInput}
                  />
                  <TouchableOpacity style={styles.customSubmitBtn} onPress={handleCustomModeleSubmit}>
                    <Text style={styles.customSubmitText}>Valider</Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* ---------------------------------------------------------------- */}
      {/* SHEET — Année                                                     */}
      {/* ---------------------------------------------------------------- */}
      <Modal
        visible={anneeSheetOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAnneeSheetOpen(false)}
      >
        <SafeAreaView style={styles.sheetSafeArea}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Année de mise en circulation</Text>
            <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setAnneeSheetOpen(false)}>
              <X size={19} color={COLORS.ink} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={YEARS}
            keyExtractor={(item) => String(item)}
            contentContainerStyle={styles.sheetListContent}
            renderItem={({ item }) => {
              const isSelected = data.annee === item;
              return (
                <TouchableOpacity
                  style={[styles.sheetItemRow, isSelected && styles.sheetItemRowActive]}
                  onPress={() => {
                    onChange({ annee: item });
                    setAnneeSheetOpen(false);
                  }}
                >
                  <Text style={[styles.sheetItemText, isSelected && styles.sheetItemTextActive]}>{item}</Text>
                  {isSelected && <Check size={18} color={COLORS.primaryDark} />}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* ---------------------------------------------------------------- */}
      {/* SHEET — Catégorie                                                */}
      {/* ---------------------------------------------------------------- */}
      <Modal
        visible={categorieSheetOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCategorieSheetOpen(false)}
      >
        <SafeAreaView style={styles.sheetSafeArea}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Catégorie du véhicule</Text>
              <Text style={styles.sheetSubtitle}>Sélectionnez le type qui correspond à votre véhicule</Text>
            </View>
            <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setCategorieSheetOpen(false)}>
              <X size={19} color={COLORS.ink} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={VEHICLE_TYPES}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.sheetListContent}
            renderItem={({ item }) => {
              const isSelected = data.type === item.id;
              const Icon = TYPE_ICONS[item.id] || Car;
              return (
                <TouchableOpacity
                  style={[styles.sheetCategoryRow, isSelected && styles.sheetItemRowActive]}
                  onPress={() => {
                    onChange({ type: item.id });
                    setCategorieSheetOpen(false);
                  }}
                >
                  <View style={styles.sheetCategoryLeft}>
                    <View style={[styles.sheetCategoryIconBox, isSelected && styles.sheetCategoryIconBoxActive]}>
                      <Icon size={20} color={isSelected ? COLORS.white : COLORS.inkSoft} />
                    </View>
                    <View style={styles.sheetCategoryTextCol}>
                      <Text style={[styles.sheetItemText, isSelected && styles.sheetItemTextActive]}>
                        {item.label}
                      </Text>
                      <Text style={styles.sheetCategoryTagline}>{item.tagline}</Text>
                    </View>
                  </View>
                  {isSelected && <Check size={18} color={COLORS.primaryDark} strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: 20, paddingBottom: 40, gap: 22 },

  heroHeader: {
    gap: 8,
    marginBottom: 4,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  centeredHeroHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    maxWidth: 280,
  },

  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  previewIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14.5,
    color: COLORS.primaryDark,
  },
  previewSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: COLORS.inkSoft,
    marginTop: 2,
  },

  fieldGroup: { gap: 8 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  label: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15.5,
    color: '#041912',
    letterSpacing: -0.3,
  },

  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 54,
  },
  selectTriggerActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  selectTriggerDisabled: { opacity: 0.6, backgroundColor: '#F1F5F9' },
  selectTriggerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  selectTriggerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectTriggerText: { fontFamily: theme.typography.fontFamily.medium, fontSize: 14, flexShrink: 1 },
  selectTriggerTextPlaceholder: { color: COLORS.faint },
  selectTriggerTextSelected: { color: COLORS.primaryDark, fontFamily: theme.typography.fontFamily.displaySemiBold },

  doneBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    color: COLORS.ink,
  },
  inputHelp: { fontFamily: theme.typography.fontFamily.medium, fontSize: 11.5, color: COLORS.faint },

  senegalPlateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    height: 56,
    overflow: 'hidden',
  },
  senegalPlateValid: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  plateFlagBand: {
    width: 44,
    height: '100%',
    backgroundColor: '#041912',
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  plateCountryCode: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: COLORS.white,
    letterSpacing: 1,
  },
  snStar: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FACC15',
  },
  senegalPlateInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 18,
    letterSpacing: 2,
    color: COLORS.ink,
    paddingHorizontal: 14,
  },
  plateCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  autoSuggestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  autoSuggestBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: COLORS.primaryDark,
  },

  cardRow2Col: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  selectCard: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  selectCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  selectCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  selectCardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectCardIconBoxActive: { backgroundColor: '#041912', borderColor: 'rgba(74, 222, 128, 0.4)' },
  selectCardCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCardTitle: { fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 13.5, color: COLORS.ink },
  selectCardTitleActive: { color: COLORS.primaryDark },
  selectCardSub: { fontFamily: theme.typography.fontFamily.regular, fontSize: 11, color: COLORS.muted, marginTop: 2 },

  // Sheets
  sheetSafeArea: { flex: 1, backgroundColor: COLORS.white },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginTop: 8,
  },
  sheetHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  sheetTitle: { fontFamily: theme.typography.fontFamily.displayBold, fontSize: 16, color: COLORS.ink },
  sheetSubtitle: { fontFamily: theme.typography.fontFamily.regular, fontSize: 12, color: COLORS.primary },
  sheetCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSearchPad: { padding: 16, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  searchInput: { flex: 1, fontFamily: theme.typography.fontFamily.regular, fontSize: 14, color: COLORS.ink },

  popularSection: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#F1F5F9', gap: 10 },
  popularTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 12.5,
    color: '#041912',
    letterSpacing: -0.2,
  },
  popularGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  popularChip: {
    paddingHorizontal: 14,
    paddingVertical: 7.5,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  popularChipActive: { backgroundColor: '#041912', borderColor: '#041912' },
  popularChipText: { fontFamily: theme.typography.fontFamily.medium, fontSize: 13, color: '#334155' },
  popularChipTextActive: { color: '#4ADE80', fontFamily: theme.typography.fontFamily.displaySemiBold },

  sheetListRow: { flex: 1, flexDirection: 'row' },
  sheetListContent: { paddingVertical: 8, paddingBottom: 32 },
  sectionHeaderRow: { backgroundColor: COLORS.white, paddingHorizontal: 20, paddingVertical: 6 },
  sectionHeaderText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 12,
    color: COLORS.faint,
  },
  sheetItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: COLORS.surface,
  },
  sheetItemRowActive: { backgroundColor: COLORS.primarySoft },
  sheetItemText: { fontFamily: theme.typography.fontFamily.medium, fontSize: 14.5, color: '#1E293B' },
  sheetItemTextActive: { fontFamily: theme.typography.fontFamily.displaySemiBold, color: COLORS.primaryDark },

  sheetCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  sheetCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  sheetCategoryIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCategoryIconBoxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sheetCategoryTextCol: {
    flex: 1,
    gap: 2,
  },
  sheetCategoryTagline: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: COLORS.muted,
  },

  alphaIndex: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 1,
  },
  alphaIndexLetter: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: COLORS.primary,
    paddingVertical: 1.5,
  },

  sheetEmptyBox: { padding: 24, alignItems: 'center', gap: 16 },
  sheetEmptyText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
  },
  customAddContainer: { width: '100%', gap: 10 },
  customSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  customSubmitText: { fontFamily: theme.typography.fontFamily.bold, fontSize: 13, color: COLORS.white },
  customAddFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    backgroundColor: COLORS.surface,
    marginTop: 10,
  },
  customFooterTitle: { fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 12, color: COLORS.inkSoft },
  customAddRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});