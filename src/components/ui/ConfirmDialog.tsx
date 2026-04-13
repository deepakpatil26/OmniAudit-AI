import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  show,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className='fixed inset-0 z-[65] flex items-center justify-center p-4'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className='relative w-full max-w-md rounded-[2rem] border border-border-primary bg-theme-primary p-8 shadow-2xl'>
            <div className='mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'>
              <AlertTriangle className='h-5 w-5' />
            </div>
            <h3 className='text-xl font-bold text-text-primary'>{title}</h3>
            <p className='mt-3 text-sm font-medium leading-relaxed text-text-secondary'>
              {description}
            </p>

            <div className='mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
              <button
                onClick={onCancel}
                className='rounded-xl border border-border-primary px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary transition-colors hover:bg-theme-secondary hover:text-text-primary'>
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className='rounded-xl bg-red-600 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700'>
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
