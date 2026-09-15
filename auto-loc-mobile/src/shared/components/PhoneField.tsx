import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import { ChevronDown, Search, X, Check } from 'lucide-react-native';
import { theme } from '../../core/theme';

export interface Country {
  flag: string;
  name: string;
  dial: string;
  code: string;
}

export const FEATURED_COUNTRIES: Country[] = [
  { flag: '🇸🇳', name: 'Sénégal', dial: '+221', code: 'SN' },
  { flag: '🇫🇷', name: 'France', dial: '+33', code: 'FR' },
  { flag: '🇨🇮', name: "Côte d'Ivoire", dial: '+225', code: 'CI' },
  { flag: '🇲🇱', name: 'Mali', dial: '+223', code: 'ML' },
  { flag: '🇬🇳', name: 'Guinée', dial: '+224', code: 'GN' },
  { flag: '🇧🇪', name: 'Belgique', dial: '+32', code: 'BE' },
  { flag: '🇨🇭', name: 'Suisse', dial: '+41', code: 'CH' },
  { flag: '🇨🇦', name: 'Canada', dial: '+1', code: 'CA' },
  { flag: '🇺🇸', name: 'États-Unis', dial: '+1', code: 'US' },
];

export const ALL_COUNTRIES: Country[] = [
  ...FEATURED_COUNTRIES,
  { flag: '🇩🇿', name: 'Algérie', dial: '+213', code: 'DZ' },
  { flag: '🇩🇪', name: 'Allemagne', dial: '+49', code: 'DE' },
  { flag: '🇦🇴', name: 'Angola', dial: '+244', code: 'AO' },
  { flag: '🇸🇦', name: 'Arabie Saoudite', dial: '+966', code: 'SA' },
  { flag: '🇦🇷', name: 'Argentine', dial: '+54', code: 'AR' },
  { flag: '🇧🇯', name: 'Bénin', dial: '+229', code: 'BJ' },
  { flag: '🇧🇷', name: 'Brésil', dial: '+55', code: 'BR' },
  { flag: '🇧🇫', name: 'Burkina Faso', dial: '+226', code: 'BF' },
  { flag: '🇨🇲', name: 'Cameroun', dial: '+237', code: 'CM' },
  { flag: '🇨🇻', name: 'Cap-Vert', dial: '+238', code: 'CV' },
  { flag: '🇨🇳', name: 'Chine', dial: '+86', code: 'CN' },
  { flag: '🇨🇩', name: 'Congo (RDC)', dial: '+243', code: 'CD' },
  { flag: '🇨🇬', name: 'Congo', dial: '+242', code: 'CG' },
  { flag: '🇩🇰', name: 'Danemark', dial: '+45', code: 'DK' },
  { flag: '🇦🇪', name: 'Émirats Arabes Unis', dial: '+971', code: 'AE' },
  { flag: '🇪🇸', name: 'Espagne', dial: '+34', code: 'ES' },
  { flag: '🇪🇹', name: 'Éthiopie', dial: '+251', code: 'ET' },
  { flag: '🇫🇮', name: 'Finlande', dial: '+358', code: 'FI' },
  { flag: '🇬🇦', name: 'Gabon', dial: '+241', code: 'GA' },
  { flag: '🇬🇲', name: 'Gambie', dial: '+220', code: 'GM' },
  { flag: '🇬🇭', name: 'Ghana', dial: '+233', code: 'GH' },
  { flag: '🇬🇼', name: 'Guinée-Bissau', dial: '+245', code: 'GW' },
  { flag: '🇮🇳', name: 'Inde', dial: '+91', code: 'IN' },
  { flag: '🇮🇹', name: 'Italie', dial: '+39', code: 'IT' },
  { flag: '🇯🇵', name: 'Japon', dial: '+81', code: 'JP' },
  { flag: '🇰🇪', name: 'Kenya', dial: '+254', code: 'KE' },
  { flag: '🇱🇷', name: 'Libéria', dial: '+231', code: 'LR' },
  { flag: '🇲🇦', name: 'Maroc', dial: '+212', code: 'MA' },
  { flag: '🇲🇷', name: 'Mauritanie', dial: '+222', code: 'MR' },
  { flag: '🇲🇽', name: 'Mexique', dial: '+52', code: 'MX' },
  { flag: '🇳🇱', name: 'Pays-Bas', dial: '+31', code: 'NL' },
  { flag: '🇳🇬', name: 'Nigeria', dial: '+234', code: 'NG' },
  { flag: '🇳🇪', name: 'Niger', dial: '+227', code: 'NE' },
  { flag: '🇳🇴', name: 'Norvège', dial: '+47', code: 'NO' },
  { flag: '🇵🇹', name: 'Portugal', dial: '+351', code: 'PT' },
  { flag: '🇬🇧', name: 'Royaume-Uni', dial: '+44', code: 'GB' },
  { flag: '🇸🇱', name: 'Sierra Leone', dial: '+232', code: 'SL' },
  { flag: '🇸🇪', name: 'Suède', dial: '+46', code: 'SE' },
  { flag: '🇹🇿', name: 'Tanzanie', dial: '+255', code: 'TZ' },
  { flag: '🇹🇬', name: 'Togo', dial: '+228', code: 'TG' },
  { flag: '🇹🇳', name: 'Tunisie', dial: '+216', code: 'TN' },
  { flag: '🇹🇷', name: 'Turquie', dial: '+90', code: 'TR' },
  { flag: '🇿🇦', name: 'Afrique du Sud', dial: '+27', code: 'ZA' },
].filter((c, i, arr) => arr.findIndex((x) => x.code === c.code) === i);

