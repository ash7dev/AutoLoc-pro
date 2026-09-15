import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { X, MapPin, Calendar as CalendarIcon, Car, Search, Check, Sparkles, SlidersHorizontal } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { AutoCalendar } from '../../../shared/components/AutoCalendar';
import { AutoButton } from '../../../shared/components/AutoButton';

export interface AirbnbSearchModalProps {
  visible: boolean;
  onClose: () => void;
  initialZone?: string;
  initialType?: string;
  initialDateDebut?: string;
  initialDateFin?: string;
  onSearch: (filters: {
    zone: string;
    type: string;
    dateDebut?: string;
    dateFin?: string;
  }) => void;
}

const ZONES = [
  { value: '', label: 'Toutes les zones' },
  { value: 'Dakar', label: '📍 Dakar & Almadies' },
  { value: 'Saly', label: '🏖️ Saly / Mbour' },
  { value: 'AIBD', label: '✈️ Aéroport AIBD (Diass)' },
  { value: 'Thiès', label: '🏙️ Thiès' },
  { value: 'Saint-Louis', label: '🏛️ Saint-Louis' },
  { value: 'Ziguinchor', label: '🌴 Ziguinchor' },
];

const TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'SUV', label: '🚘 SUV & 4×4' },
  { value: 'BERLINE', label: '🚗 Berlines Premium' },
  { value: 'LUXE', label: '✨ Luxe & VIP' },
  { value: 'PICKUP', label: '🛻 Pick-ups' },
  { value: 'CITADINE', label: '🚕 Citadines' },
];

