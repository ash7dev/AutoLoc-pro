'use client';

import * as React from 'react';
import { PhoneInput as BasePhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
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
    <div className={cn("phone-input-container w-full", className)}>
      <BasePhoneInput
        defaultCountry="sn"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full"
        inputClassName={cn(
          "!w-full !h-12 !pl-3 !pr-4 !border-none !text-[13.5px] !font-medium !bg-transparent focus:!ring-0 !text-slate-800",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        countrySelectorStyleProps={{
          buttonClassName: cn(
            "!h-12 !pl-3 !pr-2 !border-none !bg-transparent hover:!bg-slate-50 !rounded-l-xl !transition-colors",
            disabled && "opacity-50 cursor-not-allowed",
            error && "!bg-red-50/50"
          ),
        }}
      />

      <style jsx global>{`
        .react-international-phone-input-container {
          display: flex;
          align-items: center;
          width: 100% !important;
          background: white;
          border: 1.5px solid ${error ? '#ef4444' : '#e2e8f0'};
          border-radius: 0.75rem !important;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          overflow: hidden;
        }

        .react-international-phone-input-container:focus-within {
          border-color: ${error ? '#ef4444' : '#10b981'};
          box-shadow: 0 0 0 3px ${error ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)'};
        }

        .react-international-phone-country-selector {
          border-right: 1.5px solid #f1f5f9;
        }

        .react-international-phone-country-selector-button__flag-emoji {
          font-size: 1.25rem !important;
        }

        .react-international-phone-country-selector-button__dropdown-arrow {
          border-top-color: #94a3b8 !important;
          margin-left: 4px !important;
        }

        .react-international-phone-country-selector-dropdown {
          z-index: 9999 !important;
          border-radius: 0.75rem !important;
          border: 1px solid #f1f5f9 !important;
          box-shadow: 0 20px 40px -8px rgba(0,0,0,0.15) !important;
          margin-top: 6px !important;
          background: white !important;
        }

        .react-international-phone-input {
          font-size: 13.5px !important;
          color: #1e293b !important;
        }

        .react-international-phone-input::placeholder {
          color: #cbd5e1 !important;
        }
      `}</style>
    </div>
  );
};
