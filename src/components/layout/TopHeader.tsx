import { useState } from 'react';
import {
  Building2,
  Cloud,
  CloudOff,
  RefreshCw,
  Globe,
  User,
  Keyboard,
  ShieldCheck,
  ChevronDown,
  Menu,
  Sun,
  Moon,
  Store,
} from 'lucide-react';
import { usePos } from '../../context/usePos';

export function TopHeader() {
  const {
    tenants,
    currentTenant,
    setCurrentTenant,
    isOffline,
    setIsOffline,
    pendingSyncCount,
    triggerManualSync,
    isUrdu,
    setIsUrdu,
    theme,
    toggleTheme,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = usePos();

  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showHotkeyModal, setShowHotkeyModal] = useState(false);

  return (
    <>
      <header className="h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-2 sm:px-4 flex items-center justify-between select-none sticky top-0 z-30 shadow-xs transition-colors duration-200">
        {/* Left: Brand / Tenant Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Toggle Navigation Menu"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </button>

          {/* Brand Mark (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 pr-2 border-r border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-xs shadow-indigo-600/30">
              <Store className="w-4 h-4" />
            </div>
            <div className="font-black text-slate-900 dark:text-slate-100 text-sm tracking-tight">
              POS<span className="text-indigo-600 dark:text-indigo-400">IFY</span>
            </div>
          </div>

          {/* Active Tenant / Branch Selector */}
          <div className="relative">
            <button
              onClick={() => setShowTenantDropdown(!showTenantDropdown)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 transition-all text-xs font-semibold cursor-pointer shadow-2xs"
            >
              <div className="w-5 h-5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1 leading-none text-xs">
                  <span className="truncate max-w-[90px] xs:max-w-[120px] sm:max-w-[160px]">
                    {currentTenant.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none truncate max-w-[90px] xs:max-w-[120px] sm:max-w-[160px] hidden xs:block">
                  {currentTenant.branch}
                </div>
              </div>
            </button>

            {showTenantDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden">
                <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  Switch Active Branch
                </div>
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setCurrentTenant(t);
                      setShowTenantDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      t.id === currentTenant.id
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/60 border-l-2 border-indigo-600'
                        : ''
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.name}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">{t.branch}</div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">
                        NTN: {t.ntn} | POS: {t.fbrPosId}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* POS Terminal Identifier */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>REG-01</span>
          </div>
        </div>

        {/* Center: Offline/Sync Status */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              isOffline
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {isOffline ? (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Offline Mode</span>
                <span className="sm:hidden">Offline</span>
                {pendingSyncCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-200 dark:bg-amber-900 rounded-full text-[10px] font-black text-amber-900 dark:text-amber-200">
                    {pendingSyncCount}
                  </span>
                )}
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="hidden md:inline">Cloud Connected</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 md:hidden" />
              </>
            )}

            <button
              onClick={() => setIsOffline(!isOffline)}
              className="text-[10px] underline ml-0.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer hidden sm:inline"
              title="Toggle network simulation"
            >
              (Toggle)
            </button>
          </div>

          {pendingSyncCount > 0 && (
            <button
              onClick={triggerManualSync}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Push pending local transactions"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Sync Now</span>
            </button>
          )}
        </div>

        {/* Right: Theme Toggle, Hotkeys, Language & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* FBR Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs border border-slate-200/60 dark:border-slate-700/60 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>FBR POS</span>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme color"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Light</span>
              </>
            )}
          </button>

          {/* Keyboard Shortcuts Guide */}
          <button
            onClick={() => setShowHotkeyModal(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden lg:inline">Shortcuts</span>
          </button>

          {/* Urdu / English Language Toggle */}
          <button
            onClick={() => setIsUrdu(!isUrdu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Toggle Urdu / English Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="hidden sm:inline">{isUrdu ? 'English' : 'اردو (Urdu)'}</span>
            <span className="sm:hidden text-[11px]">{isUrdu ? 'EN' : 'اردو'}</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Cashier Badge Card */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden xl:block text-left text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100 leading-none">Hammad Hussain</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none">Senior Cashier</div>
            </div>
          </div>
        </div>
      </header>

      {/* Hotkey Guide Modal */}
      {showHotkeyModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-slate-100 text-sm">
                <Keyboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                POS Rapid Keyboard Shortcuts
              </div>
              <button
                onClick={() => setShowHotkeyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Focus Barcode Scanner / Search</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono font-bold text-indigo-600 dark:text-indigo-400 shadow-2xs">
                  F2
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Return to POS Terminal</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono font-bold text-indigo-600 dark:text-indigo-400 shadow-2xs">
                  F12
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Fast Barcode Scan & Add</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono font-bold text-emerald-600 dark:text-emerald-400 shadow-2xs">
                  ENTER
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Print Z-Report (Shift Closing)</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                  Ctrl + P
                </kbd>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHotkeyModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
