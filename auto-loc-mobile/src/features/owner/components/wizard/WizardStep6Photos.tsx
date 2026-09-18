import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ActionSheetIOS,
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
  Upload,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  Folder,
  Eye,
  X,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../../../../core/theme';

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
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    target: 'carteGrise' | 'assuranceDoc';
    doc: DocumentItem;
  } | null>(null);

  const photos = data.photos || [];
  const carteGrise = data.carteGrise || null;
  const assuranceDoc = data.assuranceDoc || null;

  const openPickerModal = (target: PickerTarget) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuler', '📸 Appareil photo', '🖼️ Photothèque', '📄 Fichier (PDF / Document)'],
          cancelButtonIndex: 0,
          title: 'Ajouter un média',
          message: 'Choisissez la source de votre fichier :',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleCameraLaunch(target);
          else if (buttonIndex === 2) handleGalleryLaunch(target);
          else if (buttonIndex === 3) handleDocumentLaunch(target);
        }
      );
    } else {
      Alert.alert(
        'Ajouter un média',
        'Choisissez la source de votre fichier :',
        [
          {
            text: ' Appareil photo',
            onPress: () => handleCameraLaunch(target),
          },
          {
            text: ' Photothèque',
            onPress: () => handleGalleryLaunch(target),
          },
          {
            text: 'Fichier (PDF / Document)',
            onPress: () => handleDocumentLaunch(target),
          },
          {
            text: 'Annuler',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleOpenPreview = (
    title: string,
    target: 'carteGrise' | 'assuranceDoc',
    doc: DocumentItem
  ) => {
    setPreviewDoc({ title, target, doc });
    setPreviewModalVisible(true);
  };

  const handleRemoveDoc = (target: 'carteGrise' | 'assuranceDoc') => {
    if (target === 'carteGrise') onChange({ carteGrise: null });
    if (target === 'assuranceDoc') onChange({ assuranceDoc: null });
  };

  // Launch Camera
  const handleCameraLaunch = async (target: PickerTarget) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission requise',
          "L'accès à l'appareil photo est nécessaire pour prendre la photo."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        handleAssetSelected(asset.uri, 'photo_camera.jpg', true, target);
      }
    } catch {
      Alert.alert('Erreur', "Impossible de prendre la photo.");
    }
  };

  // Launch Gallery
  const handleGalleryLaunch = async (target: PickerTarget) => {
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
        mediaTypes: 'images',
        quality: 0.8,
        allowsMultipleSelection: target === 'photo',
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (target === 'photo') {
          const newItems: PhotoItem[] = result.assets.map((asset, idx) => ({
            id: `${Date.now()}-${idx}-${Math.random()}`,
            uri: asset.uri,
          }));
          onChange({ photos: [...photos, ...newItems] });
        } else {
          const asset = result.assets[0];
          handleAssetSelected(asset.uri, asset.fileName || 'photo_doc.jpg', true, target);
        }
      }
    } catch {
      Alert.alert('Erreur', "Impossible de sélectionner dans la galerie.");
    }
  };

  // Launch Document Picker (PDF/Files)
  const handleDocumentLaunch = async (target: PickerTarget) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const doc = result.assets[0];
        const isImg = doc.mimeType?.startsWith('image/') || doc.name.match(/\.(jpg|jpeg|png|heic)$/i) !== null;
        handleAssetSelected(doc.uri, doc.name, isImg, target);
      }
    } catch {
      Alert.alert('Erreur', "Impossible de sélectionner le fichier.");
    }
  };

  const handleAssetSelected = (
    uri: string,
    name: string,
    isImage = true,
    target: PickerTarget = 'photo'
  ) => {
    if (target === 'photo') {
      const newPhoto: PhotoItem = {
        id: `${Date.now()}-${Math.random()}`,
        uri,
      };
      onChange({ photos: [...photos, newPhoto] });
    } else if (target === 'carteGrise') {
      onChange({ carteGrise: { uri, name, isImage } });
    } else if (target === 'assuranceDoc') {
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
    <View style={styles.container}>
      {/* Hero Header d'étape Centré Luxury */}
      <View style={styles.centeredHeroHeader}>
        <View style={styles.centeredIconBadge}>
          <Camera size={22} color="#4ADE80" strokeWidth={2.2} />
        </View>
        <Text style={styles.centeredHeroTitle} numberOfLines={1} adjustsFontSizeToFit>
          Photos & Documents
        </Text>
        <Text style={styles.centeredHeroSubtitle}>
          {isEditMode
            ? 'Gérez vos visuels HD et choisissez la photo de couverture.'
            : 'Ajoutez vos visuels HD et vos justificatifs administratifs.'}
        </Text>
      </View>

      {/* SECTION 1: GALERIE PHOTOS */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionTopRow}>
          <View style={styles.labelWithIcon}>
            <Images size={16} color="#059669" strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>Galerie du Véhicule *</Text>
          </View>
          <TouchableOpacity
            style={styles.addPhotoHeaderBtn}
            onPress={() => openPickerModal('photo')}
            activeOpacity={0.7}
          >
            <Plus size={14} color="#059669" strokeWidth={2.5} />
            <Text style={styles.addPhotoHeaderBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionSubText}>
          {photos.length > 0
            ? `${photos.length} photo${photos.length > 1 ? 's' : ''} disponible${photos.length > 1 ? 's' : ''} (la 1ère est en couverture)`
            : 'Ajoutez des visuels captivants sous différents angles.'}
        </Text>

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
                    <Crown size={11} color="#4ADE80" />
                    <Text style={styles.coverBadgeText}>COUVERTURE</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.setCoverBtn}
                    onPress={() => handleSetAsCover(index)}
                    activeOpacity={0.8}
                  >
                    <Crown size={11} color="#047857" />
                    <Text style={styles.setCoverBtnText}>Placer 1er</Text>
                  </TouchableOpacity>
                )}

                {/* Trash Button */}
                <TouchableOpacity
                  style={styles.deletePhotoBtn}
                  onPress={() => handleRemovePhoto(photo.id)}
                  activeOpacity={0.8}
                >
                  <Trash2 size={13} color="#FFFFFF" />
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
              <Plus size={20} color="#059669" />
            </View>
            <Text style={styles.addPhotoTileText}>Ajouter photo</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Angles Tip Box */}
        <View style={styles.tipBox}>
          <Sparkles size={16} color="#059669" style={{ marginTop: 2 }} />
          <Text style={styles.tipBoxText}>
            💡 <Text style={{ fontFamily: theme.typography.fontFamily.displaySemiBold }}>Conseil pro :</Text> Cliquez sur « Placer 1er » pour choisir la photo qui sera affichée sur la carte de recherche.
          </Text>
        </View>
      </View>

      {/* SECTION 2: DOCUMENTS ADMINISTRATIFS (Mode Création uniquement) */}
      {!isEditMode && (
        <View style={styles.sectionCard}>
          <View style={styles.labelWithIcon}>
            <FileText size={16} color="#059669" strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>Documents Administratifs *</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Vérification légale avant la mise en ligne du véhicule.
          </Text>

          <View style={styles.docsStack}>
            {/* CARTE GRISE CARD */}
            <View style={[styles.docCard, carteGrise && styles.docCardSuccess]}>
              <TouchableOpacity
                style={styles.docHeaderRow}
                onPress={() => {
                  if (carteGrise) {
                    handleOpenPreview('Carte Grise', 'carteGrise', carteGrise);
                  } else {
                    openPickerModal('carteGrise');
                  }
                }}
                activeOpacity={0.8}
              >
                {carteGrise?.isImage ? (
                  <View style={styles.docThumbnailContainer}>
                    <Image source={{ uri: carteGrise.uri }} style={styles.docThumbnail} />
                    <View style={styles.docThumbnailOverlay}>
                      <Eye size={14} color="#FFFFFF" />
                    </View>
                  </View>
                ) : (
                  <View style={[styles.docIconBg, carteGrise ? styles.docIconBgSuccess : null]}>
                    {carteGrise ? (
                      <FileCheck2 size={20} color="#059669" />
                    ) : (
                      <FileText size={20} color="#64748B" />
                    )}
                  </View>
                )}

                <View style={styles.docTextCol}>
                  <Text style={styles.docTitle} numberOfLines={1} adjustsFontSizeToFit>
                    Carte Grise (Certificat)
                  </Text>
                  <Text style={styles.docStatusText} numberOfLines={1}>
                    {carteGrise ? carteGrise.name : 'Photo ou fichier PDF'}
                  </Text>
                </View>

                {carteGrise ? (
                  <View style={styles.badgeImported}>
                    <CheckCircle2 size={11} color="#4ADE80" />
                    <Text style={styles.badgeImportedText}>Importé</Text>
                  </View>
                ) : (
                  <View style={styles.badgePending}>
                    <Text style={styles.badgePendingText}>Requis</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Actions Row */}
              {carteGrise ? (
                <View style={styles.docActionsBar}>
                  <TouchableOpacity
                    style={styles.docActionPill}
                    onPress={() => handleOpenPreview('Carte Grise', 'carteGrise', carteGrise)}
                    activeOpacity={0.7}
                  >
                    <Eye size={14} color="#059669" />
                    <Text style={styles.docActionPillText}>Aperçu</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.docActionPill}
                    onPress={() => openPickerModal('carteGrise')}
                    activeOpacity={0.7}
                  >
                    <Upload size={14} color="#047857" />
                    <Text style={styles.docActionPillText}>Remplacer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.docActionSquareDanger}
                    onPress={() => handleRemoveDoc('carteGrise')}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={15} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadDocBtnFull}
                  onPress={() => openPickerModal('carteGrise')}
                  activeOpacity={0.8}
                >
                  <Upload size={14} color="#059669" />
                  <Text style={styles.uploadDocBtnText}>Ajouter la Carte Grise</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ATTESTATION D'ASSURANCE CARD */}
            <View style={[styles.docCard, assuranceDoc && styles.docCardSuccess]}>
              <TouchableOpacity
                style={styles.docHeaderRow}
                onPress={() => {
                  if (assuranceDoc) {
                    handleOpenPreview("Attestation d'Assurance", 'assuranceDoc', assuranceDoc);
                  } else {
                    openPickerModal('assuranceDoc');
                  }
                }}
                activeOpacity={0.8}
              >
                {assuranceDoc?.isImage ? (
                  <View style={styles.docThumbnailContainer}>
                    <Image source={{ uri: assuranceDoc.uri }} style={styles.docThumbnail} />
                    <View style={styles.docThumbnailOverlay}>
                      <Eye size={14} color="#FFFFFF" />
                    </View>
                  </View>
                ) : (
                  <View style={[styles.docIconBg, assuranceDoc ? styles.docIconBgSuccess : null]}>
                    {assuranceDoc ? (
                      <ShieldCheck size={20} color="#059669" />
                    ) : (
                      <FileText size={20} color="#64748B" />
                    )}
                  </View>
                )}

                <View style={styles.docTextCol}>
                  <Text style={styles.docTitle} numberOfLines={1} adjustsFontSizeToFit>
                    Attestation d'Assurance
                  </Text>
                  <Text style={styles.docStatusText} numberOfLines={1}>
                    {assuranceDoc ? assuranceDoc.name : 'Photo ou fichier PDF'}
                  </Text>
                </View>

                {assuranceDoc ? (
                  <View style={styles.badgeImported}>
                    <CheckCircle2 size={11} color="#4ADE80" />
                    <Text style={styles.badgeImportedText}>Importé</Text>
                  </View>
                ) : (
                  <View style={styles.badgePending}>
                    <Text style={styles.badgePendingText}>Requis</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Actions Row */}
              {assuranceDoc ? (
                <View style={styles.docActionsBar}>
                  <TouchableOpacity
                    style={styles.docActionPill}
                    onPress={() => handleOpenPreview("Attestation d'Assurance", 'assuranceDoc', assuranceDoc)}
                    activeOpacity={0.7}
                  >
                    <Eye size={14} color="#059669" />
                    <Text style={styles.docActionPillText}>Aperçu</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.docActionPill}
                    onPress={() => openPickerModal('assuranceDoc')}
                    activeOpacity={0.7}
                  >
                    <Upload size={14} color="#047857" />
                    <Text style={styles.docActionPillText}>Remplacer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.docActionSquareDanger}
                    onPress={() => handleRemoveDoc('assuranceDoc')}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={15} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadDocBtnFull}
                  onPress={() => openPickerModal('assuranceDoc')}
                  activeOpacity={0.8}
                >
                  <Upload size={14} color="#059669" />
                  <Text style={styles.uploadDocBtnText}>Ajouter l'Attestation d'Assurance</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* MODAL PRÉVISUALISATION DU DOCUMENT (STYLE KYC) */}
      <Modal
        visible={previewModalVisible && Boolean(previewDoc)}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewBackdrop}
            activeOpacity={1}
            onPress={() => setPreviewModalVisible(false)}
          />
          <View style={styles.previewContainer}>
            {/* Header */}
            <View style={styles.previewHeader}>
              <View style={styles.previewHeaderLeft}>
                <FileCheck2 size={20} color="#4ADE80" />
                <View>
                  <Text style={styles.previewTitle}>{previewDoc?.title}</Text>
                  <Text style={styles.previewSubTitle} numberOfLines={1}>
                    {previewDoc?.doc.name}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.previewCloseBtn}
                onPress={() => setPreviewModalVisible(false)}
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Main Content Area */}
            <View style={styles.previewContentArea}>
              {previewDoc?.doc.isImage || previewDoc?.doc.uri.match(/\.(jpg|jpeg|png|heic)$/i) ? (
                <Image
                  source={{ uri: previewDoc.doc.uri }}
                  style={styles.previewFullImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.previewPdfPlaceholder}>
                  <FileText size={64} color="#059669" />
                  <Text style={styles.previewPdfName}>{previewDoc?.doc.name}</Text>
                  <View style={styles.previewPdfBadge}>
                    <CheckCircle2 size={14} color="#047857" />
                    <Text style={styles.previewPdfBadgeText}>Fichier PDF valide importé</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Footer Buttons */}
            <View style={styles.previewFooterActions}>
              <TouchableOpacity
                style={styles.previewChangeBtn}
                onPress={() => {
                  setPreviewModalVisible(false);
                  if (previewDoc) openPickerModal(previewDoc.target);
                }}
                activeOpacity={0.8}
              >
                <Upload size={16} color="#FFFFFF" />
                <Text style={styles.previewChangeBtnText}>Changer le document</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.previewDismissBtn}
                onPress={() => setPreviewModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.previewDismissBtnText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    gap: 16,
  },

  centeredHeroHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  centeredIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#041912',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  centeredHeroTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 21.5,
    lineHeight: 28,
    color: '#041912',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  centeredHeroSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13.5,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 300,
  },

  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  // Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  sectionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
    letterSpacing: -0.3,
  },
  sectionSubText: {
    fontSize: 12.5,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748B',
  },
  sectionDesc: {
    fontSize: 12.5,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748B',
  },

  addPhotoHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  addPhotoHeaderBtnText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#047857',
  },

  // Photo Grid
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoCard: {
    width: '48%',
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    backgroundColor: '#041912',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  coverBadgeText: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#4ADE80',
    letterSpacing: 0.5,
  },
  setCoverBtn: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  setCoverBtnText: {
    fontSize: 9.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
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
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderStyle: 'dashed',
    backgroundColor: '#F0FDF4',
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
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  addPhotoTileText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#047857',
  },

  // Tip Box
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tipBoxText: {
    flex: 1,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#166534',
    lineHeight: 17,
  },

  // Docs Stack
  docsStack: {
    gap: 12,
  },
  docCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  docCardSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
  },
  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  docThumbnailContainer: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  docThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  docThumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(4, 25, 18, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docIconBgSuccess: {
    backgroundColor: '#FFFFFF',
    borderColor: '#A7F3D0',
  },
  docTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
  },
  docStatusText: {
    fontSize: 11.5,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748B',
    marginTop: 2,
  },

  // State Badges
  badgePending: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  badgePendingText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#92400E',
  },
  badgeImported: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#041912',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeImportedText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#4ADE80',
  },

  // Doc Actions Bar
  docActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(167, 243, 208, 0.4)',
  },
  docActionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  docActionPillText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#047857',
  },
  docActionSquareDanger: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },

  uploadDocBtnFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  uploadDocBtnText: {
    fontSize: 12.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#059669',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  popoverHeaderTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
    marginBottom: 4,
  },
  popoverItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  popoverIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popoverItemText: {
    fontSize: 14.5,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#0F172A',
  },

  // Document Preview Modal (KYC Style)
  previewOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  previewBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(4, 25, 18, 0.75)',
  },
  previewContainer: {
    backgroundColor: '#041912',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#FFFFFF',
  },
  previewSubTitle: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#A7F3D0',
    marginTop: 1,
  },
  previewCloseBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },

  previewContentArea: {
    height: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewFullImage: {
    width: '100%',
    height: '100%',
  },
  previewPdfPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  previewPdfName: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  previewPdfBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  previewPdfBadgeText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#047857',
  },

  previewFooterActions: {
    gap: 10,
    marginTop: 4,
  },
  previewChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 14,
  },
  previewChangeBtnText: {
    fontSize: 14.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#FFFFFF',
  },
  previewDismissBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  previewDismissBtnText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#94A3B8',
  },
});
