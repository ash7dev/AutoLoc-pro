import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { theme } from '../../../core/theme';

export interface WhereToSearchTriggerProps {
  onPress: () => void;
  selectedZone?: string;
  selectedType?: string;
  selectedDatesSummary?: string;
}

export const WhereToSearchTrigger: React.FC<WhereToSearchTriggerProps> = ({
  onPress,
  selectedZone,
  selectedType,
  selectedDatesSummary,
}) => {
  const displayTitle = selectedZone ? selectedZone : 'Où & quand louer ?';
  
  const displaySubtitle = [
    selectedType ? selectedType : null,
    selectedDatesSummary ? selectedDatesSummary : 'Destination · Dates · Catégories',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Badge Icône Recherche Émeraude */}
      <View style={styles.searchBadge}>
        <Search size={18} color={theme.colors.brand.main} />
      </View>

      {/* Contenu Texte Central */}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {displayTitle}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {displaySubtitle}
        </Text>
      </View>

      {/* Badge Bouton Filtre Forest Sombre */}
      <View style={styles.filterBadge}>
        <SlidersHorizontal size={15} color={theme.primitives.emerald[300]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.full, // Pilule 9999px
    borderWidth: 1,
    borderColor: '#E4EBDB',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    gap: theme.spacing[3],
    ...theme.elevation.card,
  },
  searchBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.subtle,
    borderWidth: 1,
    borderColor: theme.colors.brand.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold, // Fraunces_600SemiBold
    fontSize: theme.typography.fontSize.sm,
    color: theme.primitives.forest[800],
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular, // Inter_400Regular
    fontSize: 11.5,
    color: '#5F6B59',
  },
  filterBadge: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.primitives.forest[800], // Forest-950 #041912
    justifyContent: 'center',
    alignItems: 'center',
  },
});
