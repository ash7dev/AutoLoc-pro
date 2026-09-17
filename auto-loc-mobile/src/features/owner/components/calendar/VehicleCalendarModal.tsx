import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  Unlock,
  Clock,
  Wrench,
  User,
  Plane,
  CheckCircle2,
  Zap,
  Sparkles,
  Info,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { ownerApi, OwnerVehicle, VehicleIndisponibilite } from '../../api/ownerApi';

interface VehicleCalendarModalProps {
  visible: boolean;
  vehicle: OwnerVehicle | null;
  onClose: () => void;
}

const PRESET_MOTIFS = [
  { id: 'personal', label: 'Usage personnel', icon: User },
  { id: 'maintenance', label: 'Entretien & Vidange', icon: Wrench },
  { id: 'travel', label: 'Voyage Hôte', icon: Plane },
  { id: 'other', label: 'Autre motif', icon: Lock },
];

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Helper: Obtenir aujourd'hui au format YYYY-MM-DD en heure locale
const getTodayLocalStr = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Helper: Normaliser n'importe quelle date en YYYY-MM-DD
const normalizeDateStr = (dateVal: string | Date | undefined): string => {
  if (!dateVal) return '';
  const str = typeof dateVal === 'string' ? dateVal : dateVal.toISOString();
  return str.substring(0, 10);
};

// Helper: Formater une date en format français lisible (ex: 12 oct. 2026)
const formatFrenchDate = (dateVal: string | Date | undefined): string => {
  if (!dateVal) return '';
  const str = normalizeDateStr(dateVal);
  if (!str || str.length < 10) return String(dateVal);
  const [y, m, d] = str.split('-');
  const monthIdx = parseInt(m, 10) - 1;
  const shortMonths = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
  ];
  const monthName = shortMonths[monthIdx] || m;
  return `${parseInt(d, 10)} ${monthName} ${y}`;
};

// Helper: Calculer le nombre de jours de location
const getDaysCount = (start: string | Date | undefined, end: string | Date | undefined): number => {
  if (!start) return 1;
  const s = normalizeDateStr(start);
  const e = end ? normalizeDateStr(end) : s;
  const d1 = new Date(s);
  const d2 = new Date(e);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
};