export const AirbnbSearchModal: React.FC<AirbnbSearchModalProps> = ({
  visible,
  onClose,
  initialZone = '',
  initialType = '',
  initialDateDebut,
  initialDateFin,
  onSearch,
}) => {
  const [zone, setZone] = useState(initialZone);
  const [type, setType] = useState(initialType);
  const [dateDebut, setDateDebut] = useState<string | undefined>(initialDateDebut);
  const [dateFin, setDateFin] = useState<string | undefined>(initialDateFin);

  useEffect(() => {
    if (visible) {
      setZone(initialZone);
      setType(initialType);
      setDateDebut(initialDateDebut);
      setDateFin(initialDateFin);
    }
  }, [visible, initialZone, initialType, initialDateDebut, initialDateFin]);

  const calculateDays = (): number | null => {
    if (!dateDebut || !dateFin) return null;
    const start = new Date(`${dateDebut}T00:00:00`).getTime();
    const end = new Date(`${dateFin}T00:00:00`).getTime();
    const diff = Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)));
    return diff;
  };

  const durationDays = calculateDays();

  const handleSelectDates = (start: string, end?: string) => {
    setDateDebut(start);
    setDateFin(end);
  };

  const handleReset = () => {
    setZone('');
    setType('');
    setDateDebut(undefined);
    setDateFin(undefined);
  };

  const handleSubmitSearch = () => {
    onSearch({
      zone,
      type,
      dateDebut,
      dateFin,
    });
    onClose();
  };

  const formatDateDisplay = (isoStr?: string) => {
    if (!isoStr) return 'Sélectionner';
    const d = new Date(`${isoStr}T00:00:00`);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.backdropOverlay}>
        <TouchableOpacity style={styles.backdropTouchable} onPress={onClose} activeOpacity={1} />

        {/* Bottom Sheet Luxury Klef / AutoLoc */}
        <View style={styles.sheetContainer}>
          {/* Header & Poignée */}
          <View style={styles.sheetHeader}>
            <View style={styles.dragHandle} />
            <View style={styles.headerTextRow}>
              <View style={styles.headerTitleBox}>
                <Text style={styles.sheetTitle}>Où & quand louer ?</Text>
                <Text style={styles.sheetSubtitle}>Filtres de réservation · Sénégal</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                <X size={16} color={theme.primitives.forest[800]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Formulaire Déroulant */}
          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Section 1 : Destination / Zone */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionLabelRow}>
                <MapPin size={15} color={theme.colors.brand.main} />
                <Text style={styles.sectionLabelText}>DESTINATION / ZONE DE PRISE EN CHARGE</Text>
              </View>
              <View style={styles.chipsWrap}>
                {ZONES.map((z) => {
                  const isSelected = zone === z.value;
                  return (
                    <TouchableOpacity
                      key={z.value}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setZone(z.value)}
                      activeOpacity={0.8}
                    >
                      {isSelected && <Check size={13} color="#FFFFFF" style={styles.checkIcon} />}
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {z.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 2 : Dates de location */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionHeaderBetween}>
                <View style={styles.sectionLabelRow}>
                  <CalendarIcon size={15} color={theme.colors.brand.main} />
                  <Text style={styles.sectionLabelText}>DATES DE SÉJOUR</Text>
                </View>
                {durationDays !== null && (
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationBadgeText}>
                      {durationDays} jour{durationDays > 1 ? 's' : ''} sélectionné{durationDays > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>

              {/* Synthèse Départ / Arrivée */}
              <View style={styles.datesSummaryGrid}>
                <View style={styles.dateSummaryCard}>
                  <Text style={styles.dateSummaryLabel}>DÉPART / DEBUT</Text>
                  <Text style={styles.dateSummaryValue}>{formatDateDisplay(dateDebut)}</Text>
                </View>
                <View style={styles.dateSummaryCard}>
                  <Text style={styles.dateSummaryLabel}>RETOUR / FIN</Text>
                  <Text style={styles.dateSummaryValue}>{formatDateDisplay(dateFin)}</Text>
                </View>
              </View>

              {/* Calendrier AutoCalendar */}
              <AutoCalendar
                startDate={dateDebut}
                endDate={dateFin}
                onSelectDates={handleSelectDates}
              />
            </View>

            {/* Section 3 : Catégorie de Véhicule */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionLabelRow}>
                <Car size={15} color={theme.colors.brand.main} />
                <Text style={styles.sectionLabelText}>CATÉGORIE DE VÉHICULE</Text>
              </View>
              <View style={styles.chipsWrap}>
                {TYPES.map((t) => {
                  const isSelected = type === t.value;
                  return (
                    <TouchableOpacity
                      key={t.value}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setType(t.value)}
                      activeOpacity={0.8}
                    >
                      {isSelected && <Sparkles size={13} color="#F59E0B" style={styles.checkIcon} />}
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Fixe avec Boutons Action Émeraude Pilule 9999px */}
          <SafeAreaView style={styles.footerSafeArea}>
            <View style={styles.footerRow}>
              <AutoButton
                title="Effacer"
                variant="ghost"
                onPress={handleReset}
                size="md"
              />

              <AutoButton
                title="Afficher les résultats"
                variant="action"
                leftIcon={<Search size={16} color="#FFFFFF" />}
                onPress={handleSubmitSearch}
                size="md"
                style={styles.submitBtn}
              />
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 25, 18, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: theme.radius.card, // 20px (radius-card)
    borderTopRightRadius: theme.radius.card,
    maxHeight: '88%',
    ...theme.elevation.lg,
  },
  sheetHeader: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#E4EBDB',
    alignItems: 'center',
  },
  dragHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4DCD0',
    marginBottom: theme.spacing[2],
  },
  headerTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitleBox: {
    flex: 1,
  },
  sheetTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold, // Fraunces_600SemiBold 20px (Plafond 600)
    fontSize: 20,
    color: theme.primitives.forest[800], // #041912
  },
  sheetSubtitle: {
    fontFamily: theme.typography.fontFamily.regular, // Inter_400Regular
    fontSize: 12,
    color: '#5F6B59',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.full,
    backgroundColor: '#F1F6EA',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    padding: theme.spacing[5],
    gap: theme.spacing[5],
  },
  sectionBox: {
    gap: theme.spacing[3],
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabelText: {
    fontFamily: theme.typography.fontFamily.bold, // Inter_700Bold 10px uppercase
    fontSize: 10,
    color: '#7D8975',
    letterSpacing: 0.8,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationBadge: {
    backgroundColor: theme.colors.brand.subtle,
    borderWidth: 1,
    borderColor: theme.colors.brand.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full, // Pilule 9999px
  },
  durationBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: theme.colors.brand.main,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FBF4',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.radius.full, // Pilule universelle 9999px
  },
  chipActive: {
    backgroundColor: theme.primitives.forest[800], // Forest-950 (#041912)
    borderColor: theme.primitives.forest[800],
  },
  checkIcon: {
    marginRight: 6,
  },
  chipText: {
    fontFamily: theme.typography.fontFamily.medium, // Inter_500Medium
    fontSize: 12,
    color: theme.colors.text.primary,
  },
  chipTextActive: {
    fontFamily: theme.typography.fontFamily.bold, // Inter_700Bold
    color: '#FFFFFF',
  },
  datesSummaryGrid: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    backgroundColor: '#F8FBF4',
    padding: theme.spacing[2],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4EBDB',
  },
  dateSummaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: theme.radius.base,
    borderWidth: 1,
    borderColor: '#E4EBDB',
  },
  dateSummaryLabel: {
    fontFamily: theme.typography.fontFamily.bold, // Inter_700Bold 9.5px
    fontSize: 9.5,
    color: '#7D8975',
    letterSpacing: 0.4,
  },
  dateSummaryValue: {
    fontFamily: theme.typography.fontFamily.bold, // Inter_700Bold
    fontSize: 13,
    color: theme.primitives.forest[800],
    marginTop: 2,
  },
  footerSafeArea: {
    borderTopWidth: 1,
    borderTopColor: '#E4EBDB',
    backgroundColor: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    gap: theme.spacing[3],
  },
  submitBtn: {
    flex: 1,
  },
});
