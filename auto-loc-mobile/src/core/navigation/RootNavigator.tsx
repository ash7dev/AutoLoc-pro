import React, { createContext, useContext, useState, useEffect } from 'react';
import { StyleSheet, View, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import { TenantBookingDetailScreen } from '../../features/tenant/screens/TenantBookingDetailScreen';
import { VehicleFeedItem } from '../../features/tenant/types';
import { TenantTabType } from '../../shared/components/TenantTabBar';
import { OwnerTabType } from '../../shared/components/OwnerTabBar';
import { OwnerMainLayout } from '../../features/owner/screens/OwnerMainLayout';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../../features/auth/screens/RegisterScreen';
import { OtpScreen } from '../../features/auth/screens/OtpScreen';
import { GuestAuthModal } from '../../shared/components';

import { OwnerBookingDetailScreen } from '../../features/owner/screens/OwnerBookingDetailScreen';
import { switchAutoLocRole } from '../../features/tenant/api/tenantProfileApi';
import { secureStorage } from '../storage/secureStore';

// Définition typée des routes de l'application
export type AppScreenRoute =
  | { name: 'SPLASH' }
  | { name: 'ONBOARDING' }
  | { name: 'TENANT_MAIN'; initialTab?: TenantTabType }
  | { name: 'OWNER_MAIN'; initialTab?: OwnerTabType }
  | { name: 'LOGIN' }
  | { name: 'REGISTER' }
  | { name: 'OTP'; phone: string }
  | { name: 'VEHICLE_DETAIL'; vehicleId: string; vehicle?: VehicleFeedItem }
  | { name: 'BOOKING_DETAIL'; reservationId: string }
  | { name: 'OWNER_BOOKING_DETAIL'; reservationId: string };

interface NavigationContextType {
  currentRoute: AppScreenRoute;
  activeTenantTab: TenantTabType;
  activeOwnerTab: OwnerTabType;
  navigateTo: (route: AppScreenRoute) => void;
  navigateToTab: (tab: TenantTabType) => void;
  navigateToOwnerTab: (tab: OwnerTabType) => void;
  switchToOwnerSpace: () => void;
  switchToTenantSpace: () => void;
  navigateToOtp: (phone: string) => void;
  navigateToVehicleDetail: (vehicleId: string, vehicle?: VehicleFeedItem) => void;
  navigateToBookingDetail: (reservationId: string) => void;
  navigateToOwnerBookingDetail: (reservationId: string) => void;
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
  const [activeOwnerTab, setActiveOwnerTab] = useState<OwnerTabType>('ACCUEIL');

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

  const navigateToOwnerTab = (tab: OwnerTabType) => {
    setActiveOwnerTab(tab);
    if (currentRoute.name !== 'OWNER_MAIN') {
      navigateTo({ name: 'OWNER_MAIN', initialTab: tab });
    }
  };

  const switchToOwnerSpace = async () => {
    const state = useAppStore.getState();
    const user = state.user;
    if (user && user.role !== 'PROPRIETAIRE') {
      try {
        const res = await switchAutoLocRole('PROPRIETAIRE');
        if (res.accessToken && res.refreshToken) {
          await secureStorage.setRefreshToken(res.refreshToken);
          await state.setAuth(res.accessToken, { ...user, role: 'PROPRIETAIRE' });
        } else {
          await state.updateUserProfile({ role: 'PROPRIETAIRE' });
        }
      } catch (err) {
        console.warn('Changement de rôle proprietaire échoué:', err);
      }
    }
    navigateTo({ name: 'OWNER_MAIN' });
  };

  const switchToTenantSpace = async () => {
    const state = useAppStore.getState();
    const user = state.user;
    if (user && user.role !== 'LOCATAIRE') {
      try {
        const res = await switchAutoLocRole('LOCATAIRE');
        if (res.accessToken && res.refreshToken) {
          await secureStorage.setRefreshToken(res.refreshToken);
          await state.setAuth(res.accessToken, { ...user, role: 'LOCATAIRE' });
        } else {
          await state.updateUserProfile({ role: 'LOCATAIRE' });
        }
      } catch (err) {
        console.warn('Changement de rôle locataire échoué:', err);
      }
    }
    navigateTo({ name: 'TENANT_MAIN' });
  };

  const navigateToOtp = (phone: string) => {
    navigateTo({ name: 'OTP', phone });
  };

  const navigateToVehicleDetail = (vehicleId: string, vehicle?: VehicleFeedItem) => {
    navigateTo({ name: 'VEHICLE_DETAIL', vehicleId, vehicle });
  };

  const navigateToBookingDetail = (reservationId: string) => {
    navigateTo({ name: 'BOOKING_DETAIL', reservationId });
  };

  const navigateToOwnerBookingDetail = (reservationId: string) => {
    navigateTo({ name: 'OWNER_BOOKING_DETAIL', reservationId });
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

  const handleVehicleDetailBack = () => {
    setActiveTenantTab('EXPLORER');
    setRouteHistory((prev) => {
      const filtered = prev.filter((r) => r.name !== 'VEHICLE_DETAIL');
      if (filtered.length > 0) {
        return filtered;
      }
      return [{ name: 'TENANT_MAIN', initialTab: 'EXPLORER' }];
    });
  };

  const handleOwnerBookingBack = () => {
    setActiveOwnerTab('RESERVATIONS');
    setRouteHistory((prev) => {
      const filtered = prev.filter((r) => r.name !== 'OWNER_BOOKING_DETAIL');
      if (filtered.length > 0) {
        return filtered;
      }
      return [{ name: 'OWNER_MAIN', initialTab: 'RESERVATIONS' }];
    });
  };

  const handleTenantBookingBack = () => {
    setActiveTenantTab('RESERVATIONS');
    setRouteHistory((prev) => {
      const filtered = prev.filter((r) => r.name !== 'BOOKING_DETAIL');
      if (filtered.length > 0) {
        return filtered;
      }
      return [{ name: 'TENANT_MAIN', initialTab: 'RESERVATIONS' }];
    });
  };

  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // Déconnexion : Lorsque l'utilisateur se déconnecte, réinitialiser automatiquement la navigation vers l'Accueil Locataire Invité
  useEffect(() => {
    if (!isAuthenticated && splashFinished) {
      setRouteHistory([{ name: 'TENANT_MAIN', initialTab: 'ACCUEIL' }]);
      setActiveTenantTab('ACCUEIL');
      setActiveOwnerTab('ACCUEIL');
    }
  }, [isAuthenticated, splashFinished]);

  // Gestionnaire du bouton Retour Matériel Android
  useEffect(() => {
    const onBackPress = () => {
      if (currentRoute.name === 'VEHICLE_DETAIL') {
        handleVehicleDetailBack();
        return true;
      }
      if (currentRoute.name === 'OWNER_BOOKING_DETAIL') {
        handleOwnerBookingBack();
        return true;
      }
      if (currentRoute.name === 'BOOKING_DETAIL') {
        handleTenantBookingBack();
        return true;
      }
      if (canGoBack) {
        goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [canGoBack, routeHistory, currentRoute]);

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
    activeOwnerTab,
    navigateTo,
    navigateToTab,
    navigateToOwnerTab,
    switchToOwnerSpace,
    switchToTenantSpace,
    navigateToOtp,
    navigateToVehicleDetail,
    navigateToBookingDetail,
    navigateToOwnerBookingDetail,
    goBack,
    canGoBack,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      <GestureHandlerRootView style={styles.rootContainer}>
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
                  onBack={handleVehicleDetailBack}
                />
              );

            case 'BOOKING_DETAIL':
              return (
                <TenantBookingDetailScreen
                  reservationId={currentRoute.reservationId}
                  onBack={handleTenantBookingBack}
                />
              );

            case 'OWNER_BOOKING_DETAIL':
              return (
                <OwnerBookingDetailScreen
                  reservationId={currentRoute.reservationId}
                  onBack={handleOwnerBookingBack}
                />
              );

            case 'OWNER_MAIN':
              return (
                <OwnerMainLayout
                  initialTab={currentRoute.initialTab}
                  onSwitchToTenant={switchToTenantSpace}
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
      </GestureHandlerRootView>
    </NavigationContext.Provider>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
});
