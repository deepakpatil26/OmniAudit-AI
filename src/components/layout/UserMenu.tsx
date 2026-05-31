import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  User as UserIcon,
  Settings,
  Moon,
  Sun,
  ShieldCheck,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenProfile: () => void;
  onOpenUpdates: () => void;
  onOpenSettings: () => void;
  showUpdatePulse?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  onOpenProfile,
  onOpenUpdates,
  onOpenSettings,
  showUpdatePulse = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonId = 'user-menu-toggle';
  const menuId = 'user-menu-dropdown';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div
      className='relative'
      ref={menuRef}>
      <button
        id={buttonId}
        type='button'
        aria-haspopup='menu'
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close user menu' : 'Open user menu'}
        onClick={() => setIsOpen(!isOpen)}
        className='group flex items-center gap-2 rounded border border-border-primary bg-theme-primary p-1 pl-2 pr-2 transition-all hover:border-amber-500/50 hover:bg-accent-primary-soft sm:pl-3'>
        <div className='hidden sm:flex flex-col items-end mr-1 text-right'>
          <span className='text-[10px] font-bold uppercase leading-none tracking-widest text-text-primary'>
            {user.displayName?.split(' ')[0] || 'Expert'}
          </span>
          <span className='mt-1 text-[8px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
            Suite Pro
          </span>
        </div>
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className='h-8 w-8 rounded border border-amber-500/30 transition-transform group-hover:rotate-6'
          />
        ) : (
          <div className='flex h-8 w-8 items-center justify-center rounded bg-[var(--accent-primary)] text-xs font-bold text-black'>
            {user.displayName?.charAt(0) || 'U'}
          </div>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={menuId}
            role='menu'
            aria-labelledby={buttonId}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className='absolute right-0 top-full z-50 mt-3 w-[min(16rem,calc(100vw-1rem))] overflow-hidden rounded border border-border-primary bg-theme-primary shadow-2xl shadow-black/30'>
            {/* Header info */}
            <div className='border-b border-border-primary bg-theme-secondary p-5'>
              <div className='mb-1 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)]'>
                Certified Auditor
              </div>
              <div className='text-sm font-bold text-text-primary truncate'>
                {user.email}
              </div>
            </div>

            <div className='p-2'>
              <button
                type='button'
                role='menuitem'
                onClick={() => {
                  setIsOpen(false);
                  onOpenProfile();
                }}
                className='group flex w-full items-center justify-between rounded px-4 py-3 text-sm font-bold text-text-secondary transition-colors hover:bg-accent-primary-soft hover:text-text-primary'>
                <div className='flex items-center gap-3'>
                  <UserIcon className='w-4 h-4 text-text-secondary transition-colors group-hover:text-[var(--accent-primary)]' />
                  Profile Suite
                </div>
              </button>

              <button
                type='button'
                role='menuitemcheckbox'
                aria-checked={isDarkMode}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDarkMode();
                }}
                className='group flex w-full items-center justify-between rounded px-4 py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-accent-primary-soft hover:text-text-primary'>
                <div className='flex items-center gap-3'>
                  {isDarkMode ? (
                    <>
                      <Sun className='w-4 h-4 text-amber-500' />
                      Light Protocol
                    </>
                  ) : (
                    <>
                      <Moon className='w-4 h-4 text-[var(--accent-primary)]' />
                      Dark Protocol
                    </>
                  )}
                </div>
                <div
                  className={`relative h-4 w-8 rounded transition-colors ${isDarkMode ? 'bg-[var(--accent-primary)]' : 'bg-gray-700'}`}>
                  <div
                    className={`absolute top-1 h-2 w-2 rounded bg-black transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </div>
              </button>

              <button
                type='button'
                role='menuitem'
                onClick={() => {
                  setIsOpen(false);
                  onOpenUpdates();
                }}
                className='group flex w-full items-center justify-between rounded px-4 py-3 text-sm font-bold text-text-secondary transition-colors hover:bg-accent-primary-soft hover:text-text-primary'>
                <div className='flex items-center gap-3'>
                  <ShieldCheck className='w-4 h-4 text-emerald-500' />
                  Statutory Updates
                </div>
                {showUpdatePulse ? (
                  <Bell className='w-3 h-3 text-amber-500 animate-pulse' />
                ) : (
                  <Bell className='w-3 h-3 text-gray-400' />
                )}
              </button>

              <button
                type='button'
                role='menuitem'
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className='group flex w-full items-center justify-between rounded px-4 py-3 text-sm font-bold text-text-secondary transition-colors hover:bg-accent-primary-soft hover:text-text-primary'>
                <div className='flex items-center gap-3'>
                  <Settings className='w-4 h-4 text-text-secondary transition-colors group-hover:text-amber-500' />
                  Suite Settings
                </div>
              </button>
            </div>

            <div className='border-t border-border-primary bg-theme-secondary p-2'>
              <button
                type='button'
                role='menuitem'
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className='group flex w-full items-center gap-3 rounded px-4 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-500/10'>
                <LogOut className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
                Terminate Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
