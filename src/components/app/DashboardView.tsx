import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  History,
  LayoutDashboard,
  Layers3,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { AuditReport, ProductProfile } from '../../types/audit';
import type { ActionTask, ActionStats } from '../../lib/actionCenter';
import type { AuditSort } from '../../types/app';
import type { ProductInsightDetail } from '../../lib/productIntelligence';
import { ActionCenterSection } from '../dashboard/ActionCenterSection';
import { AuditLedgerSection } from '../dashboard/AuditLedgerSection';
import { DashboardStats } from '../dashboard/DashboardStats';
import { ProductMemorySection } from '../dashboard/ProductMemorySection';
import { ProductDetailDrawer } from '../dashboard/ProductDetailDrawer';

interface DashboardViewProps {
  user: User | null;
  audits: AuditReport[];
  productProfiles: ProductProfile[];
  filteredAudits: AuditReport[];
  stats: {
    highRiskCount: number;
    avgScore: number;
    regions: number;
  };
  actionTasks: ActionTask[];
  actionStats: ActionStats;
  groupedActionTasks: {
    critical: ActionTask[];
    advisory: ActionTask[];
  };
  productInsights: ProductInsightDetail[];
  selectedProduct: ProductInsightDetail | null;
  onSelectProduct: (product: ProductInsightDetail | null) => void;
  onSelectAudit: (audit: AuditReport) => void;
  onOpenAuditById: (auditId: string) => void;
  onStartAuditClick: () => void;
  onStartReaudit: (task: ActionTask) => void;
  onStartProductReaudit: (productInsight: ProductInsightDetail) => void;
  onResolveTask: (actionId: string) => void;
  onUpdateProductCadence: (
    insight: ProductInsightDetail,
    cadenceDays: number,
  ) => Promise<void>;
  onMarkProductReviewed: (insight: ProductInsightDetail) => Promise<void>;
  setAuditPendingDelete: (audit: AuditReport | null) => void;
  filter: 'all' | 'high-risk';
  searchQuery: string;
  sortBy: AuditSort;
  ledgerTab: 'overview' | 'actions' | 'products' | 'records';
  setFilter: React.Dispatch<React.SetStateAction<'all' | 'high-risk'>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSortBy: React.Dispatch<React.SetStateAction<AuditSort>>;
  setLedgerTab: React.Dispatch<
    React.SetStateAction<'overview' | 'actions' | 'products' | 'records'>
  >;
}

