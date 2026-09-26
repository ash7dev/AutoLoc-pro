import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { User } from 'lucide-react-native';
import { theme } from '../../core/theme';
import { useAppStore } from '../../core/store/useAppStore';

export type OwnerHeaderVariant = 'DISCOVERY' | 'MANAGEMENT';

export interface OwnerHeaderProps {
  variant: OwnerHeaderVariant;
  title?: string;
  subtitle?: string;
  onProfilePress?: () => void;
  onSupportPress?: () => void;
}

export const OwnerHeader: React.FC<OwnerHeaderProps> = ({
  variant,
  title,
  subtitle,
  onProfilePress,
}) => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const user = useAppStore((state) => state.user);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {variant === 'DISCOVERY' ? (
          /* VARIANTE DISCOVERY : Logo AutoLoc à gauche + Icône Profil à droite */
          <View style={styles.rowBetween}>
            {/* Gauche : Logo AutoLoc */}
            <View style={styles.brandGroup}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Droite : Icône Profil (Navigue vers l'écran Profil) */}
            <TouchableOpacity
              style={styles.avatarCircle}
              onPress={onProfilePress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Accéder à mon profil"
            >
              {isAuthenticated && user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <User size={18} color={theme.colors.brand.main} />
              )}
              {isAuthenticated && <View style={styles.onlineDot} />}
            </TouchableOpacity>
          </View>
        ) : (
          /* VARIANTE MANAGEMENT : Titre à gauche + Icône Profil à droite */
          <View style={styles.rowBetween}>
            <View style={styles.managementTitleBox}>
              <Text style={styles.managementTitle} numberOfLines={1}>
                {title || 'Espace Propriétaire'}
              </Text>
              {subtitle ? (
                <Text style={styles.managementSubtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>

            {/* Droite : Icône Profil */}
            <TouchableOpacity
              style={styles.avatarCircle}
              onPress={onProfilePress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Accéder à mon profil"
            >
              {isAuthenticated && user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <User size={18} color={theme.colors.brand.main} />
              )}
              {isAuthenticated && <View style={styles.onlineDot} />}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  container: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 140,
    height: 44,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  onlineDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  managementTitleBox: {
    flex: 1,
    marginRight: theme.spacing[2],
  },
  managementTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 21,
    color: theme.primitives.forest[800],
    letterSpacing: -0.3,
  },
  managementSubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
});
