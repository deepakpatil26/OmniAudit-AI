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
    <div className='mb-12 grid grid-cols-1 gap-6 md:grid-cols-3'>
      <div className='rounded-[2rem] border border-border-primary bg-theme-primary p-6 shadow-sm'>
        <div className='flex items-center gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'>
            <TrendingDown className='w-6 h-6' />
          </div>
          <div>
            <div className='text-xs font-bold uppercase tracking-widest text-text-secondary'>
              Risk detections
            </div>
            <div className='mt-1 text-3xl font-bold leading-none text-text-primary'>
              {stats.highRiskCount}
            </div>
          </div>
        </div>
      </div>

      <div className='rounded-[2rem] border border-border-primary bg-theme-primary p-6 shadow-sm'>
        <div className='flex items-center gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'>
            <ShieldCheck className='w-6 h-6' />
          </div>
          <div>
            <div className='text-xs font-bold uppercase tracking-widest text-text-secondary'>
              Integrity Score
            </div>
            <div className='mt-1 text-3xl font-bold leading-none text-text-primary'>
              {stats.avgScore}%
            </div>
          </div>
        </div>
      </div>

      <div className='rounded-[2rem] border border-border-primary bg-theme-primary p-6 shadow-sm'>
        <div className='flex items-center gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'>
            <Globe className='w-6 h-6' />
          </div>
          <div>
            <div className='text-xs font-bold uppercase tracking-widest text-text-secondary'>
              Market Coverage
            </div>
            <div className='mt-1 text-3xl font-bold leading-none text-text-primary'>
              {stats.regions} Regions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
