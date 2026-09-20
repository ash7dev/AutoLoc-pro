import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileCheck,
  Fuel,
  Gauge,
  ImagePlus,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';

export type PhotoEtatLieu = {
  id: string;
  url: string;
  type: 'CHECKIN' | 'CHECKOUT';
  categorie?: string;
  creeLe?: string | Date;
};

interface BookingEtatLieuxGalleryModalProps {
  visible: boolean;
  photos: PhotoEtatLieu[];
  onClose: () => void;
}

type FilterTab = 'ALL' | 'CHECKIN' | 'CHECKOUT';

export const BookingEtatLieuxGalleryModal: React.FC<BookingEtatLieuxGalleryModalProps> = ({
  visible,
  photos = [],
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  const checkinPhotos = photos.filter((p) => p.type === 'CHECKIN');
  const checkoutPhotos = photos.filter((p) => p.type === 'CHECKOUT');

  const filteredPhotos =
    activeTab === 'CHECKIN'
      ? checkinPhotos
      : activeTab === 'CHECKOUT'
      ? checkoutPhotos
      : photos;

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.badgeGlass}>
              <ShieldCheck size={11} color="#A7F3D0" />
              <Text style={styles.badgeText}>INSPECTION VISUELLE</Text>
            </View>
            <Text style={styles.title}>État des lieux certifié</Text>
            <Text style={styles.subtitle}>
              {photos.length} photo{photos.length > 1 ? 's' : ''} HD enregistrée{photos.length > 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('ALL')}
            style={[styles.tabBtn, activeTab === 'ALL' && styles.tabBtnActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
              Toutes ({photos.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('CHECKIN')}
            style={[styles.tabBtn, activeTab === 'CHECKIN' && styles.tabBtnActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'CHECKIN' && styles.tabTextActive]}>
              Prise en charge ({checkinPhotos.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('CHECKOUT')}
            style={[styles.tabBtn, activeTab === 'CHECKOUT' && styles.tabBtnActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'CHECKOUT' && styles.tabTextActive]}>
              Restitution ({checkoutPhotos.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Photos Grid Content */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredPhotos.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Camera size={28} color="#A7F3D0" />
              </View>
              <Text style={styles.emptyTitle}>Aucune photo enregistrée</Text>
              <Text style={styles.emptySub}>
                {activeTab === 'CHECKIN'
                  ? 'Aucune photo prise lors de la prise en charge.'
                  : activeTab === 'CHECKOUT'
                  ? 'Aucune photo prise lors de la restitution.'
                  : 'Aucune photo d’état des lieux n’a encore été ajoutée.'}
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredPhotos.map((photo, idx) => (
                <TouchableOpacity
                  key={photo.id || idx}
                  onPress={() => setSelectedPhotoUrl(photo.url)}
                  style={styles.photoCard}
                  activeOpacity={0.88}
                >
                  <Image source={{ uri: photo.url }} contentFit="cover" style={styles.photoImg} />

                  {/* Type Tag (CHECKIN / CHECKOUT) */}
                  <View style={[styles.typeBadge, photo.type === 'CHECKIN' ? styles.typeCheckin : styles.typeCheckout]}>
                    <Text style={styles.typeBadgeText}>
                      {photo.type === 'CHECKIN' ? 'DEPART' : 'RETOUR'}
                    </Text>
                  </View>

                  {/* Zoom Hint Icon */}
                  <View style={styles.zoomHintCircle}>
                    <Eye size={12} color="#FFFFFF" />
                  </View>

                  {/* Category Caption */}
                  <View style={styles.captionOverlay}>
                    <Text style={styles.captionText} numberOfLines={1}>
                      {photo.categorie ? photo.categorie.replace('_', ' ') : 'Photo état des lieux'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Fullscreen Full-Res Zoom Modal */}
      {selectedPhotoUrl && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setSelectedPhotoUrl(null)}>
          <View style={styles.fullBackdrop}>
            <SafeAreaView style={styles.fullHeader}>
              <Text style={styles.fullTitle}>Inspecter la photo HD</Text>
              <TouchableOpacity
                onPress={() => setSelectedPhotoUrl(null)}
                style={styles.fullCloseBtn}
                activeOpacity={0.8}
              >
                <X size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </SafeAreaView>
            <View style={styles.fullImageWrapper}>
              <Image
                source={{ uri: selectedPhotoUrl }}
                style={styles.fullImage}
                contentFit="contain"
              />
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#041912',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerLeft: {
    flex: 1,
    gap: 3,
  },
  badgeGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(5, 150, 105, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.40)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    gap: 5,
    marginBottom: 4,
  },
  badgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
    letterSpacing: 0.7,
    color: '#A7F3D0',
  },
  title: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#A7F3D0',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Tab Bar */
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#34D399',
  },
  tabText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
  },

  /* Content Scroll & Grid */
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(5, 150, 105, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 17,
    color: '#FFFFFF',
  },
  emptySub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoCard: {
    width: '48%',
    aspectRatio: 0.9,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    position: 'relative',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeCheckin: {
    backgroundColor: 'rgba(5, 150, 105, 0.85)',
    borderColor: '#34D399',
  },
  typeCheckout: {
    backgroundColor: 'rgba(217, 119, 6, 0.85)',
    borderColor: '#FCD34D',
  },
  typeBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  zoomHintCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(4, 25, 18, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.10)',
  },
  captionText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 10.5,
    color: '#E2E8F0',
    textTransform: 'capitalize',
  },

  /* Fullscreen Modal */
  fullBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  fullHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  fullTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  fullCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});
