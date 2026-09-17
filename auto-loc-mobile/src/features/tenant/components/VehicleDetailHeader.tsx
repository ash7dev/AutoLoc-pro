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
      {/* Bouton Retour Glass (Gauche) */}
      <TouchableOpacity
        style={styles.glassCircleBtn}
        onPress={onBack}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ArrowLeft size={19} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Groupe d'actions à droite : Partager + Favoris */}
      <View style={styles.rightActionsGroup}>
        {/* Bouton Partager Glass */}
        <TouchableOpacity
          style={styles.glassCircleBtn}
          onPress={handleShare}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Share2 size={18} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>

        {/* Bouton Favoris (Cœur Néon Menthe / Rouge) Glass */}
        <TouchableOpacity
          style={[styles.glassCircleBtn, isFavorited && styles.glassCircleBtnActive]}
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
            color={isFavorited ? '#4ADE80' : '#FFFFFF'}
            fill={isFavorited ? '#4ADE80' : 'transparent'}
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
    top: Platform.OS === 'ios' ? 52 : 24,
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glassCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(4, 21, 15, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  glassCircleBtnActive: {
    backgroundColor: 'rgba(4, 25, 18, 0.85)',
    borderColor: 'rgba(74, 222, 128, 0.60)',
  },
  rightActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
