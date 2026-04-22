'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateInputProps {
  value: string; // Format YYYY-MM-DD (format API)
  onChange: (value: string) => void;
  label?: string;
  error?: boolean;
  required?: boolean;
  className?: string;
}

export function DateInput({ value, onChange, label, error, required, className }: DateInputProps) {
  // État local pour l'affichage (JJ / MM / AAAA)
  const [displayValue, setDisplayValue] = useState('');

  // Synchronisation initiale : conversion de YYYY-MM-DD vers JJ/MM/AAAA
  useEffect(() => {
    if (value && value.includes('-')) {
      const [y, m, d] = value.split('-');
      setDisplayValue(`${d}${m}${y}`);
    } else if (!value) {
      setDisplayValue('');
    }
  }, [value]);

  const formatDisplay = (val: string) => {
    // Garde uniquement les chiffres
    const digits = val.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    
    if (digits.length > 0) {
      formatted += digits.slice(0, 2);
    }
    if (digits.length > 2) {
      formatted += ' / ' + digits.slice(2, 4);
    }
    if (digits.length > 4) {
      formatted += ' / ' + digits.slice(4, 8);
    }
    
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digits = rawValue.replace(/\D/g, '').slice(0, 8);
    
    // Mise à jour de l'affichage avec les slashs
    setDisplayValue(digits);

    // Si on a les 8 chiffres, on notifie le parent au format YYYY-MM-DD
    if (digits.length === 8) {
      const d = digits.slice(0, 2);
      const m = digits.slice(2, 4);
      const y = digits.slice(4, 8);
      onChange(`${y}-${m}-${d}`);
    } else {
      onChange(''); // Incomplet
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-[12px] font-bold text-slate-700 ml-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative group">
        <div className={cn(
          "absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200",
          displayValue.length === 8 ? "text-emerald-500" : "text-slate-400 group-focus-within:text-emerald-400"
        )}>
          <Calendar className="w-4 h-4" strokeWidth={2} />
        </div>
        <input
          type="text"
          inputMode="numeric"
          placeholder="JJ / MM / AAAA"
          value={formatDisplay(displayValue)}
          onChange={handleChange}
          className={cn(
            "w-full h-12 pl-10 pr-4 rounded-xl border bg-white transition-all duration-200 outline-none",
            "text-[14px] font-medium tracking-wide tabular-nums",
            error 
              ? "border-red-200 bg-red-50/30 text-red-900 focus:border-red-400 focus:ring-4 focus:ring-red-400/5" 
              : "border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/5"
          )}
        />
        
        {/* Barre de progression subtile sous l'input */}
        <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-slate-50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${(displayValue.length / 8) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
