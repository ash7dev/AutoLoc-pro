import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  Clipboard,
} from 'react-native';
import {
  X,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  Calendar,
  CreditCard,
  Hash,
  ShieldCheck,
} from 'lucide-react-native';
import { OwnerWalletTransaction } from '../api/ownerApi';
import { formatCurrency, CurrencyCode } from '../../../core/utils/currency';

export interface TransactionReceiptModalProps {
  visible: boolean;
  transaction: OwnerWalletTransaction | null;
  selectedCurrency?: CurrencyCode;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  visible,
  transaction,
  selectedCurrency = 'XOF',
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const isCredit = transaction.sens === 'CREDIT';
  const displayAmount = Math.abs(transaction.montant);

  const handleCopyRef = () => {
    const ref = transaction.reference || transaction.id;
    if (Clipboard && Clipboard.setString) {
      Clipboard.setString(ref);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getProviderName = () => {
    if (transaction.fournisseur === 'WAVE' || transaction.type === 'RETRAIT_WAVE') {
      return '🌊 Wave Digital Finance';
    }
    if (transaction.fournisseur === 'ORANGE_MONEY' || transaction.type === 'RETRAIT_ORANGE') {
      return '🟠 Orange Money SN';
    }
    return '🏦 Portefeuille AutoLoc';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* Header Bar */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <ShieldCheck size={20} color="#4ADE80" />
              <Text style={styles.headerTitle}>Reçu de Transaction</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Amount Badge Banner */}
          <View style={[styles.amountBanner, isCredit ? styles.amountBannerCredit : styles.amountBannerDebit]}>
            <View style={[styles.iconPill, isCredit ? styles.iconPillCredit : styles.iconPillDebit]}>
              {isCredit ? (
                <ArrowDownLeft size={22} color="#4ADE80" />
              ) : (
                <ArrowUpRight size={22} color="#F87171" />
              )}
            </View>

            <Text style={styles.transactionTitre}>
              {transaction.titre || (isCredit ? 'Crédit Location' : 'Débit Retrait')}
            </Text>

            <Text style={[styles.amountText, isCredit ? styles.amountCreditText : styles.amountDebitText]}>
              {isCredit ? '+' : '-'}{formatCurrency(displayAmount, selectedCurrency)}
            </Text>

            <View style={styles.statusBadge}>
              <CheckCircle2 size={12} color="#4ADE80" />
              <Text style={styles.statusBadgeText}>Effectué avec succès</Text>
            </View>
          </View>

          {/* Receipt Details Table */}
          <View style={styles.detailsTable}>
            {/* Reference */}
            <View style={styles.detailRow}>
              <View style={styles.rowLabelGroup}>
                <Hash size={15} color="#64748B" />
                <Text style={styles.rowLabel}>Référence</Text>
              </View>

              <TouchableOpacity
                style={styles.refCopyBadge}
                onPress={handleCopyRef}
                activeOpacity={0.7}
              >
                <Text style={styles.refText}>{transaction.reference || transaction.id.slice(0, 12)}</Text>

                {copied ? (
                  <Check size={13} color="#4ADE80" />
                ) : (
                  <Copy size={13} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>

            {/* Provider / Operator */}
            <View style={styles.detailRow}>
              <View style={styles.rowLabelGroup}>
                <CreditCard size={15} color="#64748B" />
                <Text style={styles.rowLabel}>Méthode / Opérateur</Text>
              </View>
              <Text style={styles.rowValue}>{getProviderName()}</Text>
            </View>

            {/* Date */}
            <View style={styles.detailRow}>
              <View style={styles.rowLabelGroup}>
                <Calendar size={15} color="#64748B" />
                <Text style={styles.rowLabel}>Date & Heure</Text>
              </View>
              <Text style={styles.rowValue}>{transaction.date || transaction.creeLe?.slice(0, 10)}</Text>
            </View>

            {/* Solde Après */}
            {Boolean(transaction.soldeApres !== undefined) && (
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <View style={styles.rowLabelGroup}>
                  <ShieldCheck size={15} color="#64748B" />
                  <Text style={styles.rowLabel}>Solde après mouvement</Text>
                </View>
                <Text style={styles.rowValueBold}>
                  {formatCurrency(transaction.soldeApres || 0, selectedCurrency)}
                </Text>
              </View>
            )}
          </View>

          {/* Footer Action Button */}
          <TouchableOpacity
            style={styles.closeFullBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.closeFullBtnText}>Fermer le reçu</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#041912',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountBanner: {
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountBannerCredit: {
    backgroundColor: 'rgba(10, 61, 46, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  amountBannerDebit: {
    backgroundColor: 'rgba(225, 29, 72, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.3)',
  },
  iconPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconPillCredit: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  iconPillDebit: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
  },
  transactionTitre: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  amountCreditText: {
    color: '#4ADE80',
  },
  amountDebitText: {
    color: '#F87171',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10, 61, 46, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4ADE80',
  },
  detailsTable: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  rowLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  rowValueBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F1DFB6',
  },
  refCopyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  refText: {
    fontSize: 11.5,
    fontFamily: 'System',
    fontWeight: '700',
    color: '#4ADE80',
  },
  closeFullBtn: {
    backgroundColor: '#0A3D2E',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeFullBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1DFB6',
  },
});
