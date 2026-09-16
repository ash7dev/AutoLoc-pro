import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Save, Edit3, Trash2, X } from 'lucide-react-native';

interface AbandonWizardModalProps {
  visible: boolean;
  onSaveAndExit: () => void;
  onContinueEditing: () => void;
  onDiscardAndExit: () => void;
}

export const AbandonWizardModal: React.FC<AbandonWizardModalProps> = ({
  visible,
  onSaveAndExit,
  onContinueEditing,
  onDiscardAndExit,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Close X icon */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onContinueEditing}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Header Icon */}
          <View style={styles.iconContainer}>
            <Save size={28} color="#059669" />
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Enregistrer et quitter ?</Text>
          <Text style={styles.subtitle}>
            Votre annonce sera conservée dans vos brouillons. Vous pourrez la reprendre à tout moment.
          </Text>

          {/* Actions */}
          <View style={styles.actionCol}>
            {/* Primary Action */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onSaveAndExit}
              activeOpacity={0.85}
            >
              <Save size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Enregistrer et quitter</Text>
            </TouchableOpacity>

            {/* Secondary Action */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onContinueEditing}
              activeOpacity={0.8}
            >
              <Edit3 size={16} color="#0F172A" />
              <Text style={styles.secondaryBtnText}>Continuer l'édition</Text>
            </TouchableOpacity>

            {/* Destructive Action */}
            <TouchableOpacity
              style={styles.discardBtn}
              onPress={onDiscardAndExit}
              activeOpacity={0.7}
            >
              <Trash2 size={15} color="#DC2626" />
              <Text style={styles.discardBtnText}>Supprimer le brouillon</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  actionCol: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#051B14',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
  },
  primaryBtnText: {
    fontSize: 14.5,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 13,
    width: '100%',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#0F172A',
  },
  discardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 2,
  },
  discardBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#DC2626',
  },
});