export function DashboardView({
  user,
  audits,
  productProfiles,
  filteredAudits,
  stats,
  actionTasks,
  actionStats,
  groupedActionTasks,
  productInsights,
  selectedProduct,
  onSelectProduct,
  onSelectAudit,
  onOpenAuditById,
  onStartAuditClick,
  onStartReaudit,
  onStartProductReaudit,
  onResolveTask,
  onUpdateProductCadence,
  onMarkProductReviewed,
  setAuditPendingDelete,
  filter,
  searchQuery,
  sortBy,
  ledgerTab,
  setFilter,
  setSearchQuery,
  setSortBy,
  setLedgerTab,
}: DashboardViewProps) {
  const topAction = actionTasks[0];
  const topProduct = productInsights[0];
  const latestAudit = audits[0];

  return (
    <motion.main
      key='dashboard'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='mx-auto max-w-7xl px-3 pt-4 pb-28 sm:px-6 sm:pt-6 sm:pb-28 lg:px-8 lg:pt-8'>
      <div className='space-y-3 sm:space-y-5 lg:space-y-6'>
        <section className='oa-panel px-4 py-4 sm:px-6 sm:py-5'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-5'>
            <div className='max-w-3xl min-w-0'>
              <div className='flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                <Layers3 className='h-4 w-4 shrink-0' />
                <span className='break-words'>Ledger workspace</span>
              </div>
              <h1 className='font-display mt-2 text-2xl font-extrabold text-text-primary sm:mt-3 sm:text-[2.2rem]'>
                Your compliance command center
              </h1>
              <p className='mt-2 max-w-2xl text-xs sm:text-sm font-medium leading-relaxed text-text-secondary'>
                Ledger is now split into focused workspaces. Start with the
                overview, then jump into actions, products, or audit records
                without scrolling through everything at once.
              </p>
            </div>
            <div className='grid grid-cols-2 gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-text-secondary sm:flex sm:flex-wrap sm:shrink-0'>
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'actions', label: 'Actions', icon: AlertTriangle },
                { id: 'products', label: 'Products', icon: Boxes },
                { id: 'records', label: 'Records', icon: History },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type='button'
                  onClick={() => setLedgerTab(id as any)}
                  className={`flex items-center gap-1.5 sm:gap-2 rounded border-l-2 px-2.5 sm:px-3 py-1.5 sm:py-2 transition-colors text-[9px] sm:text-[10px] ${
                    ledgerTab === id
                      ? 'border-[var(--accent-primary)] bg-accent-primary-soft text-[var(--accent-primary)]'
                      : 'border-transparent text-text-secondary hover:bg-accent-primary-soft hover:text-text-primary'
                  }`}>
                  <Icon className='h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0' />
                  <span className='hidden xs:inline'>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {ledgerTab === 'overview' && (
          <div className='space-y-3 sm:space-y-5'>
            <DashboardStats stats={stats} />
            <section className='oa-panel p-4 sm:p-6'>
              <div className='mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between'>
                <div>
                  <div className='flex items-center gap-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                    <LayoutDashboard className='h-4 w-4 shrink-0' />
                    <span>Overview</span>
                  </div>
                  <h2 className='font-display mt-2 text-xl sm:mt-3 sm:text-2xl font-bold text-text-primary'>
                    Pick the workstream you need
                  </h2>
                </div>
                <button
                  type='button'
                  onClick={onStartAuditClick}
                  className='oa-button-primary'>
                  New audit
                </button>
              </div>

              <div className='grid grid-cols-1 gap-2.5 sm:gap-3 lg:grid-cols-3'>
                <OverviewCard
                  label='Action queue'
                  title={
                    topAction ? topAction.title : 'No open actions right now'
                  }
                  description={
                    topAction
                      ? topAction.description
                      : 'Critical and advisory workflow tasks will appear here when audits need attention.'
                  }
                  meta={`${actionTasks.length} open / ${actionStats.resolved} resolved`}
                  icon={AlertTriangle}
                  accentClass='bg-red-500/10 text-red-500'
                  onOpen={() => setLedgerTab('actions')}
                />
                <OverviewCard
                  label='Product memory'
                  title={
                    topProduct
                      ? topProduct.profile.productName
                      : 'No product memory yet'
                  }
                  description={
                    topProduct
                      ? topProduct.changeSummary
                      : 'Repeat audits will create product-level timelines, reminders, and change intelligence.'
                  }
                  meta={`${productProfiles.length} saved product${productProfiles.length === 1 ? '' : 's'}`}
                  icon={Boxes}
                  accentClass='bg-blue-500/10 text-blue-500'
                  onOpen={() => setLedgerTab('products')}
                />
                <OverviewCard
                  label='Audit records'
                  title={
                    latestAudit
                      ? latestAudit.productName
                      : 'No audits recorded yet'
                  }
                  description={
                    latestAudit
                      ? latestAudit.riskSummary
                      : 'Run your first audit to build a searchable statutory ledger.'
                  }
                  meta={`${audits.length} total record${audits.length === 1 ? '' : 's'}`}
                  icon={History}
                  accentClass='bg-emerald-500/10 text-emerald-500'
                  onOpen={() => setLedgerTab('records')}
                />
              </div>
            </section>
          </div>
        )}

        {ledgerTab === 'actions' && (
          <ActionCenterSection
            actionTasks={actionTasks}
            actionStats={actionStats}
            groupedActionTasks={groupedActionTasks}
            onOpenReport={onSelectAudit}
            onStartReaudit={onStartReaudit}
            onResolveTask={onResolveTask}
          />
        )}

        {ledgerTab === 'products' && (
          <ProductMemorySection
            productCount={productProfiles.length}
            productInsights={productInsights}
            onOpenProduct={onSelectProduct}
            onStartReaudit={onStartProductReaudit}
          />
        )}

        {ledgerTab === 'records' && (
          <AuditLedgerSection
            filter={filter}
            searchQuery={searchQuery}
            sortBy={sortBy}
            filteredAudits={filteredAudits}
            onSetFilter={setFilter}
            onSetSearchQuery={setSearchQuery}
            onSetSortBy={setSortBy}
            onStartAudit={onStartAuditClick}
            onViewReport={onSelectAudit}
            onDeleteAudit={setAuditPendingDelete}
          />
        )}
      </div>

      <ProductDetailDrawer
        insight={selectedProduct}
        onClose={() => onSelectProduct(null)}
        onOpenAudit={onOpenAuditById}
        onStartReaudit={onStartProductReaudit}
        onUpdateCadence={onUpdateProductCadence}
        onMarkReviewed={onMarkProductReviewed}
      />
    </motion.main>
  );
}

interface OverviewCardProps {
  label: string;
  title: string;
  description: string;
  meta: string;
  icon: React.ElementType;
  accentClass: string;
  onOpen: () => void;
}

function OverviewCard({
  label,
  title,
  description,
  meta,
  icon: Icon,
  accentClass,
  onOpen,
}: OverviewCardProps) {
  return (
    <button
      type='button'
      onClick={onOpen}
      className='group rounded border border-border-primary bg-theme-primary p-4 sm:p-5 text-left transition-colors hover:border-amber-500/50 hover:bg-accent-primary-soft'>
      <div className='flex items-start justify-between gap-3 sm:gap-4'>
        <div className='min-w-0'>
          <div className='oa-label text-[8px] sm:text-[9px]'>{label}</div>
          <h3 className='font-display mt-2 sm:mt-3 text-base sm:text-xl font-bold leading-tight text-text-primary'>
            {title}
          </h3>
          <p className='mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium leading-relaxed text-text-secondary'>
            {description}
          </p>
        </div>
        <div
          className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded border border-border-primary ${accentClass}`}>
          <Icon className='h-4 w-4 sm:h-5 sm:w-5' />
        </div>
      </div>
      <div className='mt-3 sm:mt-5 flex items-center justify-between gap-2 sm:gap-4 border-t border-border-primary pt-3 sm:pt-4'>
        <span className='text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-text-secondary truncate'>
          {meta}
        </span>
        <span className='flex items-center gap-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)] shrink-0'>
          <span className='hidden sm:inline'>Open</span>{' '}
          <ArrowRight className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
        </span>
      </div>
    </button>
  );
}
