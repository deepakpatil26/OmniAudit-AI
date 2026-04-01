import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Search, Shield, ChevronRight, Trash2, X } from 'lucide-react';
import { AuditReport } from '../../types/audit';

interface AuditCardProps {
  audit: AuditReport;
  onViewReport: (audit: AuditReport) => void;
  onDelete?: (id: string) => void;
}

export const AuditCard: React.FC<AuditCardProps> = ({ 
  audit, 
  onViewReport,
  onDelete 
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const hasDiscrepancy = audit.findings.some((f: any) => f.status === 'discrepancy');

  return (
    <motion.div
      layoutId={audit.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-theme-primary border border-border-primary rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all relative group'>
      
      {/* Delete Action Overlay */}
      <div className='absolute top-6 right-6 z-10 flex items-center gap-2'>
         <AnimatePresence>
            {isConfirmingDelete ? (
               <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 10 }}
                  className='flex items-center gap-3 bg-red-600 text-white px-4 py-2 rounded-2xl shadow-xl border border-red-700'>
                  <span className='text-[10px] font-black uppercase tracking-widest'>Confirm?</span>
                  <button 
                     onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(audit.id!);
                        setIsConfirmingDelete(false);
                     }}
                     className='p-1.5 hover:bg-white/20 rounded-lg transition-colors'>
                     <Trash2 className='w-4 h-4' />
                  </button>
                  <button 
                     onClick={(e) => {
                        e.stopPropagation();
                        setIsConfirmingDelete(false);
                     }}
                     className='p-1.5 hover:bg-white/20 rounded-lg transition-colors border-l border-white/20 pl-3 ml-1'>
                     <X className='w-4 h-4' />
                  </button>
               </motion.div>
            ) : (
               <button
                  onClick={(e) => {
                     e.stopPropagation();
                     setIsConfirmingDelete(true);
                  }}
                  className='p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-gray-100 dark:border-gray-700 shadow-lg'>
                  <Trash2 className='w-4.5 h-4.5' />
               </button>
            )}
         </AnimatePresence>
      </div>

      <div className='p-8'>
        <div className='flex justify-between items-start mb-6 pr-12'>
          <div>
            <h3 className='text-xl font-bold text-text-primary tracking-tight leading-tight'>
              {audit.productName}
            </h3>
            <p className='text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-2'>
              {audit.id ? audit.id.slice(0, 8) : 'NEW'} • {new Date(audit.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className='flex flex-col items-end gap-3'>
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                hasDiscrepancy
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50'
                  : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
              }`}>
              {hasDiscrepancy ? 'High Risk' : 'Compliant'}
            </div>
            {audit.complianceScore !== undefined && (
              <div className='text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-lg border border-gray-100 dark:border-gray-700'>
                Score: {audit.complianceScore}/100
              </div>
            )}
          </div>
        </div>

        <div className='space-y-3 mb-8'>
          {audit.findings.slice(0, 2).map((finding: any, idx: number) => (
            <div
              key={idx}
              className='flex gap-4 p-4 bg-theme-secondary/50 rounded-[1.25rem] border border-border-primary/50 transition-all hover:bg-theme-secondary'>
              {finding.status === 'discrepancy' ? (
                <AlertTriangle className='w-5 h-5 text-amber-500 shrink-0 mt-0.5' />
              ) : (
                <CheckCircle className='w-5 h-5 text-emerald-500 shrink-0 mt-0.5' />
              )}
              <div>
                <p className='text-sm font-bold text-text-primary leading-tight mb-1'>
                  {finding.claim}
                </p>
                <p className='text-[10px] text-text-secondary line-clamp-1 italic font-medium'>
                  {finding.reasoning}
                </p>
              </div>
            </div>
          ))}
          {audit.findings.length > 2 && (
            <p className='text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest pl-2 mt-4'>
              +{audit.findings.length - 2} more findings detected
            </p>
          )}
        </div>

        <div className='flex items-center justify-between pt-6 border-t border-border-primary'>
          <div className='flex items-center gap-2'>
            {audit.twinMismatches && (
              <div className='w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center shadow-sm'>
                <Search className='w-4 h-4 text-indigo-600 dark:text-indigo-400' />
              </div>
            )}
            {audit.shelfLife && (
              <div className='w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center shadow-sm'>
                <Shield className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
              </div>
            )}
          </div>
          <button
            onClick={() => onViewReport(audit)}
            className='text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1 group/btn hover:gap-2 transition-all p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl'>
            View Full Report <ChevronRight className='w-4 h-4 transition-transform group-hover/btn:translate-x-1' />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
