import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User as UserIcon, Settings, Moon, Sun, ShieldCheck, ChevronDown, Bell } from 'lucide-react';
import { User } from 'firebase/auth';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onLogout,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className='relative' ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 p-1 pl-3 pr-2 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600 group'>
        <div className='flex flex-col items-end mr-1 text-right'>
          <span className='text-[10px] font-bold text-text-primary uppercase tracking-tighter leading-none'>
            {user.displayName?.split(' ')[0] || 'Expert'}
          </span>
          <span className='text-[8px] font-bold text-indigo-500 uppercase tracking-widest mt-1'>Suite Pro</span>
        </div>
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className='w-8 h-8 rounded-xl border-2 border-indigo-500/20 group-hover:rotate-6 transition-transform'
          />
        ) : (
          <div className='w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold'>
            {user.displayName?.charAt(0) || 'U'}
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className='absolute top-full right-0 mt-3 w-64 bg-theme-primary border border-border-primary rounded-[2.5rem] shadow-2xl shadow-indigo-950/10 z-50 overflow-hidden'>

            {/* Header info */}
            <div className='p-5 border-b border-border-primary bg-theme-secondary/50'>
              <div className='text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1'>Certified Auditor</div>
              <div className='text-sm font-bold text-text-primary truncate'>{user.email}</div>
            </div>

            <div className='p-2'>
              <button
                className='w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group'>
                <div className='flex items-center gap-3'>
                  <UserIcon className='w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors' />
                  Profile Suite
                </div>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDarkMode();
                }}
                className='w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group'>
                <div className='flex items-center gap-3'>
                  {isDarkMode ? (
                    <>
                      <Sun className='w-4 h-4 text-amber-500' />
                      Light Protocol
                    </>
                  ) : (
                    <>
                      <Moon className='w-4 h-4 text-indigo-500' />
                      Dark Protocol
                    </>
                  )}
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </button>

              <button
                className='w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group'>
                <div className='flex items-center gap-3'>
                  <ShieldCheck className='w-4 h-4 text-emerald-500' />
                  Statutory Updates
                </div>
                <Bell className='w-3 h-3 text-amber-500 animate-pulse' />
              </button>

              <button
                className='w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group'>
                <div className='flex items-center gap-3'>
                  <Settings className='w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors' />
                  Suite Settings
                </div>
              </button>
            </div>

            <div className='p-2 bg-theme-secondary/50 border-t border-border-primary'>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className='w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all group'>
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
