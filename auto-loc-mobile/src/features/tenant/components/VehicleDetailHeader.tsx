import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  Share,
} from 'react-native';
import { ArrowLeft, Share2, Heart } from 'lucide-react-native';

interface VehicleDetailHeaderProps {
  vehicleId?: string;
  vehicleTitle?: string;
  onBack: () => void;
  onFavoriteToggle?: (vehicleId: string) => void;
  isFavorited?: boolean;
}

export const VehicleDetailHeader: React.FC<VehicleDetailHeaderProps> = ({
  vehicleId,
  vehicleTitle = 'Véhicule',
  onBack,
  onFavoriteToggle,
  isFavorited = false,
}) => {
  const handleShare = async () => {
    try {
      const shareUrl = vehicleId ? `https://autoloc.sn/vehicle/${vehicleId}` : 'https://autoloc.sn';
      await Share.share({
        title: vehicleTitle,
        message: `Découvrez ce véhicule sur AutoLoc : ${vehicleTitle}\n${shareUrl}`,
        url: shareUrl,
      });
    } catch (error) {
      console.warn('Erreur de partage:', error);
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* Bouton Retour (Gauche) */}
      <TouchableOpacity
        style={styles.circleBtn}
        onPress={onBack}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ArrowLeft size={20} color="#0F172A" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Groupe d'actions à droite : Partager + Favoris */}
      <View style={styles.rightActionsGroup}>
        {/* Bouton Partager */}
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={handleShare}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Share2 size={18} color="#0F172A" strokeWidth={2} />
        </TouchableOpacity>

        {/* Bouton Favoris (Cœur) */}
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => {
            if (vehicleId && onFavoriteToggle) {
              onFavoriteToggle(vehicleId);
            }
          }}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Heart
            size={18}
            color={isFavorited ? '#EF4444' : '#0F172A'}
            fill={isFavorited ? '#EF4444' : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  rightActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
