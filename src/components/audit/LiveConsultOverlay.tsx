import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, CheckCircle, Loader2, MicOff } from 'lucide-react';
import { useDismissableLayer } from '../../hooks/useDismissableLayer';

interface LiveConsultOverlayProps {
  show: boolean;
  onClose: () => void;
  transcript: string;
  aiResponse: string;
  isConsultantThinking: boolean;
}

export const LiveConsultOverlay: React.FC<LiveConsultOverlayProps> = ({
  show,
  onClose,
  transcript,
  aiResponse,
  isConsultantThinking,
}) => {
  const overlayRef = useDismissableLayer<HTMLDivElement>(show, onClose);

  return (
    <AnimatePresence>
      {show && (
        <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
          />
          <motion.div
            ref={overlayRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className='oa-panel relative flex h-[80vh] w-full max-w-lg flex-col shadow-2xl shadow-black/30 sm:h-auto'>
            <div className='flex items-center justify-between border-b border-border-primary p-6'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 animate-pulse items-center justify-center rounded border border-amber-500/30 bg-[var(--accent-primary)]'>
                  <Mic className='h-5 w-5 text-black' />
                </div>
                <div>
                  <h3 className='font-display text-lg font-bold text-text-primary'>
                    Live AI Consultant
                  </h3>
                  <p className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                    Hands-free compliance verification
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className='rounded p-2 transition-colors hover:bg-accent-primary-soft'>
                <X className='h-6 w-6 text-text-secondary' />
              </button>
            </div>

            <div className='flex flex-1 flex-col items-center justify-center space-y-8 p-8 text-center'>
              <div className='relative'>
                <div className='flex h-32 w-32 items-center justify-center rounded border-2 border-amber-500/40'>
                  <div className='flex h-24 w-24 items-center justify-center rounded bg-amber-500/15'>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className='h-16 w-16 rounded bg-[var(--accent-primary)] opacity-50'
                    />
                  </div>
                </div>
                <div className='absolute -bottom-2 -right-2 rounded border-4 border-[var(--panel)] bg-emerald-500 p-2'>
                  <CheckCircle className='h-4 w-4 text-black' />
                </div>
              </div>

              <div className='w-full space-y-4'>
                <div className='flex min-h-[60px] items-center justify-center rounded border border-border-primary bg-theme-secondary p-4'>
                  <p
                    className={`text-lg italic ${transcript ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {transcript || '"Ask me something..."'}
                  </p>
                </div>

                {isConsultantThinking && (
                  <div className='flex items-center justify-center gap-2 text-emerald-400'>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    <span className='text-xs uppercase font-bold tracking-widest'>
                      Consulting Llama...
                    </span>
                  </div>
                )}

                <AnimatePresence>
                  {aiResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='relative rounded border border-amber-500/30 bg-accent-primary-soft p-6 text-text-primary'>
                      <p className='text-lg font-medium leading-relaxed'>
                        {aiResponse}
                      </p>
                      <div className='absolute -bottom-2 -right-2 rounded border-4 border-[var(--panel)] bg-emerald-500 p-1.5'>
                        <CheckCircle className='h-4 w-4 text-black' />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className='w-full space-y-4'>
                <div className='flex justify-center gap-4'>
                  <div
                    className={`h-8 w-1 rounded bg-[var(--accent-primary)] ${isConsultantThinking || aiResponse ? 'animate-bounce' : ''}`}
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className={`h-12 w-1 rounded bg-amber-300 ${isConsultantThinking || aiResponse ? 'animate-bounce' : ''}`}
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className={`h-10 w-1 rounded bg-amber-500 ${isConsultantThinking || aiResponse ? 'animate-bounce' : ''}`}
                    style={{ animationDelay: '0.3s' }}
                  />
                  <div
                    className={`h-14 w-1 rounded bg-[var(--accent-primary)] ${isConsultantThinking || aiResponse ? 'animate-bounce' : ''}`}
                    style={{ animationDelay: '0.4s' }}
                  />
                  <div
                    className={`h-8 w-1 rounded bg-amber-300 ${isConsultantThinking || aiResponse ? 'animate-bounce' : ''}`}
                    style={{ animationDelay: '0.5s' }}
                  />
                </div>
              </div>
            </div>

            <div className='flex flex-col gap-4 border-t border-border-primary bg-theme-secondary p-8'>
              <button
                onClick={onClose}
                className='oa-button-primary flex w-full items-center justify-center gap-3 py-4'>
                <MicOff className='h-5 w-5' /> Stop Consultation
              </button>
              <p className='oa-label text-center'>
                Secure server-side Groq Llama 3.3
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

