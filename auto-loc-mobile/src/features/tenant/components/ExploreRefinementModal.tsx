import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Check, SlidersHorizontal, X } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { SearchFilters } from '../../../core/store/useAppStore';

type ExploreSort = NonNullable<SearchFilters['sort']>;

interface ExploreRefinementModalProps {
  visible: boolean;
  filters: SearchFilters;
  onClose: () => void;
  onApply: (filters: Pick<SearchFilters, 'prixMin' | 'prixMax' | 'carburant' | 'transmission' | 'sort'>) => void;
}

const BUDGETS = [
  { label: 'Tous les budgets', value: undefined },
  { label: 'Jusqu’à 25 000 F', value: 25_000 },
  { label: 'Jusqu’à 50 000 F', value: 50_000 },
  { label: 'Jusqu’à 100 000 F', value: 100_000 },
];

const SORTS: Array<{ label: string; value: ExploreSort }> = [
  { label: 'Pertinence', value: 'RELEVANCE' },
  { label: 'Prix croissant', value: 'PRICE_ASC' },
  { label: 'Prix décroissant', value: 'PRICE_DESC' },
  { label: 'Mieux notés', value: 'RATING' },
];

const FUELS = ['', 'ESSENCE', 'DIESEL', 'HYBRIDE', 'ELECTRIQUE'];
const TRANSMISSIONS = ['', 'AUTOMATIQUE', 'MANUELLE'];

const formatOption = (value: string, fallback: string) =>
  value ? `${value.charAt(0)}${value.slice(1).toLowerCase()}` : fallback;

export const ExploreRefinementModal: React.FC<ExploreRefinementModalProps> = ({
  visible,
  filters,
  onClose,
  onApply,
}) => {
  const [prixMax, setPrixMax] = useState<number | undefined>(filters.prixMax);
  const [carburant, setCarburant] = useState(filters.carburant ?? '');
  const [transmission, setTransmission] = useState(filters.transmission ?? '');
  const [sort, setSort] = useState<ExploreSort>(filters.sort ?? 'RELEVANCE');

  useEffect(() => {
    if (visible) {
      setPrixMax(filters.prixMax);
      setCarburant(filters.carburant ?? '');
      setTransmission(filters.transmission ?? '');
      setSort(filters.sort ?? 'RELEVANCE');
    }
  }, [filters, visible]);

  const handleApply = () => {
    onApply({ prixMax, carburant, transmission, sort });
    onClose();
  };

  const handleReset = () => {
    setPrixMax(undefined);
    setCarburant('');
    setTransmission('');
    setSort('RELEVANCE');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropDismiss} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <SlidersHorizontal size={18} color={theme.colors.brand.main} />
              <Text style={styles.title}>Affiner la recherche</Text>
            </View>
            <TouchableOpacity accessibilityLabel="Fermer les filtres" onPress={onClose} style={styles.closeButton}>
              <X size={18} color="#334155" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <FilterSection label="TRIER PAR">
              {SORTS.map((option) => (
                <Choice key={option.value} label={option.label} selected={sort === option.value} onPress={() => setSort(option.value)} />
              ))}
            </FilterSection>
            <FilterSection label="BUDGET PAR JOUR">
              {BUDGETS.map((option) => (
                <Choice key={option.label} label={option.label} selected={prixMax === option.value} onPress={() => setPrixMax(option.value)} />
              ))}
            </FilterSection>
            <FilterSection label="CARBURANT">
              {FUELS.map((value) => (
                <Choice key={value || 'all'} label={formatOption(value, 'Tous carburants')} selected={carburant === value} onPress={() => setCarburant(value)} />
              ))}
            </FilterSection>
            <FilterSection label="TRANSMISSION">
              {TRANSMISSIONS.map((value) => (
                <Choice key={value || 'all'} label={formatOption(value, 'Toutes transmissions')} selected={transmission === value} onPress={() => setTransmission(value)} />
              ))}
            </FilterSection>
          </ScrollView>

          <SafeAreaView style={styles.footer}>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleApply} style={styles.applyButton}>
              <Text style={styles.applyText}>Afficher les véhicules</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const FilterSection: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <View style={styles.choices}>{children}</View>
  </View>
);

const Choice: React.FC<{ label: string; selected: boolean; onPress: () => void }> = ({ label, selected, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}>
    {selected && <Check size={14} color="#FFFFFF" />}
    <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(4,25,18,0.58)', justifyContent: 'flex-end' },
  backdropDismiss: { flex: 1 },
  sheet: { maxHeight: '86%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 4, marginTop: 10, backgroundColor: '#CBD5E1' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 20, color: '#041912' },
  closeButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 24 },
  section: { gap: 10 },
  sectionLabel: { fontFamily: theme.typography.fontFamily.bold, fontSize: 10, letterSpacing: 0.8, color: '#64748B' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  choiceSelected: { backgroundColor: '#072A20', borderColor: '#072A20' },
  choiceText: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: 13, color: '#334155' },
  choiceTextSelected: { color: '#FFFFFF' },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  resetButton: { minHeight: 48, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  resetText: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: 14, color: '#334155', textDecorationLine: 'underline' },
  applyButton: { flex: 1, minHeight: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.brand.main },
  applyText: { fontFamily: theme.typography.fontFamily.bold, fontSize: 14, color: '#FFFFFF' },
});
