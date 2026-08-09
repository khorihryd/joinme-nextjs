'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 animate-slide-in-right ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900'
                : toast.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 bg-white dark:bg-zinc-900'
                : toast.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-white dark:bg-zinc-900'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>
                {toast.type === 'success' && '✅'}
                {toast.type === 'error' && '❌'}
                {toast.type === 'warning' && '⚠️'}
                {toast.type === 'info' && 'ℹ️'}
              </span>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-3 text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
