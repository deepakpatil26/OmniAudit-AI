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
    <div className='min-h-screen bg-theme-secondary text-text-primary transition-colors duration-300'>
      <section className='relative overflow-hidden border-b border-border-primary pb-20 pt-14 sm:pb-24 sm:pt-18'>
        <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)]'>
            <div className='max-w-3xl text-center lg:text-left'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='mb-8 inline-flex items-center gap-2 rounded border border-border-primary bg-accent-primary-soft px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                <Zap className='h-3 w-3' />
                Autonomous Compliance AI v3.0
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='font-display mb-6 text-4xl font-extrabold leading-[1.02] text-text-primary sm:mb-8 sm:text-5xl lg:text-6xl'>
                Secure Your{' '}
                <span className='text-[var(--accent-primary)]'>
                  Market Integrity
                </span>{' '}
                in Minutes
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='mx-auto mb-8 max-w-2xl text-base font-medium leading-relaxed text-text-secondary sm:mb-10 sm:text-lg lg:mx-0'>
                The AI-powered compliance workspace for e-commerce brands. Audit packaging, catch marketplace mismatches, and turn risk findings into clear next actions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className='flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start'>
                <button
                  onClick={onStartAudit}
                  className='oa-button-primary group w-full px-8 py-4 sm:w-auto'>
                  {isLoggedIn ? 'Go to Dashboard' : 'Start Free Audit'}
                  <ArrowRight className='h-5 w-5 transition-transform group-hover:translate-x-1' />
                </button>
                <div className='flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap sm:justify-start'>
                  <div className='flex -space-x-2'>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className='flex h-10 w-10 items-center justify-center rounded border border-border-primary bg-theme-primary'>
                        <Shield className='h-4 w-4 text-[var(--accent-primary)]' />
                      </div>
                    ))}
                  </div>
                  <span className='self-center pl-4 text-left text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                    Trusted by 500+ D2C Brands
                  </span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className='oa-panel p-4 sm:p-5'>
              <div className='mb-4 flex items-center justify-between border-b border-border-primary pb-4'>
                <div>
                  <div className='oa-label'>Ledger preview</div>
                  <div className='font-display mt-1 text-lg font-bold text-text-primary'>
                    Compliance command center
                  </div>
                </div>
                <div className='rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500'>
                  Live
                </div>
              </div>

              <div className='grid grid-cols-3 gap-2'>
                {[
                  ['Risk', '04', 'text-red-500'],
                  ['Score', '92%', 'text-emerald-500'],
                  ['Markets', '08', 'text-[var(--accent-primary)]'],
                ].map(([label, value, tone]) => (
                  <div
                    key={label}
                    className='rounded border border-border-primary bg-theme-primary p-3'>
                    <div className='oa-label'>{label}</div>
                    <div className={`font-display mt-2 text-2xl font-bold ${tone}`}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className='mt-4 space-y-2'>
                {[
                  ['Resolve first', 'FSSAI license contradiction', 'red'],
                  ['Product memory', 'Shelf-life review in 6 days', 'amber'],
                  ['Audit record', 'Marketplace mismatch cleared', 'green'],
                ].map(([label, title, tone]) => (
                  <div
                    key={title}
                    className='flex items-center justify-between gap-4 rounded border border-border-primary bg-theme-primary p-3'>
                    <div>
                      <div className='oa-label'>{label}</div>
                      <div className='mt-1 text-sm font-semibold text-text-primary'>
                        {title}
                      </div>
                    </div>
                    <div
                      className={`h-2 w-12 rounded ${tone === 'red'
                          ? 'bg-red-500'
                          : tone === 'green'
                            ? 'bg-emerald-500'
                            : 'bg-[var(--accent-primary)]'
                        }`}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className='relative border-y border-border-primary bg-theme-primary py-16'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto mb-16 max-w-2xl text-center'>
            <h2 className='font-display mb-4 text-3xl font-bold uppercase text-text-primary'>
              The Expert Suite
            </h2>
            <p className='font-medium text-text-secondary'>
              Statutory-grade modules designed for the 2026 global regulatory landscape.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            <motion.div
              whileHover={{ y: -10 }}
              className='oa-panel group p-7 [--accent-line:var(--success)]'>
              <div className='mb-6 flex h-12 w-12 items-center justify-center rounded border border-border-primary bg-emerald-500/10 text-emerald-500 transition-colors'>
                <Zap className='h-7 w-7' />
              </div>
              <h3 className='font-display mb-3 text-xl font-bold uppercase text-text-primary'>
                FSSAI Consultant
              </h3>
              <p className='mb-6 text-sm font-medium leading-relaxed text-text-secondary'>
                AI-driven mapping for the 2026 Food Category System. Automatically identifies legal codes and packaging mandates in seconds.
              </p>
              <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500'>
                <CheckCircle className='h-4 w-4' /> Fully Statutory Verified
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className='oa-panel group p-7 [--accent-line:var(--info)]'>
              <div className='mb-6 flex h-12 w-12 items-center justify-center rounded border border-border-primary bg-blue-500/10 text-blue-500 transition-colors'>
                <Search className='h-7 w-7' />
              </div>
              <h3 className='font-display mb-3 text-xl font-bold uppercase text-text-primary'>
                Digital Twin Matcher
              </h3>
              <p className='mb-6 text-sm font-medium leading-relaxed text-text-secondary'>
                Cross-references physical labels against marketplace listings to detect mismatches in weight, claims, marks, or licensing details.
              </p>
              <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-500'>
                <CheckCircle className='h-4 w-4' /> Marketplace Guard Active
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className='oa-panel group p-7'>
              <div className='mb-6 flex h-12 w-12 items-center justify-center rounded border border-border-primary bg-amber-500/10 text-amber-500 transition-colors'>
                <Shield className='h-7 w-7' />
              </div>
              <h3 className='font-display mb-3 text-xl font-bold uppercase text-text-primary'>
                Shelf-Life Guard
              </h3>
              <p className='mb-6 text-sm font-medium leading-relaxed text-text-secondary'>
                Extracts MFG and EXP date signals from packaging imagery to highlight near-expiry or expired product risks before they hit the marketplace.
              </p>
              <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-500'>
                <CheckCircle className='h-4 w-4' /> Freshness Shield
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className='relative overflow-hidden py-16'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='oa-panel relative p-6 text-center sm:p-10 sm:text-left lg:p-14'>
            <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16'>
              <div className='z-10'>
                <h2 className='font-display mb-6 text-3xl font-bold leading-tight text-text-primary sm:text-5xl'>
                  The <span className='text-[var(--accent-primary)]'>Statutory Seal</span>{' '}
                  of Tomorrow.
                </h2>
                <p className='mb-10 text-base font-medium leading-relaxed text-text-secondary'>
                  Generate audit artifacts ready for internal review, marketplace verification, and repeat product governance. OmniAudit bridges the gap between marketing and statutory reality.
                </p>
                <div className='grid grid-cols-2 gap-6 sm:gap-8'>
                  <div>
                    <div className='font-display mb-1 text-3xl font-bold text-text-primary'>99.4%</div>
                    <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                      Detection Accuracy
                    </div>
                  </div>
                  <div>
                    <div className='font-display mb-1 text-3xl font-bold text-text-primary'>2s</div>
                    <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                      Average Scan Time
                    </div>
                  </div>
                </div>
              </div>
              <div className='relative z-10'>
                <div className='rounded border border-border-primary bg-theme-secondary p-6'>
                  <div className='mb-6 flex items-center gap-3'>
                    <div className='h-2 w-2 animate-pulse rounded bg-red-400' />
                    <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                      Live Detection Stream
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <div className='flex items-center gap-4 rounded border border-border-primary bg-theme-primary p-4 transition-all hover:bg-accent-primary-soft'>
                      <Shield className='h-5 w-5 text-[var(--accent-primary)]' />
                      <div className='text-[10px] font-bold uppercase tracking-widest text-text-primary'>
                        FSSAI licensing contradiction detected
                      </div>
                    </div>
                    <div className='flex items-center gap-4 rounded border border-border-primary bg-theme-primary p-4 transition-all hover:bg-accent-primary-soft'>
                      <Search className='h-5 w-5 text-amber-400' />
                      <div className='text-[10px] font-bold uppercase tracking-widest text-text-primary'>
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

      <footer className='border-t border-border-primary py-14 pb-28 md:pb-14'>
        <div className='mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8 md:flex-row md:items-start md:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded bg-[var(--accent-primary)]'>
              <Shield className='h-5 w-5 text-black' />
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

          <div className='flex flex-col items-start gap-y-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 text-[11px] font-semibold text-text-secondary'>
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


