import React, { useState } from 'react';
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
import { useDismissableLayer } from '../../hooks/useDismissableLayer';

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
  const modalRef = useDismissableLayer<HTMLDivElement>(show, onClose);
  const [formStep, setFormStep] = useState<'details' | 'evidence' | 'review'>(
    'details',
  );

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
  const formSteps: {
    id: typeof formStep;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'evidence', label: 'Evidence', icon: Upload },
    { id: 'review', label: 'Review', icon: Shield },
  ];

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        />

        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className='oa-panel relative flex max-h-[90vh] w-full max-w-xl flex-col shadow-2xl shadow-black/30'>
          <div className='p-6 sm:p-8 border-b border-border-primary flex items-center justify-between shrink-0'>
            <div className='flex items-center gap-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded border border-amber-500/30 bg-[var(--accent-primary)]'>
                <Shield className='h-4 w-4 text-black' />
              </div>
              <h2 className='font-display text-xl font-bold text-text-primary sm:text-2xl'>
                New Compliance Audit
              </h2>
            </div>
            <button
              onClick={onClose}
              className='rounded p-2 text-text-secondary transition-all hover:bg-accent-primary-soft hover:text-text-primary'>
              <X className='w-5 h-5' />
            </button>
          </div>

          {!isUploading && (
            <div className='flex shrink-0 gap-2 overflow-x-auto border-b border-border-primary bg-theme-secondary px-6 py-3 sm:px-8'>
              {formSteps.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type='button'
                  onClick={() => setFormStep(id)}
                  className={`flex shrink-0 items-center gap-2 rounded border-l-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    formStep === id
                      ? 'border-[var(--accent-primary)] bg-accent-primary-soft text-[var(--accent-primary)]'
                      : 'border-transparent text-text-secondary hover:bg-accent-primary-soft hover:text-text-primary'
                  }`}>
                  <Icon className='h-3.5 w-3.5' />
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className='flex-1 overflow-y-auto p-6 sm:p-8'>
            {isUploading ? (
              <div className='py-12 flex flex-col items-center text-center'>
                <div className='relative mb-8 flex h-16 w-16 items-center justify-center rounded border border-border-primary bg-accent-primary-soft'>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className='absolute inset-0 rounded border-4 border-[var(--accent-primary)] border-t-transparent'
                  />
                  <Search className='h-6 w-6 text-[var(--accent-primary)]' />
                </div>
                <h3 className='font-display mb-2 text-lg font-bold uppercase text-text-primary'>
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

                <div className='mt-10 h-1.5 w-full max-w-sm overflow-hidden rounded bg-theme-secondary'>
                  <motion.div
                    animate={{ width: progressWidth }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className='h-full bg-[var(--accent-primary)]'
                  />
                </div>

                <div className='mt-8 w-full max-w-md space-y-3 text-left'>
                  {auditStages.map((stage, index) => {
                    const isComplete = currentStageIndex > index;
                    const isActive = currentStageIndex === index;

                    return (
                      <div
                        key={stage.key}
                        className={`rounded border px-4 py-4 transition-all ${
                          isActive
                            ? 'border-amber-500/40 bg-accent-primary-soft'
                            : isComplete
                              ? 'border-emerald-500/30 bg-emerald-500/10'
                              : 'border-border-primary bg-theme-secondary'
                        }`}>
                        <div className='flex items-start gap-3'>
                          <div className='mt-0.5'>
                            {isComplete ? (
                              <CheckCircle2 className='h-5 w-5 text-emerald-600' />
                            ) : isActive ? (
                              <Loader2 className='h-5 w-5 animate-spin text-[var(--accent-primary)]' />
                            ) : (
                              <div className='h-5 w-5 rounded border border-border-primary bg-theme-primary' />
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
                {formStep === 'details' && (
                  <>
                <section>
                  <label className='mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                    <Globe className='h-3 w-3 text-[var(--accent-primary)]' /> Target Market
                    / Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => {
                      clearSubmitError();
                      setRegion(e.target.value as AuditRegion);
                    }}
                    className='w-full appearance-none rounded border border-border-primary bg-theme-secondary p-4 text-xs font-bold text-text-primary outline-none transition-all focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20'>
                    {AUDIT_REGIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </section>

                <section className='relative'>
                  <label className='mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                    <FileText className='h-3 w-3 text-[var(--accent-primary)]' /> Product
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
                    className='w-full resize-none rounded border border-border-primary bg-theme-secondary p-6 text-xs font-medium text-text-primary outline-none transition-all focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20'
                  />

                  <AnimatePresence>
                    {quickCheckResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className='absolute -bottom-2 right-2 z-10 max-w-[85%] rounded border border-amber-500/40 bg-[var(--accent-primary)] p-3 text-black shadow-xl shadow-black/30'>
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
                  </>
                )}

                {formStep === 'evidence' && (
                  <>
                <section>
                  <label className='mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                    <Shield className='h-3 w-3 text-[var(--accent-primary)]' /> Source A:
                    Physical Label
                  </label>
                  {!allowVisionAudits && (
                    <div className='mb-3 rounded border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-400'>
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
                    <div className='rounded border-2 border-dashed border-border-primary bg-theme-secondary p-8 text-center transition-all group-hover:border-amber-500/50 group-hover:bg-accent-primary-soft'>
                      <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded border border-border-primary bg-theme-primary transition-transform group-hover:rotate-12'>
                        <Upload className='h-5 w-5 text-text-secondary transition-colors group-hover:text-[var(--accent-primary)]' />
                      </div>
                      <p className='text-[10px] font-bold uppercase tracking-widest text-text-secondary transition-colors group-hover:text-[var(--accent-primary)]'>
                        Drop Actual Packaging Image
                      </p>
                      {imagePreview && (
                        <div className='mt-4 overflow-hidden rounded border border-border-primary bg-theme-primary'>
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
                              className='rounded p-2 text-text-secondary transition-colors hover:bg-theme-secondary hover:text-text-primary'>
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <label className='mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                    <ImageIcon className='h-3 w-3 text-[var(--accent-primary)]' /> Source B:
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
                    <div className='rounded border-2 border-dashed border-border-primary bg-theme-secondary p-6 text-center transition-all group-hover:border-amber-500/50 group-hover:bg-accent-primary-soft'>
                      <ImageIcon className='mx-auto mb-3 h-5 w-5 text-text-secondary transition-colors group-hover:text-[var(--accent-primary)]' />
                      <p className='text-[10px] font-bold uppercase tracking-widest text-text-secondary transition-colors group-hover:text-[var(--accent-primary)]'>
                        Upload Marketplace Screenshot
                      </p>
                      {digitalImagePreview && (
                        <div className='mt-4 overflow-hidden rounded border border-border-primary bg-theme-primary'>
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
                              className='rounded p-2 text-text-secondary transition-colors hover:bg-theme-secondary hover:text-text-primary'>
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <label className='mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                    <FileStack className='h-3 w-3 text-[var(--accent-primary)]' /> Supplier
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
                    <div className='rounded border-2 border-dashed border-border-primary bg-theme-secondary p-6 text-center transition-all group-hover:border-amber-500/50 group-hover:bg-accent-primary-soft'>
                      <FileStack className='mx-auto mb-3 h-5 w-5 text-text-secondary transition-colors group-hover:text-[var(--accent-primary)]' />
                      <p className='text-[10px] font-bold uppercase tracking-widest text-text-secondary transition-colors group-hover:text-[var(--accent-primary)]'>
                        Add PDF or TXT
                      </p>
                      <p className='mt-2 text-[9px] font-bold uppercase tracking-widest text-text-secondary'>
                        Upload supplier support files for deeper verification
                      </p>
                    </div>
                  </div>
                </section>

                {pdfFiles.length > 0 && (
                  <section className='rounded border border-border-primary bg-theme-secondary p-4'>
                    <div className='mb-3 flex items-center justify-between'>
                      <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                        Attached supplier files
                      </div>
                      <button
                        onClick={resetPdfs}
                        className='rounded p-2 text-text-secondary transition-colors hover:bg-theme-primary hover:text-text-primary'>
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                    <div className='space-y-2'>
                      {pdfFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className='flex items-center justify-between rounded border border-border-primary bg-theme-primary px-4 py-3'>
                          <div>
                            <p className='text-xs font-bold text-text-primary'>
                              {file.name}
                            </p>
                            <p className='mt-1 text-[10px] font-medium uppercase tracking-widest text-text-secondary'>
                              {Math.max(1, Math.round(file.size / 1024))} KB
                            </p>
                          </div>
                          <p className='text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                            queued
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                  </>
                )}

                {formStep === 'review' && (
                  <>
                {submitError && (
                  <div className='flex items-start gap-3 rounded border border-red-500/30 bg-red-500/10 px-4 py-4 text-red-400'>
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
                  <div className='rounded border border-border-primary bg-theme-secondary p-4'>
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
                  className='oa-button-primary flex w-full items-center justify-center gap-2 py-4 disabled:opacity-50'>
                  Run Autonomous Audit
                  <ArrowRight className='w-4 h-4' />
                </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className='shrink-0 border-t border-border-primary bg-theme-secondary p-4'>
            {!isUploading ? (
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-[8px] font-bold uppercase tracking-widest text-text-secondary'>
                  Expert Mode: Secure server-side AI and multisource
                  cross-reference active
                </p>
                <div className='flex gap-2'>
                  {formStep !== 'details' && (
                    <button
                      type='button'
                      onClick={() =>
                        setFormStep(
                          formStep === 'review' ? 'evidence' : 'details',
                        )
                      }
                      className='oa-button-ghost'>
                      Back
                    </button>
                  )}
                  {formStep !== 'review' && (
                    <button
                      type='button'
                      onClick={() =>
                        setFormStep(
                          formStep === 'details' ? 'evidence' : 'review',
                        )
                      }
                      className='oa-button-primary'>
                      Next
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className='text-center text-[8px] font-bold uppercase tracking-widest text-text-secondary'>
                Expert Mode: Secure server-side AI and multisource
                cross-reference active
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

