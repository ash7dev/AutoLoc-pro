import { NativeModules, TurboModuleRegistry } from 'react-native';
import { googleAuthService } from './googleAuthService';

let GoogleSigninModule: any = null;
let statusCodesModule: any = null;

function isNativeGoogleSigninAvailable(): boolean {
  try {
    // 1. Vérification dans NativeModules standard (React Native Bridge)
    if (NativeModules.RNGoogleSignin || NativeModules.RNGoogleSigninModule) {
      return true;
    }
    // 2. Vérification sécurisée dans TurboModuleRegistry sans lever d'exception Enforcing (Expo Go Sandbox)
    if (TurboModuleRegistry && typeof TurboModuleRegistry.get === 'function') {
      const nativeModule = TurboModuleRegistry.get('RNGoogleSignin');
      if (nativeModule) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

function getNativeGoogleSignin() {
  if (GoogleSigninModule !== null) return GoogleSigninModule;

  // Si le binaire natif n'est pas lié à l'application (ex: Expo Go), ne pas exécution du require natif
  if (!isNativeGoogleSigninAvailable()) {
    return null;
  }

  try {
    const pkg = require('@react-native-google-signin/google-signin');
    GoogleSigninModule = pkg.GoogleSignin;
    statusCodesModule = pkg.statusCodes;
    return GoogleSigninModule;
  } catch {
    return null;
  }
}

export const nativeGoogleAuthService = {
  configure() {
    const GoogleSignin = getNativeGoogleSignin();
    if (!GoogleSignin) return;
    try {
      GoogleSignin.configure({
        scopes: ['email', 'profile'],
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || undefined,
        offlineAccess: true,
      });
    } catch (e) {
      console.warn('[NativeGoogleAuth] Erreur configuration module natif:', e);
    }
  },

  async signInWithGoogle(): Promise<string | null> {
    const GoogleSignin = getNativeGoogleSignin();

    if (GoogleSignin) {
      try {
        this.configure();
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();
        const idToken = response.data?.idToken || (response as any)?.idToken;

        if (idToken) {
          return idToken;
        }
      } catch (error: any) {
        if (statusCodesModule && error.code === statusCodesModule.SIGN_IN_CANCELLED) {
          return null;
        }
        if (statusCodesModule && error.code === statusCodesModule.IN_PROGRESS) {
          return null;
        }
        console.warn('[NativeGoogleAuth] Module natif non disponible dans cette brique, bascule vers Web OAuth:', error?.message);
      }
    }

    // Bascule automatique et transparente vers Web OAuth (Expo Go & Web)
    return googleAuthService.performGoogleOAuth();
  },
};
