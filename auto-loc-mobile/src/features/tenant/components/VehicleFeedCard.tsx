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
  Settings,
  Fuel,
  Users,
  Navigation,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import { VehicleFeedItem } from '../types';
import { useAppStore } from '../../../core/store/useAppStore';
import { formatConvertedPrice } from '../../../core/utils/currency';
import { theme } from '../../../core/theme';

interface VehicleFeedCardProps {
  vehicle: VehicleFeedItem & {
    allowsOutsideDakar?: boolean;
    horsDakar?: boolean;
    isSuperhost?: boolean;
  };
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
const IMAGE_HEIGHT = 195;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const VehicleFeedCard: React.FC<VehicleFeedCardProps> = ({
  vehicle,
  onPress,
  onFavoriteToggle,
  isFavorited = false,
}) => {
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const isPremium = Boolean(vehicle.isFeatured || (vehicle.scoreGlobal && vehicle.scoreGlobal > 8));
  const allowsHorsDakar = Boolean(vehicle.allowsOutsideDakar || vehicle.horsDakar);

  // ── Animation ressort sur appui ──
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const favoriteAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 8,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleFavoritePress = useCallback(() => {
    if (!onFavoriteToggle) return;
    Animated.sequence([
      Animated.spring(favoriteAnim, {
        toValue: 1.35,
        friction: 3,
        tension: 160,
        useNativeDriver: true,
      }),
      Animated.spring(favoriteAnim, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
    onFavoriteToggle(vehicle.id);
  }, [onFavoriteToggle, vehicle.id, favoriteAnim]);

  // ── Carrousel photos ──
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const photosList: string[] = React.useMemo(() => {
    let list: string[] = [];
    if (vehicle.photoUrl) {
      list = [vehicle.photoUrl];
    }
    if (list.length === 0) {
      return EXTRA_CAR_PHOTOS;
    }
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

  const formattedPrice = formatConvertedPrice(vehicle.prixParJour, selectedCurrency);
  const hasRating = Boolean(vehicle.note && vehicle.note > 0);

  return (
    <AnimatedPressable
      style={[
        styles.cardContainer,
        { transform: [{ scale: scaleAnim }] },
      ]}
      onPress={() => onPress(vehicle)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {/* ─── Visuel principal avec Carrousel ─── */}
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

        {/* Dégradé haut translucide pour badges */}
        <LinearGradient
          colors={['rgba(4, 21, 15, 0.45)', 'transparent']}
          style={styles.topFade}
          pointerEvents="none"
        />

        {/* Dégradé bas cinématique */}
        <LinearGradient
          colors={['transparent', 'rgba(4, 21, 15, 0.35)']}
          style={styles.bottomFade}
          pointerEvents="none"
        />

        {/* Badges Glassmorphism Supérieurs */}
        {allowsHorsDakar ? (
          <View style={styles.badgesTopContainer}>
            <View style={styles.horsDakarBadge}>
              <Navigation size={9} color="#059669" />
              <Text style={styles.horsDakarText}>HORS DAKAR OK</Text>
            </View>
          </View>
        ) : null}


        {/* Bouton Favori en Verre Flouté */}
        {Boolean(onFavoriteToggle) ? (
          <Pressable
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleFavoritePress();
            }}
            hitSlop={12}
          >
            <Animated.View style={{ transform: [{ scale: favoriteAnim }] }}>
              <Heart
                size={16}
                color={isFavorited ? '#E11D48' : '#FFFFFF'}
                fill={isFavorited ? '#E11D48' : 'transparent'}
                strokeWidth={2.2}
              />
            </Animated.View>
          </Pressable>
        ) : null}

        {/* Indication des Points de Pagination */}
        {photosList.length > 1 ? (
          <View style={styles.paginationDots}>
            {photosList.slice(0, 5).map((_, idx) => (
              <View
                key={`dot-${idx}`}
                style={[
                  styles.dot,
                  activeImageIndex === idx ? styles.activeDot : null,
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>

      {/* ─── Contenu Texte & Caractéristiques ─── */}
      <View style={styles.contentBody}>
        {/* Ligne Titre & Évaluation */}
        <View style={styles.titleRow}>
          <Text style={styles.titleText} numberOfLines={1}>
            {vehicle.marque} {vehicle.modele}
          </Text>
          {hasRating ? (
            <View style={styles.ratingBox}>
              <Star size={11} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingVal}>{vehicle.note.toFixed(1)}</Text>
            </View>
          ) : (
            <View style={styles.newBadge}>
              <Sparkles size={9} color="#059669" />
              <Text style={styles.newBadgeText}>Nouveau</Text>
            </View>
          )}
        </View>

        {/* Localisation & Garantie */}
        <View style={styles.locationRow}>
          <MapPin size={11} color="#059669" strokeWidth={2.2} />
          <Text style={styles.locationText} numberOfLines={1}>
            {vehicle.ville || 'Dakar'}
          </Text>
          {vehicle.isSuperhost && (
            <View style={styles.superhostTag}>
              <ShieldCheck size={10} color="#059669" />
              <Text style={styles.superhostTagText}>Vérifié</Text>
            </View>
          )}
        </View>


        {/* Puces de Spécifications Vectorielles */}
        <View style={styles.specsRow}>
          {Boolean(vehicle.transmission) ? (
            <View style={styles.specChip}>
              <Settings size={10} color="#64748B" />
              <Text style={styles.specText} numberOfLines={1}>{vehicle.transmission}</Text>
            </View>
          ) : null}
          {Boolean(vehicle.carburant) ? (
            <View style={styles.specChip}>
              <Fuel size={10} color="#64748B" />
              <Text style={styles.specText} numberOfLines={1}>{vehicle.carburant}</Text>
            </View>
          ) : null}
          {Boolean(vehicle.nombrePlaces) ? (
            <View style={styles.specChip}>
              <Users size={10} color="#64748B" />
              <Text style={styles.specText} numberOfLines={1}>{vehicle.nombrePlaces} pl.</Text>
            </View>
          ) : null}
        </View>


        {/* ─── Bloc Prix Vert Nuit Forêt ─── */}
        <LinearGradient
          colors={['#041912', '#06281C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.priceBlock}
        >
          <View style={styles.priceTextGroup}>
            <Text style={styles.priceValue}>{formattedPrice}</Text>
            <Text style={styles.pricePeriod}>/ jour</Text>
          </View>

          <View style={styles.priceArrowCircle}>
            <ChevronRight size={13} color="#4ADE80" strokeWidth={2.5} />
          </View>
        </LinearGradient>
      </View>
    </AnimatedPressable>
  );
};

/* ─────────────────────────────────────────────
   Styles — Premium Vehicle Feed Card (No Emojis)
   ───────────────────────────────────────────── */

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: '#E4EBDB',
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.10,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  /* ── Zone Image ── */
  imageWrapper: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: '#04150F',
    position: 'relative',
    overflow: 'hidden',
  },
  imageScroll: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
  },
  carouselImage: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
  },

  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 54,
  },

  /* Badges Supérieurs */
  badgesTopContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(4, 25, 18, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.40)',
  },
  premiumText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#F5C451',
    fontSize: 8.5,
    letterSpacing: 1.2,
  },
  horsDakarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  horsDakarText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#059669',
    fontSize: 8.5,
    letterSpacing: 0.5,
  },

  /* Favori */
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(4, 25, 18, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  /* Pagination Dots */
  paginationDots: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(4, 25, 18, 0.40)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  activeDot: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4ADE80',
  },

  /* ── Zone Contenu ── */
  contentBody: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 13,
    gap: 6,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16.5,
    color: '#041912',
    flex: 1,
    marginRight: 6,
    letterSpacing: -0.3,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  ratingVal: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11.5,
    color: '#92400E',
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  newBadgeText: {
    fontSize: 9.5,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#059669',
  },

  /* Localisation */
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#64748B',
  },
  superhostTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 4,
  },
  superhostTagText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
    color: '#059669',
  },

  /* Spécifications */
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specText: {
    fontSize: 9.5,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#475569',
  },


  /* Bloc Prix */
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.20)',
  },
  priceTextGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceValue: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 18.5,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  pricePeriod: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: 'rgba(168, 213, 193, 0.70)',
  },
  priceArrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
