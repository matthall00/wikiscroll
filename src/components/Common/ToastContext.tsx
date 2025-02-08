import React, { createContext, useContext, useCallback, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center pointer-events-none"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            role="alert"
            className={`
              mb-2 px-4 py-2 rounded-lg shadow-lg max-w-sm w-full mx-4
              ${prefersReducedMotion ? 'opacity-100' : 'animate-fade-in-up'}
              ${toast.type === 'success' ? 'bg-green-500' :
                toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }
              text-white text-sm font-medium
            `}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};