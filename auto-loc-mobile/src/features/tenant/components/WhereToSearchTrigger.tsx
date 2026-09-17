import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react-native';
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
  const hasActiveFilters = Boolean(selectedZone || selectedType || selectedDatesSummary);

  const displayTitle = selectedZone ? selectedZone : 'Où & quand louer ?';
  
  const displaySubtitle = [
    selectedType ? selectedType : null,
    selectedDatesSummary ? selectedDatesSummary : 'Destination · Dates · Catégories',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity
      style={[
        styles.container,
        hasActiveFilters && styles.containerActive,
      ]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Badge Icône Recherche Émeraude */}
      <View style={styles.searchBadge}>
        <Search size={18} color={theme.colors.brand.main} />
      </View>

      {/* Contenu Texte Central */}
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {displayTitle}
          </Text>
          {hasActiveFilters && (
            <View style={styles.activeTag}>
              <Sparkles size={10} color="#0D5C3A" />
              <Text style={styles.activeTagText}>Actif</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          {displaySubtitle}
        </Text>
      </View>

      {/* Badge Bouton Filtre Forest Sombre avec notification d'état */}
      <View style={styles.filterBadge}>
        <SlidersHorizontal size={15} color={theme.primitives.emerald[300]} />
        {hasActiveFilters && <View style={styles.activeDot} />}
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
    borderWidth: 1.5,
    borderColor: '#E4EBDB',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    gap: theme.spacing[3],
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
  containerActive: {
    borderColor: theme.colors.brand.border,
    backgroundColor: '#FAFDFB',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold, // Fraunces_600SemiBold
    fontSize: theme.typography.fontSize.sm,
    color: theme.primitives.forest[800],
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activeTagText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 9.5,
    color: '#0D5C3A',
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
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
    borderWidth: 1.5,
    borderColor: '#041912',
  },
});

