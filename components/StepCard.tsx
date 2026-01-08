import React from 'react';

interface StepCardProps {
  number: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const StepCard: React.FC<StepCardProps> = ({ number, title, icon, children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 transition-all duration-300 hover:shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
        <span className="flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-full font-extrabold text-lg">
          {number}
        </span>
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
};