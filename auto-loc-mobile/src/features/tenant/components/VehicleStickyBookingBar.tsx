import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { CurrencyCode, formatDirectPrice } from '../../../core/utils/currency';
import { theme } from '../../../core/theme';

interface VehicleStickyBookingBarProps {
  tenantPricePerDay: number;
  selectedCurrency: CurrencyCode;
  onBookPress: () => void;
}

export const VehicleStickyBookingBar: React.FC<VehicleStickyBookingBarProps> = ({
  tenantPricePerDay,
  selectedCurrency,
  onBookPress,
}) => {
  const formattedPrice = formatDirectPrice(tenantPricePerDay, selectedCurrency);
  const scale = React.useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <View style={styles.bottomBarContainer}>
      {/* Zone d'affichage du prix (Anti-chevauchement & Typographie Tabulaire Premium) */}
      <View style={styles.priceContainer}>
        <View style={styles.ttcBadge}>
          <Text style={styles.priceLabel}>À PARTIR DE</Text>
        </View>
        <View style={styles.priceRow}>
          <Text
            style={styles.priceValue}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.70}
          >
            {formattedPrice}
          </Text>
          <Text style={styles.pricePerDay}>/ jour</Text>
        </View>
        <Text style={styles.priceSubtext} numberOfLines={1}>
          Frais & assurances TTC inclus
        </Text>
      </View>

      {/* Bouton de réservation (Dark Auth Button) */}
      <Pressable
        onPressIn={() => animateTo(0.96)}
        onPressOut={() => animateTo(1)}
        onPress={onBookPress}
        style={styles.buttonWrapper}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <View style={styles.bookButtonDark}>
            <Text style={styles.bookButtonText}>Réserver</Text>
            <View style={styles.emeraldArrowCircle}>
              <ArrowRight size={13} color="#4ADE80" strokeWidth={2.5} />
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#04150F',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.30)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  priceContainer: {
    flex: 1,
    marginRight: 6,
    justifyContent: 'center',
  },
  ttcBadge: {
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  priceLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#4ADE80',
    letterSpacing: 0.8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
    overflow: 'hidden',
  },
  priceValue: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
    flexShrink: 1,
  },
  pricePerDay: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: 'rgba(168, 213, 193, 0.70)',
    marginLeft: 4,
    flexShrink: 0,
  },
  priceSubtext: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 2,
  },
  buttonWrapper: {
    flexShrink: 0,
  },
  bookButtonDark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 22,
    backgroundColor: '#059669',
    borderWidth: 1,
    borderColor: '#4ADE80',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  bookButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    fontSize: 14.5,
    letterSpacing: 0.2,
  },
  emeraldArrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(4, 25, 18, 0.60)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.50)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});