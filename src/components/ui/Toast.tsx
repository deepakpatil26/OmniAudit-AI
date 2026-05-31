import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  tone?: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, tone = 'success', onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          className='oa-panel fixed bottom-6 right-6 z-[70] max-w-sm p-4 shadow-2xl shadow-black/30'>
          <div className='flex items-start gap-3'>
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded border ${
                tone === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                  : 'border-red-500/30 bg-red-500/10 text-red-500'
              }`}>
              {tone === 'success' ? (
                <CheckCircle2 className='h-4 w-4' />
              ) : (
                <AlertCircle className='h-4 w-4' />
              )}
            </div>
            <div className='flex-1'>
              <div className='oa-label'>
                {tone === 'success' ? 'Update saved' : 'Action needed'}
              </div>
              <p className='mt-2 text-sm font-medium text-text-primary'>
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className='rounded p-2 text-text-secondary transition-colors hover:bg-accent-primary-soft hover:text-text-primary'>
              <X className='h-4 w-4' />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

