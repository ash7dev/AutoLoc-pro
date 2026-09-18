import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { Calendar, CheckCircle2 } from 'lucide-react-native';
import { theme } from '../../core/theme';

interface DatePickerFieldProps {
  label?: string;
  value?: string; // Format ISO "YYYY-MM-DD"
  onChange: (isoDateStr: string) => void;
  error?: string;
}

const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label = 'Date de naissance',
  value,
  onChange,
  error,
}) => {
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  const parseIso = (isoStr?: string) => {
    if (isoStr && isoStr.length === 10) {
      const parts = isoStr.split('-');
      if (parts.length === 3) {
        return { y: parts[0], m: parts[1], d: parts[2] };
      }
    }
    return { y: '', m: '', d: '' };
  };

  const initial = parseIso(value);
  const [day, setDay] = useState(initial.d);
  const [month, setMonth] = useState(initial.m);
  const [year, setYear] = useState(initial.y);

  useEffect(() => {
    const parsed = parseIso(value);
    setDay(parsed.d);
    setMonth(parsed.m);
    setYear(parsed.y);
  }, [value]);

  const updateDate = (dStr: string, mStr: string, yStr: string) => {
    setDay(dStr);
    setMonth(mStr);
    setYear(yStr);

    if (dStr.length === 2 && mStr.length === 2 && yStr.length === 4) {
      const d = parseInt(dStr, 10);
      const m = parseInt(mStr, 10);
      const y = parseInt(yStr, 10);

      const maxYear = new Date().getFullYear() - 16;
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1940 && y <= maxYear) {
        const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        onChange(iso);
      }
    }
  };

  const handleDayChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setDay(cleaned);
    updateDate(cleaned, month, year);
    if (cleaned.length === 2) {
      monthRef.current?.focus();
    }
  };

  const handleMonthChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setMonth(cleaned);
    updateDate(day, cleaned, year);
    if (cleaned.length === 2) {
      yearRef.current?.focus();
    }
  };

  const handleYearChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setYear(cleaned);
    updateDate(day, month, cleaned);
  };

  // Formatage & âge calculé
  const isValidDate = value && value.length === 10;
  const getDisplayDateStr = () => {
    if (!isValidDate) return null;
    const parts = value.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return `${d} ${MOIS_NOMS[m - 1]} ${y}`;
  };

  const getAge = () => {
    if (!isValidDate) return null;
    const birthDate = new Date(value);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const displayDateStr = getDisplayDateStr();
  const calculatedAge = getAge();

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.inputsRow, isValidDate && styles.inputsRowValid]}>
        <View style={styles.iconCircle}>
          <Calendar size={18} color={isValidDate ? '#059669' : '#94A3B8'} />
        </View>

        {/* Champ Jour */}
        <View style={styles.inputCol}>
          <Text style={styles.colLabel}>JOUR</Text>
          <TextInput
            style={styles.numericInput}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="JJ"
            placeholderTextColor="#94A3B8"
            value={day}
            onChangeText={handleDayChange}
          />
        </View>

        <Text style={styles.slashDivider}>/</Text>

        {/* Champ Mois */}
        <View style={styles.inputCol}>
          <Text style={styles.colLabel}>MOIS</Text>
          <TextInput
            ref={monthRef}
            style={styles.numericInput}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="MM"
            placeholderTextColor="#94A3B8"
            value={month}
            onChangeText={handleMonthChange}
          />
        </View>

        <Text style={styles.slashDivider}>/</Text>

        {/* Champ Année */}
        <View style={[styles.inputCol, { flex: 1.4 }]}>
          <Text style={styles.colLabel}>ANNÉE</Text>
          <TextInput
            ref={yearRef}
            style={styles.numericInput}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="AAAA"
            placeholderTextColor="#94A3B8"
            value={year}
            onChangeText={handleYearChange}
          />
        </View>

        {isValidDate ? (
          <CheckCircle2 size={18} color="#059669" style={styles.validCheck} />
        ) : null}
      </View>

      {/* Pill récapitulatif & âge */}
      {displayDateStr ? (
        <View style={styles.summaryPill}>
          <Text style={styles.summaryText}>{displayDateStr}</Text>
          {calculatedAge !== null && (
            <View style={styles.ageBadge}>
              <Text style={styles.ageText}>{calculatedAge} ans</Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.hintText}>Saisissez votre date (ex. 14 / 08 / 1998)</Text>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
    width: '100%',
  },
  label: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.1,
    color: '#041912',
    marginBottom: 6,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 56,
    gap: 8,
  },
  inputsRowValid: {
    borderColor: '#059669',
    backgroundColor: '#FFFFFF',
  },
  iconCircle: {
    marginRight: 4,
  },
  inputCol: {
    flex: 1,
    gap: 1,
  },
  colLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 8.5,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  numericInput: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14.5,
    color: '#041912',
    padding: 0,
    height: 24,
  },
  slashDivider: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
    color: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 8,
  },
  validCheck: {
    marginLeft: 4,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 6,
  },
  summaryText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#041912',
  },
  ageBadge: {
    backgroundColor: '#041912',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ageText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#4ADE80',
  },
  hintText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.status.error,
    marginTop: 4,
  },
});
