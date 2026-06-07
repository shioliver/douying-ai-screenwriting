'use client'

import { useToastStore } from '@/store/toast-store'
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'

const iconMap = {
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
}

const styleMap = {
  error: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconStyleMap = {
  error: 'text-red-500',
  success: 'text-green-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] flex flex-col items-center pt-3 px-4 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type]
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg border shadow-lg text-sm max-w-lg w-full ${styleMap[toast.type]}`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${iconStyleMap[toast.type]}`} />
            <span className="flex-1">{toast.message}</span>
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="px-2 py-0.5 text-xs font-medium rounded bg-white/80 border border-current/20 hover:bg-white transition-colors flex-shrink-0"
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 hover:opacity-70 transition-opacity flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
