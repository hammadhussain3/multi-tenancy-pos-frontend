import { useNavigate, useLocation } from 'react-router-dom';
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
  LogOut,
  User,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { usePos } from '../../context/usePos';
import type { ActiveTab } from '../../types/pos';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeTab,
    setActiveTab,
    cart,
    isUrdu,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    authUser,
    logout,
    theme,
  } = usePos();

  const navItems: {
    id: ActiveTab;
    path: string;
    label: string;
    labelUrdu: string;
    icon: typeof ShoppingCart;
    badge?: number;
  }[] = [
    {
      id: 'pos',
      path: '/pos',
      label: 'POS Checkout',
      labelUrdu: 'سیلز کاؤنٹر',
      icon: ShoppingCart,
      badge: cart.length > 0 ? cart.length : undefined,
    },
    {
      id: 'khata',
      path: '/khata',
      label: 'Khata Ledger (Udhaar)',
      labelUrdu: 'کھاتہ / ادھار رجسٹر',
      icon: BookOpen,
    },
    {
      id: 'inventory',
      path: '/inventory',
      label: 'Stock & Products',
      labelUrdu: 'اسٹاک اور مصنوعات',
      icon: Package,
    },
    {
      id: 'sales',
      path: '/sales',
      label: 'Sales History',
      labelUrdu: 'سابقہ بل اور رسیدیں',
      icon: Receipt,
    },
    {
      id: 'register',
      path: '/register',
      label: 'Day Closing & Cash',
      labelUrdu: 'دن کا حساب اور کیش',
      icon: Calculator,
    },
    {
      id: 'reports',
      path: '/reports',
      label: 'Reports & Analytics',
      labelUrdu: 'رپورٹس اور تجزیہ',
      icon: BarChart3,
    },
  ];

  const handleNavClick = (path: string, tabId: ActiveTab) => {
    setActiveTab(tabId);
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    const isDark = theme === 'dark';
    const result = await Swal.fire({
      title: isUrdu ? 'کیا آپ شفٹ ختم کرنا چاہتے ہیں؟' : 'End Register Shift?',
      text: isUrdu
        ? 'آپ کا سیشن ختم ہو جائے گا اور ٹرمینل لاک ہو جائے گا۔'
        : 'Your cashier session will end and the POS terminal will be locked.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: isUrdu ? 'لاگ آؤٹ' : 'Logout',
      cancelButtonText: isUrdu ? 'کینسل' : 'Cancel',
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#f8fafc' : '#0f172a',
    });

    if (result.isConfirmed) {
      await logout();
      navigate('/login', { replace: true });
    }
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
            const isActive =
              location.pathname === item.path ||
              (item.path === '/pos' && (location.pathname === '/' || activeTab === 'pos'));
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path, item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-800/60'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
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
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive
                        ? 'text-indigo-500 rtl:rotate-180'
                        : 'text-transparent group-hover:text-slate-400 rtl:rotate-180'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Cashier & End Shift */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 shrink-0 space-y-2">
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[110px]">
                {authUser?.name || 'Cashier'}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-tight capitalize">
                {authUser?.role || 'Active'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title={isUrdu ? 'شفٹ لاگ آؤٹ' : 'Logout Shift'}
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
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
