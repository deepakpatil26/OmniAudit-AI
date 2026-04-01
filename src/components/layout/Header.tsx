import React from 'react';
import { Shield, Mic, Plus, Globe, LayoutDashboard } from 'lucide-react';
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
  currentView?: 'landing' | 'dashboard' | 'auth' | 'profile' | 'updates' | 'settings';
  user: User | null;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
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
}) => {
  return (
    <header className='bg-theme-primary/80 dark:bg-theme-primary/80 border-b border-border-primary sticky top-0 z-50 backdrop-blur-md transition-colors duration-300'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between'>
        <div className='flex items-center gap-8'>
          <div 
            className='flex items-center gap-3 cursor-pointer group'
            onClick={onShowFeatures}>
            <div className='w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-100 dark:shadow-indigo-900/40 group-hover:rotate-12 transition-transform'>
              <Shield className='text-white w-6 h-6' />
            </div>
            <div className='flex flex-col'>
               <span className='font-bold text-xl tracking-tighter text-text-primary leading-none'>OmniAudit AI</span>
               <span className='text-[8px] font-bold uppercase tracking-widest text-indigo-500 mt-1'>Expert Suite v3.0</span>
            </div>
          </div>

          {isLoggedIn && (
            <nav className='hidden md:flex items-center gap-1 bg-theme-secondary/50 p-1 rounded-xl border border-border-primary'>
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

        <div className='flex items-center gap-4'>
          <button
            onClick={onShowLiveConsult}
            className='p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors flex items-center gap-2 font-bold text-sm border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800'>
            <Mic className='w-5 h-5' />
            <span className='hidden lg:inline text-[10px] font-bold uppercase tracking-widest'>Live Consult</span>
          </button>
          
          <button
            onClick={onShowUploadModal}
            className='flex items-center gap-2 bg-gray-900 dark:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-xl shadow-gray-200 dark:shadow-none group'>
            <Plus className='w-4 h-4 group-hover:rotate-90 transition-transform' />
            <span className='hidden sm:inline'>New Audit</span>
          </button>

          {isLoggedIn && user && (
            <div className='pl-4 border-l border-border-primary ml-2'>
              <UserMenu 
                user={user} 
                onLogout={onLogout} 
                isDarkMode={isDarkMode} 
                onToggleDarkMode={onToggleDarkMode}
                onOpenProfile={onOpenProfile}
                onOpenUpdates={onOpenUpdates}
                onOpenSettings={onOpenSettings}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
