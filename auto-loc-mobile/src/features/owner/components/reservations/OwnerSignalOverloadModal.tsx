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
import { AlertTriangle, Users, X } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

interface OwnerSignalOverloadModalProps {
  visible: boolean;
  loading: boolean;
  maxPlaces?: number;
  onClose: () => void;
  onConfirm: (nombreOccupantsReel: number, commentaire?: string) => Promise<void>;
}

export const OwnerSignalOverloadModal: React.FC<OwnerSignalOverloadModalProps> = ({
  visible,
  loading,
  maxPlaces = 5,
  onClose,
  onConfirm,
}) => {
  const [occupantsInput, setOccupantsInput] = useState<string>(String(maxPlaces + 1));
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    const num = Number(occupantsInput);
    if (isNaN(num) || num <= maxPlaces) {
      return Alert.alert(
        'Nombre invalide',
        `Le nombre d'occupants doit dépasser la capacité max du véhicule (${maxPlaces} places).`
      );
    }

    try {
      await onConfirm(num, comment.trim() || undefined);
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Le signalement de dépassement a échoué.');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Users size={20} color="#D97706" />
            </View>
            <View style={styles.titles}>
              <Text style={styles.title}>Signalement Dépassement Occupants</Text>
              <Text style={styles.subtitle}>Capacité maximale autorisée : {maxPlaces} places</Text>
            </View>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.warningCard}>
              <AlertTriangle size={15} color="#B45309" style={styles.warningIcon} />
              <Text style={styles.warningText}>
                Ce signalement entraîne une annulation immédiate de la location pour non-respect de la capacité du véhicule avec pénalité locataire de 50%.
              </Text>
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Nombre d'occupants constatés :</Text>
              <TextInput
                value={occupantsInput}
                onChangeText={setOccupantsInput}
                keyboardType="numeric"
                style={styles.numInput}
              />
            </View>

            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Commentaires complémentaires (ex: refus du locataire de débarquer les passagers en trop)"
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
              <Text style={styles.submitText}>{loading ? 'Traitement…' : 'Confirmer le signalement'}</Text>
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
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    flex: 1,
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15.5,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12.5,
    color: '#334155',
  },
  numInput: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 16,
    color: '#072A20',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 60,
    textAlign: 'center',
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
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
});
