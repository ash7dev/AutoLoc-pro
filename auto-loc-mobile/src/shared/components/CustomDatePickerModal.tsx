import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { Calendar, X, CheckCircle2, ChevronRight } from 'lucide-react-native';

interface CustomDatePickerModalProps {
  visible: boolean;
  value?: string; // YYYY-MM-DD
  onConfirm: (dateStr: string) => void;
  onClose: () => void;
}

const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const MOIS_SHORT = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
];

export const CustomDatePickerModal: React.FC<CustomDatePickerModalProps> = ({
  visible,
  value,
  onConfirm,
  onClose,
}) => {
  const currentYear = new Date().getFullYear();
  const maxAllowedYear = currentYear - 16;
  const minAllowedYear = 1940;

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
    return { year: 1998, month: 8, day: 14 };
  };

  const initial = parseInitialDate();
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonth, setSelectedMonth] = useState(initial.month); // 1-12
  const [selectedDay, setSelectedDay] = useState(initial.day); // 1-31
  const [activeTab, setActiveTab] = useState<'YEAR' | 'MONTH' | 'DAY'>('YEAR');

  // Input manuel alternatif
  const [manualDay, setManualDay] = useState(String(initial.day).padStart(2, '0'));
  const [manualMonth, setManualMonth] = useState(String(initial.month).padStart(2, '0'));
  const [manualYear, setManualYear] = useState(String(initial.year));

  useEffect(() => {
    if (visible) {
      const parsed = parseInitialDate();
      setSelectedYear(parsed.year);
      setSelectedMonth(parsed.month);
      setSelectedDay(parsed.day);
      setManualDay(String(parsed.day).padStart(2, '0'));
      setManualMonth(String(parsed.month).padStart(2, '0'));
      setManualYear(String(parsed.year));
      setActiveTab('YEAR');
    }
  }, [visible, value]);

  // Sync manuel vers état interne
  const handleManualChange = (dStr: string, mStr: string, yStr: string) => {
    setManualDay(dStr);
    setManualMonth(mStr);
    setManualYear(yStr);

    const d = parseInt(dStr, 10);
    const m = parseInt(mStr, 10);
    const y = parseInt(yStr, 10);

    if (!isNaN(y) && y >= minAllowedYear && y <= maxAllowedYear) {
      setSelectedYear(y);
    }
    if (!isNaN(m) && m >= 1 && m <= 12) {
      setSelectedMonth(m);
    }
    if (!isNaN(d) && d >= 1 && d <= 31) {
      setSelectedDay(d);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const maxDays = getDaysInMonth(selectedYear, selectedMonth);

  useEffect(() => {
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
      setManualDay(String(maxDays).padStart(2, '0'));
    }
  }, [selectedMonth, selectedYear, maxDays]);

  // Liste des années
  const yearsList: number[] = [];
  for (let y = maxAllowedYear; y >= minAllowedYear; y--) {
    yearsList.push(y);
  }

  const calculateAge = () => {
    const today = new Date();
    let age = today.getFullYear() - selectedYear;
    const m = today.getMonth() + 1 - selectedMonth;
    if (m < 0 || (m === 0 && today.getDate() < selectedDay)) {
      age--;
    }
    return Math.max(0, age);
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
          {/* Top Bar Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.headerIconCircle}>
                <Calendar size={18} color="#059669" strokeWidth={2.2} />
              </View>
              <Text style={styles.headerTitle}>Date de naissance</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <X size={18} color="#64748B" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Banner Preview Date Sélectionnée & Âge */}
          <View style={styles.previewBanner}>
            <View style={styles.previewTextGroup}>
              <Text style={styles.previewSubtext}>DATE SÉLECTIONNÉE</Text>
              <Text style={styles.previewDateText}>{displayFormattedDate}</Text>
            </View>

            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>{calculateAge()} ans</Text>
            </View>
          </View>

          {/* Segmented Tabs (Année -> Mois -> Jour) */}
          <View style={styles.tabsTrack}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'YEAR' && styles.tabBtnActive]}
              onPress={() => setActiveTab('YEAR')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, activeTab === 'YEAR' && styles.tabLabelActive]}>1. Année</Text>
              <Text style={[styles.tabValue, activeTab === 'YEAR' && styles.tabValueActive]}>{selectedYear}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'MONTH' && styles.tabBtnActive]}
              onPress={() => setActiveTab('MONTH')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, activeTab === 'MONTH' && styles.tabLabelActive]}>2. Mois</Text>
              <Text style={[styles.tabValue, activeTab === 'MONTH' && styles.tabValueActive]}>
                {MOIS_SHORT[selectedMonth - 1]}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'DAY' && styles.tabBtnActive]}
              onPress={() => setActiveTab('DAY')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, activeTab === 'DAY' && styles.tabLabelActive]}>3. Jour</Text>
              <Text style={[styles.tabValue, activeTab === 'DAY' && styles.tabValueActive]}>
                {String(selectedDay).padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenu Interactif selon l'onglet actif */}
          <View style={styles.tabContentArea}>
            {activeTab === 'YEAR' && (
              <View style={styles.gridWrapper}>
                <Text style={styles.gridInstruction}>Choisissez votre année de naissance :</Text>
                <ScrollView contentContainerStyle={styles.yearsGrid} showsVerticalScrollIndicator={false}>
                  {yearsList.map((y) => {
                    const isSelected = y === selectedYear;
                    return (
                      <TouchableOpacity
                        key={y}
                        style={[styles.yearChip, isSelected && styles.yearChipSelected]}
                        onPress={() => {
                          setSelectedYear(y);
                          setManualYear(String(y));
                          setActiveTab('MONTH');
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.yearChipText, isSelected && styles.yearChipTextSelected]}>
                          {y}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {activeTab === 'MONTH' && (
              <View style={styles.gridWrapper}>
                <Text style={styles.gridInstruction}>Choisissez votre mois de naissance :</Text>
                <View style={styles.monthsGrid}>
                  {MOIS_NOMS.map((mName, idx) => {
                    const mNum = idx + 1;
                    const isSelected = mNum === selectedMonth;
                    return (
                      <TouchableOpacity
                        key={mName}
                        style={[styles.monthCard, isSelected && styles.monthCardSelected]}
                        onPress={() => {
                          setSelectedMonth(mNum);
                          setManualMonth(String(mNum).padStart(2, '0'));
                          setActiveTab('DAY');
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.monthNumberText, isSelected && styles.monthNumberTextSelected]}>
                          {String(mNum).padStart(2, '0')}
                        </Text>
                        <Text style={[styles.monthNameText, isSelected && styles.monthNameTextSelected]} numberOfLines={1}>
                          {mName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {activeTab === 'DAY' && (
              <View style={styles.gridWrapper}>
                <Text style={styles.gridInstruction}>Choisissez le jour dans le mois :</Text>
                <ScrollView contentContainerStyle={styles.daysGrid} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => {
                    const isSelected = d === selectedDay;
                    return (
                      <TouchableOpacity
                        key={d}
                        style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                        onPress={() => {
                          setSelectedDay(d);
                          setManualDay(String(d).padStart(2, '0'));
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                          {String(d).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Saisie Manuelle Rapide Alternative */}
          <View style={styles.manualInputRow}>
            <Text style={styles.manualLabel}>Ou saisissez directement :</Text>
            <View style={styles.manualInputsGroup}>
              <TextInput
                style={styles.manualBox}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="JJ"
                placeholderTextColor="#94A3B8"
                value={manualDay}
                onChangeText={(t) => handleManualChange(t, manualMonth, manualYear)}
              />
              <Text style={styles.manualSlash}>/</Text>
              <TextInput
                style={styles.manualBox}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="MM"
                placeholderTextColor="#94A3B8"
                value={manualMonth}
                onChangeText={(t) => handleManualChange(manualDay, t, manualYear)}
              />
              <Text style={styles.manualSlash}>/</Text>
              <TextInput
                style={[styles.manualBox, { width: 68 }]}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="AAAA"
                placeholderTextColor="#94A3B8"
                value={manualYear}
                onChangeText={(t) => handleManualChange(manualDay, manualMonth, t)}
              />
            </View>
          </View>

          {/* Footer Bouton Validation */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} activeOpacity={0.85}>
              <CheckCircle2 size={18} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.confirmButtonText}>Valider cette date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 25, 18, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 16,
    maxHeight: '88%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 17,
    color: '#041912',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  previewTextGroup: {
    gap: 2,
  },
  previewSubtext: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9.5,
    letterSpacing: 0.8,
    color: '#059669',
  },
  previewDateText: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 18,
    color: '#041912',
  },
  ageBadge: {
    backgroundColor: '#041912',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  ageBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#4ADE80',
  },
  tabsTrack: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    gap: 1,
  },
  tabBtnActive: {
    backgroundColor: '#041912',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#64748B',
  },
  tabLabelActive: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  tabValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#041912',
  },
  tabValueActive: {
    color: '#4ADE80',
  },
  tabContentArea: {
    height: 220,
    paddingHorizontal: 20,
  },
  gridWrapper: {
    flex: 1,
  },
  gridInstruction: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  yearsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 16,
  },
  yearChip: {
    width: '23%',
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearChipSelected: {
    backgroundColor: '#041912',
    borderColor: '#059669',
  },
  yearChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#041912',
  },
  yearChipTextSelected: {
    color: '#4ADE80',
    fontFamily: 'Inter_700Bold',
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthCard: {
    width: '31%',
    height: 54,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 8,
    justifyContent: 'center',
  },
  monthCardSelected: {
    backgroundColor: '#041912',
    borderColor: '#059669',
  },
  monthNumberText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#059669',
  },
  monthNumberTextSelected: {
    color: '#4ADE80',
  },
  monthNameText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#041912',
    marginTop: 2,
  },
  monthNameTextSelected: {
    color: '#FFFFFF',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    paddingBottom: 16,
  },
  dayChip: {
    width: '12.5%',
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipSelected: {
    backgroundColor: '#041912',
    borderColor: '#059669',
  },
  dayChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#041912',
  },
  dayChipTextSelected: {
    color: '#4ADE80',
    fontFamily: 'Inter_700Bold',
  },
  manualInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  manualLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: '#64748B',
  },
  manualInputsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  manualBox: {
    width: 44,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#041912',
  },
  manualSlash: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#94A3B8',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: '#041912',
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(4, 25, 18, 0.90)',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontFamily: 'Inter_700Bold',
  },
});
