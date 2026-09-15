import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { CurrencyCode, formatDirectPrice } from '../../../core/utils/currency';

interface VehicleStickyBookingBarProps {
  tenantPricePerDay: number;
  selectedCurrency: CurrencyCode;
  onBookPress: () => void;
}

const COLORS = {
  accent: '#16A34A',
  accentDeep: '#0F7A38',
  ink: '#041912',
  inkMuted: '#5F6B59',
  border: '#E4EBDB',
};

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
      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>À partir de</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceValue} numberOfLines={1}>
            {formattedPrice}
          </Text>
          <Text style={styles.pricePerDay}>/jour</Text>
        </View>
        <Text style={styles.priceSubtext} numberOfLines={1}>
          Frais TTC inclus
        </Text>
      </View>

      <Pressable
        onPressIn={() => animateTo(0.96)}
        onPressOut={() => animateTo(1)}
        onPress={onBookPress}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bookGradient}
          >
            <Text style={styles.bookButtonText}>Réserver</Text>
            <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.ink,
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  priceContainer: {
    flex: 1,
    marginRight: 16,
  },
  priceLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceValue: {
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: -0.4,
  },
  pricePerDay: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.inkMuted,
  },
  priceSubtext: {
    fontSize: 11,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  bookGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: COLORS.accentDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});