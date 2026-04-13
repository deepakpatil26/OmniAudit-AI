import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Globe,
  FileText,
  Search,
  Zap,
  ArrowRight,
  Shield,
  Image as ImageIcon,
  FileStack,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  AUDIT_REGIONS,
  formatRegionLabel,
  type AuditRegion,
} from '../../lib/auditConfig';

interface UploadModalProps {
  show: boolean;
  onClose: () => void;
  region: AuditRegion;
  setRegion: React.Dispatch<React.SetStateAction<AuditRegion>>;
  productDesc: string;
  setProductDesc: (v: string) => void;
  allowVisionAudits: boolean;
  isUploading: boolean;
  submitError: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDigitalImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePdfChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearSubmitError: () => void;
  handleStartAudit: () => void;
  auditStep:
    | 'queued'
    | 'preparing'
    | 'analyzing'
    | 'cross-checking'
    | 'finalizing'
    | 'completed'
    | 'failed';
  quickCheckResult: { risk: 'high' | 'low'; message: string } | null;
  imagePreview: string | null;
  digitalImagePreview: string | null;
  pdfFiles: File[];
  resetImage: () => void;
  resetDigitalImage: () => void;
  resetPdfs: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  show,
  onClose,
  region,
  setRegion,
  productDesc,
  setProductDesc,
  allowVisionAudits,
  isUploading,
  submitError,
  handleImageChange,
  handleDigitalImageChange,
  handlePdfChange,
  clearSubmitError,
  handleStartAudit,
  auditStep,
  quickCheckResult,
  imagePreview,
  digitalImagePreview,
  pdfFiles,
  resetImage,
  resetDigitalImage,
  resetPdfs,
}) => {
  if (!show) return null;

  const auditStages = [
    {
      key: 'preparing',
      title: 'Preparing assets',
      description: 'Packaging images and listing text are being normalized.',
    },
    {
      key: 'cross-checking',
      title: 'Cross-checking evidence',
      description: 'Supplier docs and source files are being aligned.',
    },
    {
      key: 'analyzing',
      title: 'Reasoning through risk',
      description: 'AI is validating claims, category fit, and mismatch risk.',
    },
    {
      key: 'finalizing',
      title: 'Saving the audit',
      description: 'The finished report is being stored in your ledger.',
    },
  ] as const;

  const currentStageIndex = auditStages.findIndex(
    (stage) => stage.key === auditStep,
  );

  const progressWidth =
    currentStageIndex >= 0
      ? `${((currentStageIndex + 1) / auditStages.length) * 100}%`
      : '0%';

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
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className='absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full'
                  />
                  <Search className='w-6 h-6 text-indigo-600' />
                </div>
                <h3 className='text-lg font-bold text-text-primary mb-2 uppercase tracking-tight'>
                  AI statutory analysis in progress
                </h3>
                <p className='text-text-secondary font-bold uppercase tracking-widest text-[9px] italic'>
                  {auditStep === 'preparing'
                    ? 'Preparing your audit package...'
                    : auditStep === 'cross-checking'
                      ? 'Cross-checking all evidence sources...'
                      : auditStep === 'analyzing'
                        ? 'Running compliance reasoning...'
                        : 'Finalizing compliance ledger...'}
                </p>

                <div className='w-full max-w-sm mt-10 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden'>
                  <motion.div
                    animate={{ width: progressWidth }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className='h-full bg-indigo-600'
                  />
                </div>

                <div className='mt-8 w-full max-w-md space-y-3 text-left'>
                  {auditStages.map((stage, index) => {
                    const isComplete = currentStageIndex > index;
                    const isActive = currentStageIndex === index;

                    return (
                      <div
                        key={stage.key}
                        className={`rounded-[1.5rem] border px-4 py-4 transition-all ${
                          isActive
                            ? 'border-indigo-200 bg-indigo-50/70 dark:border-indigo-900/50 dark:bg-indigo-900/20'
                            : isComplete
                              ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-900/10'
                              : 'border-border-primary bg-theme-secondary/40'
                        }`}>
                        <div className='flex items-start gap-3'>
                          <div className='mt-0.5'>
                            {isComplete ? (
                              <CheckCircle2 className='h-5 w-5 text-emerald-600' />
                            ) : isActive ? (
                              <Loader2 className='h-5 w-5 animate-spin text-indigo-600' />
                            ) : (
                              <div className='h-5 w-5 rounded-full border border-border-primary bg-theme-primary' />
                            )}
                          </div>
                          <div>
                            <p className='text-[10px] font-bold uppercase tracking-widest text-text-primary'>
                              {stage.title}
                            </p>
                            <p className='mt-1 text-sm font-medium leading-relaxed text-text-secondary'>
                              {stage.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className='space-y-6 sm:space-y-8'>
                <section>
                  <label className='text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2'>
                    <Globe className='w-3 h-3 text-indigo-500' /> Target Market
                    / Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => {
                      clearSubmitError();
                      setRegion(e.target.value as AuditRegion);
                    }}
                    className='w-full p-4 bg-theme-secondary border border-border-primary rounded-xl text-xs font-bold text-text-primary focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none'>
                    {AUDIT_REGIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </section>

                <section className='relative'>
                  <label className='text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2'>
                    <FileText className='w-3 h-3 text-indigo-500' /> Product
                    Description / Listing Text
                  </label>
                  <textarea
                    value={productDesc}
                    onChange={(e) => {
                      clearSubmitError();
                      setProductDesc(e.target.value);
                    }}
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
                            <p className='text-[8px] font-bold uppercase tracking-widest leading-none mb-1'>
                              Real-time Quick Check
                            </p>
                            <p className='text-[10px] font-bold leading-relaxed line-clamp-2 italic'>
                              {quickCheckResult.message}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                <section>
                  <label className='text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2'>
                    <Shield className='w-3 h-3 text-indigo-500' /> Source A:
                    Physical Label
                  </label>
                  {!allowVisionAudits && (
                    <div className='mb-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300'>
                      <p className='text-[10px] font-bold uppercase tracking-widest'>
                        Vision audit mode is off
                      </p>
                      <p className='mt-1 text-sm font-medium'>
                        Enable vision audits in Suite Settings to compare packaging and listing images.
                      </p>
                    </div>
                  )}
                  <div className='relative group'>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleImageChange}
                      disabled={!allowVisionAudits}
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                    />
                    <div className='p-8 border-2 border-dashed border-border-primary rounded-[1.5rem] bg-theme-secondary/30 text-center group-hover:border-indigo-200 dark:group-hover:border-indigo-900/50 group-hover:bg-indigo-50/10 transition-all'>
                      <div className='w-12 h-12 bg-theme-primary rounded-xl flex items-center justify-center shadow-sm mx-auto mb-3 group-hover:rotate-12 transition-transform'>
                        <Upload className='w-5 h-5 text-text-secondary group-hover:text-indigo-600 transition-colors' />
                      </div>
                      <p className='text-[10px] font-bold uppercase tracking-tighter text-text-secondary group-hover:text-indigo-600 transition-colors'>
                        Drop Actual Packaging Image
                      </p>
                      {imagePreview && (
                        <div className='mt-4 overflow-hidden rounded-[1.25rem] border border-border-primary bg-theme-primary'>
                          <img
                            src={imagePreview}
                            alt='Physical label preview'
                            className='h-36 w-full object-contain bg-theme-primary p-3'
                          />
                          <div className='flex items-center justify-between border-t border-border-primary px-4 py-3'>
                            <p className='text-[9px] font-bold uppercase tracking-widest text-emerald-600'>
                              Image attached
                            </p>
                            <button
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                resetImage();
                              }}
                              className='rounded-xl p-2 text-text-secondary transition-colors hover:bg-theme-secondary hover:text-text-primary'>
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <label className='text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2'>
                    <ImageIcon className='w-3 h-3 text-indigo-500' /> Source B:
                    Digital Listing
                  </label>
                  <div className='relative group'>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleDigitalImageChange}
                      disabled={!allowVisionAudits}
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                    />
                    <div className='p-6 border-2 border-dashed border-border-primary rounded-[1.5rem] bg-theme-secondary/30 text-center group-hover:border-indigo-200 dark:group-hover:border-indigo-900/50 group-hover:bg-indigo-50/10 transition-all'>
                      <ImageIcon className='w-5 h-5 text-text-secondary group-hover:text-indigo-600 transition-colors mx-auto mb-3' />
                      <p className='text-[10px] font-bold uppercase tracking-tighter text-text-secondary group-hover:text-indigo-600 transition-colors'>
                        Upload Marketplace Screenshot
                      </p>
                      {digitalImagePreview && (
                        <div className='mt-4 overflow-hidden rounded-[1.25rem] border border-border-primary bg-theme-primary'>
                          <img
                            src={digitalImagePreview}
                            alt='Digital listing preview'
                            className='h-32 w-full object-contain bg-theme-primary p-3'
                          />
                          <div className='flex items-center justify-between border-t border-border-primary px-4 py-3'>
                            <p className='text-[9px] font-bold uppercase tracking-widest text-emerald-600'>
                              Screenshot attached
                            </p>
                            <button
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                resetDigitalImage();
                              }}
                              className='rounded-xl p-2 text-text-secondary transition-colors hover:bg-theme-secondary hover:text-text-primary'>
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <label className='text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2'>
                    <FileStack className='w-3 h-3 text-indigo-500' /> Supplier
                    Docs
                  </label>
                  <div className='relative group'>
                    <input
                      type='file'
                      accept='.pdf,.txt,text/plain,application/pdf'
                      multiple
                      onChange={handlePdfChange}
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                    />
                    <div className='p-6 border-2 border-dashed border-border-primary rounded-[1.5rem] bg-theme-secondary/30 text-center group-hover:border-indigo-200 dark:group-hover:border-indigo-900/50 group-hover:bg-indigo-50/10 transition-all'>
                      <FileStack className='w-5 h-5 text-text-secondary group-hover:text-indigo-600 transition-colors mx-auto mb-3' />
                      <p className='text-[10px] font-bold uppercase tracking-tighter text-text-secondary group-hover:text-indigo-600 transition-colors'>
                        Add PDF or TXT
                      </p>
                      <p className='mt-2 text-[9px] font-bold uppercase tracking-widest text-text-secondary'>
                        Upload supplier support files for deeper verification
                      </p>
                    </div>
                  </div>
                </section>

                {pdfFiles.length > 0 && (
                  <section className='rounded-[1.5rem] border border-border-primary bg-theme-secondary/40 p-4'>
                    <div className='mb-3 flex items-center justify-between'>
                      <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                        Attached supplier files
                      </div>
                      <button
                        onClick={resetPdfs}
                        className='rounded-xl p-2 text-text-secondary transition-colors hover:bg-theme-primary hover:text-text-primary'>
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                    <div className='space-y-2'>
                      {pdfFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className='flex items-center justify-between rounded-xl border border-border-primary bg-theme-primary px-4 py-3'>
                          <div>
                            <p className='text-xs font-bold text-text-primary'>
                              {file.name}
                            </p>
                            <p className='mt-1 text-[10px] font-medium uppercase tracking-widest text-text-secondary'>
                              {Math.max(1, Math.round(file.size / 1024))} KB
                            </p>
                          </div>
                          <p className='text-[10px] font-bold uppercase tracking-widest text-indigo-600'>
                            queued
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {submitError && (
                  <div className='flex items-start gap-3 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-4 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300'>
                    <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
                    <div>
                      <p className='text-[10px] font-bold uppercase tracking-widest'>
                        Audit could not start
                      </p>
                      <p className='mt-2 text-sm font-medium leading-relaxed'>
                        {submitError}
                      </p>
                    </div>
                  </div>
                )}

                {(imagePreview || digitalImagePreview) && (
                  <div className='rounded-[1.5rem] border border-border-primary bg-theme-secondary/40 p-4'>
                    <p className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                      Audit package
                    </p>
                    <p className='mt-2 text-sm font-medium text-text-primary'>
                      Checking {formatRegionLabel(region)} assets with{' '}
                      {imagePreview && digitalImagePreview
                        ? 'both physical and marketplace sources attached.'
                        : imagePreview
                          ? 'a physical label attached.'
                          : 'a marketplace screenshot attached.'}
                    </p>
                  </div>
                )}

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
              Expert Mode: Secure server-side AI and multisource
              cross-reference active
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
