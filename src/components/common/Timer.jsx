import React from 'react';
import { formatTime } from '../../utils/formatTime';

export function Timer({ 
  timeRemaining, 
  showWarning = true,
  className = '' 
}) {
  const minutes = Math.floor(timeRemaining / 60);
  const isWarning = showWarning && timeRemaining <= 300 && timeRemaining > 60; // 5 minutos
  const isCritical = showWarning && timeRemaining <= 60; // 1 minuto
  
  let colorClass = 'text-gray-700';
  let bgClass = 'bg-gray-100';
  
  if (isCritical) {
    colorClass = 'text-red-600 animate-pulse';
    bgClass = 'bg-red-100';
  } else if (isWarning) {
    colorClass = 'text-orange-600';
    bgClass = 'bg-orange-100';
  }
  
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${bgClass} ${className}`}>
      <svg 
        className={`w-5 h-5 ${colorClass}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span className={`font-mono text-lg font-bold ${colorClass}`}>
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}