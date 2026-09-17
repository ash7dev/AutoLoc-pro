import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowRight,
  CarFront,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { useNavigation } from '../../../../core/navigation/RootNavigator';

interface TenantBecomeHostCardProps {
  isHost: boolean;
  listingsCount?: number;
  onConfirm: () => Promise<void>;
}

export function TenantBecomeHostCard({
  isHost,
  listingsCount = 0,
  onConfirm,
}: TenantBecomeHostCardProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { switchToOwnerSpace } = useNavigation();

  const confirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      setOpen(false);
      switchToOwnerSpace();
    } catch {
      Alert.alert(
        'Activation impossible',
        'Nous n’avons pas pu activer votre espace Hôte. Réessayez dans quelques instants.'
      );
    } finally {
      setLoading(false);
    }
  };

  // CAS 1 : L'utilisateur est DÉJÀ un Hôte avec des annonces actives
  if (isHost && listingsCount > 0) {
    return (
      <View style={styles.cardHostActive}>
        <View style={styles.headerRow}>
          <View style={styles.darkIconBadgeActive}>
            <Sparkles size={18} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <View style={styles.titleGroup}>
            <Text style={styles.titleHostActive}>
              Espace Hôte ({listingsCount} {listingsCount > 1 ? 'véhicules' : 'véhicule'})
            </Text>
            <Text style={styles.subtitleHostActive}>
              Gérez vos annonces, vos réservations entrantes et vos revenus Hôte.
            </Text>
          </View>

          <View style={styles.activePill}>
            <CheckCircle2 size={11} color="#4ADE80" strokeWidth={2.2} />
            <Text style={styles.activePillText}>HÔTE ACTIF</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.switchBtnHost}
          onPress={switchToOwnerSpace}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Accéder au Mode Hôte"
        >
          <Text style={styles.switchBtnHostText}>Accéder au Mode Hôte ⚡️</Text>
          <ArrowRight size={15} color="#041912" strokeWidth={2.25} />
        </TouchableOpacity>
      </View>
    );
  }

  // CAS 2 : L'utilisateur est Hôte actif mais N'A PAS ENCORE d'annonce publiée
  if (isHost) {
    return (
      <View style={styles.cardHostActive}>
        <View style={styles.headerRow}>
          <View style={styles.darkIconBadgeActive}>
            <CarFront size={18} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <View style={styles.titleGroup}>
            <Text style={styles.titleHostActive}>Espace Hôte Débloqué ⚡️</Text>
            <Text style={styles.subtitleHostActive}>
              Ajoutez votre 1ère voiture pour commencer à recevoir des réservations.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.switchBtnHost}
          onPress={switchToOwnerSpace}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Publier mon 1er véhicule"
        >
          <Text style={styles.switchBtnHostText}>Publier mon 1er véhicule</Text>
          <ArrowRight size={15} color="#041912" strokeWidth={2.25} />
        </TouchableOpacity>
      </View>
    );
  }

  // CAS 2 : L'utilisateur N'EST PAS encore un Hôte
  return (
    <>
      <View style={styles.cardBecomeHost}>
        <View style={styles.headerRow}>
          <View style={styles.darkIconBadge}>
            <CarFront size={18} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <View style={styles.titleGroup}>
            <Text style={styles.titleBecomeHost}>Vous avez un véhicule à louer ?</Text>
            <Text style={styles.subtitleBecomeHost}>
              Proposez votre véhicule sur AutoLoc et générez des revenus en toute sécurité.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.becomeHostBtn}
          onPress={() => setOpen(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Devenir Hôte AutoLoc"
        >
          <Sparkles size={15} color="#041912" strokeWidth={2.25} />
          <Text style={styles.becomeHostBtnText}>Devenir Hôte AutoLoc</Text>
          <ChevronRight size={15} color="#041912" strokeWidth={2.25} />
        </TouchableOpacity>
      </View>

      {/* Modal d'Activation */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => !loading && setOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TouchableOpacity
              style={styles.closeBtn}
              disabled={loading}
              onPress={() => setOpen(false)}
            >
              <X size={18} color="#64748B" strokeWidth={2.2} />
            </TouchableOpacity>

            <View style={styles.modalIconBadge}>
              <CarFront size={22} color="#4ADE80" strokeWidth={2.25} />
            </View>

            <Text style={styles.modalTitle}>Activer mon Espace Hôte</Text>
            <Text style={styles.modalText}>
              Votre compte restera utilisable en tant que locataire. Vous pourrez basculer entre les deux espaces à tout moment depuis votre profil.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                disabled={loading}
                onPress={confirm}
                style={styles.modalPrimaryBtn}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Sparkles size={15} color="#FFFFFF" strokeWidth={2.25} />
                    <Text style={styles.modalPrimaryBtnText}>Activer l’Espace Hôte ⚡️</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                disabled={loading}
                onPress={() => setOpen(false)}
                style={styles.modalGhostBtn}
              >
                <Text style={styles.modalGhostBtnText}>Pas maintenant</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  /* Card CAS 1 : Hôte déjà Actif */
  cardHostActive: {
    backgroundColor: '#041912',
    borderRadius: 22,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  darkIconBadgeActive: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    flexShrink: 0,
  },
  titleGroup: {
    flex: 1,
    gap: 2,
  },
  titleHostActive: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  subtitleHostActive: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#A8D5C1',
    lineHeight: 16,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  activePillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#4ADE80',
    letterSpacing: 0.5,
  },
  switchBtnHost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ADE80',
    height: 46,
    borderRadius: 14,
    gap: 8,
  },
  switchBtnHostText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
    color: '#041912',
  },

  /* Card CAS 2 : Pas encore Hôte */
  cardBecomeHost: {
    backgroundColor: '#041912',
    borderRadius: 22,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  darkIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    flexShrink: 0,
  },
  titleBecomeHost: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  subtitleBecomeHost: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#A8D5C1',
    lineHeight: 16,
  },
  becomeHostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ADE80',
    height: 46,
    borderRadius: 14,
    gap: 8,
  },
  becomeHostBtnText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
    color: '#041912',
  },

  /* Modal Styles */
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(4, 25, 18, 0.65)',
  },
  modal: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    gap: 14,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    marginTop: 6,
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 19,
    color: '#041912',
    textAlign: 'center',
  },
  modalText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
  },
  modalActions: {
    width: '100%',
    gap: 8,
    marginTop: 4,
  },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#041912',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  modalPrimaryBtnText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  modalGhostBtn: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalGhostBtnText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12.5,
    color: '#64748B',
  },
});
