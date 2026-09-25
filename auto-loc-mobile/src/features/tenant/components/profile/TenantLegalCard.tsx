import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ChevronRight,
  ExternalLink,
  FileText,
  Scale,
  ShieldCheck,
  Trash2,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { deleteAccount } from '../../api/tenantProfileApi';
import { useAppStore } from '../../../../core/store/useAppStore';

const CGU_URL = 'https://autoloc.sn/cgu';
const PRIVACY_URL = 'https://autoloc.sn/privacy';

export function TenantLegalCard() {
  const logout = useAppStore((state) => state.logout);
  const [deleting, setDeleting] = useState(false);

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Information', `Veuillez visiter ${url} dans votre navigateur.`);
      }
    } catch {
      Alert.alert('Information', `Veuillez visiter ${url} dans votre navigateur.`);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer mon compte ?',
      'Cette action est définitive et irréversible. Vos réservations, avis et données personnelles seront définitivement supprimés conformément aux exigences de confidentialité (RGPD / Apple Store Guideline 5.1.1).',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer définitivement',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteAccount();
      Alert.alert(
        'Compte supprimé',
        'Votre compte et toutes vos données ont été supprimés avec succès.',
        [{ text: 'OK', onPress: () => logout() }]
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Impossible de supprimer votre compte pour le moment. Veuillez réessayer plus tard ou contacter le support.';
      Alert.alert('Erreur', message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* En-tête du composant */}
      <View style={styles.headerRow}>
        <View style={styles.darkIconBadge}>
          <Scale size={18} color="#4ADE80" strokeWidth={2.2} />
        </View>
        <View style={styles.titleTextGroup}>
          <Text style={styles.title}>Conditions & Confidentialité</Text>
          <Text style={styles.subtitle}>
            Réglementation, CGU et gestion de vos données
          </Text>
        </View>
      </View>

      {/* Liste d'actions juridiques */}
      <View style={styles.optionsList}>
        <TouchableOpacity
          style={styles.optionRow}
          activeOpacity={0.7}
          onPress={() => openLink(CGU_URL)}
        >
          <View style={styles.optionIconBadge}>
            <FileText size={16} color="#041912" strokeWidth={2} />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Conditions Générales d'Utilisation (CGU)</Text>
            <Text style={styles.optionSub}>Droits, devoirs et garanties des utilisateurs</Text>
          </View>
          <ExternalLink size={15} color="#94A3B8" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.optionRow}
          activeOpacity={0.7}
          onPress={() => openLink(PRIVACY_URL)}
        >
          <View style={styles.optionIconBadge}>
            <ShieldCheck size={16} color="#041912" strokeWidth={2} />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Politique de Confidentialité</Text>
            <Text style={styles.optionSub}>Protection et traitement des données personnelles</Text>
          </View>
          <ExternalLink size={15} color="#94A3B8" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Action Destructive - Supprimer mon compte (Apple Guidelines) */}
        <TouchableOpacity
          style={[styles.optionRow, styles.deleteRow]}
          activeOpacity={0.7}
          disabled={deleting}
          onPress={handleDeleteAccount}
        >
          <View style={[styles.optionIconBadge, styles.deleteIconBadge]}>
            <Trash2 size={16} color="#DC2626" strokeWidth={2} />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.deleteTitle}>Supprimer mon compte</Text>
            <Text style={styles.deleteSub}>Suppression définitive de vos données (Apple Guideline 5.1.1)</Text>
          </View>
          {deleting ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <ChevronRight size={16} color="#F87171" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  darkIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    flexShrink: 0,
  },
  titleTextGroup: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: '#041912',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#64748B',
  },
  optionsList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  optionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionTextContainer: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#0F172A',
  },
  optionSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  deleteRow: {
    backgroundColor: '#FEF2F2',
  },
  deleteIconBadge: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  deleteTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#DC2626',
  },
  deleteSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#EF4444',
  },
});
