import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, ArrowLeft, Lock, Globe, Search } from 'lucide-react';

interface AuthProps {
  onSignIn: () => void;
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSignIn, onBack }) => {
  return (
    <div className='min-h-screen bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 flex flex-col'>
      {/* Top Bar */}
      <div className='p-6 flex items-center justify-between'>
        <button 
          onClick={onBack}
          className='flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors group'>
          <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' /> Back to Features
        </button>
        <div className='flex items-center gap-2'>
           <Shield className='text-indigo-600 w-5 h-5' />
           <span className='font-black text-sm uppercase tracking-tighter'>OmniAudit AI</span>
        </div>
      </div>

      {/* Main Auth Content */}
      <div className='flex-1 flex items-center justify-center p-4'>
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className='max-w-md w-full'>
           
           <div className='text-center mb-10'>
              <div className='w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20'>
                 <Lock className='text-white w-8 h-8' />
              </div>
              <h1 className='text-3xl font-black mb-2 tracking-tight'>Access Your Suite.</h1>
              <p className='text-gray-500 dark:text-gray-400 font-medium'>Sign in to your centralized compliance dashboard.</p>
           </div>

           <div className='space-y-6'>
              <button
                onClick={onSignIn}
                className='w-full flex items-center justify-center gap-4 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gray-200 dark:shadow-none'>
                <img src='https://www.google.com/favicon.ico' className='w-5 h-5' alt='G' />
                Continue with Google
              </button>

              <div className='relative'>
                 <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-gray-100 dark:border-gray-800'></div>
                 </div>
                 <div className='relative flex justify-center text-xs uppercase font-bold tracking-widest'>
                    <span className='bg-white dark:bg-[#0B0F19] px-4 text-gray-400'>Statutory Authorized Access Only</span>
                 </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                 <div className='p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-center'>
                    <Globe className='w-4 h-4 text-indigo-500 mx-auto mb-2' />
                    <div className='text-[10px] font-black uppercase text-gray-900 dark:text-gray-100'>Global Compliance</div>
                 </div>
                 <div className='p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-center'>
                    <Search className='w-4 h-4 text-emerald-500 mx-auto mb-2' />
                    <div className='text-[10px] font-black uppercase text-gray-900 dark:text-gray-100'>AI Verification</div>
                 </div>
              </div>
           </div>

           <p className='mt-12 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose'>
              By continuing, you agree to our OmniAudit <br /> 
              Expert Terms of Service & Privacy Protocol.
           </p>
        </motion.div>
      </div>
    </div>
  );
};
