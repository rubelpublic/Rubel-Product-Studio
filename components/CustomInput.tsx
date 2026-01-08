import React from 'react';

interface CustomInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'text' | 'textarea';
  maxLength?: number;
  rows?: number;
}

export const CustomInput: React.FC<CustomInputProps> = ({ 
  label, value, onChange, placeholder, disabled, type = 'text', maxLength, rows = 3 
}) => {
  return (
    <div className="transition-opacity duration-200">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-sm disabled:bg-gray-50 transition-colors"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-sm disabled:bg-gray-50 transition-colors"
        />
      )}
    </div>
  );
};