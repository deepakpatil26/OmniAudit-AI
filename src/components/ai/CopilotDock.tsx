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
import { useDismissableLayer } from '../../hooks/useDismissableLayer';

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
  const dockRef = useDismissableLayer<HTMLDivElement>(isOpen, () =>
    setIsOpen(false),
  );

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
        className='fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-1.5rem)] items-center gap-3 rounded border border-border-primary bg-theme-primary/95 px-4 py-3 text-left shadow-2xl shadow-black/30 backdrop-blur transition-colors hover:border-amber-500/50 hover:bg-accent-primary-soft sm:bottom-6 sm:right-6 sm:max-w-none'>
        <div className='flex h-11 w-11 items-center justify-center rounded border border-amber-500/30 bg-[var(--accent-primary)] text-black'>
          <Bot className='h-5 w-5' />
        </div>
        <div className='hidden sm:block'>
          <p className='text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
            Ask OmniAudit
          </p>
          <p className='mt-1 text-sm font-semibold text-text-primary'>
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
              className='absolute inset-0 bg-black/55 backdrop-blur-sm'
            />

            <motion.div
              ref={dockRef}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              className='oa-panel relative z-10 flex h-[min(82dvh,44rem)] max-h-[calc(100dvh-1rem)] w-full max-w-[min(100vw-1rem,32rem)] flex-col shadow-2xl shadow-black/30 md:h-auto md:max-h-[calc(100dvh-2rem)] md:w-[30rem] md:max-w-[30rem] lg:max-h-[calc(100dvh-3rem)] lg:w-[32rem] lg:max-w-[32rem]'>
              <div className='border-b border-border-primary bg-theme-primary px-5 py-5 sm:px-6'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-11 w-11 items-center justify-center rounded border border-amber-500/30 bg-[var(--accent-primary)] text-black'>
                      <Sparkles className='h-5 w-5' />
                    </div>
                    <div>
                      <p className='text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                        AI Copilot
                      </p>
                      <h3 className='font-display mt-1 text-lg font-bold text-text-primary'>
                        Ask OmniAudit anything
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className='rounded p-2 text-text-secondary transition-colors hover:bg-accent-primary-soft hover:text-text-primary'>
                    <X className='h-5 w-5' />
                  </button>
                </div>

                {contextTitle && (
                  <div className='mt-4 rounded border border-border-primary bg-theme-secondary px-4 py-3'>
                    <p className='oa-label'>
                      Current context
                    </p>
                    <p className='mt-1 text-sm font-semibold text-text-primary'>
                      {contextTitle}
                    </p>
                  </div>
                )}
              </div>

              <div className='flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6'>
                <div className='rounded border border-border-primary bg-theme-secondary p-4'>
                  <p className='oa-label'>
                    Suggested prompts
                  </p>
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {prompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => void submitQuery(prompt)}
                        className='rounded border border-border-primary bg-theme-primary px-3 py-2 text-left text-xs font-semibold text-text-primary transition-colors hover:border-amber-500/50 hover:bg-accent-primary-soft hover:text-[var(--accent-primary)]'>
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='rounded border border-border-primary bg-theme-secondary p-4'>
                  <label className='oa-label'>
                    Your question
                  </label>
                  <textarea
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder='Ask about an audit result, risk signal, supported workflow, or what to do next.'
                    rows={4}
                    className='mt-3 w-full resize-none rounded border border-border-primary bg-theme-primary p-4 text-sm font-medium text-text-primary outline-none transition-all focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20'
                  />
                  <button
                    onClick={() => void submitQuery(query)}
                    disabled={isLoading || query.trim().length < 3}
                    className='oa-button-primary mt-4 w-full py-3 disabled:opacity-50'>
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
                  <div className='rounded border border-border-primary bg-theme-secondary px-4 py-4 text-text-primary'>
                    <div className='mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                      <MessageSquareText className='h-4 w-4' />
                      Copilot response
                    </div>
                    {isLoading ? (
                      <div className='flex items-center gap-2 text-sm font-medium text-text-secondary'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Building an expert answer...
                      </div>
                    ) : error ? (
                      <p className='text-sm font-medium text-red-400'>
                        {error}
                      </p>
                    ) : (
                      <p className='text-sm font-medium leading-relaxed text-text-primary'>
                        {answer}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className='border-t border-border-primary bg-theme-secondary px-5 py-4 text-center sm:px-6'>
                <p className='oa-label'>
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

