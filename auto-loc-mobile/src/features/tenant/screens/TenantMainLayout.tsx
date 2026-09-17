import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TenantHomeScreen } from './TenantHomeScreen';
import { TenantExploreScreen } from './TenantExploreScreen';
import { TenantBookingsScreen } from './TenantBookingsScreen';
import { TenantProfileScreen } from './TenantProfileScreen';
import { TenantTabBar } from '../../../shared/components/TenantTabBar';
import { useNavigation } from '../../../core/navigation/RootNavigator';

export const TenantMainLayout: React.FC = () => {
  const { activeTenantTab, navigateToTab } = useNavigation();

  const renderActiveScreen = () => {
    switch (activeTenantTab) {
      case 'ACCUEIL':
        return <TenantHomeScreen />;
      case 'EXPLORER':
        return <TenantExploreScreen />;
      case 'RESERVATIONS':
        return <TenantBookingsScreen />;
      case 'PROFIL':
        return <TenantProfileScreen />;
      default:
        return <TenantHomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Contenu de l'écran actif */}
      <View style={styles.screenContent}>
        {renderActiveScreen()}
      </View>

      {/* Tab Bar Flottante Ultra-Premium (Inspirée de la maquette utilisateur) */}
      <TenantTabBar
        activeTab={activeTenantTab}
        onTabChange={(tab) => navigateToTab(tab)}
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
