import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  MessageSquareText,
  Send,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react';
import { getConsultationResponse } from '../../services/gemini';

interface CopilotDockProps {
  contextTitle?: string;
  contextPrompt?: string;
  suggestedPrompts?: string[];
}

export const CopilotDock: React.FC<CopilotDockProps> = ({
  contextTitle,
  contextPrompt,
  suggestedPrompts = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prompts = useMemo(() => {
    if (suggestedPrompts.length > 0) return suggestedPrompts.slice(0, 3);
    return [
      'How should I prepare a strong audit package?',
      'What usually causes a high-risk compliance finding?',
      'How should I interpret the integrity score?',
    ];
  }, [suggestedPrompts]);

  const submitQuery = async (rawQuery: string) => {
    const nextQuery = rawQuery.trim();
    if (nextQuery.length < 3) return;

    setIsLoading(true);
    setError(null);
    setAnswer('');
    setQuery(nextQuery);

    try {
      const contextualQuery = contextPrompt
        ? `${contextPrompt}\n\nUser question: ${nextQuery}`
        : nextQuery;
      const response = await getConsultationResponse(contextualQuery);
      setAnswer(response);
    } catch (submissionError) {
      console.error('Copilot request failed:', submissionError);
      setError('The copilot could not answer right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-1.5rem)] items-center gap-3 rounded-full border border-indigo-200 bg-white/95 px-4 py-3 text-left shadow-2xl shadow-indigo-100 backdrop-blur dark:border-indigo-900/50 dark:bg-[#0B1020]/95 dark:shadow-none sm:bottom-6 sm:right-6 sm:max-w-none'>
        <div className='flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'>
          <Bot className='h-5 w-5' />
        </div>
        <div className='hidden sm:block'>
          <p className='text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-500'>
            Ask OmniAudit
          </p>
          <p className='mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100'>
            Compliance copilot
          </p>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className='fixed inset-0 z-50 flex items-end justify-center p-2 md:items-end md:justify-end md:p-4 lg:p-6'>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className='absolute inset-0 bg-slate-950/45 backdrop-blur-sm'
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              className='relative z-10 flex h-[min(82dvh,44rem)] max-h-[calc(100dvh-1rem)] w-full max-w-[min(100vw-1rem,32rem)] flex-col overflow-hidden rounded-[2rem] border border-border-primary bg-theme-primary shadow-2xl md:h-auto md:max-h-[calc(100dvh-2rem)] md:w-[30rem] md:max-w-[30rem] lg:max-h-[calc(100dvh-3rem)] lg:w-[32rem] lg:max-w-[32rem]'>
              <div className='border-b border-border-primary bg-theme-primary px-5 py-5 sm:px-6'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white'>
                      <Sparkles className='h-5 w-5' />
                    </div>
                    <div>
                      <p className='text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-500'>
                        AI Copilot
                      </p>
                      <h3 className='mt-1 text-lg font-bold text-text-primary'>
                        Ask OmniAudit anything
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className='rounded-xl p-2 text-text-secondary transition-colors hover:bg-theme-secondary hover:text-text-primary'>
                    <X className='h-5 w-5' />
                  </button>
                </div>

                {contextTitle && (
                  <div className='mt-4 rounded-2xl border border-border-primary bg-theme-secondary/50 px-4 py-3'>
                    <p className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                      Current context
                    </p>
                    <p className='mt-1 text-sm font-semibold text-text-primary'>
                      {contextTitle}
                    </p>
                  </div>
                )}
              </div>

              <div className='flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6'>
                <div className='rounded-[1.75rem] border border-border-primary bg-theme-secondary/40 p-4'>
                  <p className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                    Suggested prompts
                  </p>
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {prompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => void submitQuery(prompt)}
                        className='rounded-full border border-border-primary bg-theme-primary px-3 py-2 text-left text-xs font-semibold text-text-primary transition-colors hover:border-indigo-200 hover:text-indigo-600 dark:hover:border-indigo-900/50'>
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='rounded-[1.75rem] border border-border-primary bg-theme-secondary/40 p-4'>
                  <label className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                    Your question
                  </label>
                  <textarea
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder='Ask about an audit result, risk signal, supported workflow, or what to do next.'
                    rows={4}
                    className='mt-3 w-full resize-none rounded-[1.25rem] border border-border-primary bg-theme-primary p-4 text-sm font-medium text-text-primary outline-none transition-all focus:ring-2 focus:ring-indigo-500'
                  />
                  <button
                    onClick={() => void submitQuery(query)}
                    disabled={isLoading || query.trim().length < 3}
                    className='mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.01] disabled:opacity-50 dark:bg-indigo-600'>
                    {isLoading ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Thinking
                      </>
                    ) : (
                      <>
                        <Send className='h-4 w-4' />
                        Ask Copilot
                      </>
                    )}
                  </button>
                </div>

                {(answer || error || isLoading) && (
                  <div className='rounded-[1.75rem] border border-border-primary bg-slate-950 px-4 py-4 text-slate-100 dark:bg-[#070B16]'>
                    <div className='mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-300'>
                      <MessageSquareText className='h-4 w-4' />
                      Copilot response
                    </div>
                    {isLoading ? (
                      <div className='flex items-center gap-2 text-sm font-medium text-slate-300'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Building an expert answer...
                      </div>
                    ) : error ? (
                      <p className='text-sm font-medium text-rose-300'>
                        {error}
                      </p>
                    ) : (
                      <p className='text-sm font-medium leading-relaxed text-slate-100'>
                        {answer}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className='border-t border-border-primary bg-theme-secondary/30 px-5 py-4 text-center sm:px-6'>
                <p className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                  AI-native help is now available across the workspace
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
