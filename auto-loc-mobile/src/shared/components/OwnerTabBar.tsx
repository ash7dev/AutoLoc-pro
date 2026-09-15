import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { LayoutDashboard, Car, Calendar, Wallet } from 'lucide-react-native';
import { theme } from '../../core/theme';
import { useAppStore } from '../../core/store/useAppStore';

export type OwnerTabType = 'ACCUEIL' | 'VEHICULES' | 'RESERVATIONS' | 'WALLET';

interface OwnerTabBarProps {
  activeTab: OwnerTabType;
  onTabChange: (tab: OwnerTabType) => void;
}

export const OwnerTabBar: React.FC<OwnerTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const triggerGuestAuthGuard = useAppStore((state) => state.triggerGuestAuthGuard);

  const tabs: Array<{
    id: OwnerTabType;
    label: string;
    icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
    requiresAuth?: boolean;
    authReason?: string;
  }> = [
    {
      id: 'ACCUEIL',
      label: 'Accueil',
      icon: LayoutDashboard,
    },
    {
      id: 'VEHICULES',
      label: 'Véhicules',
      icon: Car,
    },
    {
      id: 'RESERVATIONS',
      label: 'Réservation',
      icon: Calendar,
      requiresAuth: true,
      authReason: 'Connectez-vous pour consulter et gérer les réservations de vos véhicules.',
    },
    {
      id: 'WALLET',
      label: 'Wallet',
      icon: Wallet,
      requiresAuth: true,
      authReason: 'Connectez-vous pour consulter vos revenus et effectuer des retraits.',
    },
  ];

  const handlePress = (tabItem: typeof tabs[0]) => {
    if (tabItem.requiresAuth) {
      const allowed = triggerGuestAuthGuard(tabItem.authReason || '', {
        action: tabItem.id === 'RESERVATIONS' ? 'VIEW_BOOKINGS' : 'VIEW_PROFILE',
      });
      if (!allowed) {
        return;
      }
    }
    onTabChange(tabItem.id);
  };

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.tabBarWhitePill}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => handlePress(tab)}
              activeOpacity={0.8}
            >
              {isActive ? (
                /* Pilule active noire émeraude (#051B14) avec Icône Vif (#34D399) & Texte Blanc */
                <View style={styles.activeBlackPill}>
                  <IconComponent size={18} color="#34D399" strokeWidth={2.5} />
                  <Text style={styles.activeLabel}>{tab.label}</Text>
                </View>
              ) : (
                /* Onglet inactif : Icône seule en gris ardoise (#9CA3AF) */
                <View style={styles.inactiveIconBox}>
                  <IconComponent size={20} color="#9CA3AF" strokeWidth={2} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 99,
  },
  tabBarWhitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 8,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    flex: 1.6,
  },
  activeBlackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#051B14',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 28,
    gap: 6,
    width: '100%',
  },
  activeLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  inactiveIconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
