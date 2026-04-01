import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Globe, FileText, Search, Zap, ArrowRight, Shield, Clock } from 'lucide-react';

interface UploadModalProps {
  show: boolean;
  onClose: () => void;
  region: string;
  setRegion: (v: string) => void;
  productDesc: string;
  setProductDesc: (v: string) => void;
  isUploading: boolean;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStartAudit: () => void;
  auditStep: 'idle' | 'analyzing' | 'searching' | 'finalizing';
  quickCheckResult: { risk: 'high' | 'low'; message: string } | null;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  show,
  onClose,
  region,
  setRegion,
  productDesc,
  setProductDesc,
  isUploading,
  handleImageChange,
  handleStartAudit,
  auditStep,
  quickCheckResult,
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className='absolute inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm'
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className='relative w-full max-w-xl max-h-[90vh] bg-theme-primary rounded-[2.5rem] shadow-2xl overflow-hidden border border-border-primary transition-colors duration-300 flex flex-col'>

          <div className='p-6 sm:p-8 border-b border-border-primary flex items-center justify-between shrink-0'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none'>
                <Shield className='text-white w-4 h-4' />
              </div>
              <h2 className='text-xl sm:text-2xl font-bold text-text-primary tracking-tighter'>
                New Compliance Audit
              </h2>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-text-secondary hover:text-text-primary hover:bg-theme-secondary rounded-xl transition-all'>
              <X className='w-5 h-5' />
            </button>
          </div>

          <div className='flex-1 overflow-y-auto p-6 sm:p-8'>
            {isUploading ? (
              <div className='py-12 flex flex-col items-center text-center'>
                <div className='w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-[1.5rem] flex items-center justify-center mb-8 relative'>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className='absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full' />
                  <Search className='w-6 h-6 text-indigo-600' />
                </div>
                <h3 className='text-lg font-bold text-text-primary mb-2 uppercase tracking-tight'>AI statutory Analysis in Progress</h3>
                <p className='text-text-secondary font-bold uppercase tracking-widest text-[9px] italic'>
                  {auditStep === 'analyzing' ? 'Extracting label data...' : auditStep === 'searching' ? 'Verifying global dossier...' : 'Finalizing compliance ledger...'}
                </p>

                <div className='w-full max-w-xs mt-10 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden'>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 15 }}
                    className='h-full bg-indigo-600' />
                </div>
              </div>
            ) : (
              <div className='space-y-6 sm:space-y-8'>
                <section>
                  <label className='text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2'>
                    <Globe className='w-3 h-3 text-indigo-500' /> Target Market / Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className='w-full p-4 bg-theme-secondary border border-border-primary rounded-xl text-xs font-bold text-text-primary focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none'>
                    <option value='India (BIS/FSSAI)'>India (BIS/FSSAI)</option>
                    <option value='USA (FDA)'>USA (FDA)</option>
                    <option value='EU (EFSA)'>EU (EFSA)</option>
                  </select>
                </section>

                <section className='relative'>
                  <label className='text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2'>
                    <FileText className='w-3 h-3 text-indigo-500' /> Product Description / Listing Text
                  </label>
                  <textarea
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                    placeholder='Paste the product title, description, and marketing claims here...'
                    rows={4}
                    className='w-full p-6 bg-theme-secondary border border-border-primary rounded-[1.5rem] text-xs font-medium text-text-primary focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none'
                  />

                  <AnimatePresence>
                    {quickCheckResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className='absolute -bottom-2 right-2 max-w-[85%] bg-indigo-600 text-white p-3 rounded-xl shadow-xl shadow-indigo-100 dark:shadow-none border border-indigo-500 z-10'>
                        <div className='flex gap-2'>
                          <Zap className='w-4 h-4 shrink-0 text-amber-300' />
                          <div>
                            <p className='text-[8px] font-bold uppercase tracking-widest leading-none mb-1'>Real-time Quick Check</p>
                            <p className='text-[10px] font-bold leading-relaxed line-clamp-2 italic'>{quickCheckResult.message}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                <section>
                  <label className='text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2'>
                    <Shield className='w-3 h-3 text-indigo-500' /> Source A: Physical Label
                  </label>
                  <div className='relative group'>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleImageChange}
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                    />
                    <div className='p-8 border-2 border-dashed border-border-primary rounded-[1.5rem] bg-theme-secondary/30 text-center group-hover:border-indigo-200 dark:group-hover:border-indigo-900/50 group-hover:bg-indigo-50/10 transition-all'>
                      <div className='w-12 h-12 bg-theme-primary rounded-xl flex items-center justify-center shadow-sm mx-auto mb-3 group-hover:rotate-12 transition-transform'>
                        <Upload className='w-5 h-5 text-text-secondary group-hover:text-indigo-600 transition-colors' />
                      </div>
                      <p className='text-[10px] font-bold uppercase tracking-tighter text-text-secondary group-hover:text-indigo-600 transition-colors'>
                        Drop Actual Packaging Image
                      </p>
                    </div>
                  </div>
                </section>

                <button
                  onClick={handleStartAudit}
                  disabled={!productDesc || isUploading}
                  className='w-full py-4 bg-gray-900 dark:bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 shadow-xl shadow-gray-200 dark:shadow-none flex items-center justify-center gap-2'>
                  Run Autonomous Audit
                  <ArrowRight className='w-4 h-4' />
                </button>
              </div>
            )}
          </div>

          <div className='p-4 bg-theme-secondary/30 border-t border-border-primary text-center shrink-0'>
            <p className='text-[8px] text-text-secondary font-bold uppercase tracking-widest'>
              Expert Mode: Multisource Statutory Cross-Reference Active
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
