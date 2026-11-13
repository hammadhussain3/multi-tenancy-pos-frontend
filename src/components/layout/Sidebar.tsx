import {
  ShoppingCart,
  BookOpen,
  Package,
  Receipt,
  Calculator,
  Store,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { usePos } from '../../context/usePos';
import type { ActiveTab } from '../../types/pos';

export function Sidebar() {
  const { activeTab, setActiveTab, cart, isUrdu } = usePos();

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
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none shadow-xs">
      <div>
        {/* Brand Banner */}
        <div className="h-14 px-4 border-b border-slate-200 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>POSify</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Hybrid Retail POS</div>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-4 pt-4 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>{isUrdu ? 'ماڈیولز' : 'Core Modules'}</span>
          <Layers className="w-3 h-3 text-slate-400" />
        </div>

        {/* Navigation Links */}
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{isUrdu ? item.labelUrdu : item.label}</span>
                </div>

                <div className="flex items-center gap-1">
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3 h-3 opacity-80 text-indigo-600" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800">
            <span>Database Mode</span>
            <span className="text-emerald-700 font-bold">SQLite / Local</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 leading-snug">
            Immutable sync outbox enabled. All transactions cached locally.
          </div>
        </div>
      </div>
    </aside>
  );
}
