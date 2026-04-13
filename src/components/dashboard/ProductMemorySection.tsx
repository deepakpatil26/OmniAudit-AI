import React from 'react';
import { Boxes, ChevronRight, TrendingUp } from 'lucide-react';
import { ProductInsightDetail } from '../../lib/productIntelligence';

interface ProductMemorySectionProps {
  productCount: number;
  productInsights: ProductInsightDetail[];
  onOpenProduct: (insight: ProductInsightDetail) => void;
  onStartReaudit: (insight: ProductInsightDetail) => void;
}

function getReminderClasses(reminderState: ProductInsightDetail['reminderState']) {
  switch (reminderState) {
    case 'overdue':
      return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
    case 'due-today':
      return 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
    case 'due-this-week':
      return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
    case 'on-track':
    default:
      return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
  }
}

export function ProductMemorySection({
  productCount,
  productInsights,
  onOpenProduct,
  onStartReaudit,
}: ProductMemorySectionProps) {
  return (
    <section className='mb-12 rounded-[2.5rem] border border-border-primary bg-theme-primary p-6 shadow-sm sm:p-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-500'>
            <Boxes className='h-4 w-4' />
            Product Memory
          </div>
          <h3 className='mt-3 text-2xl font-bold tracking-tight text-text-primary'>
            Products OmniAudit remembers
          </h3>
          <p className='mt-2 max-w-2xl text-sm font-medium text-text-secondary'>
            Repeat products now surface reminder timing, change intelligence,
            and a focused detail workspace for daily compliance review.
          </p>
        </div>
        <div className='rounded-2xl border border-border-primary bg-theme-secondary/50 px-4 py-3 text-sm font-semibold text-text-primary'>
          {productCount} saved product{productCount === 1 ? '' : 's'}
        </div>
      </div>

      {productInsights.length === 0 ? (
        <div className='mt-6 rounded-[2rem] border border-dashed border-border-primary bg-theme-secondary/30 px-6 py-10 text-center'>
          <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'>
            <Boxes className='h-7 w-7' />
          </div>
          <h4 className='mt-4 text-lg font-bold text-text-primary'>
            Product memory will appear here
          </h4>
          <p className='mt-2 text-sm font-medium text-text-secondary'>
            Run repeat audits for the same products and OmniAudit will start
            surfacing change history and review reminders here.
          </p>
        </div>
      ) : (
        <div className='mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2'>
          {productInsights.map((insight) => (
            <button
              key={insight.profile.id || insight.profile.productKey}
              type='button'
              onClick={() => onOpenProduct(insight)}
              className='rounded-[1.75rem] border border-border-primary bg-theme-secondary/40 p-5 text-left transition-colors hover:bg-theme-secondary/70'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                <div className='min-w-0'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <p className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                      {insight.profile.region} market memory
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${getReminderClasses(insight.reminderState)}`}>
                      {insight.reminderLabel}
                    </span>
                    <span className='rounded-full border border-border-primary bg-theme-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                      {insight.profile.productStatus}
                    </span>
                  </div>
                  <h4 className='mt-2 text-lg font-bold leading-tight text-text-primary'>
                    {insight.profile.productName}
                  </h4>
                  <p className='mt-2 text-sm font-medium leading-relaxed text-text-secondary'>
                    {insight.profile.latestRiskSummary}
                  </p>

                  <div className='mt-4 rounded-[1.5rem] border border-border-primary bg-theme-primary px-4 py-4'>
                    <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                      What changed
                    </div>
                    <p className='mt-2 text-sm font-semibold leading-relaxed text-text-primary'>
                      {insight.changeSummary}
                    </p>
                    {(insight.newRiskClaims.length > 0 ||
                      insight.resolvedRiskClaims.length > 0 ||
                      insight.changedAttributes.length > 0) && (
                      <div className='mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest'>
                        {insight.newRiskClaims.map((claim) => (
                          <span
                            key={`new-${claim}`}
                            className='rounded-full bg-red-50 px-3 py-1 text-red-600 dark:bg-red-900/20 dark:text-red-400'>
                            New risk: {claim}
                          </span>
                        ))}
                        {insight.resolvedRiskClaims.map((claim) => (
                          <span
                            key={`resolved-${claim}`}
                            className='rounded-full bg-emerald-50 px-3 py-1 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'>
                            Resolved: {claim}
                          </span>
                        ))}
                        {insight.changedAttributes.map((attribute) => (
                          <span
                            key={`attribute-${attribute}`}
                            className='rounded-full bg-indigo-50 px-3 py-1 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'>
                            Changed: {attribute}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className='mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest'>
                    <span className='rounded-full border border-border-primary bg-theme-primary px-3 py-1 text-text-secondary'>
                      {insight.profile.auditCount} audits
                    </span>
                    <span className='rounded-full border border-border-primary bg-theme-primary px-3 py-1 text-text-secondary'>
                      {insight.profile.openFindingsCount} open findings
                    </span>
                    <span className='rounded-full border border-border-primary bg-theme-primary px-3 py-1 text-text-secondary'>
                      {insight.openActionCount} open actions
                    </span>
                  </div>

                  <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div className='rounded-2xl border border-border-primary bg-theme-primary px-4 py-3'>
                      <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                        Score trend
                      </div>
                      <div className='mt-2 flex items-center gap-2 text-sm font-bold text-text-primary'>
                        <TrendingUp className='h-4 w-4 text-indigo-500' />
                        {insight.scoreDelta === null
                          ? 'Awaiting comparison audit'
                          : `${insight.scoreDelta > 0 ? '+' : ''}${insight.scoreDelta} vs previous`}
                      </div>
                    </div>
                    <div className='rounded-2xl border border-border-primary bg-theme-primary px-4 py-3'>
                      <div className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
                        Next review
                      </div>
                      <div className='mt-2 text-sm font-bold text-text-primary'>
                        {new Date(insight.profile.nextReviewAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='flex items-start gap-2 sm:flex-col sm:items-end'>
                  <ChevronRight className='hidden h-5 w-5 text-text-secondary sm:block' />
                  <button
                    type='button'
                    onClick={(event) => {
                      event.stopPropagation();
                      onStartReaudit(insight);
                    }}
                    className='rounded-xl border border-border-primary bg-theme-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-primary transition-colors hover:bg-theme-secondary'>
                    Re-audit
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
