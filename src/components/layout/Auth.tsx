import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, ArrowLeft, Lock, Globe, Search } from 'lucide-react';

interface AuthProps {
  onSignIn: () => void;
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSignIn, onBack }) => {
  return (
    <div className='flex min-h-screen flex-col bg-theme-secondary text-text-primary'>
      {/* Top Bar */}
      <div className='flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6'>
        <button 
          onClick={onBack}
          className='group flex items-center gap-2 text-sm font-bold text-text-secondary transition-colors hover:text-[var(--accent-primary)]'>
          <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' /> Back to Features
        </button>
        <div className='flex items-center gap-2'>
           <Shield className='h-5 w-5 text-[var(--accent-primary)]' />
           <span className='font-display text-sm font-black uppercase'>OmniAudit AI</span>
        </div>
      </div>

      {/* Main Auth Content */}
      <div className='flex-1 flex items-center justify-center p-4 sm:p-6'>
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className='max-w-md w-full'>
           
           <div className='text-center mb-10'>
              <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded border border-amber-500/30 bg-[var(--accent-primary)]'>
                 <Lock className='h-8 w-8 text-black' />
              </div>
              <h1 className='font-display mb-2 text-3xl font-black sm:text-4xl'>Access Your Suite.</h1>
              <p className='font-medium text-text-secondary'>Sign in to your centralized compliance dashboard.</p>
           </div>

           <div className='space-y-6'>
              <button
                onClick={onSignIn}
                className='oa-button-primary flex w-full items-center justify-center gap-4 py-4'>
                <img src='https://www.google.com/favicon.ico' className='w-5 h-5' alt='G' />
                Continue with Google
              </button>

              <div className='relative'>
                 <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-border-primary'></div>
                 </div>
                 <div className='relative flex justify-center text-xs uppercase font-bold tracking-widest'>
                    <span className='bg-theme-secondary px-4 text-text-secondary'>Statutory Authorized Access Only</span>
                 </div>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                 <div className='rounded border border-border-primary bg-theme-primary p-4 text-center'>
                    <Globe className='mx-auto mb-2 h-4 w-4 text-[var(--accent-primary)]' />
                    <div className='text-[10px] font-black uppercase text-text-primary'>Global Compliance</div>
                 </div>
                 <div className='rounded border border-border-primary bg-theme-primary p-4 text-center'>
                    <Search className='mx-auto mb-2 h-4 w-4 text-emerald-500' />
                    <div className='text-[10px] font-black uppercase text-text-primary'>AI Verification</div>
                 </div>
              </div>
           </div>

           <p className='mt-12 text-center text-[10px] font-bold uppercase leading-loose tracking-widest text-text-secondary'>
              By continuing, you agree to our OmniAudit
              <span className='block sm:inline'> Expert Terms of Service & Privacy Protocol.</span>
           </p>
        </motion.div>
      </div>
    </div>
  );
};

