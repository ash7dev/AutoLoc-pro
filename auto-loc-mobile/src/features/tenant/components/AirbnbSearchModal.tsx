import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { X, MapPin, Calendar as CalendarIcon, Car, Search, Check, Sparkles, Zap, ChevronRight } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { AutoCalendar } from '../../../shared/components/AutoCalendar';

const { width: screenWidth } = Dimensions.get('window');

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
  { value: '', label: 'Tout Dakar', subtitle: 'Tous les véhicules disponibles', icon: '📍' },
  { value: 'HorsDakar', label: 'Autorisé Hors Dakar', subtitle: 'Voyages en régions & Saly', icon: '🛣️' },
  { value: 'AIBD', label: 'Aéroport AIBD (Diass)', subtitle: 'Livraison terminal aéroport', icon: '✈️' },
];

const TYPES = [
  { value: '', label: 'Tous les types', badge: 'TOUT', subtitle: 'Catalogue complet', icon: '🚗' },
  { value: 'SUV', label: 'SUV & 4×4', badge: 'POPULAIRE', subtitle: 'Polyvalent & confort', icon: '🚘' },
  { value: 'LUXE', label: 'Luxe & Prestige', badge: 'EXCLUSIF', subtitle: 'Véhicules haut de gamme', icon: '✨' },
  { value: 'BERLINE', label: 'Berlines Premium', badge: 'BUSINESS', subtitle: 'Élégance & longs trajets', icon: '🏎️' },
  { value: 'PICKUP', label: 'Pick-up Tout-Terrain', badge: 'ROBUSTE', subtitle: 'Capacité & 4WD', icon: '🛻' },
  { value: 'CITADINE', label: 'Citadines Éco', badge: 'URBAIN', subtitle: 'Agile & économique', icon: '🚕' },
];

