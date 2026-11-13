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
  } = usePos();

  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showHotkeyModal, setShowHotkeyModal] = useState(false);

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none sticky top-0 z-30 shadow-xs">
        {/* Left: Tenant / Branch Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowTenantDropdown(!showTenantDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition-all text-xs font-medium cursor-pointer"
            >
              <div className="w-5 h-5 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 leading-none">
                  {currentTenant.name}
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-none truncate max-w-[160px]">
                  {currentTenant.branch}
                </div>
              </div>
            </button>

            {showTenantDropdown && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 overflow-hidden">
                <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                  Switch Active Tenant / Branch
                </div>
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setCurrentTenant(t);
                      setShowTenantDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                      t.id === currentTenant.id ? 'bg-indigo-50/70 border-l-2 border-indigo-600' : ''
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-slate-500 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-600">{t.branch}</div>
                      <div className="text-[10px] text-indigo-600 mt-0.5">
                        NTN: {t.ntn} | POS: {t.fbrPosId}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* POS Terminal Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            REG-01 [POS TERMINAL]
          </div>
        </div>

        {/* Center: Offline/Sync Status Pill */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              isOffline
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {isOffline ? (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Local Offline Mode</span>
                {pendingSyncCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-200/80 rounded-full text-[10px] font-bold text-amber-900">
                    {pendingSyncCount} Queued
                  </span>
                )}
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cloud Connected</span>
                <span className="text-[10px] text-emerald-700 font-medium">Real-time</span>
              </>
            )}

            <button
              onClick={() => setIsOffline(!isOffline)}
              className="text-[10px] underline ml-1 text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Click to toggle simulation of internet connectivity loss"
            >
              (Toggle)
            </button>
          </div>

          {pendingSyncCount > 0 && (
            <button
              onClick={triggerManualSync}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-all shadow-xs cursor-pointer"
              title="Push pending local transactions to cloud"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync Now</span>
            </button>
          )}
        </div>

        {/* Right: Controls & Cashier info */}
        <div className="flex items-center gap-2.5">
          {/* FBR Compliance Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs border border-slate-200 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>FBR POS Ready</span>
          </div>

          {/* Hotkey Guide Button */}
          <button
            onClick={() => setShowHotkeyModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs transition-colors cursor-pointer"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Shortcuts</span>
          </button>

          {/* Urdu / English Language Switch */}
          <button
            onClick={() => setIsUrdu(!isUrdu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span>{isUrdu ? 'English' : 'اردو (Urdu)'}</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          {/* Cashier Badge */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden xl:block text-left text-xs">
              <div className="font-semibold text-slate-900 leading-none">Hammad Hussain</div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-none">Senior Cashier</div>
            </div>
          </div>
        </div>
      </header>

      {/* Hotkey Modal */}
      {showHotkeyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Keyboard className="w-4 h-4 text-indigo-600" />
                POS Rapid Keyboard Shortcuts
              </div>
              <button
                onClick={() => setShowHotkeyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-700">Focus Barcode Scanner / Search</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 text-indigo-700 font-bold shadow-xs">
                  F2
                </kbd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-700">Open POS Terminal</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 text-indigo-700 font-bold shadow-xs">
                  F12
                </kbd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-700">Fast Barcode Scan Simulation</span>
                <span className="text-slate-500">Type or Scan & Press Enter</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-700">Quick Cash Tender</span>
                <span className="text-emerald-700 font-semibold">Pay button or Spacebar</span>
              </div>
            </div>
            <div className="mt-5 text-right">
              <button
                onClick={() => setShowHotkeyModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs"
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
