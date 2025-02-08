import React from 'react';
import { useMotionPreference } from '../../hooks/useMotionPreference';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  details?: string;
  code?: string;
  retryAttempts?: number;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  details,
  code,
  retryAttempts = 0
}) => {
  const { allowAnimations } = useMotionPreference();

  return (
    <div 
      className="min-h-[50vh] flex flex-col items-center justify-center p-4 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className={`text-6xl mb-6 ${allowAnimations ? 'animate-bounce' : ''}`} aria-hidden="true">
        😕
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-4">
        {message}
      </h2>
      
      {details && (
        <p className="text-slate-400 mb-4">
          {details}
        </p>
      )}

      {code && (
        <div className="mb-6 p-2 bg-slate-800 rounded-lg max-w-md overflow-auto">
          <code className="text-sm text-slate-300">
            {code}
          </code>
        </div>
      )}

      {onRetry && retryAttempts < 3 && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Try Again
        </button>
      )}

      {retryAttempts >= 3 && (
        <p className="text-slate-400 text-sm mt-4">
          Too many retry attempts. Please try again later.
        </p>
      )}
    </div>
  );
};

export default ErrorState;