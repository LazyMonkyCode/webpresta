import React from 'react';

const LoadingSpinner: React.FC<{size?: 'small' | 'medium' | 'large'}> = ({size = 'small'}) => {
  return (
    <div className={`flex justify-center items-center ${size === 'small' ? 'min-h-[10px]' : size === 'medium' ? 'min-h-[20px]' : 'min-h-[400px]'}`}>
      <div 
        className={`animate-spin rounded-full ${size === 'small' ? 'h-5 w-5' : size === 'medium' ? 'h-10 w-10' : 'h-20 w-20'} border-t-2 border-b-2 border-blue-500`}
        role="status"
      >
        <span className="sr-only">Cargando...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner; 