export const VehicleCalendarModal: React.FC<VehicleCalendarModalProps> = ({
  visible,
  vehicle,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Indisponibilités créées par l'hôte
  const [indisponibilites, setIndisponibilites] = useState<VehicleIndisponibilite[]>([]);
  // Ensemble complet des dates bloquées (réservations locataires + blocages hôte)
  const [allBlockedDates, setAllBlockedDates] = useState<Set<string>>(new Set());

  // Mois actuellement affiché
  const [currentDate, setCurrentDate] = useState(new Date());

  // Sélection de plage de dates (Date de début et Date de fin)
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [selectedMotif, setSelectedMotif] = useState<string>('Usage personnel');

  // Charger les données de disponibilité réelles depuis le backend NestJS
  const fetchCalendarData = useCallback(async () => {
    if (!vehicle?.id) return;
    try {
      setLoading(true);
      const [hostBlocks, allDates] = await Promise.all([
        ownerApi.getIndisponibilites(vehicle.id),
        ownerApi.getVehicleBlockedDates(vehicle.id),
      ]);

      setIndisponibilites(hostBlocks);
      const blockedSet = new Set<string>();

      // Ajouter toutes les dates bloquées globales
      allDates.forEach((d) => blockedSet.add(normalizeDateStr(d)));

      // Ajouter les plages des blocages hôte
      hostBlocks.forEach((ib) => {
        const start = normalizeDateStr(ib.dateDebut);
        const end = normalizeDateStr(ib.dateFin);
        let cur = new Date(start);
        const last = new Date(end);
        while (cur <= last) {
          const formatted = normalizeDateStr(cur);
          blockedSet.add(formatted);
          cur.setDate(cur.getDate() + 1);
        }
      });

      setAllBlockedDates(blockedSet);
    } catch (err) {
      console.warn('Erreur lors du chargement des données du calendrier:', err);
    } finally {
      setLoading(false);
    }
  }, [vehicle?.id]);

  useEffect(() => {
    if (visible && vehicle) {
      fetchCalendarData();
      setSelectedStartDate(null);
      setSelectedEndDate(null);
    }
  }, [visible, vehicle, fetchCalendarData]);

  if (!visible || !vehicle) return null;

  // Navigation des mois
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const todayStr = getTodayLocalStr();

  // Déterminer si une date est un blocage HÔTE
  const getHostBlock = (dateStr: string): VehicleIndisponibilite | undefined => {
    const targetDay = normalizeDateStr(dateStr);
    return indisponibilites.find((indispo) => {
      const startDay = normalizeDateStr(indispo.dateDebut);
      const endDay = normalizeDateStr(indispo.dateFin);
      return targetDay >= startDay && targetDay <= endDay;
    });
  };

  // Déterminer le statut exact d'une date (DISPONIBLE, RESEVE_LOCATAIRE, BLOQUE_HOTE)
  const getDateStatus = (dateStr: string): 'DISPONIBLE' | 'RESERVE_LOCATAIRE' | 'BLOQUE_HOTE' => {
    const targetDay = normalizeDateStr(dateStr);
    const hostBlock = getHostBlock(targetDay);
    if (hostBlock) return 'BLOQUE_HOTE';
    if (allBlockedDates.has(targetDay)) return 'RESERVE_LOCATAIRE';
    return 'DISPONIBLE';
  };

  // Vérifier si une plage contient des dates bloquées
  const hasBlockedDatesInRange = (startStr: string, endStr: string): boolean => {
    let cur = new Date(startStr);
    const last = new Date(endStr);
    while (cur <= last) {
      const formatted = normalizeDateStr(cur);
      if (getDateStatus(formatted) !== 'DISPONIBLE') {
        return true;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  };

  // Gestion du clic sur une date de la grille
  const handleDatePress = (dateStr: string) => {
    if (dateStr < todayStr) {
      Alert.alert('Date passée', 'Impossible de sélectionner une date déjà passée.');
      return;
    }

    const status = getDateStatus(dateStr);
    if (status === 'BLOQUE_HOTE') {
      const hostBlock = getHostBlock(dateStr);
      Alert.alert(
        'Période bloquée',
        `Cette date est bloquée par l'hôte : ${hostBlock?.motif || 'Motif non précisé'}`
      );
      return;
    }

    if (status === 'RESERVE_LOCATAIRE') {
      Alert.alert('Réservation locataire', 'Cette date est déjà réservée par un locataire AutoLoc.');
      return;
    }

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(dateStr);
      setSelectedEndDate(null);
    } else {
      if (dateStr < selectedStartDate) {
        setSelectedStartDate(dateStr);
        setSelectedEndDate(null);
      } else {
        if (hasBlockedDatesInRange(selectedStartDate, dateStr)) {
          Alert.alert(
            'Plage invalide',
            'La période sélectionnée contient déjà des dates indisponibles. Veuillez choisir une plage libre.'
          );
          return;
        }
        setSelectedEndDate(dateStr);
      }
    }
  };

  // Presets de raccourcis rapides
  const handleQuickPreset = (presetType: 'today' | 'weekend' | 'week') => {
    const today = new Date();
    const startStr = getTodayLocalStr();

    if (presetType === 'today') {
      if (getDateStatus(startStr) === 'DISPONIBLE') {
        setSelectedStartDate(startStr);
        setSelectedEndDate(startStr);
      } else {
        Alert.alert('Aujourd’hui indisponible', 'Aujourd’hui est déjà bloqué ou réservé.');
      }
    } else if (presetType === 'weekend') {
      // Trouver le prochain samedi
      const dayOfWeek = today.getDay();
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
      const sat = new Date(today);
      sat.setDate(today.getDate() + (daysUntilSaturday === 0 ? 0 : daysUntilSaturday));
      const sun = new Date(sat);
      sun.setDate(sat.getDate() + 1);

      const satStr = normalizeDateStr(sat);
      const sunStr = normalizeDateStr(sun);

      if (!hasBlockedDatesInRange(satStr, sunStr)) {
        setSelectedStartDate(satStr);
        setSelectedEndDate(sunStr);
      } else {
        Alert.alert('Week-end indisponible', 'Le week-end à venir contient des dates déjà occupées.');
      }
    } else if (presetType === 'week') {
      const endWeek = new Date(today);
      endWeek.setDate(today.getDate() + 6);
      const endStr = normalizeDateStr(endWeek);

      if (!hasBlockedDatesInRange(startStr, endStr)) {
        setSelectedStartDate(startStr);
        setSelectedEndDate(endStr);
      } else {
        Alert.alert('Semaine indisponible', 'Les 7 prochains jours contiennent des dates déjà occupées.');
      }
    }
  };

  // Enregistrer le blocage de la période
  const handleBlockPeriod = async () => {
    if (!selectedStartDate) return;
    const startDate = selectedStartDate;
    const endDate = selectedEndDate || selectedStartDate;

    try {
      setSubmitting(true);
      const res = await ownerApi.createIndisponibilite(vehicle.id, {
        dateDebut: startDate,
        dateFin: endDate,
        motif: selectedMotif,
      });

      const newItem: VehicleIndisponibilite = res || {
        id: `indispo-${Date.now()}`,
        vehiculeId: vehicle.id,
        dateDebut: startDate,
        dateFin: endDate,
        motif: selectedMotif,
      };

      setIndisponibilites((prev) => [...prev, newItem]);

      // Mettre à jour le Set des dates bloquées
      setAllBlockedDates((prev) => {
        const nextSet = new Set(prev);
        let cur = new Date(startDate);
        const last = new Date(endDate);
        while (cur <= last) {
          nextSet.add(normalizeDateStr(cur));
          cur.setDate(cur.getDate() + 1);
        }
        return nextSet;
      });

      setSelectedStartDate(null);
      setSelectedEndDate(null);

      // Re-synchroniser avec l'API
      fetchCalendarData();

      Alert.alert(
        'Période bloquée',
        `Période du ${startDate} au ${endDate} enregistrée avec succès (${selectedMotif}).`
      );
    } catch {
      Alert.alert('Erreur', 'Impossible de bloquer cette période. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer une indisponibilité (Débloquer)
  const handleUnblockPeriod = (indispo: VehicleIndisponibilite) => {
    const startStr = normalizeDateStr(indispo.dateDebut);
    const endStr = normalizeDateStr(indispo.dateFin);

    Alert.alert(
      'Débloquer cette période ?',
      `Le véhicule sera à nouveau disponible à la réservation du ${startStr} au ${endStr}.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Débloquer',
          style: 'destructive',
          onPress: async () => {
            try {
              setIndisponibilites((prev) => prev.filter((i) => i.id !== indispo.id));
              await ownerApi.deleteIndisponibilite(vehicle.id, indispo.id);
              await fetchCalendarData();
            } catch {
              fetchCalendarData();
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#041912" />

        {/* Header Dark Obsidian Glass */}
        <LinearGradient
          colors={['#072A20', '#041912', '#020F0B']}
          locations={[0, 0.6, 1]}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <X size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerThumbBox}>
            {vehicle.photoUrl ? (
              <Image source={{ uri: vehicle.photoUrl }} style={styles.headerThumbImage} contentFit="cover" transition={180} />
            ) : (
              <CalendarIcon size={18} color="#34D399" />
            )}
          </View>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle} numberOfLines={1}>Calendrier & Disponibilités</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {vehicle.marque} {vehicle.modele} • {vehicle.ville} ({vehicle.annee})
            </Text>
          </View>

          <View style={styles.badgeStatut}>
            <View style={styles.greenPulse} />
            <Text style={styles.badgeStatutText}>En Ligne</Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Quick Raccourcis Presets */}
          <View style={styles.presetsCard}>
            <Text style={styles.presetsTitle}>Sélection rapide :</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
              <TouchableOpacity style={styles.presetChip} onPress={() => handleQuickPreset('today')}>
                <Zap size={13} color="#059669" />
                <Text style={styles.presetChipText}>Aujourd'hui</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.presetChip} onPress={() => handleQuickPreset('weekend')}>
                <Sparkles size={13} color="#059669" />
                <Text style={styles.presetChipText}>Ce week-end</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.presetChip} onPress={() => handleQuickPreset('week')}>
                <CalendarIcon size={13} color="#059669" />
                <Text style={styles.presetChipText}>7 jours à venir</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Grille du Calendrier */}
          <View style={styles.calendarCard}>
            {/* Header du mois */}
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES[month]} {year}
              </Text>

              <View style={styles.monthNavRow}>
                <TouchableOpacity style={styles.monthNavBtn} onPress={handlePrevMonth}>
                  <ChevronLeft size={20} color="#0F172A" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.monthNavBtn} onPress={handleNextMonth}>
                  <ChevronRight size={20} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Légende explicative */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Libre</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>Réservé</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.legendText}>Bloqué Hôte</Text>
              </View>
            </View>

            {/* En-tête jours de la semaine */}
            <View style={styles.daysOfWeekRow}>
              {DAYS_OF_WEEK.map((day, idx) => (
                <Text key={idx} style={styles.dayOfWeekText}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Grille des jours */}
            <View style={styles.gridContainer}>
              {loading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color="#059669" />
                  <Text style={styles.loadingText}>Mise à jour du calendrier...</Text>
                </View>
              ) : (
                <View style={styles.gridDays}>
                  {/* Empty cells before month start */}
                  {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <View key={`empty-${idx}`} style={styles.dayCellEmpty} />
                  ))}

                  {/* Day Cells */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateStr = formatDateStr(year, month, dayNum);
                    const isPast = dateStr < todayStr;
                    const status = getDateStatus(dateStr);

                    const isStart = dateStr === selectedStartDate;
                    const isEnd = dateStr === selectedEndDate;
                    const isSelected =
                      (selectedStartDate && dateStr === selectedStartDate) ||
                      (selectedEndDate && dateStr === selectedEndDate) ||
                      (selectedStartDate &&
                        selectedEndDate &&
                        dateStr > selectedStartDate &&
                        dateStr < selectedEndDate);

                    return (
                      <TouchableOpacity
                        key={`day-${dayNum}`}
                        style={[
                          styles.dayCell,
                          isPast && styles.dayCellPast,
                          status === 'BLOQUE_HOTE' && styles.dayCellBlockedHost,
                          status === 'RESERVE_LOCATAIRE' && styles.dayCellReservedRenter,
                          isSelected && styles.dayCellSelected,
                          (isStart || isEnd) && styles.dayCellSelectedBorder,
                        ]}
                        onPress={() => handleDatePress(dateStr)}
                        activeOpacity={0.7}
                        disabled={isPast}
                      >
                        <Text
                          style={[
                            styles.dayNumText,
                            isPast && styles.dayNumTextPast,
                            status === 'BLOQUE_HOTE' && styles.dayNumTextBlockedHost,
                            status === 'RESERVE_LOCATAIRE' && styles.dayNumTextReservedRenter,
                            isSelected && styles.dayNumTextSelected,
                          ]}
                        >
                          {dayNum}
                        </Text>

                        {status === 'BLOQUE_HOTE' && (
                          <View style={styles.blockedBadgeDot}>
                            <Lock size={9} color="#B45309" strokeWidth={2.5} />
                          </View>
                        )}
                        {status === 'RESERVE_LOCATAIRE' && (
                          <View style={styles.blockedBadgeDot}>
                            <User size={9} color="#B91C1C" strokeWidth={2.5} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {/* Action Drawer quand des dates sont sélectionnées */}
          {selectedStartDate && (
            <View style={styles.actionPanelCard}>
              <View style={styles.actionPanelHeader}>
                <Clock size={18} color="#059669" />
                <Text style={styles.actionPanelTitle}>Bloquer cette période</Text>
              </View>

              <Text style={styles.selectedDatesText}>
                {selectedEndDate
                  ? `Du ${selectedStartDate} au ${selectedEndDate}`
                  : `Le ${selectedStartDate} (1 jour)`}
              </Text>

              {/* Sélection du motif */}
              <Text style={styles.motifLabel}>Motif de l'indisponibilité :</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.motifsRow}>
                {PRESET_MOTIFS.map((m) => {
                  const IconComp = m.icon;
                  const isSelected = selectedMotif === m.label;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.motifChip, isSelected && styles.motifChipSelected]}
                      onPress={() => setSelectedMotif(m.label)}
                      activeOpacity={0.8}
                    >
                      <IconComp size={13} color={isSelected ? '#FFFFFF' : '#475569'} />
                      <Text style={[styles.motifChipText, isSelected && styles.motifChipTextSelected]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.actionPanelButtons}>
                <TouchableOpacity
                  style={styles.cancelSelectionBtn}
                  onPress={() => {
                    setSelectedStartDate(null);
                    setSelectedEndDate(null);
                  }}
                >
                  <Text style={styles.cancelSelectionText}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.blockCtaBtnWrapper}
                  onPress={handleBlockPeriod}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#0A3E30', '#041912']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.blockCtaBtn}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#34D399" />
                    ) : (
                      <>
                        <View style={styles.blockCtaIconBox}>
                          <Lock size={13} color="#34D399" />
                        </View>
                        <Text style={styles.blockCtaText}>Bloquer ces dates</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Liste des périodes actuellement bloquées par l'hôte */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.sectionIconBadge}>
                  <Lock size={15} color="#041912" />
                </View>
                <View>
                  <View style={styles.sectionTitleFlex}>
                    <Text style={styles.sectionTitle}>Périodes bloquées</Text>
                    {indisponibilites.length > 0 && (
                      <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{indisponibilites.length}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.sectionSubtitle}>
                    Plages de dates verrouillées manuellement
                  </Text>
                </View>
              </View>
            </View>

            {indisponibilites.length > 0 ? (
              <View style={styles.indispoList}>
                {indisponibilites.map((item) => {
                  const startFormatted = formatFrenchDate(item.dateDebut);
                  const endFormatted = formatFrenchDate(item.dateFin);
                  const daysCount = getDaysCount(item.dateDebut, item.dateFin);
                  const isSingleDay = startFormatted === endFormatted;

                  return (
                    <View key={item.id} style={styles.indispoCard}>
                      <View style={styles.indispoContentLeft}>
                        <View style={styles.indispoLockBadge}>
                          <Lock size={14} color="#EF4444" />
                        </View>
                        <View style={styles.indispoMainInfo}>
                          <Text style={styles.indispoDateRange}>
                            {isSingleDay ? startFormatted : `Du ${startFormatted} au ${endFormatted}`}
                          </Text>

                          <View style={styles.indispoMetaRow}>
                            <View style={styles.motifTag}>
                              <Text style={styles.motifTagText}>
                                {item.motif || 'Indisponible'}
                              </Text>
                            </View>
                            <Text style={styles.indispoDot}>•</Text>
                            <Text style={styles.indispoDuration}>
                              {daysCount} {daysCount > 1 ? 'jours' : 'jour'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.unblockBtn}
                        onPress={() => handleUnblockPeriod(item)}
                        activeOpacity={0.7}
                      >
                        <Unlock size={12} color="#DC2626" />
                        <Text style={styles.unblockBtnText}>Débloquer</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyIndispoBox}>
                <View style={styles.emptyIconContainer}>
                  <CheckCircle2 size={24} color="#059669" />
                </View>
                <View style={styles.emptyTextWrapper}>
                  <Text style={styles.emptyIndispoTitle}>Aucun blocage actif</Text>
                  <Text style={styles.emptyIndispoSub}>
                    Votre véhicule est 100% ouvert aux réservations. Touchez une plage de dates sur le calendrier ci-dessus pour bloquer des jours.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 222, 128, 0.25)',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerThumbBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerThumbImage: {
    width: '100%',
    height: '100%',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15.5,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#A8D5C1',
    marginTop: 1,
  },
  badgeStatut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  badgeStatutText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#34D399',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  presetsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  presetsTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13,
    color: '#334155',
  },
  presetsRow: {
    gap: 8,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  presetChipText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#047857',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 17,
    color: '#0F172A',
  },
  monthNavRow: {
    flexDirection: 'row',
    gap: 6,
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#64748B',
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingBottom: 6,
  },
  dayOfWeekText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#94A3B8',
    width: 36,
    textAlign: 'center',
  },
  gridContainer: {
    minHeight: 220,
    justifyContent: 'center',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 8,
  },
  loadingText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#64748B',
  },
  gridDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 42,
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
    position: 'relative',
  },
  dayCellPast: {
    opacity: 0.3,
  },
  dayCellBlockedHost: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
  },
  dayCellReservedRenter: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
  },
  dayCellSelected: {
    backgroundColor: '#ECFDF5',
  },
  dayCellSelectedBorder: {
    backgroundColor: '#059669',
    borderRadius: 10,
  },
  dayNumText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#1E293B',
  },
  dayNumTextPast: {
    color: '#94A3B8',
  },
  dayNumTextBlockedHost: {
    color: '#92400E',
    fontFamily: theme.typography.fontFamily.bold,
  },
  dayNumTextReservedRenter: {
    color: '#991B1B',
    fontFamily: theme.typography.fontFamily.bold,
  },
  dayNumTextSelected: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
  },
  blockedBadgeDot: {
    position: 'absolute',
    bottom: 2,
  },
  actionPanelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#059669',
    gap: 12,
  },
  actionPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionPanelTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: '#0F172A',
  },
  selectedDatesText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#047857',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  motifLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#64748B',
  },
  motifsRow: {
    gap: 8,
  },
  motifChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  motifChipSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  motifChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#475569',
  },
  motifChipTextSelected: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
  },
  actionPanelButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  cancelSelectionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelSelectionText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#64748B',
  },
  blockCtaBtnWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  blockCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  blockCtaIconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockCtaText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitleFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: '#0F172A',
  },
  countBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  countBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#DC2626',
  },
  sectionSubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  indispoList: {
    gap: 10,
  },
  indispoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  indispoContentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  indispoLockBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  indispoMainInfo: {
    gap: 4,
    flex: 1,
  },
  indispoDateRange: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#0F172A',
  },
  indispoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  motifTag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  motifTagText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#334155',
  },
  indispoDot: {
    color: '#94A3B8',
    fontSize: 11,
  },
  indispoDuration: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#64748B',
  },
  unblockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  unblockBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#DC2626',
  },
  emptyIndispoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  emptyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTextWrapper: {
    flex: 1,
    gap: 2,
  },
  emptyIndispoTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14,
    color: '#065F46',
  },
  emptyIndispoSub: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#047857',
    lineHeight: 16,
  },
});
