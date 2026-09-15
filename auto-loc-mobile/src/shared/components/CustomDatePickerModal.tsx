import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Calendar, X, Check, ChevronDown } from 'lucide-react-native';

interface CustomDatePickerModalProps {
  visible: boolean;
  value?: string; // YYYY-MM-DD
  onConfirm: (dateStr: string) => void;
  onClose: () => void;
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

export const CustomDatePickerModal: React.FC<CustomDatePickerModalProps> = ({
  visible,
  value,
  onConfirm,
  onClose,
}) => {
  const currentYear = new Date().getFullYear();
  const defaultYear = 1998;

  // Analyser la valeur YYYY-MM-DD passée en props
  const parseInitialDate = () => {
    if (value && value.length === 10) {
      const parts = value.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return { year: y, month: m, day: d };
      }
    }
    return { year: defaultYear, month: 8, day: 14 };
  };

  const initial = parseInitialDate();
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonth, setSelectedMonth] = useState(initial.month); // 1-12
  const [selectedDay, setSelectedDay] = useState(initial.day); // 1-31
  const [viewMode, setViewMode] = useState<'PICKER' | 'YEAR_GRID'>('PICKER');

  useEffect(() => {
    if (visible) {
      const parsed = parseInitialDate();
      setSelectedYear(parsed.year);
      setSelectedMonth(parsed.month);
      setSelectedDay(parsed.day);
      setViewMode('PICKER');
    }
  }, [visible, value]);

  // Nombre de jours dans le mois sélectionné
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const maxDays = getDaysInMonth(selectedYear, selectedMonth);

  // Ajuster le jour si le mois change (ex: passer de 31 Janvier à Février)
  useEffect(() => {
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  }, [selectedMonth, selectedYear, maxDays, selectedDay]);

  // Générer les listes d'années (de 1940 à max 16 ans aujourd'hui)
  const minYear = 1940;
  const maxYear = currentYear - 16;
  const yearsList: number[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearsList.push(y);
  }

  // Calcul de l'âge théorique
  const calculateAge = () => {
    const today = new Date();
    let age = today.getFullYear() - selectedYear;
    const m = today.getMonth() + 1 - selectedMonth;
    if (m < 0 || (m === 0 && today.getDate() < selectedDay)) {
      age--;
    }
    return age;
  };

  const formattedDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const displayFormattedDate = `${selectedDay} ${MOIS_NOMS[selectedMonth - 1]} ${selectedYear}`;

  const handleConfirm = () => {
    onConfirm(formattedDateStr);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header Modal */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Calendar size={20} color={COLORS.accent} />
              <Text style={styles.headerTitle}>Sélectionnez votre Date de Naissance</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={20} color={COLORS.ink} />
            </Pressable>
          </View>

          {/* Affichage de la Date Sélectionnée & Âge Calculé */}
          <View style={styles.datePreviewCard}>
            <Text style={styles.datePreviewLabel}>Date choisie :</Text>
            <View style={styles.datePreviewRow}>
              <Text style={styles.datePreviewText}>{displayFormattedDate}</Text>
              <View style={styles.ageBadge}>
                <Text style={styles.ageBadgeText}>{calculateAge()} ans</Text>
              </View>
            </View>
          </View>

          {viewMode === 'YEAR_GRID' ? (
            /* Mode Sélection Rapide d'Année */
            <View style={styles.yearGridContainer}>
              <View style={styles.yearGridHeader}>
                <Text style={styles.sectionTitle}>Choisissez votre année de naissance</Text>
                <Pressable onPress={() => setViewMode('PICKER')}>
                  <Text style={styles.backToPickerText}>Retour au sélecteur</Text>
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={styles.yearGridScroll} showsVerticalScrollIndicator={false}>
                {yearsList.map((y) => (
                  <Pressable
                    key={y}
                    style={[
                      styles.yearChip,
                      y === selectedYear && styles.yearChipSelected,
                    ]}
                    onPress={() => {
                      setSelectedYear(y);
                      setViewMode('PICKER');
                    }}
                  >
                    <Text style={[styles.yearChipText, y === selectedYear && styles.yearChipTextSelected]}>
                      {y}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : (
            /* Mode Sélecteur 3 Colonnes (Jour / Mois / Année) */
            <View style={styles.pickerBody}>
              {/* Bouton Rapide Sélection d'Année */}
              <Pressable style={styles.quickYearButton} onPress={() => setViewMode('YEAR_GRID')}>
                <Text style={styles.quickYearButtonText}>Année : <Text style={{ fontWeight: '800' }}>{selectedYear}</Text></Text>
                <ChevronDown size={16} color={COLORS.accent} />
              </Pressable>

              <View style={styles.columnsRow}>
                {/* Colonne Jour */}
                <View style={styles.columnContainer}>
                  <Text style={styles.columnTitle}>Jour</Text>
                  <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                    {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                      <Pressable
                        key={d}
                        style={[
                          styles.itemCell,
                          d === selectedDay && styles.itemCellSelected,
                        ]}
                        onPress={() => setSelectedDay(d)}
                      >
                        <Text style={[styles.itemText, d === selectedDay && styles.itemTextSelected]}>
                          {String(d).padStart(2, '0')}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Colonne Mois */}
                <View style={[styles.columnContainer, { flex: 1.4 }]}>
                  <Text style={styles.columnTitle}>Mois</Text>
                  <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                    {MOIS_NOMS.map((mName, idx) => {
                      const mNumber = idx + 1;
                      const isSelected = mNumber === selectedMonth;
                      return (
                        <Pressable
                          key={mName}
                          style={[
                            styles.itemCell,
                            isSelected && styles.itemCellSelected,
                          ]}
                          onPress={() => setSelectedMonth(mNumber)}
                        >
                          <Text 
                            style={[styles.itemText, isSelected && styles.itemTextSelected]}
                            numberOfLines={1}
                          >
                            {mName}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Colonne Année */}
                <View style={styles.columnContainer}>
                  <Text style={styles.columnTitle}>Année</Text>
                  <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                    {yearsList.map((y) => (
                      <Pressable
                        key={y}
                        style={[
                          styles.itemCell,
                          y === selectedYear && styles.itemCellSelected,
                        ]}
                        onPress={() => setSelectedYear(y)}
                      >
                        <Text style={[styles.itemText, y === selectedYear && styles.itemTextSelected]}>
                          {y}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          )}

          {/* Footer Bouton Validation */}
          <View style={styles.footer}>
            <Pressable style={styles.confirmButton} onPress={handleConfirm}>
              <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.confirmButtonText}>Valider cette date</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 25, 18, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    maxHeight: '82%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.ink,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePreviewCard: {
    backgroundColor: COLORS.accentLight,
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 16,
  },
  datePreviewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  datePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePreviewText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.ink,
  },
  ageBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ageBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  pickerBody: {
    paddingHorizontal: 24,
    height: 240,
  },
  quickYearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  quickYearButtonText: {
    fontSize: 13,
    color: COLORS.ink,
  },
  columnsRow: {
    flexDirection: 'row',
    gap: 10,
    height: 180,
  },
  columnContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  columnTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.inkMuted,
    textAlign: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    textTransform: 'uppercase',
  },
  columnScroll: {
    flex: 1,
    paddingVertical: 4,
  },
  itemCell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  itemCellSelected: {
    backgroundColor: COLORS.accent,
  },
  itemText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
  },
  itemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  yearGridContainer: {
    paddingHorizontal: 24,
    height: 240,
  },
  yearGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink,
  },
  backToPickerText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.accent,
  },
  yearGridScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 16,
  },
  yearChip: {
    width: '23%',
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearChipSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  yearChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
  },
  yearChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  confirmButton: {
    backgroundColor: COLORS.accent,
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
  },
});
