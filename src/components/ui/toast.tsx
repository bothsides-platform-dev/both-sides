"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showRateLimitError: (retryAfter?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const icons: Record<ToastType, typeof AlertCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles: Record<ToastType, string> = {
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/50 dark:border-green-800 dark:text-green-200",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-800 dark:text-red-200",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/50 dark:border-yellow-800 dark:text-yellow-200",
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-200",
};

const iconStyles: Record<ToastType, string> = {
  success: "text-green-500 dark:text-green-400",
  error: "text-red-500 dark:text-red-400",
  warning: "text-yellow-500 dark:text-yellow-400",
  info: "text-blue-500 dark:text-blue-400",
};

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = crypto.randomUUID();
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const showRateLimitError = useCallback(
    (retryAfter?: number) => {
      const message = retryAfter
        ? `요청이 너무 많습니다. ${retryAfter}초 후에 다시 시도해주세요.`
        : "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";

      showToast(message, "warning", 5000);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showRateLimitError }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const Icon = icons[toast.type];
            return (
              <motion.div
                key={toast.id}
                layout
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 100, scale: 0.95 }}
                transition={shouldReduceMotion ? { duration: 0.15 } : { type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border shadow-lg",
                  styles[toast.type]
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconStyles[toast.type])} />
                <p className="text-sm font-medium flex-1">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="알림 닫기"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