type StepType = 'zone' | 'dates' | 'type';

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

  // Étape active pour l'accordéon compact
  const [activeStep, setActiveStep] = useState<StepType>('zone');

  useEffect(() => {
    if (visible) {
      setZone(initialZone);
      setType(initialType);
      setDateDebut(initialDateDebut);
      setDateFin(initialDateFin);
      setActiveStep('zone');
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

  // Presets intelligents
  const handlePresetWeekEnd = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);

    setDateDebut(friday.toISOString().split('T')[0]);
    setDateFin(sunday.toISOString().split('T')[0]);
  };

  const handlePreset7Days = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    setDateDebut(today.toISOString().split('T')[0]);
    setDateFin(nextWeek.toISOString().split('T')[0]);
  };

  const handlePreset14Days = () => {
    const today = new Date();
    const next2Weeks = new Date(today);
    next2Weeks.setDate(today.getDate() + 14);
    setDateDebut(today.toISOString().split('T')[0]);
    setDateFin(next2Weeks.toISOString().split('T')[0]);
  };

  const handleReset = () => {
    setZone('');
    setType('');
    setDateDebut(undefined);
    setDateFin(undefined);
    setActiveStep('zone');
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
    if (!isoStr) return '';
    const d = new Date(`${isoStr}T00:00:00`);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const selectedZoneObj = ZONES.find((z) => z.value === zone) || ZONES[0];
  const selectedTypeObj = TYPES.find((t) => t.value === type) || TYPES[0];

  const datesSummaryText = dateDebut && dateFin
    ? `${formatDateDisplay(dateDebut)} - ${formatDateDisplay(dateFin)} (${durationDays}j)`
    : 'Ajouter des dates';

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.backdropOverlay}>
        <TouchableOpacity style={styles.backdropTouchable} onPress={onClose} activeOpacity={1} />

        {/* Sheet Container Luxe Compact */}
        <View style={styles.sheetContainer}>
          {/* Header & Poignée */}
          <View style={styles.sheetHeader}>
            <View style={styles.dragHandle} />

            <View style={styles.headerTextRow}>
              <View style={styles.headerTitleBox}>
                <View style={styles.badgeLuxuryHeader}>
                  <Sparkles size={11} color="#059669" />
                  <Text style={styles.badgeLuxuryText}>RECHERCHE RAPIDE · DAKAR</Text>
                </View>
                <Text style={styles.sheetTitle}>Où & quand louer ?</Text>
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                <X size={16} color="#041912" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Formulaire Accordéon Ultra-Compact */}
          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* ---------------------------------------------------- */}
            {/* ETAPE 1 : ZONE / PERIMETRE DE DEPLACEMENT */}
            {/* ---------------------------------------------------- */}
            <View style={[styles.accordionCard, activeStep === 'zone' && styles.accordionCardActive]}>
              {activeStep !== 'zone' ? (
                // Mode Résumé Replié
                <TouchableOpacity
                  style={styles.collapsedHeader}
                  onPress={() => setActiveStep('zone')}
                  activeOpacity={0.8}
                >
                  <View style={styles.collapsedLeft}>
                    <Text style={styles.collapsedStepLabel}>PÉRIMÈTRE</Text>
                    <Text style={styles.collapsedValueText}>
                      {selectedZoneObj.icon} {selectedZoneObj.label}
                    </Text>
                  </View>
                  <View style={styles.editPill}>
                    <Text style={styles.editPillText}>Modifier</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                // Mode Déplié (Contenu actif)
                <View style={styles.expandedContent}>
                  <View style={styles.stepTitleRow}>
                    <View style={styles.sectionIconBadge}>
                      <MapPin size={13} color="#059669" />
                    </View>
                    <Text style={styles.stepTitleText}>OÙ VOULEZ-VOUS ROULER ?</Text>
                  </View>

                  <View style={styles.zoneStack}>
                    {ZONES.map((z) => {
                      const isSelected = zone === z.value;
                      return (
                        <TouchableOpacity
                          key={z.value}
                          style={[styles.zoneRowCard, isSelected && styles.zoneRowCardActive]}
                          onPress={() => {
                            setZone(z.value);
                            setActiveStep('dates');
                          }}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.zoneRowIcon}>{z.icon}</Text>
                          <View style={styles.zoneRowTextContainer}>
                            <Text style={[styles.zoneRowLabel, isSelected && styles.zoneRowLabelActive]}>
                              {z.label}
                            </Text>
                            <Text style={[styles.zoneRowSubtitle, isSelected && styles.zoneRowSubtitleActive]}>
                              {z.subtitle}
                            </Text>
                          </View>

                          <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                            {isSelected && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* ---------------------------------------------------- */}
            {/* ETAPE 2 : DATES DU SEJOUR */}
            {/* ---------------------------------------------------- */}
            <View style={[styles.accordionCard, activeStep === 'dates' && styles.accordionCardActive]}>
              {activeStep !== 'dates' ? (
                // Mode Résumé Replié
                <TouchableOpacity
                  style={styles.collapsedHeader}
                  onPress={() => setActiveStep('dates')}
                  activeOpacity={0.8}
                >
                  <View style={styles.collapsedLeft}>
                    <Text style={styles.collapsedStepLabel}>DATES DE LOCATION</Text>
                    <Text style={styles.collapsedValueText}>
                      📅 {datesSummaryText}
                    </Text>
                  </View>
                  <View style={styles.editPill}>
                    <Text style={styles.editPillText}>Modifier</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                // Mode Déplié (Contenu actif)
                <View style={styles.expandedContent}>
                  <View style={styles.stepTitleRowBetween}>
                    <View style={styles.stepTitleRow}>
                      <View style={styles.sectionIconBadge}>
                        <CalendarIcon size={13} color="#059669" />
                      </View>
                      <Text style={styles.stepTitleText}>QUAND SOUHAITEZ-VOUS LOUER ?</Text>
                    </View>

                    {durationDays !== null && (
                      <View style={styles.durationBadge}>
                        <Sparkles size={11} color="#059669" />
                        <Text style={styles.durationBadgeText}>{durationDays}j</Text>
                      </View>
                    )}
                  </View>

                  {/* Raccourcis Rapides 1-Tap (Presets) */}
                  <View style={styles.presetsRow}>
                    <TouchableOpacity style={styles.presetPill} onPress={handlePresetWeekEnd} activeOpacity={0.8}>
                      <Zap size={11} color="#059669" />
                      <Text style={styles.presetPillText}>Ce week-end</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.presetPill} onPress={handlePreset7Days} activeOpacity={0.8}>
                      <Text style={styles.presetEmoji}>🗓️</Text>
                      <Text style={styles.presetPillText}>7 jours</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.presetPill} onPress={handlePreset14Days} activeOpacity={0.8}>
                      <Text style={styles.presetEmoji}>🌟</Text>
                      <Text style={styles.presetPillText}>14 jours</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Calendrier AutoCalendar */}
                  <AutoCalendar
                    startDate={dateDebut}
                    endDate={dateFin}
                    onSelectDates={handleSelectDates}
                  />

                  <TouchableOpacity
                    style={styles.nextStepBtn}
                    onPress={() => setActiveStep('type')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.nextStepBtnText}>Valider les dates</Text>
                    <ChevronRight size={15} color="#041912" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ---------------------------------------------------- */}
            {/* ETAPE 3 : CATEGORIE DE VEHICULE */}
            {/* ---------------------------------------------------- */}
            <View style={[styles.accordionCard, activeStep === 'type' && styles.accordionCardActive]}>
              {activeStep !== 'type' ? (
                // Mode Résumé Replié
                <TouchableOpacity
                  style={styles.collapsedHeader}
                  onPress={() => setActiveStep('type')}
                  activeOpacity={0.8}
                >
                  <View style={styles.collapsedLeft}>
                    <Text style={styles.collapsedStepLabel}>CATÉGORIE DE VÉHICULE</Text>
                    <Text style={styles.collapsedValueText}>
                      {selectedTypeObj.icon} {selectedTypeObj.label}
                    </Text>
                  </View>
                  <View style={styles.editPill}>
                    <Text style={styles.editPillText}>Modifier</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                // Mode Déplié (Contenu actif)
                <View style={styles.expandedContent}>
                  <View style={styles.stepTitleRow}>
                    <View style={styles.sectionIconBadge}>
                      <Car size={13} color="#059669" />
                    </View>
                    <Text style={styles.stepTitleText}>QUEL TYPE DE VÉHICULE ?</Text>
                  </View>

                  <View style={styles.typeGrid}>
                    {TYPES.map((t) => {
                      const isSelected = type === t.value;
                      return (
                        <TouchableOpacity
                          key={t.value}
                          style={[styles.typePillCard, isSelected && styles.typePillCardActive]}
                          onPress={() => setType(t.value)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.typePillIcon}>{t.icon}</Text>
                          <View style={styles.typePillTextContent}>
                            <Text style={[styles.typePillLabel, isSelected && styles.typePillLabelActive]}>
                              {t.label}
                            </Text>
                            <Text style={[styles.typePillSubtitle, isSelected && styles.typePillSubtitleActive]}>
                              {t.subtitle}
                            </Text>
                          </View>
                          {isSelected && (
                            <View style={styles.typeCheckBadge}>
                              <Check size={10} color="#FFFFFF" strokeWidth={3} />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Fixe Luxe */}
          <SafeAreaView style={styles.footerSafeArea}>
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
                <Text style={styles.resetBtnText}>Effacer</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitSearch} activeOpacity={0.85}>
                <Search size={15} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.submitBtnText}>Rechercher</Text>
                <View style={styles.emeraldArrowCircle}>
                  <Sparkles size={11} color="#4ADE80" />
                </View>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(4, 21, 15, 0.70)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHeader: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
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
  badgeLuxuryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    marginBottom: 3,
  },
  badgeLuxuryText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    letterSpacing: 0.6,
    color: '#059669',
  },
  sheetTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 20,
    color: '#041912',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    padding: theme.spacing[4],
    gap: 10,
  },
  // Accordion Styling
  accordionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  accordionCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#041912',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  collapsedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  collapsedLeft: {
    flex: 1,
    gap: 2,
  },
  collapsedStepLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#64748B',
    letterSpacing: 0.6,
  },
  collapsedValueText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#041912',
  },
  editPill: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editPillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#059669',
  },
  expandedContent: {
    padding: 14,
    gap: 12,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepTitleRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitleText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#041912',
    letterSpacing: 0.6,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  durationBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#059669',
  },
  // Zone Rows
  zoneStack: {
    gap: 8,
  },
  zoneRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 12,
    borderRadius: 14,
    gap: 10,
  },
  zoneRowCardActive: {
    backgroundColor: '#041912',
    borderColor: '#041912',
  },
  zoneRowIcon: {
    fontSize: 18,
  },
  zoneRowTextContainer: {
    flex: 1,
  },
  zoneRowLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#041912',
  },
  zoneRowLabelActive: {
    color: '#FFFFFF',
  },
  zoneRowSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10.5,
    color: '#64748B',
  },
  zoneRowSubtitleActive: {
    color: 'rgba(255, 255, 255, 0.70)',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  // Presets & Dates
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  presetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
  },
  presetEmoji: {
    fontSize: 11,
  },
  presetPillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#059669',
  },
  nextStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  nextStepBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#041912',
  },
  // Type Grid
  typeGrid: {
    gap: 8,
  },
  typePillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 10,
    borderRadius: 14,
    gap: 10,
  },
  typePillCardActive: {
    backgroundColor: '#041912',
    borderColor: '#041912',
  },
  typePillIcon: {
    fontSize: 18,
  },
  typePillTextContent: {
    flex: 1,
  },
  typePillLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#041912',
  },
  typePillLabelActive: {
    color: '#FFFFFF',
  },
  typePillSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: '#64748B',
  },
  typePillSubtitleActive: {
    color: 'rgba(255, 255, 255, 0.70)',
  },
  typeCheckBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSafeArea: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    gap: theme.spacing[3],
  },
  resetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  resetBtnText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(4, 25, 18, 0.90)',
    gap: 8,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  emeraldArrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
});
