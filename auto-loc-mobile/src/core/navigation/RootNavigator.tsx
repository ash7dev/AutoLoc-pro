import React, { createContext, useContext, useState, useEffect } from 'react';
import { StyleSheet, View, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { theme } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { SplashScreen } from '../../features/splash/SplashScreen';
import { OnboardingScreen } from '../../features/onboarding/OnboardingScreen';
import { TenantMainLayout } from '../../features/tenant/screens/TenantMainLayout';
import { VehicleDetailScreen } from '../../features/tenant/screens/VehicleDetailScreen';
import { VehicleFeedItem } from '../../features/tenant/types';
import { TenantTabType } from '../../shared/components/TenantTabBar';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../../features/auth/screens/RegisterScreen';
import { OtpScreen } from '../../features/auth/screens/OtpScreen';
import { GuestAuthModal } from '../../shared/components';

// Définition typée des routes de l'application
export type AppScreenRoute =
  | { name: 'SPLASH' }
  | { name: 'ONBOARDING' }
  | { name: 'TENANT_MAIN'; initialTab?: TenantTabType }
  | { name: 'LOGIN' }
  | { name: 'REGISTER' }
  | { name: 'OTP'; phone: string }
  | { name: 'VEHICLE_DETAIL'; vehicleId: string; vehicle?: VehicleFeedItem };

interface NavigationContextType {
  currentRoute: AppScreenRoute;
  activeTenantTab: TenantTabType;
  navigateTo: (route: AppScreenRoute) => void;
  navigateToTab: (tab: TenantTabType) => void;
  navigateToOtp: (phone: string) => void;
  navigateToVehicleDetail: (vehicleId: string, vehicle?: VehicleFeedItem) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation doit être utilisé à l’intérieur d’un RootNavigator');
  }
  return context;
};

export const RootNavigator: React.FC = () => {
  // 1. Polices d'écriture Google Fonts
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  // 2. État Global Zustand
  const isInitialized = useAppStore((state) => state.isInitialized);
  const hasSeenOnboarding = useAppStore((state) => state.hasSeenOnboarding);

  // 3. Navigation Stack & Historique (Pile de routes)
  const [routeHistory, setRouteHistory] = useState<AppScreenRoute[]>([{ name: 'SPLASH' }]);
  const [splashFinished, setSplashFinished] = useState(false);
  const [activeTenantTab, setActiveTenantTab] = useState<TenantTabType>('ACCUEIL');

  const currentRoute = routeHistory[routeHistory.length - 1] || { name: 'SPLASH' };
  const canGoBack = routeHistory.length > 1;

  // Gestion de la navigation
  const navigateTo = (newRoute: AppScreenRoute) => {
    setRouteHistory((prev) => [...prev, newRoute]);
  };

  const navigateToTab = (tab: TenantTabType) => {
    setActiveTenantTab(tab);
    if (currentRoute.name !== 'TENANT_MAIN') {
      navigateTo({ name: 'TENANT_MAIN', initialTab: tab });
    }
  };

  const navigateToOtp = (phone: string) => {
    navigateTo({ name: 'OTP', phone });
  };

  const navigateToVehicleDetail = (vehicleId: string, vehicle?: VehicleFeedItem) => {
    navigateTo({ name: 'VEHICLE_DETAIL', vehicleId, vehicle });
  };

  const goBack = () => {
    if (canGoBack) {
      setRouteHistory((prev) => prev.slice(0, prev.length - 1));
    }
  };

  // Dépile les écrans d'authentification et retourne automatiquement à l'écran d'origine (ex: Détail Véhicule)
  const handleAuthSuccess = () => {
    setRouteHistory((prev) => {
      const nonAuthHistory = prev.filter(
        (r) => r.name !== 'LOGIN' && r.name !== 'REGISTER' && r.name !== 'OTP'
      );
      if (nonAuthHistory.length > 0) {
        return nonAuthHistory;
      }
      return [{ name: 'TENANT_MAIN' }];
    });
  };

  const handleAuthClose = () => {
    if (canGoBack) {
      goBack();
    } else {
      setRouteHistory([{ name: 'TENANT_MAIN' }]);
    }
  };

  // Gestionnaire du bouton Retour Matériel Android
  useEffect(() => {
    const onBackPress = () => {
      if (canGoBack) {
        goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [canGoBack, routeHistory]);

  if (!fontsLoaded) {
    return null;
  }

  // Phase 1 : Splash Screen
  if (!isInitialized || !splashFinished) {
    return (
      <SplashScreen
        onFinish={() => {
          setSplashFinished(true);
          if (!hasSeenOnboarding) {
            setRouteHistory([{ name: 'ONBOARDING' }]);
          } else {
            setRouteHistory([{ name: 'TENANT_MAIN' }]);
          }
        }}
      />
    );
  }

  const contextValue: NavigationContextType = {
    currentRoute,
    activeTenantTab,
    navigateTo,
    navigateToTab,
    navigateToOtp,
    navigateToVehicleDetail,
    goBack,
    canGoBack,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      <View style={styles.rootContainer}>
        <StatusBar style="dark" />

        {/* Rendu dynamique de l'écran actif */}
        {(() => {
          switch (currentRoute.name) {
            case 'ONBOARDING':
              return (
                <OnboardingScreen
                  onNavigateToTenantHome={() => navigateTo({ name: 'TENANT_MAIN' })}
                  onNavigateToLogin={() => navigateTo({ name: 'LOGIN' })}
                />
              );

            case 'LOGIN':
              return (
                <LoginScreen
                  onNavigateToRegister={() => navigateTo({ name: 'REGISTER' })}
                  onNavigateToOtp={(phone) => navigateToOtp(phone)}
                  onLoginSuccess={handleAuthSuccess}
                  onClose={handleAuthClose}
                />
              );

            case 'REGISTER':
              return (
                <RegisterScreen
                  onNavigateToLogin={() => navigateTo({ name: 'LOGIN' })}
                  onNavigateToOtp={(phone) => navigateToOtp(phone)}
                  onClose={handleAuthClose}
                />
              );

            case 'OTP':
              return (
                <OtpScreen
                  telephone={currentRoute.phone}
                  onNavigateBack={() => goBack()}
                  onSuccess={handleAuthSuccess}
                />
              );

            case 'VEHICLE_DETAIL':
              // Rendu Hors-TabBar (Masque automatiquement le TabBar bottom)
              return (
                <VehicleDetailScreen
                  vehicleId={currentRoute.vehicleId}
                  vehicle={currentRoute.vehicle}
                  onBack={() => goBack()}
                />
              );

            case 'TENANT_MAIN':
            default:
              return <TenantMainLayout />;
          }
        })()}

        {/* Modal Invité au niveau racine */}
        <GuestAuthModal
          onNavigateToLogin={() => navigateTo({ name: 'LOGIN' })}
          onNavigateToRegister={() => navigateTo({ name: 'REGISTER' })}
        />
      </View>
    </NavigationContext.Provider>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
});
