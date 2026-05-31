import React from 'react';
import { ArrowDownUp, Clock, Search } from 'lucide-react';
import { AuditCard } from '../audit/AuditCard';
import { AuditSort } from '../../types/app';
import { AuditReport } from '../../types/audit';

interface AuditLedgerSectionProps {
  filter: 'all' | 'high-risk';
  searchQuery: string;
  sortBy: AuditSort;
  filteredAudits: AuditReport[];
  onSetFilter: (nextFilter: 'all' | 'high-risk') => void;
  onSetSearchQuery: (query: string) => void;
  onSetSortBy: (sortBy: AuditSort) => void;
  onStartAudit: () => void;
  onViewReport: (audit: AuditReport) => void;
  onDeleteAudit: (audit: AuditReport) => void;
}

export function AuditLedgerSection({
  filter,
  searchQuery,
  sortBy,
  filteredAudits,
  onSetFilter,
  onSetSearchQuery,
  onSetSortBy,
  onStartAudit,
  onViewReport,
  onDeleteAudit,
}: AuditLedgerSectionProps) {
  return (
    <section className='oa-panel px-4 py-5 sm:px-6 sm:py-7'>
      <div className='mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
        <div>
          <div className='text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
            Expert Ledger
          </div>
          <h2 className='font-display mt-3 text-xl sm:text-2xl font-bold leading-none text-text-primary'>
            Audit history and review queue
          </h2>
          <p className='mt-2 max-w-2xl text-sm font-medium text-text-secondary'>
            Search past audits, focus on higher-risk records, and reopen reports
            without losing context.
          </p>
        </div>
        <div className='flex w-full flex-wrap items-center gap-1 rounded border border-border-primary bg-theme-secondary p-1 md:w-auto'>
          <button
            onClick={() => onSetFilter('all')}
            className={`rounded px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
              filter === 'all'
                ? 'bg-accent-primary-soft text-[var(--accent-primary)]'
                : 'text-text-secondary hover:text-text-primary'
            }`}>
            All Records
          </button>
          <button
            onClick={() => onSetFilter('high-risk')}
            className={`rounded px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
              filter === 'high-risk'
                ? 'bg-red-500/10 text-red-500'
                : 'text-text-secondary hover:text-text-primary'
            }`}>
            High Risk
          </button>
        </div>
      </div>

      <div className='mb-6 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]'>
        <label className='flex items-center gap-3 rounded border border-border-primary bg-theme-secondary px-3 py-3 sm:px-4 sm:py-4'>
          <Search className='h-4 w-4 text-text-secondary' />
          <input
            value={searchQuery}
            onChange={(event) => onSetSearchQuery(event.target.value)}
            placeholder='Search product names, regions, risks, or findings'
            className='w-full bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary'
          />
        </label>
        <label className='flex items-center gap-3 rounded border border-border-primary bg-theme-secondary px-3 py-3 sm:px-4 sm:py-4'>
          <ArrowDownUp className='h-4 w-4 text-text-secondary' />
          <select
            value={sortBy}
            onChange={(event) => onSetSortBy(event.target.value as AuditSort)}
            className='w-full bg-transparent text-sm font-bold text-text-primary outline-none'>
            <option value='newest'>Newest first</option>
            <option value='oldest'>Oldest first</option>
            <option value='highest-score'>Highest score</option>
            <option value='lowest-score'>Lowest score</option>
          </select>
        </label>
      </div>

      {filteredAudits.length === 0 ? (
        <div className='rounded border border-dashed border-border-primary bg-theme-primary p-6 text-center sm:p-16'>
          <div className='mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded border border-border-primary bg-accent-primary-soft'>
            <Clock className='h-7 w-7 text-[var(--accent-primary)]' />
          </div>
          <h3 className='font-display mb-2 text-lg sm:text-xl font-bold uppercase text-text-primary'>
            {searchQuery.trim()
              ? 'No Matching Audits Found'
              : filter === 'all'
                ? 'Statutory Ledger Empty'
                : 'No Critical Deviations Found'}
          </h3>
          <p className='mx-auto mb-8 max-w-sm font-medium text-text-secondary'>
            {searchQuery.trim()
              ? 'Try a broader keyword, switch the risk filter, or sort by a different signal.'
              : 'Your compliance history is clear. Ready to initiate a new statutory verification?'}
          </p>
          {!searchQuery.trim() && (
            <button
              onClick={onStartAudit}
              className='oa-button-primary px-8 py-4'>
              Initiate Audit
            </button>
          )}
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
          {filteredAudits.map((audit) => (
            <AuditCard
              key={audit.id}
              audit={audit}
              onViewReport={onViewReport}
              onDelete={() => onDeleteAudit(audit)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
