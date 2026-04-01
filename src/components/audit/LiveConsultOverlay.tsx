import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, CheckCircle, Loader2, MicOff } from 'lucide-react';

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
  return (
    <AnimatePresence>
      {show && (
        <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='absolute inset-0 bg-indigo-900/40 backdrop-blur-sm'
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className='relative bg-indigo-950 w-full max-w-lg sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] sm:h-auto'>
            <div className='p-6 border-b border-indigo-900/50 flex justify-between items-center'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center animate-pulse'>
                  <Mic className='text-white w-5 h-5' />
                </div>
                <div>
                  <h3 className='text-lg font-bold text-white'>
                    Live AI Consultant
                  </h3>
                  <p className='text-xs text-indigo-300'>
                    Hands-free compliance verification
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className='p-2 hover:bg-indigo-900 rounded-full transition-colors'>
                <X className='w-6 h-6 text-indigo-400' />
              </button>
            </div>

            <div className='flex-1 p-8 flex flex-col items-center justify-center text-center space-y-8'>
              <div className='relative'>
                <div className='w-32 h-32 rounded-full border-4 border-indigo-600 flex items-center justify-center'>
                  <div className='w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center'>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className='w-16 h-16 rounded-full bg-indigo-400 opacity-50'
                    />
                  </div>
                </div>
                <div className='absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-indigo-950'>
                  <CheckCircle className='w-4 h-4 text-white' />
                </div>
              </div>

              <div className='space-y-4 w-full'>
                <div className='p-4 bg-indigo-900/40 rounded-2xl border border-indigo-700/50 min-h-[60px] flex items-center justify-center'>
                  <p
                    className={`text-lg italic ${transcript ? 'text-indigo-200' : 'text-indigo-500'}`}>
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
                      className='p-6 bg-indigo-600 rounded-3xl text-white shadow-2xl relative'>
                      <p className='text-lg font-medium leading-relaxed font-outfit'>
                        {aiResponse}
                      </p>
                      <div className='absolute -bottom-2 -right-2 bg-emerald-500 p-1.5 rounded-full border-4 border-indigo-950'>
                        <CheckCircle className='w-4 h-4 text-white' />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className='w-full space-y-4'>
                <div className='flex justify-center gap-4'>
                  <div
                    className={`w-1 h-8 bg-indigo-600 rounded-full ${isConsultantThinking || aiResponse ? 'animate-bounce' : ''}`}
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className={`w-1 h-12 bg-indigo-400 rounded-full ${isConsultantThinking || aiResponse ? 'animate-bounce' : ''}`}
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className={`w-1 h-10 bg-indigo-500 rounded-full ${isConsultantThinking || aiResponse ? 'animate-bounce' : ''}`}
                    style={{ animationDelay: '0.3s' }}
                  />
                  <div
                    className={`w-1 h-14 bg-indigo-600 rounded-full ${isConsultantThinking || aiResponse ? 'animate-bounce' : ''}`}
                    style={{ animationDelay: '0.4s' }}
                  />
                  <div
                    className={`w-1 h-8 bg-indigo-400 rounded-full ${isConsultantThinking || aiResponse ? 'animate-bounce' : ''}`}
                    style={{ animationDelay: '0.5s' }}
                  />
                </div>
              </div>
            </div>

            <div className='p-8 bg-indigo-900/20 border-t border-indigo-900/50 flex flex-col gap-4'>
              <button
                onClick={onClose}
                className='w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20'>
                <MicOff className='w-5 h-5' /> Stop Consultation
              </button>
              <p className='text-[10px] text-indigo-400 text-center uppercase tracking-widest font-bold'>
                Powered by Groq Llama 3.3
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
