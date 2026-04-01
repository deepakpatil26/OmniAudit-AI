import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, AlertTriangle, CheckCircle, Search, Shield, Zap, Info, Clock, AlertCircle, Globe, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AuditReport } from '../../types/audit';

interface ReportModalProps {
  audit: AuditReport | null;
  onClose: () => void;
  onGeneratePDF: (audit: AuditReport) => void;
  onFixImage?: (findingIdx: number) => void;
  isFixing: string | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  audit,
  onClose,
  onGeneratePDF,
  onFixImage,
  isFixing,
}) => {
  if (!audit) return null;

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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className='relative w-full max-w-5xl max-h-[90vh] bg-theme-primary rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-border-primary transition-colors duration-300'>
          
          {/* Modal Header */}
          <div className='px-6 sm:px-8 py-6 border-b border-border-primary flex items-center justify-between bg-theme-primary sticky top-0 z-10 shrink-0'>
            <div>
              <div className='flex items-center gap-2 mb-1'>
                 <Shield className='w-4 h-4 text-indigo-600' />
                 <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary'>Statutory Report</span>
              </div>
              <h2 className='text-xl sm:text-2xl font-bold text-text-primary tracking-tight'>
                {audit.productName}
              </h2>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => onGeneratePDF(audit)}
                className='hidden sm:flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none'>
                <Download className='w-4 h-4' />
                Certificate
              </button>
              <button
                onClick={onClose}
                className='p-2.5 text-text-secondary hover:text-text-primary hover:bg-theme-secondary rounded-xl transition-all'>
                <X className='w-6 h-6' />
              </button>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-6 sm:p-8'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Left Column: Image & Score */}
              <div className='lg:col-span-1 space-y-6'>
                <div className='aspect-square bg-theme-secondary rounded-[2rem] overflow-hidden border-4 border-theme-secondary shadow-inner group relative'>
                   {audit.productImage && (
                     <img
                       src={audit.productImage}
                       alt='Product packaging'
                       className='w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500'
                     />
                   )}
                   <div className='absolute bottom-4 left-4 right-4 bg-theme-primary/80 backdrop-blur-md rounded-xl p-3 border border-border-primary'>
                      <p className='text-[8px] font-bold uppercase tracking-widest text-text-secondary mb-1'>Vision Hash</p>
                      <p className='text-[9px] font-mono text-text-secondary truncate'>{audit.thoughtSignature}</p>
                   </div>
                </div>

                <div className='bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden'>
                  <div className='absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl' />
                  <p className='text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-80'>Compliance Integrity</p>
                  <div className='text-5xl font-bold mb-1 tracking-tighter'>{audit.complianceScore}</div>
                  <p className='text-xs font-semibold opacity-60 uppercase tracking-widest'>Statutory Score / 100</p>
                </div>
                
                {audit.region && (
                  <div className='bg-theme-secondary/50 p-6 rounded-2xl border border-border-primary'>
                    <h4 className='text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2'>
                        <Globe className='w-3 h-3 text-indigo-500' /> Target Market
                    </h4>
                    <p className='text-sm font-bold text-text-primary'>{audit.region}</p>
                    {audit.fssaiCategory && (
                       <div className='mt-3 inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-indigo-100 dark:border-indigo-800'>
                          FSSAI CAT: {audit.fssaiCategory}
                       </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Details */}
              <div className='lg:col-span-2 space-y-8'>
                <section>
                  <h4 className='text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                     <Info className='w-4 h-4 text-indigo-500' /> Expert Risk Summary
                  </h4>
                  <div className='prose prose-sm prose-indigo dark:prose-invert max-w-none'>
                    <div className='text-text-secondary font-medium leading-relaxed italic'>
                      <ReactMarkdown>
                        {audit.riskSummary}
                      </ReactMarkdown>
                    </div>
                  </div>
                </section>

                {/* Digital Twin Mismatch Table */}
                {audit.twinMismatches && audit.twinMismatches.length > 0 && (
                  <section className='bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/30'>
                    <h4 className='text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                       <Search className='w-4 h-4' /> Digital Twin Mismatch Detection
                    </h4>
                    <div className='overflow-x-auto'>
                       <table className='w-full border-separate border-spacing-y-2'>
                          <thead>
                             <tr>
                                <th className='text-left text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4'>Attribute</th>
                                <th className='text-left text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4'>Physical</th>
                                <th className='text-left text-[9px] font-bold text-indigo-500 uppercase tracking-widest px-4'>Listing</th>
                             </tr>
                          </thead>
                          <tbody>
                             {audit.twinMismatches.map((m, i) => (
                                <tr key={i} className='bg-theme-primary/50 border-b border-border-primary/50'>
                                   <td className='text-[10px] font-bold text-text-primary p-4 rounded-l-xl uppercase tracking-tighter'>{m.attribute}</td>
                                   <td className='text-xs text-text-secondary p-4 font-medium'>{m.physicalValue}</td>
                                   <td className='text-xs font-bold text-red-600 dark:text-red-400 p-4 rounded-r-xl bg-red-50 dark:bg-red-900/10 border-l border-red-100 dark:border-red-900/30'>{m.digitalValue}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  </section>
                )}

                {/* Freshness Guard (Shelf-Life Tracker) */}
                {audit.shelfLife && (
                  <div className={`p-6 rounded-[2rem] border-2 shadow-sm relative overflow-hidden transition-colors duration-300 ${
                    audit.shelfLife.status === 'expired'
                      ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                      : audit.shelfLife.status === 'near-expiry'
                      ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
                      : 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                  }`}>
                    <div className={`absolute top-0 right-0 py-1.5 px-6 text-white text-[9px] font-bold uppercase tracking-[0.2em] rounded-bl-2xl ${
                      audit.shelfLife.status === 'expired' ? 'bg-red-600' : audit.shelfLife.status === 'near-expiry' ? 'bg-amber-600' : 'bg-emerald-600'
                    }`}>
                      {audit.shelfLife.status}
                    </div>

                    <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${
                      audit.shelfLife.status === 'expired' ? 'text-red-900 dark:text-red-400' : audit.shelfLife.status === 'near-expiry' ? 'text-amber-900 dark:text-amber-400' : 'text-emerald-900 dark:text-emerald-400'
                    }`}>
                      < Zap className='w-4 h-4' /> Freshness Guard
                    </h4>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
                      <div className='space-y-4'>
                        <div className='flex justify-between items-end'>
                           <div>
                              <p className='text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1'>Exp Date</p>
                              <div className='text-base font-bold text-text-primary tracking-tight leading-none'>{audit.shelfLife.expDate}</div>
                           </div>
                           <div className='text-right'>
                              <p className='text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1'>Days Left</p>
                              <div className={`text-base font-bold tracking-tight leading-none ${
                                audit.shelfLife.remainingDays <= 0 ? 'text-red-600' : audit.shelfLife.remainingDays < 45 ? 'text-amber-600' : 'text-emerald-600'
                              }`}>{audit.shelfLife.remainingDays}</div>
                           </div>
                        </div>
                        <div className='h-2.5 bg-theme-secondary border border-border-primary/50 rounded-full overflow-hidden'>
                           <div 
                              style={{ width: `${Math.max(0, Math.min(100, (audit.shelfLife.remainingDays / 365) * 100))}%` }}
                              className={`h-full transition-all duration-1000 ${
                                audit.shelfLife.status === 'expired' ? 'bg-red-600' : audit.shelfLife.status === 'near-expiry' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                           />
                        </div>
                      </div>

                      <div className='p-5 bg-theme-primary/60 backdrop-blur-md rounded-2xl border border-border-primary'>
                        <p className='text-[11px] text-text-secondary font-medium italic leading-relaxed'>
                          {audit.shelfLife.status === 'expired' 
                             ? 'Product exceeds safety dates.' 
                             : audit.shelfLife.status === 'near-expiry'
                             ? 'Approaching end-of-life status. High attention required.'
                             : 'Product maintains optimal freshness according to statutory OCR verification.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <section>
                  <h4 className='text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                     <CheckCircle className='w-4 h-4 text-emerald-500' /> Statutory Verification
                  </h4>
                  <div className='space-y-4'>
                    {audit.findings.map((finding, idx) => (
                      <div
                        key={idx}
                        className={`p-6 rounded-2xl border transition-all ${
                          finding.status === 'discrepancy'
                            ? 'bg-amber-50/30 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
                            : 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                        }`}>
                        <div className='flex items-start justify-between gap-4'>
                          <div className='flex items-start gap-4'>
                            <div className='mt-1'>
                              {finding.status === 'discrepancy' ? (
                                <AlertCircle className='w-6 h-6 text-amber-500' />
                              ) : (
                                <CheckCircle className='w-6 h-6 text-emerald-500' />
                              )}
                            </div>
                            <div>
                              <h5 className='text-base font-bold text-text-primary tracking-tight uppercase mb-1 leading-none'>
                                {finding.claim}
                              </h5>
                              <p className='text-[10px] text-text-secondary font-semibold uppercase tracking-widest mb-4'>
                                Legal Ref: {finding.legalReference}
                              </p>
                              <p className='text-[11px] text-text-secondary font-medium leading-relaxed italic'>
                                {finding.reasoning}
                              </p>
                            </div>
                          </div>

                          {finding.visualFixPrompt && onFixImage && (
                            <button
                              onClick={() => !isFixing && onFixImage(idx)}
                              disabled={!!isFixing}
                              className='shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-gray-200 dark:shadow-none'>
                              {isFixing === idx.toString() ? (
                                <>
                                  <Loader2 className='w-3 h-3 animate-spin' />
                                  Applying...
                                </>
                              ) : (
                                <>
                                  <Zap className='w-3 h-3' />
                                  Visual Fix
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className='px-6 sm:px-8 py-6 border-t border-border-primary bg-theme-secondary/50 flex justify-between items-center shrink-0'>
             <div className='text-[9px] text-text-secondary font-bold uppercase tracking-widest'>
                Generated by OmniAudit AI v3.0 Statutory Engine
             </div>
             <button
               onClick={onClose}
               className='text-[10px] font-bold text-text-secondary uppercase tracking-widest hover:text-text-primary transition-colors p-2'>
               Close Report
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
