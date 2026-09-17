import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import {
  Wind,
  Navigation,
  Video,
  Smartphone,
  Radio,
  Disc,
  Flame,
  Sparkles,
  Wifi,
  Tv,
  CheckCircle2,
  Car,
  Zap,
  Sun,
  Gauge,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';

export interface EquipementItem {
  id?: string;
  equipementId?: string;
  equipement?: {
    id?: string;
    nom: string;
  };
}

interface VehicleEquipmentsGridProps {
  equipements?: EquipementItem[];
}

const DEFAULT_FALLBACK_EQUIPMENTS = [
  { nom: 'Ventilateur', icon: Wind },
  { nom: 'Réfrigérateur', icon: Zap },
  { nom: 'Climatisation', icon: Wind },
  { nom: 'WiFi haut débit', icon: Wifi },
  { nom: 'Télévision', icon: Tv },
  { nom: 'Chauffage', icon: Flame },
  { nom: 'Parking privé', icon: Car },
  { nom: 'Régulateur de vitesse', icon: Gauge },
];

const getEquipmentMeta = (nom: string) => {
  const key = nom.toUpperCase();
  if (key.includes('VENTILAT') || key.includes('FAN')) {
    return { label: nom, icon: Wind };
  }
  if (key.includes('CLIM') || key.includes('AIR')) {
    return { label: nom, icon: Wind };
  }
  if (key.includes('REFRIG') || key.includes('FRIGO') || key.includes('GLAC')) {
    return { label: nom, icon: Zap };
  }
  if (key.includes('GPS') || key.includes('NAV')) {
    return { label: nom, icon: Navigation };
  }
  if (key.includes('CAMERA') || key.includes('RECUL') || key.includes('CAM')) {
    return { label: nom, icon: Video };
  }
  if (key.includes('CARPLAY') || key.includes('PHONE') || key.includes('SMARTPHONE')) {
    return { label: nom, icon: Smartphone };
  }
  if (key.includes('BLUETOOTH') || key.includes('AUDIO')) {
    return { label: nom, icon: Radio };
  }
  if (key.includes('PARK') || key.includes('PARKING') || key.includes('GARAGE')) {
    return { label: nom, icon: Car };
  }
  if (key.includes('SIEGE') || key.includes('CHAUFF')) {
    return { label: nom, icon: Flame };
  }
  if (key.includes('WIFI') || key.includes('INTERNET')) {
    return { label: nom, icon: Wifi };
  }
  if (key.includes('TV') || key.includes('TELE') || key.includes('ECRAN')) {
    return { label: nom, icon: Tv };
  }
  if (key.includes('TOIT') || key.includes('SUN')) {
    return { label: nom, icon: Sun };
  }
  if (key.includes('CHARGE') || key.includes('USB')) {
    return { label: nom, icon: Zap };
  }
  if (key.includes('REGULATEUR') || key.includes('LIMIT')) {
    return { label: nom, icon: Gauge };
  }
  return { label: nom, icon: CheckCircle2 };
};

export const VehicleEquipmentsGrid: React.FC<VehicleEquipmentsGridProps> = ({
  equipements = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Construction de la liste dynamique d'équipements
  const items = equipements && equipements.length > 0
    ? equipements.map((item) => {
        const rawNom = item.equipement?.nom || item.id || 'Équipement';
        const meta = getEquipmentMeta(rawNom);
        return {
          id: item.equipementId || item.id || rawNom,
          label: meta.label,
          Icon: meta.icon,
        };
      })
    : DEFAULT_FALLBACK_EQUIPMENTS.map((item, idx) => ({
        id: `fallback-${idx}`,
        label: item.nom,
        Icon: item.icon,
      }));

  const totalCount = items.length;
  const COLLAPSED_LIMIT = 6;
  const visibleItems = isExpanded ? items : items.slice(0, COLLAPSED_LIMIT);
  const showExpandButton = totalCount > COLLAPSED_LIMIT;

  return (
    <View style={styles.container}>
      {/* 1. Header avec Icône Badge, Titre Serif & Nombre d'équipements */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.titleIconBadge}>
            <Sparkles size={14} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <Text style={styles.sectionTitle}>Équipements</Text>
        </View>
        <Text style={styles.countText}>{totalCount}</Text>
      </View>

      {/* 2. Liste verticale minimaliste avec icônes stroke émeraude */}
      <View style={styles.listContainer}>
        {visibleItems.map((item) => {
          const IconComponent = item.Icon;
          return (
            <View key={item.id} style={styles.itemRow}>
              <IconComponent size={21} color={theme.colors.brand.main} strokeWidth={2} />
              <Text style={styles.itemText}>{item.label}</Text>
            </View>
          );
        })}
      </View>

      {/* 3. Bouton Pilule de basculement "Voir les X équipements" */}
      {showExpandButton && (
        <Pressable
          style={({ pressed }) => [
            styles.expandButtonPill,
            pressed && styles.expandButtonPillPressed,
          ]}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={styles.expandButtonText}>
            {isExpanded
              ? 'Réduire la liste'
              : `Voir les ${totalCount} équipements`}
          </Text>
          {isExpanded ? (
            <ChevronUp size={16} color={theme.colors.brand.dark} strokeWidth={2.2} />
          ) : (
            <ChevronDown size={16} color={theme.colors.brand.dark} strokeWidth={2.2} />
          )}
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 18,
    color: theme.colors.brand.dark,
    letterSpacing: -0.3,
  },
  countText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 15,
    color: theme.colors.text.tertiary,
  },
  listContainer: {
    gap: 18,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  itemText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 15.5,
    color: theme.colors.text.primary,
    lineHeight: 22,
  },
  expandButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: theme.colors.surface.card,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginTop: 4,
    shadowColor: theme.colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  expandButtonPillPressed: {
    backgroundColor: theme.colors.surface.subtle,
    borderColor: theme.colors.border.strong,
  },
  expandButtonText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 14.5,
    color: theme.colors.brand.dark,
  },
});