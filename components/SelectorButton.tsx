import React from 'react';

interface SelectorButtonProps {
  id: string;
  current: string;
  name: string;
  onClick: (id: string) => void;
  disabled?: boolean;
}

export const SelectorButton: React.FC<SelectorButtonProps> = ({ id, current, name, onClick, disabled }) => {
  return (
    <button
      key={id}
      onClick={() => onClick(id)}
      disabled={disabled}
      className={`p-2 rounded-xl border-2 transition-all duration-200 text-center text-xs font-semibold ${
        current === id
          ? 'border-red-600 bg-red-100 text-red-800 transform scale-[1.02]'
          : 'border-gray-200 hover:border-red-300 bg-white text-gray-700 hover:shadow-sm'
      }`}
    >
      {name}
    </button>
  );
};