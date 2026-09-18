import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlertOctagon, AlertTriangle, X } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

interface OwnerSignalNoShowModalProps {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (commentaire?: string) => Promise<void>;
}

export const OwnerSignalNoShowModal: React.FC<OwnerSignalNoShowModalProps> = ({
  visible,
  loading,
  onClose,
  onConfirm,
}) => {
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    try {
      await onConfirm(comment.trim() || undefined);
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Le signalement no-show a échoué.');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <AlertOctagon size={20} color="#DC2626" />
            </View>
            <View style={styles.titles}>
              <Text style={styles.title}>Signaler l’absence du locataire</Text>
              <Text style={styles.subtitle}>No-show au lieu de rendez-vous (T+2h)</Text>
            </View>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.warningCard}>
              <AlertTriangle size={15} color="#B45309" style={styles.warningIcon} />
              <Text style={styles.warningText}>
                Ce signalement indique que le locataire ne s’est pas présenté 2h après l’heure de départ. Le service client traitera l’annulation selon le barème (remboursement partiel locataire 30% / indemnité hôte 50%).
              </Text>
            </View>

            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Précisez la situation (tentatives d'appel, attente sur place...)"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              style={styles.textInput}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={loading}
              onPress={handleSubmit}
              style={styles.submitBtn}
            >
              <Text style={styles.submitText}>{loading ? 'Traitement…' : 'Confirmer le No-show'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 25, 18, 0.70)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    flex: 1,
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: '#072A20',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: 12,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningIcon: {
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#92400E',
    lineHeight: 16,
  },
  textInput: {
    minHeight: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12.5,
    color: '#475569',
  },
  submitBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
});
