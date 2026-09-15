import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, Check, DollarSign } from 'lucide-react-native';
import { theme } from '../../core/theme';

export type CurrencyCode = 'XOF' | 'EUR' | 'USD';

export interface CurrencyItem {
  code: CurrencyCode;
  symbol: string;
  flag: string;
  name: string;
  subtitle: string;
}

export const CURRENCIES: CurrencyItem[] = [
  {
    code: 'XOF',
    symbol: 'FCFA',
    flag: '🇸🇳',
    name: 'FCFA (XOF)',
    subtitle: 'Franc CFA — Sénégal & Afrique de l’Ouest',
  },
  {
    code: 'EUR',
    symbol: '€',
    flag: '🇪🇺',
    name: 'Euro (€)',
    subtitle: 'Euro — Zone Euro & International',
  },
  {
    code: 'USD',
    symbol: '$',
    flag: '🇺🇸',
    name: 'Dollar US ($)',
    subtitle: 'Dollar Américain',
  },
];

interface CurrencyPickerModalProps {
  visible: boolean;
  selectedCurrency: CurrencyCode;
  onSelectCurrency: (currency: CurrencyCode) => void;
  onClose: () => void;
}

export const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({
  visible,
  selectedCurrency,
  onSelectCurrency,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
              {/* Top Handle */}
              <View style={styles.handleBar} />

              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerTitleRow}>
                  <DollarSign size={20} color={theme.colors.brand.main} />
                  <Text style={styles.modalTitle}>Devise d'affichage</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Choisissez la monnaie utilisée pour afficher les tarifs de location.
              </Text>

              {/* Currency List */}
              <View style={styles.listContainer}>
                {CURRENCIES.map((curr) => {
                  const isSelected = curr.code === selectedCurrency;
                  return (
                    <TouchableOpacity
                      key={curr.code}
                      style={[styles.currencyCard, isSelected && styles.currencyCardSelected]}
                      onPress={() => {
                        onSelectCurrency(curr.code);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.flagEmoji}>{curr.flag}</Text>
                      <View style={styles.currInfo}>
                        <Text style={styles.currName}>{curr.name}</Text>
                        <Text style={styles.currSub}>{curr.subtitle}</Text>
                      </View>
                      {isSelected ? (
                        <View style={styles.checkBadge}>
                          <Check size={16} color="#FFFFFF" />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 27, 20, 0.65)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[8],
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: theme.radius.full,
    alignSelf: 'center',
    marginBottom: theme.spacing[3],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[1],
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
  },
  closeBtn: {
    padding: theme.spacing[1],
  },
  modalSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
  },
  listContainer: {
    gap: theme.spacing[3],
  },
  currencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  currencyCardSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: theme.colors.brand.main,
  },
  flagEmoji: {
    fontSize: 26,
  },
  currInfo: {
    flex: 1,
  },
  currName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  currSub: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.brand.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
