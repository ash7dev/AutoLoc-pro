import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
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
} from 'lucide-react-native';
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

  const isAvailable = vehicle.statut === 'DISPONIBLE';

  const menuItems = [
    {
      id: 'calendar',
      icon: Calendar,
      title: 'Calendrier & Indisponibilités',
      subtitle: 'Bloquer des dates pour entretien ou usage personnel',
      color: '#059669',
      bg: '#ECFDF5',
      onPress: () => {
        onClose();
        if (onManageCalendar) onManageCalendar(vehicle);
      },
    },
    {
      id: 'edit',
      icon: Edit3,
      title: 'Modifier l’annonce & Tarifs',
      subtitle: 'Ajuster les prix, photos, équipements et conditions',
      color: '#2563EB',
      bg: '#EFF6FF',
      onPress: () => {
        onClose();
        if (onEditVehicle) onEditVehicle(vehicle);
      },
    },
    {
      id: 'reservations',
      icon: ClipboardList,
      title: 'Réservations du véhicule',
      subtitle: `${vehicle.totalReservations || 0} réservation(s) au total`,
      color: '#7C3AED',
      bg: '#F5F3FF',
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
      color: isAvailable ? '#D97706' : '#059669',
      bg: isAvailable ? '#FFFBEB' : '#ECFDF5',
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
                <Car size={16} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vehicleTitle} numberOfLines={1}>
                  {vehicle.marque} {vehicle.modele} ({vehicle.annee})
                </Text>
                <Text style={styles.vehicleSub}>
                  Immatriculation : {vehicle.immatriculation} · {vehicle.ville}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={10}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuList}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconBg, { backgroundColor: item.bg }]}>
                    <Icon size={18} color={item.color} />
                  </View>

                  <View style={styles.menuTextGroup}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSub}>{item.subtitle}</Text>
                  </View>

                  <ChevronRight size={16} color="#94A3B8" />
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
                <Trash2 size={16} color="#FFFFFF" />
                <Text style={styles.purgeBtnText}>Supprimer définitivement le véhicule</Text>
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
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 8,
  },
  handlePill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  carBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  vehicleSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuList: {
    gap: 8,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextGroup: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#0F172A',
  },
  menuSub: {
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 1,
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
    fontFamily: 'Inter_600SemiBold',
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
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
});
