import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarClock,
  ChevronRight,
  Clock3,
  Globe,
  Layers3,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  ProductInsightDetail,
  REVIEW_CADENCE_OPTIONS,
} from '../../lib/productIntelligence';

interface ProductDetailDrawerProps {
  insight: ProductInsightDetail | null;
  onClose: () => void;
  onOpenAudit: (auditId: string) => void;
  onStartReaudit: (insight: ProductInsightDetail) => void;
  onUpdateCadence: (insight: ProductInsightDetail, cadenceDays: number) => void;
  onMarkReviewed: (insight: ProductInsightDetail) => void;
}

function getReminderClasses(reminderState: ProductInsightDetail['reminderState']) {
  switch (reminderState) {
    case 'overdue':
      return 'bg-red-500/10 text-red-500';
    case 'due-today':
      return 'bg-red-500/10 text-red-500';
    case 'due-this-week':
      return 'bg-amber-500/10 text-amber-500';
    case 'on-track':
    default:
      return 'bg-emerald-500/10 text-emerald-500';
  }
}

export function ProductDetailDrawer({
  insight,
  onClose,
  onOpenAudit,
  onStartReaudit,
  onUpdateCadence,
  onMarkReviewed,
}: ProductDetailDrawerProps) {
  return (
    <AnimatePresence>
      {insight && (
        <div className='fixed inset-0 z-[70]'>
          <motion.button
            type='button'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='absolute inset-0 bg-slate-950/55 backdrop-blur-sm'
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className='absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col overflow-hidden border-l border-border-primary bg-theme-primary shadow-2xl'>
            <div className='flex items-start justify-between gap-4 border-b border-border-primary px-4 py-4 sm:px-6'>
              <div>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                    Product Workspace
                  </span>
                  <span
                    className={`rounded px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${getReminderClasses(insight.reminderState)}`}>
                    {insight.reminderLabel}
                  </span>
                </div>
                <h3 className='font-display mt-3 text-2xl font-bold text-text-primary'>
                  {insight.profile.productName}
                </h3>
                <p className='mt-2 text-sm font-medium text-text-secondary'>
                  {insight.profile.latestRiskSummary}
                </p>
              </div>
              <button
                type='button'
                onClick={onClose}
                className='rounded p-2 text-text-secondary transition-colors hover:bg-accent-primary-soft hover:text-text-primary'>
                <X className='h-5 w-5' />
              </button>
            </div>

            <div className='flex-1 overflow-y-auto px-4 py-5 sm:px-6'>
              <div className='space-y-6'>
                <section className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div className='rounded border border-border-primary bg-theme-secondary p-4'>
                    <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                      Latest score
                    </div>
                    <div className='font-display mt-2 text-3xl font-bold text-text-primary'>
                      {insight.latestAudit?.complianceScore ?? insight.profile.lastComplianceScore}
                    </div>
                    <div className='mt-2 text-sm font-medium text-text-secondary'>
                      {insight.scoreDelta === null
                        ? 'Awaiting second audit for delta'
                        : `${insight.scoreDelta > 0 ? '+' : ''}${insight.scoreDelta} vs previous audit`}
                    </div>
                  </div>
                  <div className='rounded border border-border-primary bg-theme-secondary p-4'>
                    <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                      Open work
                    </div>
                    <div className='font-display mt-2 text-3xl font-bold text-text-primary'>
                      {insight.openActionCount}
                    </div>
                    <div className='mt-2 text-sm font-medium text-text-secondary'>
                      {insight.profile.openFindingsCount} open findings across this product.
                    </div>
                  </div>
                </section>

                <section className='rounded border border-border-primary bg-theme-secondary p-5'>
                  <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                      <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                        <CalendarClock className='h-4 w-4 text-[var(--accent-primary)]' />
                        Review cadence
                      </div>
                      <p className='mt-2 text-sm font-medium text-text-secondary'>
                        Next review: {new Date(insight.profile.nextReviewAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => onMarkReviewed(insight)}
                      className='oa-button-ghost'>
                      Mark reviewed today
                    </button>
                  </div>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {REVIEW_CADENCE_OPTIONS.map((cadence) => (
                      <button
                        key={cadence}
                        type='button'
                        onClick={() => onUpdateCadence(insight, cadence)}
                        className={`rounded px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                          insight.profile.reviewCadenceDays === cadence
                            ? 'bg-[var(--accent-primary)] text-black'
                            : 'border border-border-primary bg-theme-primary text-text-primary hover:bg-accent-primary-soft'
                        }`}>
                        {cadence} days
                      </button>
                    ))}
                  </div>
                </section>

                <section className='rounded border border-border-primary bg-theme-secondary p-5'>
                  <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                    <ShieldAlert className='h-4 w-4 text-[var(--accent-primary)]' />
                    What changed since last audit
                  </div>
                  <p className='mt-3 text-sm font-semibold text-text-primary'>
                    {insight.changeSummary}
                  </p>
                  <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div className='rounded border border-border-primary bg-theme-primary px-4 py-3'>
                      <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                        Shelf-life
                      </div>
                      <div className='mt-2 text-sm font-medium text-text-primary'>
                        {insight.shelfLifeChange || 'No shelf-life change detected.'}
                      </div>
                    </div>
                    <div className='rounded border border-border-primary bg-theme-primary px-4 py-3'>
                      <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                        Risk summary
                      </div>
                      <div className='mt-2 text-sm font-medium text-text-primary'>
                        {insight.riskSummaryShift}
                      </div>
                    </div>
                  </div>
                  {(insight.newRiskClaims.length > 0 ||
                    insight.resolvedRiskClaims.length > 0 ||
                    insight.changedAttributes.length > 0) && (
                    <div className='mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest'>
                      {insight.newRiskClaims.map((claim) => (
                        <span
                          key={`new-${claim}`}
                          className='rounded bg-red-500/10 px-3 py-1 text-red-500'>
                          New risk: {claim}
                        </span>
                      ))}
                      {insight.resolvedRiskClaims.map((claim) => (
                        <span
                          key={`resolved-${claim}`}
                          className='rounded bg-emerald-500/10 px-3 py-1 text-emerald-500'>
                          Resolved: {claim}
                        </span>
                      ))}
                      {insight.changedAttributes.map((attribute) => (
                        <span
                          key={`attribute-${attribute}`}
                          className='rounded bg-blue-500/10 px-3 py-1 text-blue-500'>
                          Changed: {attribute}
                        </span>
                      ))}
                    </div>
                  )}
                </section>

                <section className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div className='rounded border border-border-primary bg-theme-secondary p-4'>
                    <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                      <Clock3 className='h-4 w-4 text-[var(--accent-primary)]' />
                      Latest shelf-life status
                    </div>
                    <p className='mt-3 text-sm font-semibold text-text-primary'>
                      {insight.latestAudit?.shelfLife?.status || 'Not available'}
                    </p>
                  </div>
                  <div className='rounded border border-border-primary bg-theme-secondary p-4'>
                    <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                      <Layers3 className='h-4 w-4 text-[var(--accent-primary)]' />
                      Twin mismatches
                    </div>
                    <p className='mt-3 text-sm font-semibold text-text-primary'>
                      {insight.latestTwinMismatchAttributes.length > 0
                        ? insight.latestTwinMismatchAttributes.join(', ')
                        : 'No active mismatch attributes'}
                    </p>
                  </div>
                </section>

                <section className='rounded border border-border-primary bg-theme-secondary p-5'>
                  <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                    <Globe className='h-4 w-4 text-[var(--accent-primary)]' />
                    Recent audits
                  </div>
                  <div className='mt-4 space-y-3'>
                    {insight.recentAudits.map((audit) => (
                      <button
                        key={audit.id || audit.createdAt}
                        type='button'
                        onClick={() => audit.id && onOpenAudit(audit.id)}
                        className='flex w-full items-center justify-between rounded border border-border-primary bg-theme-primary px-4 py-4 text-left transition-colors hover:bg-accent-primary-soft'>
                        <div>
                          <p className='text-sm font-bold text-text-primary'>
                            {new Date(audit.createdAt).toLocaleDateString()} | {audit.region}
                          </p>
                          <p className='mt-1 text-sm font-medium text-text-secondary'>
                            {audit.riskSummary}
                          </p>
                        </div>
                        <div className='flex items-center gap-3'>
                          <span className='text-sm font-bold text-text-primary'>
                            {audit.complianceScore}
                          </span>
                          <ChevronRight className='h-4 w-4 text-text-secondary' />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className='border-t border-border-primary px-4 py-4 sm:px-6'>
              <button
                type='button'
                onClick={() => onStartReaudit(insight)}
                className='oa-button-primary w-full px-5 py-3'>
                Re-audit this product
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

