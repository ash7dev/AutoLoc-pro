import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { X, Wallet, Smartphone, Building2, CheckCircle2 } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { formatCurrency } from '../../../core/utils/currency';
import { useAppStore } from '../../../core/store/useAppStore';
import { AutoButton } from '../../../shared/components/AutoButton';

interface PayoutModalProps {
  visible: boolean;
  soldeDisponible: number;
  onClose: () => void;
  onPayoutSuccess: (montant: number, method: string) => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  visible,
  soldeDisponible,
  onClose,
  onPayoutSuccess,
}) => {
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);

  const [montant, setMontant] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'WAVE' | 'ORANGE' | 'MTN' | 'BANQUE'>('WAVE');
  const [telephoneOuIban, setTelephoneOuIban] = useState('+225 07 08 12 34 56');

  const methods = [
    { id: 'WAVE', label: 'Wave Mobile Money', color: '#10B981', icon: Smartphone },
    { id: 'ORANGE', label: 'Orange Money CI', color: '#FF7900', icon: Smartphone },
    { id: 'MTN', label: 'MTN Mobile Money', color: '#FFCC00', icon: Smartphone },
    { id: 'BANQUE', label: 'Virement Bancaire', color: '#1F2937', icon: Building2 },
  ];

  const handleWithdrawal = () => {
    const amountNum = parseFloat(montant);
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Montant invalide', 'Veuillez saisir un montant supérieur à 0.');
      return;
    }

    if (amountNum > soldeDisponible) {
      Alert.alert('Solde insuffisant', `Votre solde disponible est de ${formatCurrency(soldeDisponible, selectedCurrency)}.`);
      return;
    }

    onPayoutSuccess(amountNum, selectedMethod);
    Alert.alert(
      'Demande envoyée ! 🚀',
      `Votre versement de ${formatCurrency(amountNum, selectedCurrency)} via ${selectedMethod} est en cours de traitement.`
    );
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Demander un virement</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#041912" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {/* Solde Récap */}
            <View style={styles.soldeBox}>
              <Text style={styles.soldeLabel}>Solde disponible au retrait</Text>
              <Text style={styles.soldeValue}>
                {formatCurrency(soldeDisponible, selectedCurrency)}
              </Text>
            </View>

            {/* Saisie Montant */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Montant à retirer (FCFA)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 100000"
                keyboardType="numeric"
                value={montant}
                onChangeText={setMontant}
              />
              <TouchableOpacity
                onPress={() => setMontant(soldeDisponible.toString())}
                style={styles.maxBtn}
              >
                <Text style={styles.maxBtnText}>Retirer tout</Text>
              </TouchableOpacity>
            </View>

            {/* Méthode de versement */}
            <Text style={styles.inputLabel}>Mode de versement</Text>
            <View style={styles.methodsGrid}>
              {methods.map((m) => {
                const isSelected = selectedMethod === m.id;
                const IconComp = m.icon;

                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.methodCard, isSelected && styles.methodCardSelected]}
                    onPress={() => setSelectedMethod(m.id as any)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.methodRow}>
                      <IconComp size={16} color={isSelected ? '#047857' : '#6B7280'} />
                      <Text style={[styles.methodText, isSelected && styles.methodTextSelected]}>
                        {m.label}
                      </Text>
                    </View>
                    {isSelected && <CheckCircle2 size={16} color="#047857" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Numéro ou IBAN */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {selectedMethod === 'BANQUE' ? 'IBAN ou Relevé d’Identité Bancaire' : 'Numéro Mobile Money'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={selectedMethod === 'BANQUE' ? 'CI76 0100 1100 ...' : '+225 07 08 ...'}
                value={telephoneOuIban}
                onChangeText={setTelephoneOuIban}
              />
            </View>

            <AutoButton title="Confirmer le virement instantané" onPress={handleWithdrawal} />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 17,
    color: '#041912',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingVertical: 16,
    gap: 14,
  },
  soldeBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  soldeLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#047857',
  },
  soldeValue: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 22,
    color: '#041912',
  },
  inputGroup: {
    gap: 6,
    position: 'relative',
  },
  inputLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#374151',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#1F2937',
  },
  maxBtn: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  maxBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#374151',
  },
  methodsGrid: {
    gap: 8,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  methodCardSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  methodText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#4B5563',
  },
  methodTextSelected: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#047857',
  },
});
