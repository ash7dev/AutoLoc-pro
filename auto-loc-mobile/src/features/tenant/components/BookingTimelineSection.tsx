import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AlertTriangle,
  ArrowRight,
  CarFront,
  CheckCircle2,
  Clock3,
  CreditCard,
  Flag,
  History,
  Key,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  XCircle,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';

export interface TimelineEvent {
  id: string;
  ancienStatut?: string | null;
  nouveauStatut: string;
  modifieLe: string | Date;
  modifiePar?: string | null;
}

interface BookingTimelineSectionProps {
  events: TimelineEvent[];
}

type StatusTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

const statusLabels: Record<string, { label: string; tone: StatusTone }> = {
  INITIEE: { label: 'Demande initiée', tone: 'neutral' },
  EN_ATTENTE_PAIEMENT: { label: 'En attente de paiement', tone: 'warning' },
  PAYEE: { label: 'Paiement en ligne confirmé', tone: 'info' },
  CONFIRMEE: { label: 'Réservation confirmée par l’hôte', tone: 'success' },
  EN_COURS: { label: 'Prise en charge & location démarrée', tone: 'success' },
  TERMINEE: { label: 'Restitution & location terminée', tone: 'neutral' },
  ANNULEE: { label: 'Réservation annulée', tone: 'danger' },
  LITIGE: { label: 'Litige ouvert', tone: 'danger' },
  REFUSEE: { label: 'Véhicule refusé au check-in', tone: 'danger' },
};

const isUuid = (str?: string | null) => Boolean(str && /^[0-9a-fA-F-]{20,}$/.test(str));

const getEventActor = (modifiePar?: string | null) => {
  if (!modifiePar) return { label: 'AutoLoc System', type: 'AUTO' };
  const upper = modifiePar.toUpperCase();

  if (upper === 'SYSTEM_TACIT_CHECKIN' || upper.startsWith('SYSTEM') || upper.startsWith('AUTO')) {
    return { label: 'AutoLoc System', type: 'AUTO' };
  }
  if (upper === 'ADMIN' || upper.includes('SUPPORT')) {
    return { label: 'Support AutoLoc', type: 'ADMIN' };
  }
  if (upper === 'PROPRIETAIRE' || upper === 'HOST' || upper === 'OWNER' || upper.startsWith('OWNER_')) {
    return { label: 'Hôte', type: 'HOST' };
  }
  if (upper === 'LOCATAIRE' || upper === 'TENANT') {
    return { label: 'Locataire', type: 'TENANT' };
  }
  if (isUuid(modifiePar)) {
    return { label: `Utilisateur #${modifiePar!.slice(0, 8).toUpperCase()}`, type: 'USER' };
  }
  return { label: modifiePar, type: 'USER' };
};

const getStatusShortLabel = (code?: string | null) => {
  if (!code) return null;
  return statusLabels[code.toUpperCase()]?.label || code;
};

