import React, { useState } from 'react';
import { User } from '../../types/user';
import { 
  loginUser, 
  registerUser, 
  loadAllUsers, 
  DEFAULT_USERS, 
  getInitials 
} from '../../lib/storage/userStore';
import { 
  X, 
  UserPlus, 
  LogIn, 
  Lock, 
  User as UserIcon, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Junior Developer');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const existingUsers = loadAllUsers();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const res = loginUser(username, password);
    if (res.success && res.user) {
      setSuccessMessage(`Welcome back, ${res.user.name}!`);
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 500);
    } else {
      setErrorMessage(res.error || 'Failed to login');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const res = registerUser({
      username,
      name,
      password,
      role
    });

    if (res.success && res.user) {
      setSuccessMessage(`Account created! Logged in as ${res.user.name}.`);
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 600);
    } else {
      setErrorMessage(res.error || 'Failed to register');
    }
  };

  const handleQuickLogin = (user: User) => {
    setErrorMessage('');
    setUsername(user.username);
    setPassword(user.password || 'password123');
    const res = loginUser(user.username, user.password || 'password123');
    if (res.success && res.user) {
      setSuccessMessage(`Logged in as ${res.user.name}`);
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-dark-900 border border-dark-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-750 bg-dark-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {mode === 'login' ? 'Sign In to TRUSTLENS' : 'Create an Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'login' ? 'Access your reviews and verification score' : 'Join TRUSTLENS to test comprehension'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Log In vs Create Account */}
        <div className="flex border-b border-dark-750 bg-dark-950/60 p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-dark-800 text-white shadow-sm border border-dark-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-dark-800 text-white shadow-sm border border-dark-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 flex flex-col gap-4">
          
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Mode 1: Log In */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-semibold text-slate-300">Username</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. ravi or sarah"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full pl-9 pr-9 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet/90 shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Quick Switch Profiles / 1-Click Login Chips */}
              <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-dark-750 text-left">
                <span className="text-[11px] font-semibold text-slate-400">
                  Or One-Click Test Login:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {existingUsers.slice(0, 4).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u)}
                      className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-750 hover:border-brand-500/40 text-left flex items-center gap-2 transition-all"
                    >
                      <div className="w-6 h-6 rounded-full bg-brand-600/20 text-brand-300 flex items-center justify-center text-[10px] font-bold border border-brand-500/30 flex-shrink-0">
                        {u.avatarInitials}
                      </div>
                      <div className="flex flex-col leading-tight min-w-0">
                        <span className="text-xs font-semibold text-slate-200 truncate">{u.name}</span>
                        <span className="text-[10px] text-slate-400 truncate">{u.role}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            /* Mode 2: Create Account */
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-semibold text-slate-300">Username (Unique ID)</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. dev_sarah or alex99"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  required
                  className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 4 characters)"
                    required
                    className="w-full pl-9 pr-9 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-semibold text-slate-300">Your Role / Profile</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="Student">Student</option>
                  <option value="Junior Developer">Junior Developer</option>
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="Security Lead">Security Lead</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Startup Founder">Startup Founder</option>
                  <option value="Product Manager">Product Manager</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet/90 shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account & Sign In</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
