import React from 'react';
import { Globe, ShieldCheck, TrendingDown } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    highRiskCount: number;
    avgScore: number;
    regions: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className='grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-3'>
      <div className='oa-panel p-4 sm:p-5 [--accent-line:var(--danger)]'>
        <div className='flex items-center gap-3 sm:gap-4'>
          <div className='flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded border border-border-primary bg-red-500/10 text-red-500 shrink-0'>
            <TrendingDown className='w-5 h-5 sm:w-6 sm:h-6' />
          </div>
          <div className='min-w-0'>
            <div className='oa-label text-[8px] sm:text-[9px]'>
              Risk detections
            </div>
            <div className='font-display mt-1 text-2xl sm:text-3xl font-extrabold leading-none text-text-primary'>
              {stats.highRiskCount}
            </div>
          </div>
        </div>
      </div>

      <div className='oa-panel p-4 sm:p-5 [--accent-line:var(--success)]'>
        <div className='flex items-center gap-3 sm:gap-4'>
          <div className='flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded border border-border-primary bg-emerald-500/10 text-emerald-500 shrink-0'>
            <ShieldCheck className='w-5 h-5 sm:w-6 sm:h-6' />
          </div>
          <div className='min-w-0'>
            <div className='oa-label text-[8px] sm:text-[9px]'>
              Integrity Score
            </div>
            <div className='font-display mt-1 text-2xl sm:text-3xl font-extrabold leading-none text-text-primary'>
              {stats.avgScore}%
            </div>
          </div>
        </div>
      </div>

      <div className='oa-panel p-4 sm:p-5 [--accent-line:var(--info)]'>
        <div className='flex items-center gap-3 sm:gap-4'>
          <div className='flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded border border-border-primary bg-blue-500/10 text-blue-500 shrink-0'>
            <Globe className='w-5 h-5 sm:w-6 sm:h-6' />
          </div>
          <div className='min-w-0'>
            <div className='oa-label text-[8px] sm:text-[9px]'>
              Market Coverage
            </div>
            <div className='font-display mt-1 text-2xl sm:text-3xl font-extrabold leading-none text-text-primary'>
              {stats.regions} Regions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
