import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import { Image as ImageIcon, Camera, Folder } from 'lucide-react-native';

interface ImageSourcePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLibrary: () => void;
  onSelectCamera: () => void;
  onSelectDocument: () => void;
}

const COLORS = {
  bg: '#FFFFFF',
  ink: '#041912',
  inkMuted: '#64748B',
  border: '#E2E8F0',
  surface: '#F8FAFC',
  accent: '#16A34A',
};

export const ImageSourcePickerModal: React.FC<ImageSourcePickerModalProps> = ({
  visible,
  onClose,
  onSelectLibrary,
  onSelectCamera,
  onSelectDocument,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetCard}>
              {/* Option 1: Photothèque */}
              <Pressable
                style={({ pressed }) => [
                  styles.optionRow,
                  pressed && styles.optionRowPressed,
                ]}
                onPress={() => {
                  onClose();
                  onSelectLibrary();
                }}
              >
                <View style={styles.iconBox}>
                  <ImageIcon size={22} color={COLORS.ink} strokeWidth={2} />
                </View>
                <Text style={styles.optionText}>Photothèque</Text>
              </Pressable>

              <View style={styles.divider} />

              {/* Option 2: Prendre une photo */}
              <Pressable
                style={({ pressed }) => [
                  styles.optionRow,
                  pressed && styles.optionRowPressed,
                ]}
                onPress={() => {
                  onClose();
                  onSelectCamera();
                }}
              >
                <View style={styles.iconBox}>
                  <Camera size={22} color={COLORS.ink} strokeWidth={2} />
                </View>
                <Text style={styles.optionText}>Prendre une photo</Text>
              </Pressable>

              <View style={styles.divider} />

              {/* Option 3: Choisir les fichiers */}
              <Pressable
                style={({ pressed }) => [
                  styles.optionRow,
                  pressed && styles.optionRowPressed,
                ]}
                onPress={() => {
                  onClose();
                  onSelectDocument();
                }}
              >
                <View style={styles.iconBox}>
                  <Folder size={22} color={COLORS.ink} strokeWidth={2} />
                </View>
                <Text style={styles.optionText}>Choisir les fichiers</Text>
              </Pressable>

              {/* Pied de page informatif */}
              <View style={styles.subtextContainer}>
                <Text style={styles.subtext}>
                  JPEG, PNG ou WebP • 10 Mo max
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 25, 18, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sheetCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.bg,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 14,
  },
  optionRowPressed: {
    backgroundColor: COLORS.surface,
  },
  iconBox: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.ink,
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
  subtextContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  subtext: {
    fontSize: 12,
    color: COLORS.inkMuted,
    textAlign: 'center',
  },
});
