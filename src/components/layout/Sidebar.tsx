import {
  ShoppingCart,
  BookOpen,
  Package,
  Receipt,
  Calculator,
  BarChart3,
  Store,
  Layers,
  ChevronRight,
  X,
} from 'lucide-react';
import { usePos } from '../../context/usePos';
import type { ActiveTab } from '../../types/pos';

export function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    cart,
    isUrdu,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = usePos();

  const navItems: {
    id: ActiveTab;
    label: string;
    labelUrdu: string;
    icon: typeof ShoppingCart;
    badge?: number;
  }[] = [
    {
      id: 'pos',
      label: 'POS Checkout',
      labelUrdu: 'سیلز کاؤنٹر',
      icon: ShoppingCart,
      badge: cart.length > 0 ? cart.length : undefined,
    },
    {
      id: 'khata',
      label: 'Khata Ledger (Udhaar)',
      labelUrdu: 'کھاتہ / ادھار رجسٹر',
      icon: BookOpen,
    },
    {
      id: 'inventory',
      label: 'Stock & Products',
      labelUrdu: 'اسٹاک اور مصنوعات',
      icon: Package,
    },
    {
      id: 'sales',
      label: 'Sales History',
      labelUrdu: 'سابقہ بل اور رسیدیں',
      icon: Receipt,
    },
    {
      id: 'register',
      label: 'Day Closing & Cash',
      labelUrdu: 'دن کا حساب اور کیش',
      icon: Calculator,
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      labelUrdu: 'رپورٹس اور تجزیہ',
      icon: BarChart3,
    },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const navContent = (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Mobile Drawer Header with Close Button (Hidden on Desktop) */}
        <div className="lg:hidden h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
              <Store className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>POS<span className="text-indigo-600 dark:text-indigo-400">ify</span></span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-bold">
                PRO
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Label */}
        <div className="px-4 pt-4 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>{isUrdu ? 'ماڈیولز' : 'Core Modules'}</span>
          <Layers className="w-3 h-3 text-slate-400 dark:text-slate-500" />
        </div>

        {/* Navigation Links */}
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-800/60'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span>{isUrdu ? item.labelUrdu : item.label}</span>
                </div>

                <div className="flex items-center gap-1">
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3 h-3 opacity-80 text-indigo-600 dark:text-indigo-400" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-slate-200">
            <span>Database Mode</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">SQLite / Local</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
            Immutable sync outbox enabled. All transactions cached locally.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 h-full max-h-full min-h-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col justify-between shrink-0 select-none shadow-xs transition-colors duration-200 overflow-hidden">
        {navContent}
      </aside>

      {/* Mobile / Tablet Drawer & Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <aside
            className={`fixed inset-y-0 ${
              isUrdu ? 'right-0' : 'left-0'
            } z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between select-none border-r border-slate-200 dark:border-slate-800 transition-colors duration-200`}
          >
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
