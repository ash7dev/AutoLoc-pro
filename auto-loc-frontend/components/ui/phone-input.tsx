'use client';

import * as React from 'react';
import { PhoneInput as BasePhoneInput, usePhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = '77 000 00 00',
  className,
  disabled,
  error,
}) => {
  return (
    <div className={cn("relative flex gap-2", className)}>
      <BasePhoneInput
        defaultCountry="sn"
        value={value}
        onChange={onChange}
        disabled={disabled}
        inputClassName={cn(
          "autoloc-body w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 transition-all duration-200 bg-white text-gray-900 placeholder-gray-300 text-sm",
          error ? "border-red-500 focus:ring-red-400" : "focus:ring-emerald-400 focus:border-transparent",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        countrySelectorStyleProps={{
          buttonClassName: cn(
             "autoloc-body flex items-center gap-2 px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm whitespace-nowrap select-none hover:bg-gray-100 transition-colors h-full",
             error && "border-red-500"
          ),
        }}
        inputProps={{
          style: { width: '100%', height: '100%' }
        }}
      />
      <div className="absolute inset-y-0 left-[72px] pl-3 flex items-center pointer-events-none z-10">
        <Phone className={cn("h-4 w-4", error ? "text-red-400" : "text-emerald-400")} />
      </div>
      
      <style jsx global>{`
        .react-international-phone-input-container {
          width: 100%;
          display: flex;
          gap: 8px;
        }
        .react-international-phone-country-selector-button {
           height: 100% !important;
           border-radius: 0.75rem !important;
        }
        .react-international-phone-country-selector-dropdown {
           z-index: 9999 !important;
           border-radius: 1rem !important;
           border: 1px solid #e2e8f0 !important;
           box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
           max-height: 300px !important;
           overflow-y: auto !important;
           background-color: white !important;
        }
        .react-international-phone-input {
           flex: 1;
           border-radius: 0.75rem !important;
           height: 100% !important;
        }
      `}</style>
    </div>
  );
};
