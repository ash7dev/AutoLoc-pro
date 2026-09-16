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
      {/* Header de Section */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>{icon}</View>
          <View style={styles.titleColumn}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        {onSeeAllPress && (
          <Pressable
            style={({ pressed }) => [
              styles.seeAllButton,
              pressed && styles.seeAllPressed,
            ]}
            onPress={onSeeAllPress}
            hitSlop={8}
          >
            <Text style={styles.seeAllText}>Voir tout</Text>
            <ChevronRight size={14} color="#059669" />
          </Pressable>
        )}
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

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  titleColumn: {
    flex: 1,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 8,
  },
  seeAllPressed: {
    opacity: 0.6,
  },
  seeAllText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 2,
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
});
