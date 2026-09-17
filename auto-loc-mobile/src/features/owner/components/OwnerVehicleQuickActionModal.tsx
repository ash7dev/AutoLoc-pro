import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import {
  X,
  Calendar,
  Edit3,
  ClipboardList,
  Power,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Car,
  Archive,
  Sparkles,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { OwnerVehicle } from '../api/ownerApi';

interface OwnerVehicleQuickActionModalProps {
  visible: boolean;
  vehicle: OwnerVehicle | null;
  onClose: () => void;
  onManageCalendar?: (vehicle: OwnerVehicle) => void;
  onEditVehicle?: (vehicle: OwnerVehicle) => void;
  onViewReservations?: (vehicle: OwnerVehicle) => void;
  onToggleStatus?: (vehicleId: string, currentStatus: OwnerVehicle['statut']) => void;
  onArchiveVehicle?: (vehicle: OwnerVehicle) => void;
  onPurgeVehicle?: (vehicle: OwnerVehicle) => void;
}

export const OwnerVehicleQuickActionModal: React.FC<OwnerVehicleQuickActionModalProps> = ({
  visible,
  vehicle,
  onClose,
  onManageCalendar,
  onEditVehicle,
  onViewReservations,
  onToggleStatus,
  onArchiveVehicle,
  onPurgeVehicle,
}) => {
  if (!vehicle) return null;

  const isAvailable = vehicle.statut === 'DISPONIBLE' || vehicle.statut === 'VERIFIE';

  const menuItems = [
    {
      id: 'edit',
      icon: Edit3,
      title: 'Modifier l’annonce & Tarifs',
      subtitle: 'Ajuster les prix, photos, équipements et conditions',
      isHighlight: true,
      onPress: () => {
        onClose();
        if (onEditVehicle) onEditVehicle(vehicle);
      },
    },
    {
      id: 'calendar',
      icon: Calendar,
      title: 'Calendrier & Indisponibilités',
      subtitle: 'Bloquer des dates pour entretien ou usage personnel',
      onPress: () => {
        onClose();
        if (onManageCalendar) onManageCalendar(vehicle);
      },
    },
    {
      id: 'reservations',
      icon: ClipboardList,
      title: 'Réservations du véhicule',
      subtitle: `${vehicle.totalReservations || 0} location(s) enregistrée(s)`,
      onPress: () => {
        onClose();
        if (onViewReservations) onViewReservations(vehicle);
      },
    },
    {
      id: 'toggle',
      icon: Power,
      title: isAvailable ? 'Désactiver temporairement' : 'Activer l’annonce',
      subtitle: isAvailable ? 'Masquer du catalogue public' : 'Rendre à nouveau visible aux locataires',
      onPress: () => {
        onClose();
        if (onToggleStatus) onToggleStatus(vehicle.id, vehicle.statut);
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          {/* Top Drag Handle */}
          <View style={styles.handleRow}>
            <View style={styles.handlePill} />
          </View>

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerTitleBox}>
              <View style={styles.carBadge}>
                {vehicle.photoUrl ? (
                  <Image source={{ uri: vehicle.photoUrl }} style={styles.carThumbImage} contentFit="cover" transition={180} />
                ) : (
                  <Car size={18} color="#34D399" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.vehicleTitle} numberOfLines={1}>
                    {vehicle.marque} {vehicle.modele}
                  </Text>
                  <View style={[styles.statusChip, { backgroundColor: isAvailable ? '#ECFDF5' : '#F1F5F9' }]}>
                    <View style={[styles.statusDot, { backgroundColor: isAvailable ? '#059669' : '#64748B' }]} />
                    <Text style={[styles.statusChipText, { color: isAvailable ? '#047857' : '#475569' }]}>
                      {isAvailable ? 'Actif' : 'Inactif'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.vehicleSub} numberOfLines={1}>
                  {vehicle.ville} ({vehicle.annee})
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={10} activeOpacity={0.7}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuList}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isDarkCard = !!item.isHighlight;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    isDarkCard && styles.menuItemDark,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.menuIconBg,
                      isDarkCard && styles.menuIconBgDark,
                    ]}
                  >
                    <Icon size={18} color={isDarkCard ? '#4ADE80' : '#34D399'} />
                  </View>

                  <View style={styles.menuTextGroup}>
                    <Text style={[styles.menuTitle, isDarkCard && styles.menuTitleDark]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.menuSub, isDarkCard && styles.menuSubDark]}>
                      {item.subtitle}
                    </Text>
                  </View>

                  <ChevronRight size={16} color={isDarkCard ? '#4ADE80' : '#94A3B8'} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Danger Zone: Archiver / Supprimer */}
          <View style={styles.dangerGroup}>
            {onArchiveVehicle && (
              <TouchableOpacity
                style={styles.archiveBtn}
                onPress={() => {
                  onClose();
                  onArchiveVehicle(vehicle);
                }}
                activeOpacity={0.8}
              >
                <Archive size={15} color="#DC2626" />
                <Text style={styles.archiveBtnText}>Archiver l'annonce</Text>
              </TouchableOpacity>
            )}

            {onPurgeVehicle && (
              <TouchableOpacity
                style={styles.purgeBtn}
                onPress={() => {
                  onClose();
                  onPurgeVehicle(vehicle);
                }}
                activeOpacity={0.8}
              >
                <Trash2 size={15} color="#FFFFFF" />
                <Text style={styles.purgeBtnText}>Supprimer définitivement</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 8,
  },
  handlePill: {
    width: 42,
    height: 4.5,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 14,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  carBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#041912',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  carThumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vehicleTitle: {
    fontSize: 16.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#0F172A',
    flexShrink: 1,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 999,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusChipText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
  },
  vehicleSub: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuList: {
    gap: 10,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuItemDark: {
    backgroundColor: '#041912',
    borderColor: 'rgba(74, 222, 128, 0.4)',
    borderWidth: 1.5,
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconBgDark: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  menuTextGroup: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#0F172A',
  },
  menuTitleDark: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
  },
  menuSub: {
    fontSize: 11.5,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#64748B',
    marginTop: 2,
  },
  menuSubDark: {
    color: '#A8D5C1',
  },
  dangerGroup: {
    gap: 8,
  },
  archiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 14,
  },
  archiveBtnText: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#DC2626',
  },
  purgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 14,
  },
  purgeBtnText: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },
});
