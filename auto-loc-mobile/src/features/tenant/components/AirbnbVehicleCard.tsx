import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Heart,
  Star,
  MapPin,
  Fuel,
  Settings,
  Users,
  Sparkles,
  ChevronRight,
  Navigation,
  ShieldCheck,
} from 'lucide-react-native';
import { VehicleFeedItem } from '../types';
import { theme } from '../../../core/theme';
import { useAppStore } from '../../../core/store/useAppStore';
import { formatConvertedPrice } from '../../../core/utils/currency';

const HERO_HEIGHT = 200;

const DEMO_EXTRA_CAR_PHOTOS = [
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=800&auto=format&fit=crop',
];

export interface AirbnbVehicleCardProps {
  vehicle: VehicleFeedItem & {
    photos?: Array<{ url: string }> | string[];
    prixBarre?: number;
    allowsOutsideDakar?: boolean;
    horsDakar?: boolean;
    isSuperhost?: boolean;
  };
  onPress: (vehicle: VehicleFeedItem) => void;
  onFavoriteToggle?: (vehicleId: string) => void;
  isFavorited?: boolean;
}

export const AirbnbVehicleCard: React.FC<AirbnbVehicleCardProps> = ({
  vehicle,
  onPress,
  onFavoriteToggle,
  isFavorited = false,
}) => {
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const listRef = useRef<FlatList>(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState<number>(
    Dimensions.get('window').width - 32
  );

  const isPremium = Boolean(vehicle.isFeatured || (vehicle.scoreGlobal && vehicle.scoreGlobal > 8));
  const allowsHorsDakar = Boolean(vehicle.allowsOutsideDakar || vehicle.horsDakar);
  const hasDiscount = Boolean(vehicle.prixBarre && vehicle.prixBarre > vehicle.prixParJour);
  const discountPct =
    hasDiscount && vehicle.prixBarre
      ? Math.round(100 - (vehicle.prixParJour / vehicle.prixBarre) * 100)
      : 0;

  const photosList: string[] = React.useMemo(() => {
    let list: string[] = [];
    if (vehicle.photos && Array.isArray(vehicle.photos) && vehicle.photos.length > 0) {
      list = vehicle.photos
        .map((p) => (typeof p === 'string' ? p : p?.url))
        .filter(Boolean) as string[];
    } else if (vehicle.photoUrl) {
      list = [vehicle.photoUrl];
    }

    if (list.length === 0) {
      return ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'];
    }

    return list;
  }, [vehicle.photos, vehicle.photoUrl]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && Math.abs(width - cardWidth) > 2) {
      setCardWidth(width);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width || cardWidth;
    if (viewSize > 0) {
      const index = Math.round(contentOffset / viewSize);
      if (index !== activeImageIndex && index >= 0 && index < photosList.length) {
        setActiveImageIndex(index);
      }
    }
  };

  const formattedPrice = formatConvertedPrice(vehicle.prixParJour, selectedCurrency);
  const formattedOldPrice =
    hasDiscount && vehicle.prixBarre
      ? formatConvertedPrice(vehicle.prixBarre, selectedCurrency)
      : null;
  const hasRating = Boolean(vehicle.note && vehicle.note > 0);
  const hasTotalAvis = Boolean(vehicle.totalAvis && vehicle.totalAvis > 0);

  return (
    <Pressable
      style={({ pressed }) => [styles.cardContainer, pressed && styles.cardPressed]}
      onPress={() => onPress(vehicle)}
    >
      {/* ─── Hero Image Carousel ─── */}
      <View style={styles.imageWrapper} onLayout={handleLayout}>
        <FlatList
          ref={listRef}
          data={photosList}
          horizontal
          pagingEnabled
          snapToInterval={cardWidth}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          bounces={false}
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.imageScroll}
          keyExtractor={(_, idx) => `${vehicle.id}-img-${idx}`}
          getItemLayout={(_, index) => ({
            length: cardWidth,
            offset: cardWidth * index,
            index,
          })}
          renderItem={({ item: imgUri, index: idx }) => (
            <Image
              key={`${vehicle.id}-img-${idx}`}
              source={{ uri: imgUri }}
              style={[styles.cardImage, { width: cardWidth }]}
              contentFit="cover"
              transition={250}
            />
          )}
        />

        {/* Dégradé bas cinématique */}
        <LinearGradient
          colors={['transparent', 'rgba(4, 21, 15, 0.10)', 'rgba(4, 21, 15, 0.40)']}
          locations={[0, 0.5, 1]}
          style={styles.bottomFade}
          pointerEvents="none"
        />

        {/* Dégradé haut pour badges */}
        <LinearGradient
          colors={['rgba(4, 21, 15, 0.45)', 'transparent']}
          style={styles.topFade}
          pointerEvents="none"
        />

        {/* Badges Glassmorphism Supérieurs */}
        <View style={styles.badgesTopContainer}>
          {allowsHorsDakar ? (
            <View style={styles.horsDakarPill}>
              <Navigation size={9} color="#059669" />
              <Text style={styles.horsDakarText}>HORS DAKAR OK</Text>
            </View>
          ) : null}

          {hasDiscount ? (
            <View style={styles.discountPill}>
              <Text style={styles.discountPillText}>-{discountPct}%</Text>
            </View>
          ) : null}
        </View>


        {/* Bouton Favori ❤️ en Verre Flouté */}
        {Boolean(onFavoriteToggle) ? (
          <Pressable
            style={({ pressed }) => [
              styles.favoriteBtn,
              pressed && styles.favoriteBtnPressed,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              if (onFavoriteToggle) onFavoriteToggle(vehicle.id);
            }}
            hitSlop={12}
          >
            <Heart
              size={16}
              color={isFavorited ? '#E11D48' : '#FFFFFF'}
              fill={isFavorited ? '#E11D48' : 'transparent'}
              strokeWidth={2.2}
            />
          </Pressable>
        ) : null}

        {/* Pagination Dots */}
        {photosList.length > 1 ? (
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
        ) : null}
      </View>

      {/* ─── Content Body ─── */}
      <View style={styles.contentBody}>
        {/* Title + Rating */}
        <View style={styles.titleRow}>
          <Text style={styles.titleText} numberOfLines={1}>
            {vehicle.marque} {vehicle.modele}
            {vehicle.annee ? ` (${vehicle.annee})` : ''}
          </Text>

          {hasRating ? (
            <View style={styles.ratingBox}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingVal}>{vehicle.note.toFixed(1)}</Text>
            </View>
          ) : (
            <View style={styles.newBadge}>
              <Sparkles size={9} color="#059669" />
              <Text style={styles.newBadgeText}>Nouveau</Text>
            </View>
          )}
        </View>

        {/* Location + Reviews */}
        <View style={styles.locationRow}>
          <MapPin size={12} color="#059669" strokeWidth={2.2} />
          <Text style={styles.locationText} numberOfLines={1}>
            {vehicle.ville || 'Dakar'}
          </Text>
          {hasRating && hasTotalAvis ? (
            <Text style={styles.reviewCount}>· {vehicle.totalAvis} avis</Text>
          ) : null}
          {vehicle.isSuperhost && (
            <View style={styles.superhostTag}>
              <ShieldCheck size={10} color="#059669" />
              <Text style={styles.superhostTagText}>Vérifié</Text>
            </View>
          )}
        </View>


        {/* Spec Chips */}
        <View style={styles.specsRow}>
          {Boolean(vehicle.transmission) ? (
            <View style={styles.specChip}>
              <Settings size={10} color="#64748B" />
              <Text style={styles.specText}>{vehicle.transmission}</Text>
            </View>
          ) : null}
          {Boolean(vehicle.carburant) ? (
            <View style={styles.specChip}>
              <Fuel size={10} color="#64748B" />
              <Text style={styles.specText}>{vehicle.carburant}</Text>
            </View>
          ) : null}
          {Boolean(vehicle.nombrePlaces) ? (
            <View style={styles.specChip}>
              <Users size={10} color="#64748B" />
              <Text style={styles.specText}>{vehicle.nombrePlaces} pl.</Text>
            </View>
          ) : null}
        </View>

        {/* ─── Price Block — Forest gradient ─── */}
        <LinearGradient
          colors={[theme.colors.brand.dark, '#06281C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.priceBlock}
        >
          <View style={styles.priceLine}>
            <Text style={styles.priceValue}>{formattedPrice}</Text>
            <Text style={styles.pricePeriod}>/ jour</Text>
            {Boolean(formattedOldPrice) ? (
              <Text style={styles.oldPrice}>{formattedOldPrice}</Text>
            ) : null}
          </View>

          <View style={styles.priceArrow}>
            <ChevronRight size={15} color={theme.colors.emerald[400]} strokeWidth={2.5} />
          </View>
        </LinearGradient>

      </View>
    </Pressable>
  );
};

/* ─────────────────────────────────────────────
   Styles — Premium Automotive Aesthetic (No Emojis)
   ───────────────────────────────────────────── */

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#E4EBDB',
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.10,
        shadowRadius: 28,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },

  imageWrapper: {
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: '#04150F',
    position: 'relative',
    overflow: 'hidden',
  },
  imageScroll: {
    width: '100%',
    height: '100%',
  },
  cardImage: {
    height: HERO_HEIGHT,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
  },

  badgesTopContainer: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  premiumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 25, 18, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(241, 223, 182, 0.50)',
  },
  premiumPillText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.gold[200],
    fontSize: 9,
    letterSpacing: 1.3,
  },
  horsDakarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.emerald[50],
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.emerald[200],
  },
  horsDakarText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.emerald[600],
    fontSize: 9,
    letterSpacing: 0.5,
  },
  discountPill: {
    backgroundColor: theme.colors.emerald[600],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  discountPillText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    fontSize: 10,
    letterSpacing: 0.3,
  },

  favoriteBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(4, 25, 18, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  favoriteBtnPressed: {
    transform: [{ scale: 0.9 }],
  },

  paginationDots: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(4, 25, 18, 0.40)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  activeDot: {
    width: 18,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.emerald[400],
  },

  contentBody: {
    backgroundColor: theme.colors.surface.card,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 6,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 19,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: 10,
    letterSpacing: -0.3,
  },

  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  ratingVal: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#92400E',
  },

  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.emerald[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.emerald[200],
  },
  newBadgeText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.emerald[600],
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12.5,
    color: theme.colors.text.secondary,
  },
  reviewCount: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12.5,
    color: theme.colors.text.secondary,
  },
  superhostTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: theme.colors.emerald[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  superhostTagText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: theme.colors.emerald[600],
  },

  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#475569',
  },

  priceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.20)',
  },
  priceLeft: {
    gap: 2,
  },
  priceLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceValue: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 24,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  oldPrice: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: 'rgba(168, 213, 193, 0.5)',
    textDecorationLine: 'line-through',
  },
  pricePeriod: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: 'rgba(168, 213, 193, 0.70)',
  },
  priceArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});