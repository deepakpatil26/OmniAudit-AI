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
    <header className='sticky top-0 z-50 border-b border-border-primary bg-theme-secondary/95 backdrop-blur-md transition-colors duration-300'>
      <div className='mx-auto max-w-7xl px-2 py-2 sm:px-6 sm:py-3 lg:px-8'>
        <div className='flex items-center justify-between gap-2 sm:gap-3'>
          <div className='flex min-w-0 items-center gap-2 sm:gap-8'>
            <button
              type='button'
              className='group flex min-w-0 items-center gap-2 sm:gap-3 text-left'
              onClick={onShowFeatures}>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded border border-border-primary bg-theme-primary transition-transform duration-300 group-hover:scale-[1.03] sm:h-11 sm:w-11'>
                <img
                  src={activeLogo}
                  alt='OmniAudit AI logo'
                  className='h-full w-full rounded object-cover p-0.5'
                />
              </div>
              <div className='hidden flex-col sm:flex'>
                <span className='font-display truncate text-base font-extrabold leading-none text-text-primary sm:text-xl'>
                  OmniAudit AI
                </span>
                <span className='mt-1 text-[9px] font-bold uppercase tracking-widest text-[var(--text-dim)]'>
                  Expert Suite v3.0
                </span>
              </div>
            </button>

            {isLoggedIn && (
              <nav className='hidden items-center gap-1 border-l border-border-primary md:flex'>
                <button
                  onClick={onShowFeatures}
                  className={`flex items-center gap-2 border-l-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    currentView === 'landing'
                      ? 'border-[var(--accent-primary)] bg-accent-primary-soft text-[var(--accent-primary)]'
                      : 'border-transparent text-text-secondary hover:bg-accent-primary-soft hover:text-text-primary'
                  }`}>
                  <Globe className='w-3.5 h-3.5' /> Explore
                </button>
                <button
                  onClick={onShowHistory}
                  className={`flex items-center gap-2 border-l-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    currentView === 'dashboard'
                      ? 'border-[var(--accent-primary)] bg-accent-primary-soft text-[var(--accent-primary)]'
                      : 'border-transparent text-text-secondary hover:bg-accent-primary-soft hover:text-text-primary'
                  }`}>
                  <LayoutDashboard className='w-3.5 h-3.5' /> Ledger
                </button>
              </nav>
            )}
          </div>

          <div className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
            <button
              onClick={onShowLiveConsult}
              className='oa-button-ghost p-1.5 sm:p-2 sm:px-3'>
              <Mic className='w-4 h-4 sm:w-5 sm:h-5' />
              <span className='hidden lg:inline text-[10px] font-bold uppercase tracking-widest'>
                Live Consult
              </span>
            </button>

            <button
              onClick={onShowUploadModal}
              className='oa-button-primary group px-2 py-2 sm:px-5 sm:py-2.5'>
              <Plus className='w-4 h-4 transition-transform group-hover:rotate-90' />
              <span className='hidden sm:inline text-sm'>New Audit</span>
            </button>

            {isLoggedIn && user && (
              <div className='ml-0.5 border-l border-border-primary pl-1.5 sm:ml-2 sm:pl-4'>
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
          <nav className='mt-2 flex items-center gap-1 overflow-x-auto border border-border-primary bg-theme-primary p-0.5 md:hidden'>
            <button
              onClick={onShowFeatures}
              className={`flex shrink-0 items-center gap-1 border-l-2 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all ${
                currentView === 'landing'
                  ? 'border-[var(--accent-primary)] bg-accent-primary-soft text-[var(--accent-primary)]'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}>
              <Globe className='w-3 h-3' />
              <span>Explore</span>
            </button>
            <button
              onClick={onShowHistory}
              className={`flex shrink-0 items-center gap-1 border-l-2 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all ${
                currentView === 'dashboard'
                  ? 'border-[var(--accent-primary)] bg-accent-primary-soft text-[var(--accent-primary)]'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}>
              <LayoutDashboard className='w-3 h-3' />
              <span>Ledger</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
