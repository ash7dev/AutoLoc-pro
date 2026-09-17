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
  Platform,
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
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <SafeAreaView style={styles.modalContainer}>
            {/* Drag Handle Bar */}
            <View style={styles.dragHandle} />

            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez un pays</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn} activeOpacity={0.7}>
                <X size={18} color="#041912" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Barre de Recherche */}
            <View style={styles.searchBar}>
              <Search size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un pays ou indicatif (+221...)"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                  <X size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Liste des Pays */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = item.code === selectedCountry.code;
                return (
                  <TouchableOpacity
                    style={[styles.countryItem, isSelected && styles.countryItemSelected]}
                    onPress={() => handleSelectCountry(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.countryFlag}>{item.flag}</Text>
                    <Text style={[styles.countryName, isSelected && styles.countryNameSelected]}>
                      {item.name}
                    </Text>
                    <View style={[styles.dialBadge, isSelected && styles.dialBadgeSelected]}>
                      <Text style={[styles.countryDial, isSelected && styles.countryDialSelected]}>
                        {item.dial}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
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
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.1,
    color: '#041912',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.lg,
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
    backgroundColor: 'rgba(4, 21, 15, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '82%',
    minHeight: '62%',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 20,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 18,
    color: '#041912',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#041912',
  },
  listContent: {
    paddingBottom: 20,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 3,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  countryItemSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  countryFlag: {
    fontSize: 24,
  },
  countryName: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
    color: '#374151',
  },
  countryNameSelected: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#041912',
  },
  dialBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dialBadgeSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  countryDial: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#6B7280',
  },
  countryDialSelected: {
    color: '#059669',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
