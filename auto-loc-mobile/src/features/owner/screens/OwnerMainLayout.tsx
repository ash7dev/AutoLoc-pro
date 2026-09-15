import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { OwnerHomeScreen } from './OwnerHomeScreen';
import { OwnerVehiclesScreen } from './OwnerVehiclesScreen';
import { OwnerBookingsScreen } from './OwnerBookingsScreen';
import { OwnerWalletScreen } from './OwnerWalletScreen';
import { OwnerProfileScreen } from './OwnerProfileScreen';
import { OwnerTabBar, OwnerTabType } from '../../../shared/components/OwnerTabBar';

interface OwnerMainLayoutProps {
  initialTab?: OwnerTabType;
  onSwitchToTenant?: () => void;
}

export const OwnerMainLayout: React.FC<OwnerMainLayoutProps> = ({
  initialTab = 'ACCUEIL',
  onSwitchToTenant,
}) => {
  const [activeTab, setActiveTab] = useState<OwnerTabType>(initialTab);
  const [isShowingProfile, setIsShowingProfile] = useState(false);

  const handleProfilePress = () => {
    setIsShowingProfile(true);
  };

  const handleTabChange = (tab: OwnerTabType) => {
    setIsShowingProfile(false);
    setActiveTab(tab);
  };

  const renderActiveScreen = () => {
    if (isShowingProfile) {
      return (
        <OwnerProfileScreen
          onSwitchToTenant={onSwitchToTenant}
          onBack={() => setIsShowingProfile(false)}
        />
      );
    }

    switch (activeTab) {
      case 'ACCUEIL':
        return (
          <OwnerHomeScreen
            onNavigateToTab={(tab) => handleTabChange(tab)}
            onSwitchToTenant={onSwitchToTenant}
            onProfilePress={handleProfilePress}
          />
        );
      case 'VEHICULES':
        return (
          <OwnerVehiclesScreen
            onSwitchToTenant={onSwitchToTenant}
            onProfilePress={handleProfilePress}
          />
        );
      case 'RESERVATIONS':
        return (
          <OwnerBookingsScreen
            onSwitchToTenant={onSwitchToTenant}
            onProfilePress={handleProfilePress}
          />
        );
      case 'WALLET':
        return (
          <OwnerWalletScreen
            onSwitchToTenant={onSwitchToTenant}
            onProfilePress={handleProfilePress}
          />
        );
      default:
        return (
          <OwnerHomeScreen
            onNavigateToTab={(tab) => handleTabChange(tab)}
            onSwitchToTenant={onSwitchToTenant}
            onProfilePress={handleProfilePress}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Contenu de l'écran actif Hôte */}
      <View style={styles.screenContent}>{renderActiveScreen()}</View>

      {/* Tab Bar Flottante Ultra-Premium Propriétaire (Accueil, Véhicules, Réservation, Wallet) */}
      <OwnerTabBar
        activeTab={isShowingProfile ? ('ACCUEIL' as any) : activeTab}
        onTabChange={handleTabChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContent: {
    flex: 1,
  },
});
