import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { User } from '../../types/user';
import { 
  Plus, 
  Sun, 
  Moon, 
  Shield, 
  BookOpen, 
  Clock, 
  Settings, 
  LayoutDashboard, 
  Code, 
  Menu, 
  X,
  LogIn,
  LogOut,
  UserPlus,
  ChevronDown,
  UserCheck
} from 'lucide-react';

export type NavTab = 'home' | 'dashboard' | 'review' | 'learn' | 'history' | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onNewReviewClick: () => void;
  currentUser: User | null;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogoutClick: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onNewReviewClick,
  currentUser,
  onLoginClick,
  onRegisterClick,
  onLogoutClick,
  theme,
  onToggleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'review', label: 'Review', icon: <Code className="w-4 h-4" /> },
    { id: 'learn', label: 'Learn', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0f1d]/75 backdrop-blur-2xl px-4 lg:px-6 py-2.5 transition-all shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Brand Logo (clickable to Home) */}
        <div 
          onClick={() => onTabChange('home')}
          className="cursor-pointer transition-transform hover:opacity-95"
        >
          <Logo size="md" />
        </div>

        {/* Center: Navigation Links matching Screenshot */}
        <nav className="hidden md:flex items-center space-x-1 bg-dark-900/80 backdrop-blur-xl p-1 rounded-xl border border-white/10 shadow-inner">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/30 text-brand-300 border border-brand-500/50 shadow-sm shadow-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: + New Review & Profile */}
        <div className="hidden sm:flex items-center space-x-3">
          {/* + New Review Button */}
          <button
            onClick={onNewReviewClick}
            className="liquid-btn-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Review</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-dark-800 border border-dark-700/60 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 pl-2.5 pr-2 py-1 rounded-xl hover:bg-dark-850/80 border border-transparent hover:border-dark-700 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center text-white font-bold text-xs ring-2 ring-brand-500/30">
                  {currentUser.avatarInitials}
                </div>
                <div className="flex flex-col text-left leading-tight hidden lg:flex">
                  <span className="text-xs font-semibold text-slate-200">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{currentUser.role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-dark-900 border border-dark-750 rounded-xl shadow-2xl py-1.5 z-50 flex flex-col animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-dark-750 flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white">{currentUser.name}</span>
                    <span className="text-[11px] text-brand-400 font-medium">{currentUser.role}</span>
                    <span className="text-[10px] text-slate-500 font-mono">@{currentUser.username}</span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLoginClick();
                      }}
                      className="w-full px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-dark-800 flex items-center gap-2 text-left transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                      <span>Switch Account / ID</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onRegisterClick();
                      }}
                      className="w-full px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-dark-800 flex items-center gap-2 text-left transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-accent-purple" />
                      <span>Create New Account</span>
                    </button>
                  </div>

                  <div className="border-t border-dark-750 pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogoutClick();
                      }}
                      className="w-full px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 text-left transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-dark-700">
              <button
                onClick={onLoginClick}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-dark-800 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={onRegisterClick}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}

        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onNewReviewClick}
            className="p-1.5 rounded-lg text-white bg-brand-600"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-dark-850"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-3 pb-2 border-t border-dark-700/80 mt-2 space-y-1">
          {currentUser && (
            <div className="p-3 bg-dark-850 rounded-xl mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                  {currentUser.avatarInitials}
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-white">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400">{currentUser.role}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogoutClick();
                }}
                className="text-xs text-rose-400 hover:underline"
              >
                Log Out
              </button>
            </div>
          )}

          {!currentUser && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLoginClick();
                }}
                className="py-2 rounded-lg bg-dark-800 text-xs font-semibold text-slate-200"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRegisterClick();
                }}
                className="py-2 rounded-lg bg-brand-600 text-xs font-semibold text-white"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Theme Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-dark-850 border border-dark-750 mb-2">
            <span className="text-xs font-semibold text-slate-300">Display Theme</span>
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-dark-800 text-slate-200 border border-dark-700"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Night Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Day Mode</span>
                </>
              )}
            </button>
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left ${
                activeTab === item.id ? 'bg-brand-600/20 text-brand-400' : 'text-slate-400 hover:bg-dark-850'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

    </header>
  );
};
