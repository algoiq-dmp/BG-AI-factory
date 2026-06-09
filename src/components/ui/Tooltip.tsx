'use client';

import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function Tooltip({ children, content, position = 'top', className = '' }: TooltipProps) {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-[#1e2532] border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-[#1e2532] border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-[#1e2532] border-t-transparent border-b-transparent border-r-transparent',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-[#1e2532] border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div className={`relative group inline-block ${className}`}>
      {children}
      <div 
        className={`absolute z-[100] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap px-3 py-1.5 bg-[#111622] border border-[#1e2532] text-xs font-medium text-[#8b9bb4] rounded-md shadow-xl ${positionClasses[position]}`}
        role="tooltip"
      >
        {content}
        <div className={`absolute w-0 h-0 border-[5px] ${arrowClasses[position]}`}></div>
      </div>
    </div>
  );
}
