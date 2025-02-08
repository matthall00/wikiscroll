import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import LoadingSpinner from '../Common/LoadingSpinner';

interface CustomErrorPageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  code?: string;
}

const CustomErrorPage: React.FC<CustomErrorPageProps> = ({
  title = 'Oops! Something went wrong',
  message,
  onRetry,
  isRetrying = false,
  code
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div 
          className={`text-6xl mb-6 ${
            prefersReducedMotion ? '' : 'animate-bounce'
          }`}
          aria-hidden="true"
        >
          😕
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
        <p className="text-slate-400 mb-6">{message}</p>
        {code && (
          <div className="mb-6 p-2 bg-slate-800 rounded-lg">
            <code className="text-sm text-slate-300">{code}</code>
          </div>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className={`
              inline-flex items-center px-6 py-3 rounded-lg
              ${isRetrying 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
              }
              text-white font-medium transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900
            `}
          >
            {isRetrying ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span className="ml-2">Retrying...</span>
              </>
            ) : (
              'Try Again'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomErrorPage;