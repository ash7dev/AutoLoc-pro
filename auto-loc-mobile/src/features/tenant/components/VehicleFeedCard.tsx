import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
  Animated,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  Heart,
  MapPin,
  Star,
} from 'lucide-react-native';
import { VehicleFeedItem } from '../types';
import { useAppStore } from '../../../core/store/useAppStore';
import { formatConvertedPrice } from '../../../core/utils/currency';
import { theme } from '../../../core/theme';

interface VehicleFeedCardProps {
  vehicle: VehicleFeedItem;
  onPress: (vehicle: VehicleFeedItem) => void;
  onFavoriteToggle?: (vehicleId: string) => void;
  isFavorited?: boolean;
}


const EXTRA_CAR_PHOTOS = [
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=800&auto=format&fit=crop',
];

const CARD_WIDTH = 290;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const VehicleFeedCard: React.FC<VehicleFeedCardProps> = ({
  vehicle,
  onPress,
  onFavoriteToggle,
  isFavorited = false,
}) => {
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const isPremium = vehicle.isFeatured || vehicle.scoreGlobal > 8;

  // ── Animated spring scale ──
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const favoriteAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.965,
      friction: 9,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleFavoritePress = useCallback(() => {
    if (!onFavoriteToggle) return;
    // Bounce animation on favorite
    Animated.sequence([
      Animated.spring(favoriteAnim, {
        toValue: 1.3,
        friction: 3,
        tension: 150,
        useNativeDriver: true,
      }),
      Animated.spring(favoriteAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
    onFavoriteToggle(vehicle.id);
  }, [onFavoriteToggle, vehicle.id, favoriteAnim]);

  // ── Photo carousel ──
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const photosList: string[] = React.useMemo(() => {
    let list: string[] = [];
    if (vehicle.photoUrl) {
      list = [vehicle.photoUrl];
    }
    if (list.length === 0) {
      return EXTRA_CAR_PHOTOS;
    }
    // Garantit au moins 3 photos pour un carousel fluide
    if (list.length === 1) {
      const charCode = vehicle.id ? vehicle.id.charCodeAt(0) : 0;
      const extra1 = EXTRA_CAR_PHOTOS[charCode % EXTRA_CAR_PHOTOS.length];
      const extra2 = EXTRA_CAR_PHOTOS[(charCode + 1) % EXTRA_CAR_PHOTOS.length];
      return [list[0], extra1, extra2];
    }
    return list;
  }, [vehicle.photoUrl, vehicle.id]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / CARD_WIDTH);
      if (index !== activeImageIndex && index >= 0 && index < photosList.length) {
        setActiveImageIndex(index);
      }
    },
    [activeImageIndex, photosList.length]
  );

  // Price
  const formattedPrice = formatConvertedPrice(vehicle.prixParJour, selectedCurrency);

  return (
    <AnimatedPressable
      style={[
        styles.cardContainer,
        isPremium && styles.cardContainerPremium,
        { transform: [{ scale: scaleAnim }] },
      ]}
      onPress={() => onPress(vehicle)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {/* ── Image Carousel ── */}
      <View style={styles.imageWrapper}>
        <FlatList
          data={photosList}
          horizontal
          pagingEnabled
          snapToInterval={CARD_WIDTH}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          bounces={false}
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.imageScroll}
          keyExtractor={(_, idx) => `${vehicle.id}-feed-img-${idx}`}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH,
            offset: CARD_WIDTH * index,
            index,
          })}
          renderItem={({ item: imgUri, index: idx }) => (
            <Image
              key={`${vehicle.id}-feed-img-${idx}`}
              source={{ uri: imgUri }}
              style={styles.carouselImage}
              contentFit="cover"
              transition={250}
            />
          )}
        />

        {/* Gradient de protection — raffiné, ne noie plus la photo */}
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.08)',
            'transparent',
            'transparent',
            'rgba(0, 0, 0, 0.25)',
            'rgba(0, 0, 0, 0.88)',
          ]}
          locations={[0, 0.15, 0.45, 0.72, 1]}
          style={styles.gradientOverlay}
          pointerEvents="none"
        />

        {/* Top Header Overlay */}
        <View style={styles.topHeader}>
          {isPremium ? (
            <View style={styles.premiumBadge}>
              <Sparkles size={11} color="#FBBF24" style={styles.badgeIcon} />
              <Text style={styles.premiumText}>PREMIUM</Text>
            </View>
          ) : (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{vehicle.type || 'LUXE'}</Text>
            </View>
          )}

          {/* Bouton Favoris — Glassmorphism pur */}
          {onFavoriteToggle && (
            <Pressable
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleFavoritePress();
              }}
              hitSlop={10}
            >
              <Animated.View style={{ transform: [{ scale: favoriteAnim }] }}>
                <Heart
                  size={17}
                  color={isFavorited ? '#EF4444' : '#FFFFFF'}
                  fill={isFavorited ? '#EF4444' : 'transparent'}
                  strokeWidth={2.2}
                />
              </Animated.View>
            </Pressable>
          )}
        </View>

        {/* Pagination Dots */}
        {photosList.length > 1 && (
          <View style={styles.paginationDots}>
            {photosList.slice(0, 5).map((_, idx) => (
              <View
                key={`dot-${idx}`}
                style={[
                  styles.dot,
                  activeImageIndex === idx && styles.activeDot,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* ── Bottom Content Overlay ── */}
      <View style={styles.bottomContent}>
        {/* Titre — Fraunces Display Font */}
        <Text style={styles.titleText} numberOfLines={1}>
          {vehicle.marque} {vehicle.modele}
        </Text>

        {/* Ligne Sub-info : Ville & Note */}
        <View style={styles.subInfoRow}>
          <View style={styles.infoPill}>
            <MapPin size={12} color="#D1D5DB" strokeWidth={2.2} />
            <Text style={styles.subInfoText}>{vehicle.ville || 'Dakar'}</Text>
          </View>

          <View style={styles.dotSeparatorWrap}>
            <View style={styles.dotSeparator} />
          </View>

          <View style={styles.infoPill}>
            <Star size={12} color="#FBBF24" fill="#FBBF24" />
            <Text style={styles.ratingText}>
              {vehicle.note > 0 ? vehicle.note.toFixed(1) : '5.0'}
            </Text>
            {vehicle.totalAvis > 0 && (
              <Text style={styles.reviewCountText}>({vehicle.totalAvis})</Text>
            )}
          </View>
        </View>

        {/* Specs — Ligne compacte inline */}
        <Text style={styles.specsLine} numberOfLines={1}>
          {[vehicle.transmission, vehicle.carburant, vehicle.nombrePlaces ? `${vehicle.nombrePlaces} places` : null]
            .filter(Boolean)
            .join('  ·  ')}
        </Text>

        {/* Prix — Bannière de conversion premium */}
        <View style={styles.priceBanner}>
          <View style={styles.priceAccent} />
          <View style={styles.priceContent}>
            <Text style={styles.priceMain}>{formattedPrice}</Text>
            <Text style={styles.pricePeriod}>/ jour</Text>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  // ── Card Container ──
  cardContainer: {
    width: CARD_WIDTH,
    height: 395,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0B1120',
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardContainerPremium: {
    ...Platform.select({
      ios: {
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  // ── Image Carousel ──
  imageWrapper: {
    width: CARD_WIDTH,
    height: '100%' as any,
    position: 'relative',
  },
  imageScroll: {
    width: CARD_WIDTH,
    height: '100%',
  },
  carouselImage: {
    width: CARD_WIDTH,
    height: 395,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // ── Top Header ──
  topHeader: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },

  // Badge Premium — Gold Shimmer
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  badgeIcon: {
    marginRight: 5,
  },
  premiumText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FBBF24',
    fontSize: 10,
    letterSpacing: 1.5,
  },

  // Badge Type — Glassmorphism neutre
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  typeText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#F9FAFB',
    fontSize: 10,
    letterSpacing: 1,
  },

  // Bouton Favoris — Glassmorphism pur
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.20,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // Pagination Dots
  paginationDots: {
    position: 'absolute',
    bottom: 130,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },

  // ── Bottom Content ──
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 8,
    zIndex: 10,
  },

  // Titre — Fraunces Display
  titleText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#FFFFFF',
    fontSize: 19,
    letterSpacing: -0.4,
    marginBottom: 6,
  },

  // Sub-info Row
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subInfoText: {
    fontFamily: theme.typography.fontFamily.medium,
    color: '#D1D5DB',
    fontSize: 12,
    marginLeft: 4,
  },
  dotSeparatorWrap: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  ratingText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  reviewCountText: {
    fontFamily: theme.typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 11,
    marginLeft: 2,
  },

  // Specs — Ligne compacte
  specsLine: {
    fontFamily: theme.typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 12,
    letterSpacing: 0.2,
    marginBottom: 14,
  },

  // Prix — Bannière de conversion
  priceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  priceAccent: {
    width: 3,
    height: 22,
    borderRadius: 2,
    backgroundColor: '#34D399',
    marginRight: 10,
  },
  priceContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceMain: {
    fontFamily: theme.typography.fontFamily.extraBold,
    color: '#FFFFFF',
    fontSize: 20,
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  pricePeriod: {
    fontFamily: theme.typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 13,
    marginLeft: 4,
  },
});
