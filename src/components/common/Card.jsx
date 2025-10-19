import React from 'react';

export function Card({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false,
  onClick = null
}) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };
  
  const baseStyles = 'bg-white rounded-lg shadow-md border border-gray-200';
  const hoverStyles = hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '';
  const clickStyles = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseStyles} ${paddings[padding]} ${hoverStyles} ${clickStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}