import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const DEFAULT_SUPABASE_URL = 'https://tcnlndjrvfddsjblamsj.supabase.co';

export const googleAuthService = {
  async performGoogleOAuth(): Promise<string | null> {
    try {
      const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
      const supabaseUrl = rawUrl.includes('autoloc-backend') ? DEFAULT_SUPABASE_URL : rawUrl;
      const redirectUri = Linking.createURL('auth/callback');

      // Utiliser directement l'URL Supabase Auth pour garantir la réussite de l'authentification
      const authBaseUrl = `${supabaseUrl}/auth/v1`;
      const authUrl = `${authBaseUrl}/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
        showInRecents: false,
      });

      if (result.type === 'success' && result.url) {
        // Extraction du jeton d'accès depuis le fragment hash (#access_token=...) ou query params
        const urlString = result.url;
        const hashIndex = urlString.indexOf('#');
        let accessToken: string | null = null;

        if (hashIndex !== -1) {
          const hashString = urlString.substring(hashIndex + 1);
          const params = new URLSearchParams(hashString);
          accessToken = params.get('access_token');
        }

        if (!accessToken) {
          const parsed = Linking.parse(urlString);
          accessToken = (parsed.queryParams?.access_token as string) || null;
        }

        if (accessToken) {
          return accessToken;
        }
      }

      if (result.type === 'dismiss' || result.type === 'cancel') {
        return null;
      }

      return null;
    } catch (error: any) {
      console.warn('[GoogleAuthService] Échec OAuth Google:', error);
      Alert.alert(
        'Connexion Google',
        'Impossible d’effectuer la connexion Google pour le moment. Veuillez réessayer.'
      );
      return null;
    }
  },
};
