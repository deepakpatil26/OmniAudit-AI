import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Search,
  Shield,
  ChevronRight,
  Trash2,
  X,
} from 'lucide-react';
import { AuditReport } from '../../types/audit';
import { formatRegionLabel } from '../../lib/auditConfig';

interface AuditCardProps {
  audit: AuditReport;
  onViewReport: (audit: AuditReport) => void;
  onDelete?: (id: string) => void;
}

export const AuditCard: React.FC<AuditCardProps> = ({
  audit,
  onViewReport,
  onDelete,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const hasDiscrepancy = audit.findings.some(
    (finding) => finding.status === 'discrepancy',
  );

  return (
    <motion.div
      layoutId={audit.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='oa-panel group relative overflow-hidden transition-colors hover:border-amber-500/50'>
      <div className='absolute top-6 right-6 z-10 flex items-center gap-2'>
        <AnimatePresence>
          {isConfirmingDelete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 10 }}
              className='flex items-center gap-3 rounded border border-red-700 bg-red-600 px-4 py-2 text-white shadow-xl'>
              <span className='text-[10px] font-black uppercase tracking-widest'>
                Confirm?
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(audit.id!);
                  setIsConfirmingDelete(false);
                }}
                className='rounded p-1.5 transition-colors hover:bg-white/20'>
                <Trash2 className='w-4 h-4' />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirmingDelete(false);
                }}
                className='ml-1 rounded border-l border-white/20 p-1.5 pl-3 transition-colors hover:bg-white/20'>
                <X className='w-4 h-4' />
              </button>
            </motion.div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmingDelete(true);
              }}
              className='rounded border border-border-primary bg-theme-secondary p-2.5 text-text-secondary opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100'>
              <Trash2 className='w-4.5 h-4.5' />
            </button>
          )}
        </AnimatePresence>
      </div>

      <div className='p-4 sm:p-6'>
        <div className='flex justify-between items-start mb-5 pr-10'>
          <div>
            <h3 className='font-display text-lg sm:text-xl font-bold leading-tight text-text-primary'>
              {audit.productName}
            </h3>
            <p className='text-[9px] sm:text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-2'>
              {audit.id ? audit.id.slice(0, 8) : 'NEW'} |{' '}
              {new Date(audit.createdAt).toLocaleDateString()}
            </p>
            <p className='mt-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
              {formatRegionLabel(audit.region)}
            </p>
          </div>
          <div className='flex flex-col items-end gap-2'>
            <div
              className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                hasDiscrepancy
                  ? 'border-red-500/20 bg-red-500/10 text-red-500'
                  : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
              }`}>
              {hasDiscrepancy ? 'High Risk' : 'Compliant'}
            </div>
            {audit.complianceScore !== undefined && (
              <div className='rounded border border-border-primary bg-theme-secondary px-2 py-0.5 text-[9px] font-bold text-text-secondary'>
                Score: {audit.complianceScore}/100
              </div>
            )}
          </div>
        </div>

        <div className='space-y-3 mb-8'>
          {audit.findings.slice(0, 2).map((finding, idx) => (
            <div
              key={idx}
              className='flex gap-3 rounded border border-border-primary bg-theme-secondary p-3 transition-all hover:border-amber-500/40'>
              {finding.status === 'discrepancy' ? (
                <AlertTriangle className='w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5' />
              ) : (
                <CheckCircle className='w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5' />
              )}
              <div>
                <p className='mb-1 text-sm font-bold leading-tight text-text-primary'>
                  {finding.claim}
                </p>
                <p className='text-[9px] text-text-secondary line-clamp-1 italic font-medium'>
                  {finding.reasoning}
                </p>
              </div>
            </div>
          ))}
          {audit.findings.length > 2 && (
            <p className='mt-4 pl-2 text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]'>
              +{audit.findings.length - 2} more findings detected
            </p>
          )}
        </div>

        <div className='flex items-center justify-between pt-5 border-t border-border-primary'>
          <div className='flex items-center gap-2'>
            {audit.twinMismatches && audit.twinMismatches.length > 0 && (
              <div className='flex h-8 w-8 items-center justify-center rounded border border-border-primary bg-blue-500/10'>
                <Search className='w-4 h-4 text-blue-500' />
              </div>
            )}
            {audit.shelfLife && (
              <div className='flex h-8 w-8 items-center justify-center rounded border border-border-primary bg-emerald-500/10'>
                <Shield className='w-4 h-4 text-emerald-500' />
              </div>
            )}
          </div>
          <button
            onClick={() => onViewReport(audit)}
            className='flex items-center gap-1 rounded px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)] transition-all hover:gap-2 hover:bg-accent-primary-soft'>
            View Full Report{' '}
            <ChevronRight className='w-4 h-4 transition-transform group-hover/btn:translate-x-1' />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
