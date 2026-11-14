import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Globe,
  Delete,
  ShieldCheck,
  Building2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { usePos } from '../../context/usePos';

export function LoginView() {
  const {
    login,
    pinLogin,
    isAuthenticated,
    tenants,
    currentTenant,
    setCurrentTenant,
    isUrdu,
    setIsUrdu,
    theme,
    toggleTheme,
  } = usePos();

  const navigate = useNavigate();

  // If already authenticated, redirect to /pos
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/pos', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [authMode, setAuthMode] = useState<'pin' | 'email'>('pin');

  // PIN Form State
  const [pinCode, setPinCode] = useState<string>('');
  const [selectedTenantId, setSelectedTenantId] = useState<number | string>(() => currentTenant.id || '1');

  // Email Form State
  const [email, setEmail] = useState<string>('admin@posify.pk');
  const [password, setPassword] = useState<string>('password');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Status State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Keypad Press for PIN
  const handleKeypadPress = useCallback((val: string) => {
    setErrorMessage(null);
    if (val === 'clear') {
      setPinCode('');
      return;
    }
    if (val === 'backspace') {
      setPinCode((prev) => prev.slice(0, -1));
      return;
    }
    setPinCode((prev) => {
      if (prev.length >= 6) return prev;
      return prev + val;
    });
  }, []);

  // Listen to physical keyboard on PIN screen
  useEffect(() => {
    if (authMode !== 'pin') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeypadPress('backspace');
      } else if (e.key === 'Escape') {
        handleKeypadPress('clear');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authMode, handleKeypadPress]);

  // Handle PIN Submission
  const handlePinSubmit = async (e?: React.FormEvent, overridePin?: string) => {
    if (e) e.preventDefault();
    const pinToUse = overridePin ?? pinCode;
    if (!pinToUse || pinToUse.length < 4) {
      setErrorMessage(isUrdu ? 'براہ کرم کم از کم 4 ہندسوں کا پن کوڈ درج کریں' : 'Please enter at least 4 digits PIN code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await pinLogin(pinToUse, selectedTenantId);
      Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      }).fire({
        icon: 'success',
        title: isUrdu ? 'کیشیئر شفٹ لاگ ان کامیاب!' : 'Cashier Shift Unlocked!',
      });
      navigate('/pos', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid cashier PIN code.';
      setErrorMessage(msg);
      setPinCode('');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email Submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage(isUrdu ? 'ای میل اور پاس ورڈ درج کریں' : 'Please provide email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      }).fire({
        icon: 'success',
        title: isUrdu ? 'خوش آمدید! لاگ ان کامیاب' : 'Welcome back! Signed in successfully.',
      });
      navigate('/pos', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Buttons
  const handleQuickDemoPin = (pin: string) => {
    setPinCode(pin);
    handlePinSubmit(undefined, pin);
  };

  const handleQuickDemoEmail = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
  };

  return (
    <div
      dir={isUrdu ? 'rtl' : 'ltr'}
      className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/30 dark:from-[#080c14] dark:via-[#0b0f19] dark:to-[#131b2e] text-slate-900 dark:text-slate-100 p-3 sm:p-6 transition-colors duration-200 select-none overflow-y-auto"
    >
      {/* Top Header Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-600/30">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-slate-100">
                POS<span className="text-indigo-600 dark:text-indigo-400">ify</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-bold">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Cloud-Local Hybrid Retail POS
            </div>
          </div>
        </div>

        {/* Right Tools (Language + Theme) */}
        <div className="flex items-center gap-2">
          {/* Urdu / English Language Toggle */}
          <button
            onClick={() => setIsUrdu(!isUrdu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{isUrdu ? 'English' : 'اردو'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto my-auto py-4">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-5 transition-all">
          {/* Tenant / Branch Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{isUrdu ? 'اسٹور برانچ منتخب کریں' : 'Store & Branch'}</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">Cloud Synced</span>
            </label>
            <select
              value={selectedTenantId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedTenantId(id);
                const found = tenants.find((t) => t.id === id);
                if (found) setCurrentTenant(found);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.branch})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher Pills */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode('pin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'pin'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'تیز کیشیئر پن' : 'Cashier PIN Code'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('email');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'email'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'مینیجر ای میل' : 'Manager Password'}</span>
            </button>
          </div>

          {/* Error Alert Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mode 1: Cashier PIN Keypad View */}
          {authMode === 'pin' && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isUrdu ? 'شفٹ ان لاک کرنے کے لیے پن درج کریں' : 'Enter your 4 to 6 digit shift PIN to unlock'}
                </div>

                {/* PIN Code Circles */}
                <div className="flex items-center justify-center gap-3 py-2">
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const isFilled = idx < pinCode.length;
                    return (
                      <div
                        key={idx}
                        className={`w-4 h-4 rounded-full transition-all duration-150 ${
                          isFilled
                            ? 'bg-indigo-600 scale-125 shadow-xs shadow-indigo-600/50'
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Touch Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[280px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-lg font-black text-slate-800 dark:text-slate-100 shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                  >
                    {digit}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handleKeypadPress('clear')}
                  className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-rose-600 shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                >
                  C
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-lg font-black text-slate-800 dark:text-slate-100 shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-500 shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                  title="Backspace"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              {/* Unlock Terminal Button */}
              <button
                type="button"
                onClick={() => handlePinSubmit()}
                disabled={isLoading || pinCode.length < 4}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Verifying...' : isUrdu ? 'شفٹ شروع کریں' : 'Unlock Register Shift'}</span>
              </button>

              {/* Quick Demo PIN Chips */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{isUrdu ? 'ڈیمو پن منتخب کریں' : '1-Click Demo Accounts'}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoPin('1234')}
                    className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold hover:bg-indigo-100 cursor-pointer shadow-2xs"
                  >
                    Admin: 1234
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoPin('7788')}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold hover:bg-emerald-100 cursor-pointer shadow-2xs"
                  >
                    Cashier: 7788
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Email & Password View */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {isUrdu ? 'ای میل ایڈریس' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@posify.pk"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {isUrdu ? 'پاس ورڈ' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Signing in...' : isUrdu ? 'لاگ ان کریں' : 'Sign In to Store'}</span>
              </button>

              {/* 1-Click Fill Demo Credentials */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{isUrdu ? 'ڈیمو مینیجر لاگ ان' : '1-Click Fill Credentials'}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoEmail('admin@posify.pk', 'password')}
                    className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold hover:bg-indigo-100 cursor-pointer shadow-2xs"
                  >
                    admin@posify.pk
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoEmail('cashier1@posify.pk', 'password')}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold hover:bg-emerald-100 cursor-pointer shadow-2xs"
                  >
                    cashier1@posify.pk
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer System Disclaimer */}
      <footer className="w-full max-w-5xl mx-auto py-2 text-center text-[11px] text-slate-400 shrink-0">
        POSify Cloud-Local Terminal • Laravel Sanctum Token Authorization • Multi-Tenant Branch Guard
      </footer>
    </div>
  );
}
