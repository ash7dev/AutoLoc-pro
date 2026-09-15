import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
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
  ShieldCheck,
} from 'lucide-react-native';

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

// Palette officielle AutoLoc Émeraude & Forest
const COLORS = {
  accent: '#16A34A',
  accentDeep: '#0F7A38',
  tint: '#ECFDF5',
  tintBorder: '#A7F3D0',
  ink: '#041912',
  inkSoft: '#3D4638',
  chipBorder: '#E7EEE0',
  surface: '#FFFFFF',
  divider: 'rgba(4, 25, 18, 0.06)',
};

const getEquipmentMeta = (nom: string) => {
  const key = nom.toUpperCase();
  if (key.includes('CLIM')) {
    return { label: 'Climatisation Bi-Zone', icon: Wind };
  }
  if (key.includes('GPS')) {
    return { label: 'Système GPS Pro', icon: Navigation };
  }
  if (key.includes('CAMERA') || key.includes('RECUL')) {
    return { label: 'Caméra de recul HD', icon: Video };
  }
  if (key.includes('CARPLAY')) {
    return { label: 'Apple CarPlay / Android Auto', icon: Smartphone };
  }
  if (key.includes('BLUETOOTH')) {
    return { label: 'Connectivité Bluetooth', icon: Radio };
  }
  if (key.includes('RADAR')) {
    return { label: 'Radar de stationnement', icon: Disc };
  }
  if (key.includes('SIEGE')) {
    return { label: 'Sièges Chauffants', icon: Flame };
  }
  return { label: nom, icon: Sparkles };
};

const EquipmentChip: React.FC<{ label: string; Icon: typeof Wind }> = ({
  label,
  Icon,
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPressIn={() => animateTo(0.96)}
      onPressOut={() => animateTo(1)}
    >
      <Animated.View style={[styles.equipmentChip, { transform: [{ scale }] }]}>
        <View style={styles.iconBoxOuter}>
          <View style={styles.iconBoxInner}>
            <Icon size={14} color={COLORS.accentDeep} strokeWidth={2.25} />
          </View>
        </View>
        <Text style={styles.chipText} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

export const VehicleEquipmentsGrid: React.FC<VehicleEquipmentsGridProps> = ({
  equipements = [],
}) => {
  const count = equipements?.length ?? 0;

  return (
    <View style={styles.container}>
      {/* En-tête de Section */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.titleIconBadge}>
            <Sparkles size={14} color={COLORS.accentDeep} strokeWidth={2.25} />
          </View>
          <Text style={styles.sectionTitle}>Équipements & Confort</Text>
        </View>
        {count > 0 && (
          <View style={styles.countPill}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Grille de chips d'équipements */}
      {count > 0 ? (
        <View style={styles.gridContainer}>
          {equipements.map((item, idx) => {
            const rawNom = item.equipement?.nom || item.id || 'Équipement';
            const meta = getEquipmentMeta(rawNom);
            return (
              <EquipmentChip
                key={item.equipementId || item.id || idx}
                label={meta.label}
                Icon={meta.icon}
              />
            );
          })}
        </View>
      ) : (
        <View style={styles.fallbackBox}>
          <View style={styles.fallbackIconBox}>
            <ShieldCheck size={18} color={COLORS.accentDeep} strokeWidth={2.25} />
          </View>
          <Text style={styles.fallbackText}>
            Climatisation, Bluetooth, Régulateur & Sécurité ABS d'origine inclus.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 22,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: COLORS.tint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.tintBorder,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.ink,
    letterSpacing: -0.3,
  },
  countPill: {
    backgroundColor: COLORS.tint,
    borderWidth: 1,
    borderColor: COLORS.tintBorder,
    borderRadius: 999,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentDeep,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  equipmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    shadowColor: '#0F1F14',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBoxOuter: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.tint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.tintBorder,
  },
  iconBoxInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    color: COLORS.ink,
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  fallbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    shadowColor: '#0F1F14',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  fallbackIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.tint,
    borderWidth: 1,
    borderColor: COLORS.tintBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: COLORS.inkSoft,
    fontSize: 12.5,
    fontWeight: '500',
    flex: 1,
    lineHeight: 17,
  },
});