import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, showRetry = true }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <p className="mb-4 text-lg">{message}</p>
      {showRetry && onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;