const formatEventDate = (raw: string | Date) => {
  const dateObj = new Date(raw);
  if (Number.isNaN(dateObj.getTime())) {
    return { date: 'Date inconnue', time: '' };
  }
  return {
    date: dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
};

export const BookingTimelineSection: React.FC<BookingTimelineSectionProps> = ({ events }) => {
  // Tri chronologique et nettoyage des doublons consécutifs identiques
  const cleanedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    const sorted = [...events].sort(
      (a, b) => new Date(a.modifieLe).getTime() - new Date(b.modifieLe).getTime()
    );

    // Filtrer les événements purement identiques consécutifs enregistrés dans la même seconde
    const filtered: TimelineEvent[] = [];
    for (const evt of sorted) {
      const prev = filtered[filtered.length - 1];
      if (
        prev &&
        prev.nouveauStatut === evt.nouveauStatut &&
        prev.ancienStatut === evt.ancienStatut &&
        prev.modifiePar === evt.modifiePar &&
        Math.abs(new Date(prev.modifieLe).getTime() - new Date(evt.modifieLe).getTime()) < 2000
      ) {
        continue; // Ignorer le doublon technique
      }
      filtered.push(evt);
    }
    return filtered;
  }, [events]);

  if (cleanedEvents.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <History size={17} color={theme.colors.brand.main} />
          </View>
          <Text style={styles.title}>Chronologie des étapes</Text>
        </View>
        <Text style={styles.emptyText}>Aucun événement enregistré pour le moment.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.iconBox}>
            <History size={17} color={theme.colors.brand.main} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Chronologie des étapes</Text>
            <Text style={styles.subtitle}>Historique horodaté et infalsifiable</Text>
          </View>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {cleanedEvents.length} étape{cleanedEvents.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Timeline List */}
      <View style={styles.list}>
        {cleanedEvents.map((event, index) => {
          const isLast = index === cleanedEvents.length - 1;
          const statusKey = event.nouveauStatut ? event.nouveauStatut.toUpperCase() : '';
          const statusInfo = statusLabels[statusKey] ?? {
            label: event.nouveauStatut || 'Mise à jour',
            tone: 'info' as StatusTone,
          };
          const actor = getEventActor(event.modifiePar);
          const isTacit = event.modifiePar === 'SYSTEM_TACIT_CHECKIN';

          const isDanger = statusInfo.tone === 'danger';
          const isSuccess = statusInfo.tone === 'success';
          const isWarning = statusInfo.tone === 'warning';
          const isInfo = statusInfo.tone === 'info';

          const { date: formattedDate, time: formattedTime } = formatEventDate(event.modifieLe);
          const ancienLabel = getStatusShortLabel(event.ancienStatut);

          // Afficher la transition uniquement si l'ancien statut est valide et différent du nouveau
          const showTransition = Boolean(
            event.ancienStatut &&
            event.ancienStatut !== event.nouveauStatut &&
            ancienLabel &&
            ancienLabel.toLowerCase() !== statusInfo.label.toLowerCase()
          );

          return (
            <View key={event.id ?? `event-${index}`} style={styles.eventRow}>
              {/* Vertical Rail Column */}
              <View style={styles.railCol}>
                <View
                  style={[
                    styles.nodeRing,
                    isWarning && styles.nodeRingWarning,
                    isInfo && styles.nodeRingInfo,
                    isDanger && styles.nodeRingDanger,
                    isSuccess && styles.nodeRingSuccess,
                    isLast && styles.nodeRingActive,
                  ]}
                >
                  {isTacit ? (
                    <Sparkles size={13} color="#2563EB" />
                  ) : isDanger ? (
                    <XCircle size={14} color="#DC2626" />
                  ) : statusKey === 'PAYEE' ? (
                    <CreditCard size={13} color="#2563EB" />
                  ) : statusKey === 'EN_COURS' ? (
                    <CarFront size={13} color="#059669" />
                  ) : statusKey === 'TERMINEE' ? (
                    <Flag size={13} color="#475569" />
                  ) : isSuccess ? (
                    <CheckCircle2 size={14} color="#059669" />
                  ) : isWarning ? (
                    <Clock3 size={13} color="#D97706" />
                  ) : (
                    <Clock3 size={13} color={isLast ? theme.colors.brand.main : '#64748B'} />
                  )}
                </View>

                {!isLast && (
                  <View style={[styles.railLine, isSuccess && styles.railLineSuccess]} />
                )}
              </View>

              {/* Event Content Box */}
              <View style={styles.eventBody}>
                <View style={styles.titleAndActorRow}>
                  <Text style={[styles.eventTitle, isLast && styles.eventTitleActive]} numberOfLines={1}>
                    {isTacit ? 'Check-in automatique appliqué' : statusInfo.label}
                  </Text>
                </View>

                {/* Transition breadcrumb cleanly formatted without overflow */}
                {showTransition && (
                  <View style={styles.transitionRow}>
                    <Text style={styles.transitionText} numberOfLines={1} ellipsizeMode="tail">
                      {ancienLabel}
                    </Text>
                    <ArrowRight size={10} color="#94A3B8" style={styles.transitionArrow} />
                    <Text style={styles.transitionTextTarget} numberOfLines={1} ellipsizeMode="tail">
                      {statusInfo.label}
                    </Text>
                  </View>
                )}

                {/* Metadata Row: Date & Clean Actor Badge */}
                <View style={styles.metaRow}>
                  <Text style={styles.eventDate}>
                    {formattedTime ? `${formattedDate} à ${formattedTime}` : formattedDate}
                  </Text>
                  <Text style={styles.metaDot}>·</Text>

                  {/* Actor Pill */}
                  <View
                    style={[
                      styles.actorPill,
                      actor.type === 'AUTO' && styles.actorPillAuto,
                      actor.type === 'ADMIN' && styles.actorPillAdmin,
                      actor.type === 'HOST' && styles.actorPillHost,
                      actor.type === 'TENANT' && styles.actorPillTenant,
                    ]}
                  >
                    {actor.type === 'AUTO' ? (
                      <Sparkles size={10} color="#2563EB" />
                    ) : actor.type === 'ADMIN' ? (
                      <ShieldCheck size={10} color="#7C3AED" />
                    ) : actor.type === 'HOST' ? (
                      <UserCheck size={10} color="#047857" />
                    ) : actor.type === 'TENANT' ? (
                      <User size={10} color="#047857" />
                    ) : (
                      <User size={10} color="#475569" />
                    )}
                    <Text
                      style={[
                        styles.actorText,
                        actor.type === 'AUTO' && styles.actorTextAuto,
                        actor.type === 'ADMIN' && styles.actorTextAdmin,
                        actor.type === 'HOST' && styles.actorTextHost,
                        actor.type === 'TENANT' && styles.actorTextTenant,
                      ]}
                      numberOfLines={1}
                    >
                      {actor.label}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: '#072A20',
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 16,
  },
  subtitle: {
    color: '#64748B',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexShrink: 0,
  },
  countBadgeText: {
    color: '#475569',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  emptyText: {
    color: '#64748B',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
  },
  list: {
    gap: 0,
    marginTop: 4,
  },
  eventRow: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 58,
  },
  railCol: {
    alignItems: 'center',
    width: 26,
  },
  nodeRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeRingActive: {
    borderColor: theme.colors.brand.main,
    backgroundColor: '#ECFDF5',
  },
  nodeRingSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  nodeRingInfo: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  nodeRingWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  nodeRingDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  railLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  railLineSuccess: {
    backgroundColor: '#A7F3D0',
  },
  eventBody: {
    flex: 1,
    paddingBottom: 16,
    gap: 4,
    minWidth: 0,
  },
  titleAndActorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  eventTitle: {
    color: '#1E293B',
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13.5,
    lineHeight: 19,
    flexShrink: 1,
  },
  eventTitleActive: {
    color: '#072A20',
    fontFamily: theme.typography.fontFamily.displayBold,
  },
  transitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1,
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  transitionText: {
    color: '#94A3B8',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    flexShrink: 1,
  },
  transitionArrow: {
    flexShrink: 0,
  },
  transitionTextTarget: {
    color: '#475569',
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 3,
  },
  eventDate: {
    color: '#64748B',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
  },
  metaDot: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '100%',
  },
  actorPillAuto: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  actorPillAdmin: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  actorPillHost: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  actorPillTenant: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  actorText: {
    color: '#475569',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    flexShrink: 1,
  },
  actorTextAuto: {
    color: '#1D4ED8',
  },
  actorTextAdmin: {
    color: '#6D28D9',
  },
  actorTextHost: {
    color: '#047857',
  },
  actorTextTenant: {
    color: '#047857',
  },
});