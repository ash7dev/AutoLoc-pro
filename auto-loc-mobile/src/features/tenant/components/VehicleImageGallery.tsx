import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  Modal,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Car,
  Sparkles,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 330;
const AUTO_PLAY_INTERVAL = 4000; // 4 secondes par slide

export interface GalleryPhoto {
  id?: string;
  url: string;
  estPrincipale?: boolean;
  position?: number;
}

interface VehicleImageGalleryProps {
  photos: GalleryPhoto[];
  vehicleTitle?: string;
  autoPlayEnabled?: boolean;
}

export const VehicleImageGallery: React.FC<VehicleImageGalleryProps> = ({
  photos,
  vehicleTitle = 'Galerie photo',
  autoPlayEnabled = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalActiveIndex, setModalActiveIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const carouselRef = useRef<ScrollView>(null);
  const modalFlatListRef = useRef<FlatList>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const photoList = photos && photos.length > 0
    ? photos
    : [{ id: 'fallback', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop' }];

  // 1. Défilement Automatique (Auto-Play)
  const startAutoPlay = useCallback(() => {
    if (!autoPlayEnabled || photoList.length <= 1 || isUserInteracting || isModalVisible) return;
    
    stopAutoPlay();
    autoPlayTimerRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % photoList.length;
        carouselRef.current?.scrollTo({
          x: nextIndex * SCREEN_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, AUTO_PLAY_INTERVAL);
  }, [autoPlayEnabled, photoList.length, isUserInteracting, isModalVisible]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay]);

  // Gestion du scroll manuel du carrousel principal
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (index >= 0 && index < photoList.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleTouchStart = () => {
    setIsUserInteracting(true);
    stopAutoPlay();
  };

  const handleTouchEnd = () => {
    // Relance l'autoplay après 5s d'inactivité
    setTimeout(() => {
      setIsUserInteracting(false);
    }, 5000);
  };

  // Ouverture du Lightbox Plein Écran
  const openModal = (index: number) => {
    stopAutoPlay();
    setModalActiveIndex(index);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    startAutoPlay();
  };

  // Navigation plein écran dans le modal
  const handleModalScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (index >= 0 && index < photoList.length && index !== modalActiveIndex) {
      setModalActiveIndex(index);
    }
  };

  const jumpToModalPhoto = (index: number) => {
    setModalActiveIndex(index);
    modalFlatListRef.current?.scrollToIndex({ index, animated: true });
  };

  return (
    <View style={styles.container}>
      {/* 2. Carrousel Principal HD */}
      <ScrollView
        ref={carouselRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onScrollBeginDrag={handleTouchStart}
        onScrollEndDrag={handleTouchEnd}
      >
        {photoList.map((photo, index) => (
          <Pressable
            key={photo.id || index.toString()}
            style={styles.slideContainer}
            onPress={() => openModal(index)}
          >
            <Image
              source={{ uri: photo.url }}
              style={styles.slideImage}
              contentFit="cover"
              transition={300}
            />

            {/* Gradient Ombragé Luxueux Top/Bottom Émeraude */}
            <LinearGradient
              colors={['rgba(4, 21, 15, 0.55)', 'transparent', 'rgba(4, 21, 15, 0.85)']}
              locations={[0, 0.5, 1]}
              style={styles.gradientOverlay}
            />

          </Pressable>
        ))}
      </ScrollView>

      {/* 3. Overlay Contrôles Bas (Pill Dots + Compteur Lightbox) */}
      <View style={styles.carouselFooterOverlay} pointerEvents="box-none">
        {/* Indicators Dots */}
        <View style={styles.dotsContainer}>
          {photoList.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <View
                key={idx}
                style={[
                  styles.dotPill,
                  isActive ? styles.dotPillActive : styles.dotPillInactive,
                ]}
              />
            );
          })}
        </View>

        {/* Bouton Agrandir / Plein Écran */}
        <Pressable
          style={styles.expandPill}
          onPress={() => openModal(activeIndex)}
          hitSlop={8}
        >
          <Maximize2 size={13} color="#FFFFFF" />
          <Text style={styles.expandPillText}>
            {activeIndex + 1} / {photoList.length}
          </Text>
        </Pressable>
      </View>

      {/* 4. MODAL GALERIE PLEIN ÉCRAN (LIGHTBOX) */}
      <Modal
        visible={isModalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalRoot}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />

          {/* Lightbox Header Bar */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitleBox}>
              <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                {vehicleTitle}
              </Text>
              <Text style={styles.modalHeaderSub}>
                Photo {modalActiveIndex + 1} sur {photoList.length}
              </Text>
            </View>

            <Pressable style={styles.modalCloseButton} onPress={closeModal} hitSlop={12}>
              <X size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Main Fullscreen Image Swiper */}
          <View style={styles.modalMainContainer}>
            <FlatList
              ref={modalFlatListRef}
              data={photoList}
              horizontal
              pagingEnabled
              initialScrollIndex={modalActiveIndex}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              showsHorizontalScrollIndicator={false}
              onScroll={handleModalScroll}
              scrollEventThrottle={16}
              keyExtractor={(item, index) => item.id || index.toString()}
              renderItem={({ item }) => (
                <View style={styles.modalImageSlide}>
                  <Image
                    source={{ uri: item.url }}
                    style={styles.modalImage}
                    contentFit="contain"
                    transition={200}
                  />
                </View>
              )}
            />
          </View>

          {/* Bottom Thumbnail Strip Bar */}
          {photoList.length > 1 && (
            <View style={styles.thumbnailStripContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailScrollContent}
              >
                {photoList.map((item, index) => {
                  const isSelected = index === modalActiveIndex;
                  return (
                    <Pressable
                      key={item.id || index.toString()}
                      style={[
                        styles.thumbnailItem,
                        isSelected && styles.thumbnailItemSelected,
                      ]}
                      onPress={() => jumpToModalPhoto(index)}
                    >
                      <Image
                        source={{ uri: item.url }}
                        style={styles.thumbnailImage}
                        contentFit="cover"
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
  },
  featuredBadge: {
    position: 'absolute',
    top: 75,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  featuredText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  carouselFooterOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(4, 21, 15, 0.70)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.30)',
  },
  dotPill: {
    height: 6,
    borderRadius: 3,
  },
  dotPillActive: {
    width: 20,
    backgroundColor: '#4ADE80',
  },
  dotPillInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  expandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(4, 21, 15, 0.70)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.30)',
  },
  expandPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Modal Fullscreen Lightbox Styles
  modalRoot: {
    flex: 1,
    backgroundColor: '#050811',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalHeaderTitleBox: {
    flex: 1,
    marginRight: 16,
  },
  modalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalHeaderSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalMainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  thumbnailStripContainer: {
    height: 76,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
  },
  thumbnailScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  thumbnailItem: {
    width: 60,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.5,
  },
  thumbnailItemSelected: {
    borderColor: '#6366F1',
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});
