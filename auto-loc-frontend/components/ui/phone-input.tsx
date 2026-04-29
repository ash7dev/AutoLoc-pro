'use client';

import * as React from 'react';
import { PhoneInput as BasePhoneInput } from 'react-international-phone';
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
    <div className={cn("phone-input-container w-full relative", className)}>
      <BasePhoneInput
        defaultCountry="sn"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full"
        // Style de l'input texte
        inputClassName={cn(
          "autoloc-body !w-full !h-14 !pl-12 !pr-4 !py-4 !border-none !text-base !bg-transparent focus:!ring-0",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        // Style du sélecteur de pays
        countrySelectorStyleProps={{
          buttonClassName: cn(
            "!h-14 !px-4 !border-none !bg-gray-50/50 hover:!bg-gray-100 !rounded-l-2xl !transition-colors !flex !items-center !justify-center",
             error && "!bg-red-50"
          ),
        }}
      />
      
      {/* Icône de téléphone flottante à l'intérieur de l'input */}
      <div className="absolute left-[88px] top-1/2 -translate-y-1/2 pointer-events-none">
        <Phone className={cn("h-4 w-4", error ? "text-red-400" : "text-emerald-500/60")} />
      </div>

      <style jsx global>{`
        /* Reset des styles par défaut de la lib pour un look sur-mesure */
        .react-international-phone-input-container {
          display: flex;
          align-items: center;
          width: 100% !important;
          background: white;
          border: 1px solid ${error ? '#ef4444' : '#e2e8f0'};
          border-radius: 1rem !important;
          transition: all 0.2s ease;
        }
        
        .react-international-phone-input-container:focus-within {
          border-color: ${error ? '#ef4444' : '#10b981'};
          box-shadow: 0 0 0 4px ${error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
        }

        .react-international-phone-country-selector-button__flag-emoji {
          font-size: 1.5rem !important;
          margin: 0 !important;
        }

        .react-international-phone-country-selector-button__dropdown-arrow {
          border-top-color: #94a3b8 !important;
          margin-left: 6px !important;
        }

        .react-international-phone-country-selector-dropdown {
          z-index: 9999 !important;
          border-radius: 1rem !important;
          border: 1px solid #f1f5f9 !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
          margin-top: 8px !important;
          background: white !important;
        }

        /* Amélioration mobile */
        @media (max-width: 640px) {
          .react-international-phone-country-selector-button {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
          .react-international-phone-input {
            padding-left: 2.5rem !important; /* Ajustement pour l'icône sur mobile */
          }
        }
      `}</style>
    </div>
  );
};
