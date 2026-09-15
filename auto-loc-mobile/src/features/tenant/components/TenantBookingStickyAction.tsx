import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { theme } from '../../../core/theme';

export const TenantBookingStickyAction: React.FC<{ visible: boolean; loading: boolean; onPress: () => void }> = ({ visible, loading, onPress }) => {
  if (!visible) return null;
  return <SafeAreaView style={styles.safe}><View style={styles.container}><TouchableOpacity disabled={loading} onPress={onPress} style={styles.button}><CheckCircle2 size={19} color="#FFFFFF" /><Text style={styles.text}>{loading ? 'Validation…' : 'Confirmer la prise en charge'}</Text></TouchableOpacity></View></SafeAreaView>;
};
const styles = StyleSheet.create({ safe: { backgroundColor: 'rgba(255,255,255,.97)', borderTopWidth: 1, borderColor: '#E2E8F0' }, container: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }, button: { minHeight: 52, borderRadius: 26, backgroundColor: '#072A20', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, text: { color: '#FFFFFF', fontFamily: theme.typography.fontFamily.bold, fontSize: 14 } });
