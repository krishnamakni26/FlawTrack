import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div
        className={`${sizeMap[size]} border-slate-700 border-t-cyan-400 rounded-full animate-spin`}
      />
      {text && <p className="text-sm font-mono text-slate-400">{text}</p>}
    </div>
  );
};
