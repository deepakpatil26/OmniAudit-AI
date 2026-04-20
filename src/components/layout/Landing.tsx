import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  Search,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

interface LandingProps {
  onStartAudit: () => void;
  isLoggedIn: boolean;
}

export const Landing: React.FC<LandingProps> = ({ onStartAudit, isLoggedIn }) => {
  return (
    <div className='min-h-screen bg-theme-primary text-text-primary transition-colors duration-300'>
      <section className='relative overflow-hidden pb-24 pt-16 sm:pb-32 sm:pt-20'>
        <div className='absolute inset-0 bg-indigo-50/30 dark:bg-indigo-900/10' />
        <div className='absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl dark:bg-indigo-500/10' />
        <div className='absolute bottom-0 -left-24 h-96 w-96 rounded-full bg-emerald-100/20 blur-3xl dark:bg-emerald-500/10' />

        <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='mb-8 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'>
              <Zap className='h-3 w-3' />
              Autonomous Compliance AI v3.0
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className='mb-6 text-4xl font-bold leading-[0.95] tracking-tight text-gray-900 dark:text-white sm:mb-8 sm:text-6xl lg:text-7xl'>
              Secure Your{' '}
              <span className='italic text-indigo-600 dark:text-indigo-400'>
                Market Integrity
              </span>{' '}
              in Minutes
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='mx-auto mb-8 max-w-2xl text-base font-medium leading-relaxed text-gray-600 dark:text-gray-400 sm:mb-10 sm:text-xl'>
              The AI-powered compliance workspace for e-commerce brands. Audit packaging, catch marketplace mismatches, and turn risk findings into clear next actions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <button
                onClick={onStartAudit}
                className='group flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-900 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-indigo-600 dark:shadow-none sm:w-auto'>
                {isLoggedIn ? 'Go to Dashboard' : 'Start Free Audit'}
                <ArrowRight className='h-5 w-5 transition-transform group-hover:translate-x-1' />
              </button>
              <div className='flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap sm:justify-start'>
                <div className='flex -space-x-2'>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className='flex h-10 w-10 items-center justify-center rounded-xl border-2 border-white bg-gray-100 shadow-sm dark:border-gray-800 dark:bg-gray-800'>
                      <Shield className='h-4 w-4 text-indigo-400' />
                    </div>
                  ))}
                </div>
                <span className='self-center pl-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400'>
                  Trusted by 500+ D2C Brands
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className='relative border-y border-border-primary bg-theme-secondary/50 py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto mb-16 max-w-2xl text-center'>
            <h2 className='mb-4 text-3xl font-bold uppercase tracking-tight text-gray-900 dark:text-white'>
              The Expert Suite
            </h2>
            <p className='font-medium text-gray-500 dark:text-gray-400'>
              Statutory-grade modules designed for the 2026 global regulatory landscape.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            <motion.div
              whileHover={{ y: -10 }}
              className='group rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:border-emerald-800 dark:bg-emerald-900/20'>
                <Zap className='h-7 w-7' />
              </div>
              <h3 className='mb-3 text-xl font-bold uppercase tracking-tight text-gray-900 dark:text-white'>
                FSSAI Consultant
              </h3>
              <p className='mb-6 text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400'>
                AI-driven mapping for the 2026 Food Category System. Automatically identifies legal codes and packaging mandates in seconds.
              </p>
              <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400'>
                <CheckCircle className='h-4 w-4' /> Fully Statutory Verified
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className='group rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:border-indigo-800 dark:bg-indigo-900/20'>
                <Search className='h-7 w-7' />
              </div>
              <h3 className='mb-3 text-xl font-bold uppercase tracking-tight text-gray-900 dark:text-white'>
                Digital Twin Matcher
              </h3>
              <p className='mb-6 text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400'>
                Cross-references physical labels against marketplace listings to detect mismatches in weight, claims, marks, or licensing details.
              </p>
              <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400'>
                <CheckCircle className='h-4 w-4' /> Marketplace Guard Active
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className='group rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 transition-colors group-hover:bg-amber-600 group-hover:text-white dark:border-amber-800 dark:bg-amber-900/20'>
                <Shield className='h-7 w-7' />
              </div>
              <h3 className='mb-3 text-xl font-bold uppercase tracking-tight text-gray-900 dark:text-white'>
                Shelf-Life Guard
              </h3>
              <p className='mb-6 text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400'>
                Extracts MFG and EXP date signals from packaging imagery to highlight near-expiry or expired product risks before they hit the marketplace.
              </p>
              <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400'>
                <CheckCircle className='h-4 w-4' /> Freshness Shield
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className='relative overflow-hidden py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gray-900 p-6 text-center shadow-2xl sm:p-12 sm:text-left lg:p-20 dark:bg-gray-800/50'>
            <div className='absolute right-0 top-0 h-96 w-96 bg-indigo-500/10 blur-3xl' />
            <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16'>
              <div className='z-10'>
                <h2 className='mb-6 text-3xl font-bold leading-tight text-white sm:text-5xl'>
                  The <span className='italic text-indigo-400'>Statutory Seal</span>{' '}
                  of Tomorrow.
                </h2>
                <p className='mb-10 text-lg font-medium leading-relaxed text-indigo-100/60'>
                  Generate audit artifacts ready for internal review, marketplace verification, and repeat product governance. OmniAudit bridges the gap between marketing and statutory reality.
                </p>
                <div className='grid grid-cols-2 gap-6 sm:gap-8'>
                  <div>
                    <div className='mb-1 text-3xl font-bold text-white'>99.4%</div>
                    <div className='text-[10px] font-bold uppercase tracking-widest text-indigo-300'>
                      Detection Accuracy
                    </div>
                  </div>
                  <div>
                    <div className='mb-1 text-3xl font-bold text-white'>2s</div>
                    <div className='text-[10px] font-bold uppercase tracking-widest text-indigo-300'>
                      Average Scan Time
                    </div>
                  </div>
                </div>
              </div>
              <div className='relative z-10'>
                <div className='rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl'>
                  <div className='mb-6 flex items-center gap-3'>
                    <div className='h-2 w-2 animate-pulse rounded-full bg-red-400' />
                    <div className='text-[10px] font-bold uppercase tracking-widest text-white/40'>
                      Live Detection Stream
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <div className='flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10'>
                      <Shield className='h-5 w-5 text-indigo-400' />
                      <div className='text-[10px] font-bold uppercase tracking-widest text-white/80'>
                        FSSAI licensing contradiction detected
                      </div>
                    </div>
                    <div className='flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10'>
                      <Search className='h-5 w-5 text-amber-400' />
                      <div className='text-[10px] font-bold uppercase tracking-widest text-white/80'>
                        Ingredient mismatch detected between packaging and listing
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className='border-t border-border-primary py-14'>
        <div className='mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 shadow-lg shadow-indigo-500/20'>
              <Shield className='h-5 w-5 text-white' />
            </div>
            <div>
              <div className='text-lg font-bold tracking-tight text-text-primary'>
                OmniAudit AI
              </div>
              <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                Product compliance workspace
              </div>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-x-5 gap-y-3 text-[11px] font-semibold text-text-secondary'>
            <a
              href='/privacy.html'
              className='transition-colors hover:text-text-primary'>
              Privacy
            </a>
            <a
              href='/terms.html'
              className='transition-colors hover:text-text-primary'>
              Terms
            </a>
            <a
              href='https://github.com/deepakpatil26/OmniAudit-AI'
              target='_blank'
              rel='noreferrer'
              className='transition-colors hover:text-text-primary'>
              GitHub
            </a>
            <span className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
              © 2026 Built for global standards
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
