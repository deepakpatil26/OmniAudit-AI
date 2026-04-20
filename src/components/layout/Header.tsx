import React from 'react';
import { Mic, Plus, Globe, LayoutDashboard } from 'lucide-react';
import { User } from 'firebase/auth';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  onShowLiveConsult: () => void;
  onShowUploadModal: () => void;
  onShowHistory?: () => void;
  onShowFeatures?: () => void;
  onOpenProfile: () => void;
  onOpenUpdates: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
  currentView?:
    | 'landing'
    | 'dashboard'
    | 'auth'
    | 'profile'
    | 'updates'
    | 'settings';
  user: User | null;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  showUpdatePulse?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onShowLiveConsult,
  onShowUploadModal,
  onShowHistory,
  onShowFeatures,
  onOpenProfile,
  onOpenUpdates,
  onOpenSettings,
  onLogout,
  isLoggedIn,
  currentView,
  user,
  isDarkMode,
  onToggleDarkMode,
  showUpdatePulse = true,
}) => {
  const activeLogo = '/light-logo.png';

  return (
    <header className='sticky top-0 z-50 border-b border-border-primary bg-theme-primary/80 backdrop-blur-md transition-colors duration-300'>
      <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-3 sm:gap-8'>
            <button
              type='button'
              className='group flex min-w-0 items-center gap-3 text-left'
              onClick={onShowFeatures}>
              <div className='flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-primary bg-theme-primary shadow-lg shadow-slate-200/40 transition-transform duration-300 group-hover:scale-[1.03] dark:shadow-slate-950/20 sm:h-12 sm:w-12'>
                <img
                  src={activeLogo}
                  alt='OmniAudit AI logo'
                  className='h-full w-full rounded-full object-cover p-0.5'
                />
              </div>
              <div className='flex min-w-0 flex-col'>
                <span className='truncate text-base font-bold leading-none tracking-tighter text-text-primary sm:text-xl'>
                  OmniAudit AI
                </span>
                <span className='mt-1 text-[8px] font-bold uppercase tracking-widest text-indigo-500'>
                  Expert Suite v3.0
                </span>
              </div>
            </button>

            {isLoggedIn && (
              <nav className='hidden md:flex items-center gap-1 rounded-xl border border-border-primary bg-theme-secondary/50 p-1'>
                <button
                  onClick={onShowFeatures}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    currentView === 'landing'
                      ? 'bg-theme-primary text-indigo-600 shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}>
                  <Globe className='w-3.5 h-3.5' /> Explore
                </button>
                <button
                  onClick={onShowHistory}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-theme-primary text-indigo-600 shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}>
                  <LayoutDashboard className='w-3.5 h-3.5' /> Ledger
                </button>
              </nav>
            )}
          </div>

          <div className='flex shrink-0 items-center gap-2 sm:gap-3'>
            <button
              onClick={onShowLiveConsult}
              className='flex items-center gap-2 rounded-xl border border-transparent p-2 text-sm font-bold text-indigo-600 transition-colors hover:border-indigo-100 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/20'>
              <Mic className='w-5 h-5' />
              <span className='hidden lg:inline text-[10px] font-bold uppercase tracking-widest'>
                Live Consult
              </span>
            </button>

            <button
              onClick={onShowUploadModal}
              className='group flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] dark:bg-indigo-600 dark:shadow-none sm:px-5'>
              <Plus className='w-4 h-4 transition-transform group-hover:rotate-90' />
              <span className='hidden sm:inline'>New Audit</span>
            </button>

            {isLoggedIn && user && (
              <div className='ml-1 border-l border-border-primary pl-2 sm:ml-2 sm:pl-4'>
                <UserMenu
                  user={user}
                  onLogout={onLogout}
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={onToggleDarkMode}
                  onOpenProfile={onOpenProfile}
                  onOpenUpdates={onOpenUpdates}
                  onOpenSettings={onOpenSettings}
                  showUpdatePulse={showUpdatePulse}
                />
              </div>
            )}
          </div>
        </div>

        {isLoggedIn && (
          <nav className='mt-3 flex items-center gap-2 overflow-x-auto rounded-2xl border border-border-primary bg-theme-secondary/50 p-1 md:hidden'>
            <button
              onClick={onShowFeatures}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                currentView === 'landing'
                  ? 'bg-theme-primary text-indigo-600 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}>
              <Globe className='w-3.5 h-3.5' /> Explore
            </button>
            <button
              onClick={onShowHistory}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                currentView === 'dashboard'
                  ? 'bg-theme-primary text-indigo-600 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}>
              <LayoutDashboard className='w-3.5 h-3.5' /> Ledger
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};


