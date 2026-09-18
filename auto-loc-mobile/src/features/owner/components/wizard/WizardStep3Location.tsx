import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
  Platform,
} from 'react-native';
import {
  MapPin,
  Compass,
  Truck,
  ChevronRight,
  Check,
  Search,
  X,
  ShieldCheck,
  Coins,
  Navigation,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { SENEGAL_LOCATIONS } from '../vehicleCatalog';

export interface Step3Data {
  ville: string;
  adresse: string;
  autoriseHorsDakar: boolean;
  supplementHorsDakarParJour: number;
  fraisLivraison: number;
  proposeLivraison?: boolean;
}

interface WizardStep3LocationProps {
  data: Step3Data;
  onChange: (updated: Partial<Step3Data>) => void;
}

const SUPPLEMENT_PRESETS = [3000, 5000, 10000, 15000];
const LIVRAISON_PRESETS = [0, 5000, 10000, 15000];

export const WizardStep3Location: React.FC<WizardStep3LocationProps> = ({
  data,
  onChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Proposer livraison actif si proposeLivraison === true
  const proposeLivraison = Boolean(data.proposeLivraison);

  // Filtrage des villes/quartiers pour la modal de sélection
  const filteredLocations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return SENEGAL_LOCATIONS;

    const result: Record<string, string[]> = {};
    Object.entries(SENEGAL_LOCATIONS).forEach(([region, cities]) => {
      const matchingCities = cities.filter((c) =>
        c.toLowerCase().includes(query)
      );
      if (matchingCities.length > 0 || region.toLowerCase().includes(query)) {
        result[region] = matchingCities.length > 0 ? matchingCities : cities;
      }
    });
    return result;
  }, [searchQuery]);

  const handleSelectLocation = (region: string, city: string) => {
    const locationString = region === 'Dakar' ? `Dakar (${city})` : city;
    onChange({ ville: locationString });
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleToggleHorsDakar = (val: boolean) => {
    onChange({
      autoriseHorsDakar: val,
      supplementHorsDakarParJour: val ? (data.supplementHorsDakarParJour || 5000) : 0,
    });
  };

  const handleToggleLivraison = (val: boolean) => {
    onChange({
      proposeLivraison: val,
      fraisLivraison: val ? (data.fraisLivraison || 5000) : 0,
    });
  };

  return (
    <View style={styles.container}>
      {/* Hero Header d'étape Centré Luxury */}
      <View style={styles.centeredHeroHeader}>
        <View style={styles.centeredIconBadge}>
          <MapPin size={22} color="#4ADE80" strokeWidth={2.2} />
        </View>
        <Text style={styles.centeredHeroTitle} numberOfLines={1} adjustsFontSizeToFit>
          Localisation & Logistique
        </Text>
        <Text style={styles.centeredHeroSubtitle}>
          Définissez le point d'attache principal et vos options de livraison
        </Text>
      </View>

      {/* SECTION 1: VILLE ET QUARTIER */}
      <View style={styles.sectionCard}>
        <View style={styles.labelWithIcon}>
          <MapPin size={16} color="#059669" strokeWidth={2.2} />
          <Text style={styles.sectionTitle}>Ville & Zone d’attache *</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Sélectionnez la ville principale où le véhicule sera restitué.
        </Text>

        <TouchableOpacity
          style={[styles.selectRow, Boolean(data.ville) && styles.selectRowActive]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.selectLeft}>
            <View style={[styles.selectIconBg, Boolean(data.ville) && styles.selectIconBgActive]}>
              <MapPin size={18} color={data.ville ? '#4ADE80' : '#059669'} />
            </View>
            <View style={styles.selectTextCol}>
              <Text style={styles.selectLabel}>Ville principale</Text>
              <Text style={[styles.selectValue, Boolean(data.ville) && styles.selectValueActive]}>
                {data.ville || 'Sélectionner une ville (ex: Dakar, Saly...)'}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={data.ville ? '#059669' : '#94A3B8'} />
        </TouchableOpacity>
      </View>

      {/* SECTION 2: ADRESSE EXACTE */}
      <View style={styles.sectionCard}>
        <View style={styles.labelWithIcon}>
          <Navigation size={16} color="#059669" strokeWidth={2.2} />
          <Text style={styles.sectionTitle}>Adresse ou Quartier exact *</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Indiquez le lieu précis de prise en main (ex: Almadies, en face de l’hôtel X).
        </Text>

        <View style={[styles.inputContainer, Boolean(data.adresse) && styles.inputContainerActive]}>
          <Navigation size={18} color={data.adresse ? '#059669' : '#64748B'} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={data.adresse}
            onChangeText={(text) => onChange({ adresse: text })}
            placeholder="Ex: Almadies, Rue des Baronnies"
            placeholderTextColor="#94A3B8"
          />
          {data.adresse.length > 0 && (
            <TouchableOpacity onPress={() => onChange({ adresse: '' })}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Reassurance Badge */}
        <View style={styles.privacyBadge}>
          <ShieldCheck size={16} color="#059669" />
          <Text style={styles.privacyBadgeText}>
            Confidentialité garantie : L’adresse exacte n’est partagée qu’après la confirmation de réservation.
          </Text>
        </View>
      </View>

      {/* SECTION 3: OPTIONS HORS DAKAR */}
      <View style={styles.sectionCard}>
        <View style={styles.toggleHeaderRow}>
          <View style={styles.toggleHeaderLeft}>
            <View style={styles.toggleIconBg}>
              <Compass size={20} color="#0284C7" />
            </View>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>Voyages Hors Dakar</Text>
              <Text style={styles.toggleSub}>
                Autoriser le locataire à sortir de la région de Dakar.
              </Text>
            </View>
          </View>
          <Switch
            value={data.autoriseHorsDakar}
            onValueChange={handleToggleHorsDakar}
            trackColor={{ false: '#E2E8F0', true: '#059669' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {data.autoriseHorsDakar && (
          <View style={styles.expandableContent}>
            <View style={styles.divider} />
            <Text style={styles.subFieldTitle}>
              Supplément journalier (FCFA / jour)
            </Text>

            {/* Presets Chips */}
            <View style={styles.chipsRow}>
              {SUPPLEMENT_PRESETS.map((preset) => {
                const isSelected = data.supplementHorsDakarParJour === preset;
                return (
                  <TouchableOpacity
                    key={preset}
                    style={[styles.presetChip, isSelected && styles.presetChipActive]}
                    onPress={() => onChange({ supplementHorsDakarParJour: preset })}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        isSelected && styles.presetChipTextActive,
                      ]}
                    >
                      +{preset.toLocaleString('fr-FR')} F
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Input */}
            <View style={styles.amountInputRow}>
              <Coins size={18} color="#059669" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={
                  data.supplementHorsDakarParJour
                    ? String(data.supplementHorsDakarParJour)
                    : ''
                }
                onChangeText={(val) => {
                  const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
                  onChange({ supplementHorsDakarParJour: num });
                }}
                placeholder="5000"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.currencyTag}>FCFA / jour</Text>
            </View>
          </View>
        )}
      </View>

      {/* SECTION 4: SERVICE DE LIVRAISON */}
      <View style={styles.sectionCard}>
        <View style={styles.toggleHeaderRow}>
          <View style={styles.toggleHeaderLeft}>
            <View style={styles.toggleIconBgPurple}>
              <Truck size={20} color="#7C3AED" />
            </View>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>Service de Livraison</Text>
              <Text style={styles.toggleSub}>
                Livrer le véhicule chez le locataire ou à l’aéroport AIBD.
              </Text>
            </View>
          </View>
          <Switch
            value={proposeLivraison}
            onValueChange={handleToggleLivraison}
            trackColor={{ false: '#E2E8F0', true: '#7C3AED' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {proposeLivraison && (
          <View style={styles.expandableContent}>
            <View style={styles.divider} />
            <Text style={styles.subFieldTitle}>Montant de la livraison (FCFA)</Text>

            {/* Presets Chips */}
            <View style={styles.chipsRow}>
              {LIVRAISON_PRESETS.map((preset) => {
                const isSelected = data.fraisLivraison === preset;
                return (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetChip,
                      isSelected && styles.presetChipPurpleActive,
                    ]}
                    onPress={() => onChange({ fraisLivraison: preset })}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        isSelected && styles.presetChipTextPurpleActive,
                      ]}
                    >
                      {preset === 0 ? 'Gratuit' : `${preset.toLocaleString('fr-FR')} F`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Input */}
            <View style={styles.amountInputRow}>
              <Truck size={18} color="#7C3AED" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={data.fraisLivraison ? String(data.fraisLivraison) : '0'}
                onChangeText={(val) => {
                  const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
                  onChange({ fraisLivraison: num });
                }}
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.currencyTag}>FCFA total</Text>
            </View>
          </View>
        )}
      </View>

      {/* MODAL DE SÉLECTION DE LA VILLE & QUARTIER */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalSheet}>
            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetIndicator} />
              <View style={styles.sheetTitleRow}>
                <Text style={styles.sheetTitle}>Choix de la Ville</Text>
                <TouchableOpacity
                  style={styles.sheetCloseBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Search size={18} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Rechercher une ville, Dakar, Saly, Thiès..."
                  placeholderTextColor="#94A3B8"
                  autoFocus={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Location List */}
            <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
              {searchQuery.trim().length > 0 && (
                <TouchableOpacity
                  style={styles.customSearchChoice}
                  onPress={() => {
                    onChange({ ville: searchQuery.trim() });
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                  activeOpacity={0.7}
                >
                  <MapPin size={18} color="#059669" />
                  <Text style={styles.customSearchText}>
                    Utiliser « <Text style={styles.customSearchBold}>{searchQuery.trim()}</Text> » comme ville
                  </Text>
                </TouchableOpacity>
              )}

              {Object.entries(filteredLocations).map(([region, cities]) => (
                <View key={region} style={styles.regionSection}>
                  <View style={styles.regionHeader}>
                    <MapPin size={14} color="#059669" />
                    <Text style={styles.regionTitle}>{region}</Text>
                  </View>
                  <View style={styles.citiesGrid}>
                    {cities.map((city) => {
                      const locationString =
                        region === 'Dakar' ? `Dakar (${city})` : city;
                      const isSelected = data.ville === locationString;
                      return (
                        <TouchableOpacity
                          key={city}
                          style={[
                            styles.cityItem,
                            isSelected && styles.cityItemActive,
                          ]}
                          onPress={() => handleSelectLocation(region, city)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.cityName,
                              isSelected && styles.cityNameActive,
                            ]}
                          >
                            {city}
                          </Text>
                          {isSelected && <Check size={16} color="#059669" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    gap: 18,
  },

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
    marginBottom: 2,
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
  },
  sectionTitle: {
    fontSize: 15.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
    letterSpacing: -0.3,
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748B',
    marginBottom: 12,
  },

  // Select Row
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  selectRowActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  selectIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectIconBgActive: {
    backgroundColor: '#041912',
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  selectTextCol: {
    flex: 1,
  },
  selectLabel: {
    fontSize: 11.5,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#64748B',
  },
  selectValue: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#0F172A',
    marginTop: 2,
  },
  selectValueActive: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#047857',
  },

  // Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  inputContainerActive: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#0F172A',
  },

  // Privacy Badge
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  privacyBadgeText: {
    flex: 1,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#166534',
    lineHeight: 16,
  },

  // Toggle Header Row
  toggleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  toggleIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleIconBgPurple: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTextCol: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
    letterSpacing: -0.3,
  },
  toggleSub: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748B',
    marginTop: 2,
  },

  // Expandable Content
  expandableContent: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  subFieldTitle: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#1E293B',
    marginBottom: 10,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 7.5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#041912',
    borderColor: '#041912',
  },
  presetChipPurpleActive: {
    backgroundColor: '#041912',
    borderColor: '#041912',
  },
  presetChipText: {
    fontSize: 12.5,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#4ADE80',
    fontFamily: theme.typography.fontFamily.displaySemiBold,
  },
  presetChipTextPurpleActive: {
    color: '#4ADE80',
    fontFamily: theme.typography.fontFamily.displaySemiBold,
  },

  // Amount Input Row
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#0F172A',
  },
  currencyTag: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#64748B',
  },

  // Modal Sheet
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  sheetHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.displayBold,
    color: '#0F172A',
  },
  sheetCloseBtn: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#0F172A',
  },
  sheetList: {
    padding: 16,
  },
  regionSection: {
    marginBottom: 20,
  },
  regionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  regionTitle: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  citiesGrid: {
    gap: 6,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cityItemActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#059669',
  },
  cityName: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#334155',
  },
  cityNameActive: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#047857',
  },
  customSearchChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    marginBottom: 16,
  },
  customSearchText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#047857',
    flex: 1,
  },
  customSearchBold: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#065F46',
  },
});
