import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { ChevronDown, Headphones, User } from 'lucide-react-native';
import { theme } from '../../core/theme';
import { useAppStore } from '../../core/store/useAppStore';
import { CurrencyPickerModal, CurrencyCode, CURRENCIES } from './CurrencyPickerModal';

export type TenantHeaderVariant = 'DISCOVERY' | 'MANAGEMENT';

export interface TenantHeaderProps {
  variant: TenantHeaderVariant;
  title?: string;
  subtitle?: string;
  location?: string;
  onSupportPress?: () => void;
}

export const TenantHeader: React.FC<TenantHeaderProps> = ({
  variant,
  title,
  subtitle,
  onSupportPress,
}) => {
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const setSelectedCurrency = useAppStore((state) => state.setSelectedCurrency);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const triggerGuestAuthGuard = useAppStore((state) => state.triggerGuestAuthGuard);

  const currentCurrObj = CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0];

  const handleCurrencySelect = (code: CurrencyCode) => {
    setSelectedCurrency(code);
  };

  const handleProfileClick = () => {
    triggerGuestAuthGuard('Accédez à votre profil et vos paramètres.', { action: 'VIEW_PROFILE' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {variant === 'DISCOVERY' ? (
          /* VARIANTE DISCOVERY : Logo AutoLoc à gauche + Indicatif & Devise + Avatar à droite */
          <View style={styles.rowBetween}>
            {/* Gauche : Logo officiel AutoLoc agrandi */}
            <View style={styles.brandGroup}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Droite : Sélecteur de Devise FCFA/EUR/USD + Avatar/Profil */}
            <View style={styles.actionsGroup}>
              {/* Sélecteur de Devise */}
              <TouchableOpacity
                style={styles.currencyChip}
                onPress={() => setCurrencyModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.currencyFlag}>{currentCurrObj.flag}</Text>
                <Text style={styles.currencySymbol}>{currentCurrObj.symbol}</Text>
                <ChevronDown size={14} color={theme.colors.text.tertiary} />
              </TouchableOpacity>

              {/* Avatar ou Icône Profil */}
              <TouchableOpacity
                style={styles.avatarCircle}
                onPress={handleProfileClick}
                activeOpacity={0.7}
              >
                <User size={18} color={theme.colors.brand.main} />
                {isAuthenticated && <View style={styles.onlineDot} />}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* VARIANTE MANAGEMENT : Titre de section à gauche + Bouton Support 24/7 à droite */
          <View style={styles.rowBetween}>
            <View style={styles.managementTitleBox}>
              <Text style={styles.managementTitle} numberOfLines={1}>
                {title || 'Espace Client'}
              </Text>
              {subtitle ? (
                <Text style={styles.managementSubtitle} numberOfLines={2}>
                  {subtitle}
                </Text>
              ) : null}
            </View>

            {/* Bouton Support 24/7 à droite */}
            <TouchableOpacity
              style={styles.supportButton}
              onPress={onSupportPress}
              activeOpacity={0.8}
            >
              <View style={styles.supportIconBadge}>
                <Headphones size={16} color={theme.colors.brand.main} />
                <View style={styles.onlineDot} />
              </View>
              <Text style={styles.supportBtnText}>Support 24/7</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal du Sélecteur de Devise */}
      <CurrencyPickerModal
        visible={currencyModalVisible}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={handleCurrencySelect}
        onClose={() => setCurrencyModalVisible(false)}
      />
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
    gap: theme.spacing[2],
  },
  logoImage: {
    width: 170,
    height: 54,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  currencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    gap: 4,
  },
  currencyFlag: {
    fontSize: 14,
  },
  currencySymbol: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: theme.colors.text.primary,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
    marginRight: theme.spacing[3],
  },
  managementTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 22,
    color: theme.primitives.forest[800],
    letterSpacing: -0.3,
  },
  managementSubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 5,
  },
  supportIconBadge: {
    position: 'relative',
  },
  supportBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11.5,
    color: '#059669',
    letterSpacing: 0.2,
  },
});
