import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Search, Globe, CheckCircle, ArrowRight } from 'lucide-react';

interface LandingProps {
  onStartAudit: () => void;
  isLoggedIn: boolean;
}

export const Landing: React.FC<LandingProps> = ({ onStartAudit, isLoggedIn }) => {
  return (
    <div className='min-h-screen bg-theme-primary text-text-primary transition-colors duration-300'>
      {/* Hero Section */}
      <section className='relative pt-20 pb-32 overflow-hidden'>
        <div className='absolute inset-0 bg-indigo-50/30 dark:bg-indigo-900/10' />
        <div className='absolute -top-24 -right-24 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl' />
        <div className='absolute bottom-0 -left-24 w-96 h-96 bg-emerald-100/20 dark:bg-emerald-500/10 rounded-full blur-3xl' />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative'>
          <div className='text-center max-w-4xl mx-auto'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8'>
              <Zap className='w-3 h-3' />
              Autonomous Compliance AI v3.0
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className='text-5xl sm:text-7xl font-bold tracking-tight leading-none mb-8 text-gray-900 dark:text-white'>
              Secure Your <span className='text-indigo-600 dark:text-indigo-400 italic'>Market Integrity</span> in Minutes
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto font-medium'>
              The world's first AI-powered statutory defender for e-commerce brands. Automatically audit packaging, eliminate greenwashing, and map global standards.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <button
                onClick={onStartAudit}
                className='w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 dark:bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gray-200 dark:shadow-none group'>
                {isLoggedIn ? 'Go to Dashboard' : 'Start Free Audit'}
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </button>
              <div className='flex -space-x-2'>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className='w-10 h-10 rounded-xl border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-sm'>
                    <Shield className='w-4 h-4 text-indigo-400' />
                  </div>
                ))}
                <span className='pl-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest self-center text-left'>
                  Trusted by 500+ D2C Brands
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Suite Section */}
      <section className='py-24 bg-theme-secondary/50 dark:bg-theme-secondary/50 relative border-y border-border-primary'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='mb-16 text-center max-w-2xl mx-auto'>
            <h2 className='text-3xl font-bold mb-4 tracking-tight uppercase text-gray-900 dark:text-white'>The Expert Suite</h2>
            <p className='text-gray-500 dark:text-gray-400 font-medium'>Statutory-grade modules designed for the 2026 global regulatory landscape.</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -10 }}
              className='bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group'>
              <div className='w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100 dark:border-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors'>
                <Zap className='w-7 h-7' />
              </div>
              <h3 className='text-xl font-bold mb-3 text-gray-900 dark:text-white tracking-tight uppercase'>FSSAI Consultant</h3>
              <p className='text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6'>
                AI-driven mapping for the 2026 Food Category System. Automatically identifies legal codes and packaging mandates in seconds.
              </p>
              <div className='flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest'>
                <CheckCircle className='w-4 h-4' /> Fully Statutory Verified
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -10 }}
              className='bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group'>
              <div className='w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-800 group-hover:bg-indigo-600 group-hover:text-white transition-colors'>
                <Search className='w-7 h-7' />
              </div>
              <h3 className='text-xl font-bold mb-3 text-gray-900 dark:text-white tracking-tight uppercase'>Digital Twin Matcher</h3>
              <p className='text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6'>
                Cross-references physical labels against Amazon/Flipkart listings to detect deceptive mismatches in net weight or logos.
              </p>
              <div className='flex items-center gap-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest'>
                <CheckCircle className='w-4 h-4' /> Marketplace Guard Active
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -10 }}
              className='bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group'>
              <div className='w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-100 dark:border-amber-800 group-hover:bg-amber-600 group-hover:text-white transition-colors'>
                <Shield className='w-7 h-7' />
              </div>
              <h3 className='text-xl font-bold mb-3 text-gray-900 dark:text-white tracking-tight uppercase'>Shelf-Life Guard</h3>
              <p className='text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6'>
                Automated OCR for MFG/EXP dates. Prevents the sale of near-expiry goods through real-time freshness visualization.
              </p>
              <div className='flex items-center gap-2 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest'>
                <CheckCircle className='w-4 h-4' /> Freshness Shield
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className='py-24 overflow-hidden relative'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='bg-gray-900 dark:bg-gray-800/50 rounded-[3.5rem] p-12 sm:p-20 relative overflow-hidden text-center sm:text-left border border-white/5 shadow-2xl'>
            <div className='absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl' />
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
              <div className='z-10'>
                <h2 className='text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight leading-tight'>
                  The <span className='italic text-indigo-400'>Statutory Seal</span> of Tomorrow.
                </h2>
                <p className='text-lg text-indigo-100/60 leading-relaxed mb-10 font-medium'>
                  Generate ISO-compliant Audit Certificates ready for legal submission or marketplace verification. OmniAudit AI is the only tool that bridges the gap between marketing and statutory reality.
                </p>
                <div className='grid grid-cols-2 gap-8'>
                  <div>
                    <div className='text-3xl font-bold text-white mb-1'>99.4%</div>
                    <div className='text-[10px] text-indigo-300 font-bold uppercase tracking-widest'>Detection Accuracy</div>
                  </div>
                  <div>
                    <div className='text-3xl font-bold text-white mb-1'>2s</div>
                    <div className='text-[10px] text-indigo-300 font-bold uppercase tracking-widest'>Average Scan Time</div>
                  </div>
                </div>
              </div>
              <div className='relative z-10'>
                 <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl'>
                    <div className='flex items-center gap-3 mb-6'>
                       <div className='w-2 h-2 rounded-full bg-red-400 animate-pulse' />
                       <div className='text-[10px] text-white/40 font-bold uppercase tracking-widest'>Live Detection Stream</div>
                    </div>
                    <div className='space-y-4'>
                       <div className='p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 transition-all hover:bg-white/10'>
                          <Shield className='w-5 h-5 text-indigo-400' />
                          <div className='text-[10px] text-white/80 font-bold uppercase tracking-widest'>FSSAI Licensing Contradiction Detected - Region: EU</div>
                       </div>
                       <div className='p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 transition-all hover:bg-white/10'>
                          <Search className='w-5 h-5 text-amber-400' />
                          <div className='text-[10px] text-white/80 font-bold uppercase tracking-widest'>Ingredient Mismatch (Maltodextrin) - Physical vs Digital</div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className='py-20 border-t border-border-primary'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-8'>
          <div className='flex items-center gap-3'>
             <div className='w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center'>
               <Shield className='text-white w-5 h-5' />
             </div>
             <span className='font-bold text-xl tracking-tighter text-text-primary'>OmniAudit AI</span>
          </div>
          <div className='text-[10px] text-text-secondary font-bold uppercase tracking-widest'>
            © 2026 Autonomous Compliance Agent • Built for Global Standards
          </div>
        </div>
      </footer>
    </div>
  );
};
