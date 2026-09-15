import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TenantHomeScreen } from './TenantHomeScreen';
import { TenantExploreScreen } from './TenantExploreScreen';
import { TenantBookingsScreen } from './TenantBookingsScreen';
import { TenantProfileScreen } from './TenantProfileScreen';
import { TenantTabBar, TenantTabType } from '../../../shared/components/TenantTabBar';

export const TenantMainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TenantTabType>('ACCUEIL');

  const renderActiveScreen = () => {
    switch (activeTab) {
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
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
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
