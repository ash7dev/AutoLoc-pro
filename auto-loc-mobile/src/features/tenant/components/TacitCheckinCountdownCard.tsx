import React, { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../core/theme';

export const TacitCheckinCountdownCard: React.FC<{ deadline?: string }> = ({ deadline }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(timer); }, []);
  if (!deadline) return null;
  const remaining = Math.max(0, new Date(deadline).getTime() - now);
  const hours = Math.floor(remaining / 3_600_000); const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  return <View style={styles.card}><Clock3 size={18} color="#1D4ED8" /><View style={styles.copy}><Text style={styles.title}>Validation automatique dans {hours} h {minutes} min</Text><Text style={styles.text}>L’hôte a confirmé la prise en charge. Inspectez les photos et validez maintenant si tout est conforme.</Text></View></View>;
};
const styles = StyleSheet.create({ card: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }, copy: { flex: 1 }, title: { color: '#1E3A8A', fontFamily: theme.typography.fontFamily.semiBold, fontSize: 13 }, text: { color: '#1D4ED8', fontFamily: theme.typography.fontFamily.regular, fontSize: 11, lineHeight: 16, marginTop: 3 } });