import { StyleProp, ViewStyle } from 'react-native';

export interface PhoneFieldProps {
  label?: string;
  value: string; // Numéro complet (ex: "+221770000000") ou local
  onChangeText: (fullNumber: string) => void;
  error?: string;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  label = 'Numéro de téléphone',
  value,
  onChangeText,
  error,
  placeholder = '77 000 00 00',
  containerStyle,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Déduire le pays initial à partir du numéro transmis
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    if (!value) return FEATURED_COUNTRIES[0];
    const match = ALL_COUNTRIES.find((c) => value.startsWith(c.dial));
    return match || FEATURED_COUNTRIES[0];
  });

  // Déduire le numéro local sans l'indicatif
  const localNumber = useMemo(() => {
    if (!value) return '';
    if (value.startsWith(selectedCountry.dial)) {
      return value.slice(selectedCountry.dial.length).replace(/^0/, '');
    }
    // Si c'est juste le numéro sans indicatif
    return value.replace(/^\+\d{1,4}/, '').replace(/^0/, '');
  }, [value, selectedCountry]);

  const handleLocalNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const full = cleaned ? `${selectedCountry.dial}${cleaned}` : '';
    onChangeText(full);
  };

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setModalVisible(false);
    const cleaned = localNumber.replace(/[^0-9]/g, '');
    const full = cleaned ? `${country.dial}${cleaned}` : '';
    onChangeText(full);
  };

  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.inputRow, !!error && styles.inputError]}>
        {/* Bouton Sélecteur d'Indicatif Pays */}
        <TouchableOpacity
          style={styles.countryPickerButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
          <Text style={styles.dialCode}>{selectedCountry.dial}</Text>
          <ChevronDown size={16} color={theme.colors.text.tertiary} />
        </TouchableOpacity>

        {/* Input Numéro Local */}
        <TextInput
          style={styles.textInput}
          value={localNumber}
          onChangeText={handleLocalNumberChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          keyboardType="phone-pad"
          autoCorrect={false}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Modal de sélection de pays */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez un pays</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={22} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Barre de Recherche */}
            <View style={styles.searchBar}>
              <Search size={18} color={theme.colors.text.tertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un pays ou indicatif..."
                placeholderTextColor={theme.colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Liste des Pays */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item.code === selectedCountry.code;
                return (
                  <TouchableOpacity
                    style={[styles.countryItem, isSelected && styles.countryItemSelected]}
                    onPress={() => handleSelectCountry(item)}
                  >
                    <Text style={styles.countryFlag}>{item.flag}</Text>
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={[styles.countryDial, isSelected && styles.countryDialSelected]}>
                      {item.dial}
                    </Text>
                    {isSelected && <Check size={18} color={theme.colors.brand.main} />}
                  </TouchableOpacity>
                );
              }}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
  },
  label: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    height: 52,
  },
  inputError: {
    borderColor: theme.colors.status.error,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: theme.spacing[3],
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: theme.colors.border.light,
    gap: 6,
  },
  flagEmoji: {
    fontSize: 20,
  },
  dialCode: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: theme.spacing[3],
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.status.error,
    marginTop: theme.spacing[1],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 27, 20, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    maxHeight: '80%',
    minHeight: '60%',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
  },
  closeBtn: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[3],
    height: 44,
    marginBottom: theme.spacing[3],
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  countryItemSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: theme.radius.md,
  },
  countryFlag: {
    fontSize: 22,
  },
  countryName: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  countryDial: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  countryDialSelected: {
    color: theme.colors.brand.main,
  },
});
