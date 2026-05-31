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

export function ProductMemorySection({
  productCount,
  productInsights,
  onOpenProduct,
  onStartReaudit,
}: ProductMemorySectionProps) {
  return (
    <section className='oa-panel px-5 py-6 sm:px-6 sm:py-7 [--accent-line:var(--info)]'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
            <Boxes className='h-4 w-4' />
            Product Memory
          </div>
          <h3 className='font-display mt-3 text-2xl font-bold text-text-primary'>
            Products OmniAudit remembers
          </h3>
          <p className='mt-2 max-w-2xl text-sm font-medium text-text-secondary'>
            Repeat products now surface reminder timing, change intelligence,
            and a focused detail workspace for daily compliance review.
          </p>
        </div>
        <div className='oa-chip py-3 text-text-primary'>
          {productCount} saved product{productCount === 1 ? '' : 's'}
        </div>
      </div>

      {productInsights.length === 0 ? (
        <div className='mt-6 rounded border border-dashed border-border-primary bg-theme-primary px-6 py-12 text-center'>
          <div className='mx-auto flex h-14 w-14 items-center justify-center rounded border border-border-primary bg-blue-500/10 text-blue-500'>
            <Boxes className='h-7 w-7' />
          </div>
          <h4 className='font-display mt-4 text-lg font-bold text-text-primary'>
            Product memory will appear here
          </h4>
          <p className='mt-2 text-sm font-medium text-text-secondary'>
            Run repeat audits for the same products and OmniAudit will start
            surfacing change history and review reminders here.
          </p>
        </div>
      ) : (
        <div className='mt-6 grid grid-cols-1 gap-3 xl:grid-cols-2'>
          {productInsights.map((insight) => (
            <button
              key={insight.profile.id || insight.profile.productKey}
              type='button'
              onClick={() => onOpenProduct(insight)}
              className='rounded border border-border-primary bg-theme-primary p-5 text-left transition-colors hover:border-amber-500/50 hover:bg-accent-primary-soft'>
              <div className='flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between'>
                <div className='min-w-0'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <p className='oa-label'>
                      {insight.profile.region} market memory
                    </p>
                    <span
                      className={`rounded px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${getReminderClasses(insight.reminderState)}`}>
                      {insight.reminderLabel}
                    </span>
                    <span className='oa-chip'>
                      {insight.profile.productStatus}
                    </span>
                  </div>
                  <h4 className='font-display mt-2 text-lg font-bold leading-tight text-text-primary'>
                    {insight.profile.productName}
                  </h4>
                  <p className='mt-2 text-sm font-medium leading-relaxed text-text-secondary'>
                    {insight.profile.latestRiskSummary}
                  </p>

                  <div className='mt-5 rounded border border-border-primary bg-theme-secondary px-4 py-4'>
                    <div className='oa-label'>
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
                  </div>

                  <div className='mt-5 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest'>
                    <span className='oa-chip'>
                      {insight.profile.auditCount} audits
                    </span>
                    <span className='oa-chip'>
                      {insight.profile.openFindingsCount} open findings
                    </span>
                    <span className='oa-chip'>
                      {insight.openActionCount} open actions
                    </span>
                  </div>

                  <div className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div className='rounded border border-border-primary bg-theme-secondary px-4 py-3'>
                      <div className='oa-label'>
                        Score trend
                      </div>
                      <div className='mt-2 flex items-center gap-2 text-sm font-bold text-text-primary'>
                        <TrendingUp className='h-4 w-4 text-[var(--accent-primary)]' />
                        {insight.scoreDelta === null
                          ? 'Awaiting comparison audit'
                          : `${insight.scoreDelta > 0 ? '+' : ''}${insight.scoreDelta} vs previous`}
                      </div>
                    </div>
                    <div className='rounded border border-border-primary bg-theme-secondary px-4 py-3'>
                      <div className='oa-label'>
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
                    className='oa-button-ghost'>
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

