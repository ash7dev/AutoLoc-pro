import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import {
  Layers,
  Sparkles,
  MapPin,
  Star,
  Tag,
  Car,
  Compass,
  CarFront,
} from 'lucide-react-native';

export type CategoryFilterKey =
  | 'ALL'
  | 'PREMIUM'
  | 'DAKAR'
  | 'TOP_RATED'
  | 'ECONOMIC'
  | 'SUV'
  | 'FOUR_X_FOUR'
  | 'BERLINE';

export interface CategoryChipItem {
  key: CategoryFilterKey;
  label: string;
  icon: React.ReactNode;
}

interface CategoryChipsBarProps {
  selectedCategory: CategoryFilterKey;
  onSelectCategory: (category: CategoryFilterKey) => void;
}

export const CategoryChipsBar: React.FC<CategoryChipsBarProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories: CategoryChipItem[] = [
    {
      key: 'ALL',
      label: 'Tous',
      icon: <Layers size={14} color={selectedCategory === 'ALL' ? '#34D399' : '#64748B'} />,
    },
    {
      key: 'PREMIUM',
      label: 'Luxe & Premium',
      icon: <Sparkles size={14} color={selectedCategory === 'PREMIUM' ? '#F59E0B' : '#64748B'} />,
    },
    {
      key: 'DAKAR',
      label: 'Dakar',
      icon: <MapPin size={14} color={selectedCategory === 'DAKAR' ? '#34D399' : '#64748B'} />,
    },
    {
      key: 'TOP_RATED',
      label: 'Mieux Notés',
      icon: <Star size={14} color={selectedCategory === 'TOP_RATED' ? '#F59E0B' : '#64748B'} />,
    },
    {
      key: 'ECONOMIC',
      label: 'Bons Plans',
      icon: <Tag size={14} color={selectedCategory === 'ECONOMIC' ? '#34D399' : '#64748B'} />,
    },
    {
      key: 'SUV',
      label: 'SUV',
      icon: <Car size={14} color={selectedCategory === 'SUV' ? '#34D399' : '#64748B'} />,
    },
    {
      key: 'FOUR_X_FOUR',
      label: '4×4 Tout-Terrain',
      icon: <Compass size={14} color={selectedCategory === 'FOUR_X_FOUR' ? '#34D399' : '#64748B'} />,
    },
    {
      key: 'BERLINE',
      label: 'Berlines',
      icon: <CarFront size={14} color={selectedCategory === 'BERLINE' ? '#34D399' : '#64748B'} />,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <Pressable
              key={cat.key}
              style={({ pressed }) => [
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
                pressed && styles.chipPressed,
              ]}
              onPress={() => onSelectCategory(cat.key)}
            >
              {cat.icon}
              <Text
                style={[
                  styles.chipLabel,
                  isSelected ? styles.chipLabelSelected : styles.chipLabelUnselected,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: '#072A20', // Forest Night Surface
    borderWidth: 1,
    borderColor: '#10B981',
    ...Platform.select({
      ios: {
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  chipUnselected: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
  chipLabelUnselected: {
    color: '#334155',
  },
});
