import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { VehicleFeedItem } from '../types';
import { VehicleFeedCard } from './VehicleFeedCard';
import { theme } from '../../../core/theme';

interface FeedSectionProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  vehicles: VehicleFeedItem[];
  onVehiclePress: (vehicle: VehicleFeedItem) => void;
  onSeeAllPress?: () => void;
  onFavoriteToggle?: (vehicleId: string) => void;
  favoritesMap?: Record<string, boolean>;
}

export const FeedSection: React.FC<FeedSectionProps> = ({
  title,
  subtitle,
  icon,
  vehicles,
  onVehiclePress,
  onSeeAllPress,
  onFavoriteToggle,
  favoritesMap = {},
}) => {
  if (!vehicles || vehicles.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      {/* Header de Section — Premium */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>{icon}</View>
          <View style={styles.titleColumn}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        {Boolean(onSeeAllPress) ? (
          <Pressable
            style={({ pressed }) => [
              styles.seeAllButton,
              pressed ? styles.seeAllPressed : null,
            ]}
            onPress={onSeeAllPress}
            hitSlop={8}
          >
            <Text style={styles.seeAllText}>Voir tout</Text>
            <ChevronRight size={14} color="#059669" strokeWidth={2.5} />
          </Pressable>
        ) : null}
      </View>

      {/* Scroll Horizontal avec Snap */}
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={306} // 290px width + 16px marginRight
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <VehicleFeedCard
            vehicle={item}
            onPress={onVehiclePress}
            onFavoriteToggle={onFavoriteToggle}
            isFavorited={!!favoritesMap[item.id]}
          />
        )}
      />
    </View>
  );
};

/* ─────────────────────────────────────────────
   Styles — Premium Feed Section
   ───────────────────────────────────────────── */

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.colors.brand.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.brand.border,
  },
  titleColumn: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: theme.colors.text.primary,
    fontSize: 19,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.tertiary,
    fontSize: 12,
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.brand.subtle,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.brand.border,
    gap: 2,
  },
  seeAllPressed: {
    opacity: 0.6,
  },
  seeAllText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.brand.action,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
});
