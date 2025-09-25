import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 animate-fade-in">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <div className={`absolute inset-0 ${sizeClasses[size]} animate-glow rounded-full`}></div>
      </div>
      {text && (
        <p className="text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;