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
    <>
      <div className='mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-text-primary tracking-tight leading-none'>
            Expert Ledger
          </h2>
          <p className='mt-2 text-sm font-medium italic text-text-secondary'>
            Manage your statutory compliance reports.
          </p>
        </div>
        <div className='flex w-full flex-wrap items-center gap-2 rounded-xl border border-border-primary bg-theme-primary p-1 shadow-sm md:w-auto'>
          <button
            onClick={() => onSetFilter('all')}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-theme-secondary text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}>
            All Records
          </button>
          <button
            onClick={() => onSetFilter('high-risk')}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
              filter === 'high-risk'
                ? 'bg-red-50 dark:bg-red-900/40 text-red-600'
                : 'text-text-secondary hover:text-text-primary'
            }`}>
            High Risk
          </button>
        </div>
      </div>

      <div className='mb-8 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]'>
        <label className='flex items-center gap-3 rounded-[1.5rem] border border-border-primary bg-theme-primary px-4 py-4 shadow-sm'>
          <Search className='h-4 w-4 text-text-secondary' />
          <input
            value={searchQuery}
            onChange={(event) => onSetSearchQuery(event.target.value)}
            placeholder='Search product names, regions, risks, or findings'
            className='w-full bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary'
          />
        </label>
        <label className='flex items-center gap-3 rounded-[1.5rem] border border-border-primary bg-theme-primary px-4 py-4 shadow-sm'>
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
        <div className='rounded-[2.5rem] border-2 border-dashed border-gray-100 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-800/30 sm:p-16'>
          <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-900/20'>
            <Clock className='h-8 w-8 text-indigo-400 dark:text-indigo-600' />
          </div>
          <h3 className='mb-2 text-xl font-bold uppercase tracking-tight text-gray-900 dark:text-white'>
            {searchQuery.trim()
              ? 'No Matching Audits Found'
              : filter === 'all'
                ? 'Statutory Ledger Empty'
                : 'No Critical Deviations Found'}
          </h3>
          <p className='mx-auto mb-10 max-w-sm font-medium text-gray-500 dark:text-gray-400'>
            {searchQuery.trim()
              ? 'Try a broader keyword, switch the risk filter, or sort by a different signal.'
              : 'Your compliance history is clear. Ready to initiate a new statutory verification?'}
          </p>
          {!searchQuery.trim() && (
            <button
              onClick={onStartAudit}
              className='inline-flex items-center gap-3 rounded-2xl bg-indigo-600 px-10 py-5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98] dark:shadow-none'>
              Initiate Audit
            </button>
          )}
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
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
    </>
  );
}
