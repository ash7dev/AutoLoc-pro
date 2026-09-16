import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import {
  Camera,
  Images,
  FileText,
  Plus,
  Trash2,
  Crown,
  CheckCircle2,
  X,
  Upload,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  FileType,
  Folder,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  useFonts as useFraunces,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  useFonts as useInter,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

export interface PhotoItem {
  id: string;
  uri: string;
  publicId?: string;
  isCover?: boolean;
}

export interface DocumentItem {
  uri: string;
  name: string;
  isImage?: boolean;
  publicId?: string;
}

export interface Step6Data {
  photos: PhotoItem[];
  carteGrise?: DocumentItem | null;
  assuranceDoc?: DocumentItem | null;
}

interface WizardStep6PhotosProps {
  data: Step6Data;
  onChange: (updated: Partial<Step6Data>) => void;
  isEditMode?: boolean;
}

type PickerTarget = 'photo' | 'carteGrise' | 'assuranceDoc';

export const WizardStep6Photos: React.FC<WizardStep6PhotosProps> = ({
  data,
  onChange,
  isEditMode = false,
}) => {
  const [frauncesLoaded] = useFraunces({ Fraunces_600SemiBold });
  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>('photo');

  const photos = data.photos || [];
  const carteGrise = data.carteGrise || null;
  const assuranceDoc = data.assuranceDoc || null;

  const openPickerModal = (target: PickerTarget) => {
    setPickerTarget(target);
    setModalVisible(true);
  };

  // Launch Camera
  const handleCameraLaunch = async () => {
    setModalVisible(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission requise',
          "L'accès à l'appareil photo est nécessaire pour prendre le document ou véhicule."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: pickerTarget === 'photo' ? [4, 3] : [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        handleAssetSelected(asset.uri, 'photo_camera.jpg', true);
      }
    } catch {
      Alert.alert('Erreur', "Impossible de prendre la photo.");
    }
  };

  // Launch Gallery
  const handleGalleryLaunch = async () => {
    setModalVisible(false);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission requise',
          "L'accès à la galerie photo est nécessaire."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: pickerTarget === 'photo',
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (pickerTarget === 'photo') {
          const newItems: PhotoItem[] = result.assets.map((asset, idx) => ({
            id: `${Date.now()}-${idx}-${Math.random()}`,
            uri: asset.uri,
          }));
          onChange({ photos: [...photos, ...newItems] });
        } else {
          const asset = result.assets[0];
          handleAssetSelected(asset.uri, asset.fileName || 'photo_doc.jpg', true);
        }
      }
    } catch {
      Alert.alert('Erreur', "Impossible de sélectionner dans la galerie.");
    }
  };

  // Launch Document Picker (PDF/Files)
  const handleDocumentLaunch = async () => {
    setModalVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const doc = result.assets[0];
        const isImg = doc.mimeType?.startsWith('image/') || doc.name.match(/\.(jpg|jpeg|png|heic)$/i) !== null;
        handleAssetSelected(doc.uri, doc.name, isImg);
      }
    } catch {
      Alert.alert('Erreur', "Impossible de sélectionner le fichier.");
    }
  };

  const handleAssetSelected = (uri: string, name: string, isImage = true) => {
    if (pickerTarget === 'photo') {
      const newPhoto: PhotoItem = {
        id: `${Date.now()}-${Math.random()}`,
        uri,
      };
      onChange({ photos: [...photos, newPhoto] });
    } else if (pickerTarget === 'carteGrise') {
      onChange({ carteGrise: { uri, name, isImage } });
    } else if (pickerTarget === 'assuranceDoc') {
      onChange({ assuranceDoc: { uri, name, isImage } });
    }
  };

  // Set photo as main cover
  const handleSetAsCover = (index: number) => {
    if (index === 0) return;
    const updated = [...photos];
    const [moved] = updated.splice(index, 1);
    updated.unshift(moved);
    onChange({ photos: updated });
  };

  // Remove photo
  const handleRemovePhoto = (id: string) => {
    const updated = photos.filter((p) => p.id !== id);
    onChange({ photos: updated });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Editorial Hero Header */}
      <View style={styles.heroHeader}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.heroBadgeDot} />
          <Text style={styles.heroBadgeText}>STUDIO PHOTOS & PAPIERS</Text>
        </View>
        <Text
          style={[
            styles.heroTitle,
            frauncesLoaded && { fontFamily: 'Fraunces_600SemiBold' },
          ]}
        >
          Photos & Documents
        </Text>
        <Text style={styles.heroSubtitle}>
          {isEditMode
            ? 'Gérez vos visuels HD et réorganisez vos photos pour choisir la couverture principale.'
            : 'Ajoutez des visuels captivants et téléversez la carte grise et l’attestation d’assurance.'}
        </Text>
      </View>

      {/* SECTION 1: GALERIE PHOTOS */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionTopRow}>
          <View style={styles.sectionHeaderCol}>
            <Text style={styles.sectionTitle}>Galerie du Véhicule *</Text>
            <Text style={styles.sectionSub}>
              {photos.length > 0
                ? `${photos.length} photo${photos.length > 1 ? 's' : ''} disponible${photos.length > 1 ? 's' : ''} (1ère = Couverture)`
                : 'Au moins 1 photo recommandée'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addPhotoHeaderBtn}
            onPress={() => openPickerModal('photo')}
            activeOpacity={0.7}
          >
            <Plus size={15} color="#059669" strokeWidth={2.5} />
            <Text style={styles.addPhotoHeaderBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {/* Photos Grid */}
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => {
            const isCover = index === 0;
            return (
              <View key={photo.id} style={styles.photoCard}>
                <Image source={{ uri: photo.uri }} style={styles.photoImage} />

                {/* Cover Badge */}
                {isCover ? (
                  <View style={styles.coverBadge}>
                    <Crown size={12} color="#FFFFFF" />
                    <Text style={styles.coverBadgeText}>COUVERTURE</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.setCoverBtn}
                    onPress={() => handleSetAsCover(index)}
                    activeOpacity={0.8}
                  >
                    <Crown size={11} color="#059669" />
                    <Text style={styles.setCoverBtnText}>Placer 1er</Text>
                  </TouchableOpacity>
                )}

                {/* Trash Button */}
                <TouchableOpacity
                  style={styles.deletePhotoBtn}
                  onPress={() => handleRemovePhoto(photo.id)}
                  activeOpacity={0.8}
                >
                  <Trash2 size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Add Photo Card Tile */}
          <TouchableOpacity
            style={styles.addPhotoTile}
            onPress={() => openPickerModal('photo')}
            activeOpacity={0.7}
          >
            <View style={styles.addPhotoIconBg}>
              <Plus size={22} color="#059669" />
            </View>
            <Text style={styles.addPhotoTileText}>Ajouter photo</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Angles Tip Box */}
        <View style={styles.tipBox}>
          <Sparkles size={16} color="#059669" style={{ marginTop: 2 }} />
          <Text style={styles.tipBoxText}>
            💡 <Text style={{ fontFamily: 'Inter_700Bold' }}>Conseil pro :</Text> La première photo s'affiche comme couverture sur la recherche. Cliquez sur « Placer 1er » pour changer la photo principale.
          </Text>
        </View>
      </View>

      {/* SECTION 2: DOCUMENTS ADMINISTRATIFS (Mode Création uniquement) */}
      {!isEditMode && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Documents Administratifs *</Text>
          <Text style={styles.sectionDesc}>
            Nécessaires pour la vérification légale avant la mise en ligne.
          </Text>

          <View style={styles.docsStack}>
            {/* CARTE GRISE CARD */}
            <View style={styles.docCard}>
              <View style={styles.docLeft}>
                {carteGrise?.isImage ? (
                  <Image source={{ uri: carteGrise.uri }} style={styles.docThumbnail} />
                ) : (
                  <View
                    style={[
                      styles.docIconBg,
                      carteGrise ? styles.docIconBgSuccess : null,
                    ]}
                  >
                    {carteGrise ? (
                      <FileCheck2 size={20} color="#059669" />
                    ) : (
                      <FileText size={20} color="#64748B" />
                    )}
                  </View>
                )}

                <View style={styles.docTextCol}>
                  <View style={styles.docTitleRow}>
                    <Text style={styles.docTitle}>Carte Grise (Certificat)</Text>

                    {carteGrise ? (
                      <View style={styles.badgeImported}>
                        <CheckCircle2 size={11} color="#047857" />
                        <Text style={styles.badgeImportedText}>Importé</Text>
                      </View>
                    ) : (
                      <View style={styles.badgePending}>
                        <Text style={styles.badgePendingText}>Non importé</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.docStatusText} numberOfLines={1}>
                    {carteGrise ? carteGrise.name : 'Photo de la carte grise ou fichier PDF'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.uploadDocBtn,
                  carteGrise ? styles.uploadDocBtnSuccess : null,
                ]}
                onPress={() => openPickerModal('carteGrise')}
                activeOpacity={0.8}
              >
                <Upload
                  size={14}
                  color={carteGrise ? '#047857' : '#059669'}
                />
                <Text
                  style={[
                    styles.uploadDocBtnText,
                    carteGrise ? styles.uploadDocBtnTextSuccess : null,
                  ]}
                >
                  {carteGrise ? 'Modifier' : 'Ajouter'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ATTESTATION D'ASSURANCE CARD */}
            <View style={styles.docCard}>
              <View style={styles.docLeft}>
                {assuranceDoc?.isImage ? (
                  <Image source={{ uri: assuranceDoc.uri }} style={styles.docThumbnail} />
                ) : (
                  <View
                    style={[
                      styles.docIconBg,
                      assuranceDoc ? styles.docIconBgSuccess : null,
                    ]}
                  >
                    {assuranceDoc ? (
                      <ShieldCheck size={20} color="#059669" />
                    ) : (
                      <FileText size={20} color="#64748B" />
                    )}
                  </View>
                )}

                <View style={styles.docTextCol}>
                  <View style={styles.docTitleRow}>
                    <Text style={styles.docTitle}>Attestation d'Assurance</Text>

                    {assuranceDoc ? (
                      <View style={styles.badgeImported}>
                        <CheckCircle2 size={11} color="#047857" />
                        <Text style={styles.badgeImportedText}>Importé</Text>
                      </View>
                    ) : (
                      <View style={styles.badgePending}>
                        <Text style={styles.badgePendingText}>Non importé</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.docStatusText} numberOfLines={1}>
                    {assuranceDoc ? assuranceDoc.name : 'Photo de l’attestation ou fichier PDF'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.uploadDocBtn,
                  assuranceDoc ? styles.uploadDocBtnSuccess : null,
                ]}
                onPress={() => openPickerModal('assuranceDoc')}
                activeOpacity={0.8}
              >
                <Upload
                  size={14}
                  color={assuranceDoc ? '#047857' : '#059669'}
                />
                <Text
                  style={[
                    styles.uploadDocBtnText,
                    assuranceDoc ? styles.uploadDocBtnTextSuccess : null,
                  ]}
                >
                  {assuranceDoc ? 'Modifier' : 'Ajouter'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* GLASSMORPHISM FLOATING POPOVER CARD MODAL */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.glassOverlay}>
          <TouchableOpacity
            style={styles.glassBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.floatingPopoverCard}>
            {/* Option 1: Photothèque */}
            <TouchableOpacity
              style={styles.popoverItemRow}
              onPress={handleGalleryLaunch}
              activeOpacity={0.7}
            >
              <Images size={24} color="#0F172A" strokeWidth={1.8} />
              <Text style={styles.popoverItemText}>Photothèque</Text>
            </TouchableOpacity>

            {/* Option 2: Prendre une photo */}
            <TouchableOpacity
              style={styles.popoverItemRow}
              onPress={handleCameraLaunch}
              activeOpacity={0.7}
            >
              <Camera size={24} color="#0F172A" strokeWidth={1.8} />
              <Text style={styles.popoverItemText}>Prendre une photo</Text>
            </TouchableOpacity>

            {/* Option 3: Choisir les fichiers */}
            <TouchableOpacity
              style={styles.popoverItemRow}
              onPress={handleDocumentLaunch}
              activeOpacity={0.7}
            >
              <Folder size={24} color="#0F172A" strokeWidth={1.8} />
              <Text style={styles.popoverItemText}>Choisir les fichiers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroHeader: {
    marginBottom: 4,
    gap: 6,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  heroBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#051B14',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    lineHeight: 20,
  },

  // Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderCol: {
    flex: 1,
    paddingRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 2,
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginBottom: 12,
  },

  addPhotoHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    flexShrink: 0,
  },
  addPhotoHeaderBtnText: {
    fontSize: 12.5,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
  },

  // Photo Grid
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  photoCard: {
    width: '48%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  coverBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  setCoverBtn: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  setCoverBtnText: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addPhotoTile: {
    width: '48%',
    height: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderStyle: 'dashed',
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addPhotoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoTileText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
  },

  // Tip Box
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipBoxText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#475569',
    lineHeight: 17,
  },

  // Docs Stack
  docsStack: {
    gap: 10,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  docLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  docThumbnail: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    resizeMode: 'cover',
  },
  docIconBg: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIconBgSuccess: {
    backgroundColor: '#ECFDF5',
  },
  docTextCol: {
    flex: 1,
  },
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
    flexShrink: 1,
  },

  // State Badges
  badgePending: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  badgePendingText: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    color: '#92400E',
  },
  badgeImported: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeImportedText: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
  },

  docStatusText: {
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 2,
  },
  uploadDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  uploadDocBtnSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  uploadDocBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#059669',
  },
  uploadDocBtnTextSuccess: {
    color: '#166534',
  },

  // Glassmorphism Action Sheet Modal
  glassOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  floatingPopoverCard: {
    width: '84%',
    maxWidth: 340,
    backgroundColor: '#FAF9F5',
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 22,
    gap: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#F0EFEA',
  },
  popoverItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 2,
  },
  popoverItemText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
});
