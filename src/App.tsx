import { useState } from 'react';
import {
  ShoppingCart,
  BookOpen,
  Package,
  Receipt,
  Calculator,
} from 'lucide-react';
import { PosProvider } from './context/PosContext';
import { usePos } from './context/usePos';
import { TopHeader } from './components/layout/TopHeader';
import { Sidebar } from './components/layout/Sidebar';
import { BarcodeSearch } from './components/pos/BarcodeSearch';
import { ProductCatalog } from './components/pos/ProductCatalog';
import { CartPanel } from './components/pos/CartPanel';
import { KhataLedgerView } from './components/khata/KhataLedgerView';
import { InventoryTableView } from './components/inventory/InventoryTableView';
import { SalesHistoryView } from './components/sales/SalesHistoryView';
import { DayClosingView } from './components/register/DayClosingView';
import { ThermalReceiptModal } from './components/pos/ThermalReceiptModal';
import type { ActiveTab } from './types/pos';

function PosDashboard() {
  const {
    activeTab,
    setActiveTab,
    activeReceipt,
    setActiveReceipt,
    isUrdu,
    cart,
    cartTotal,
  } = usePos();

  const [mobilePosView, setMobilePosView] = useState<'catalog' | 'cart'>('catalog');

  const mobileNavItems: {
    id: ActiveTab;
    label: string;
    labelUrdu: string;
    icon: typeof ShoppingCart;
    badge?: number;
  }[] = [
    {
      id: 'pos',
      label: 'POS',
      labelUrdu: 'سیلز',
      icon: ShoppingCart,
      badge: cart.length > 0 ? cart.length : undefined,
    },
    {
      id: 'khata',
      label: 'Khata',
      labelUrdu: 'کھاتہ',
      icon: BookOpen,
    },
    {
      id: 'inventory',
      label: 'Stock',
      labelUrdu: 'اسٹاک',
      icon: Package,
    },
    {
      id: 'sales',
      label: 'History',
      labelUrdu: 'رسیدیں',
      icon: Receipt,
    },
    {
      id: 'register',
      label: 'Closing',
      labelUrdu: 'حساب',
      icon: Calculator,
    },
  ];

  return (
    <div
      dir={isUrdu ? 'rtl' : 'ltr'}
      className="h-full w-full max-h-dvh flex flex-col bg-slate-100 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-hidden select-none transition-colors duration-200"
    >
      {/* Global Multi-Tenant Header */}
      <TopHeader />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar (Desktop + Mobile Drawer) */}
        <Sidebar />

        {/* Dynamic View Container */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-100 dark:bg-[#0b0f19] pb-16 lg:pb-0 transition-colors duration-200">
          {activeTab === 'pos' && (
            <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative">
              {/* On screens < lg: Top Segmented Switcher (Catalog vs Order/Cart) */}
              <div className="lg:hidden shrink-0 px-2.5 pt-2 pb-1 bg-slate-100 dark:bg-[#0b0f19] flex items-center gap-2">
                <div className="flex-1 flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
                  <button
                    onClick={() => setMobilePosView('catalog')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      mobilePosView === 'catalog'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'پروڈکٹس' : 'Catalog'}</span>
                  </button>

                  <button
                    onClick={() => setMobilePosView('cart')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      mobilePosView === 'cart'
                        ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'آرڈر اور ادائیگی' : 'Order & Pay'}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                        cart.length > 0
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      PKR {cartTotal.toLocaleString()}
                    </span>
                  </button>
                </div>
              </div>

              {/* Product Catalog & Search area (Always visible on lg:, visible on < lg when mobilePosView === 'catalog') */}
              <div
                className={`flex-1 flex-col p-2.5 sm:p-4 gap-2.5 sm:gap-3 overflow-hidden bg-slate-100 dark:bg-[#0b0f19] ${
                  mobilePosView === 'cart' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                <BarcodeSearch />
                <ProductCatalog />

                {/* Mobile Floating Cart Action Bar */}
                {cart.length > 0 && mobilePosView === 'catalog' && (
                  <div className="lg:hidden shrink-0 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg flex items-center justify-between transition-all">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs relative">
                        <ShoppingCart className="w-4 h-4" />
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[9px] font-black shadow-xs">
                          {cart.length}
                        </span>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {cart.reduce((sum, item) => sum + item.quantity, 0)} items selected
                        </div>
                        <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                          PKR {cartTotal.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setMobilePosView('cart')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>{isUrdu ? 'بل دیکھیں اور ادا کریں' : 'View Cart & Pay'}</span>
                      <span className="text-indigo-200 font-bold">→</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Full Cart View on < lg */}
              {mobilePosView === 'cart' && (
                <div className="lg:hidden flex-1 h-full overflow-hidden">
                  <CartPanel
                    isMobileFullView={true}
                    onBackToCatalog={() => setMobilePosView('catalog')}
                  />
                </div>
              )}

              {/* Desktop Persistent Cart Panel */}
              <CartPanel isMobileFullView={false} />
            </div>
          )}

          {activeTab === 'khata' && <KhataLedgerView />}
          {activeTab === 'inventory' && <InventoryTableView />}
          {activeTab === 'sales' && <SalesHistoryView />}
          {activeTab === 'register' && <DayClosingView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< lg screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-1 py-1.5 flex items-center justify-around shadow-lg select-none transition-colors duration-200">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'pos') {
                  setMobilePosView('catalog');
                }
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-[10px] font-semibold transition-all cursor-pointer relative ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 stroke-2'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full text-[8px] font-black bg-rose-600 text-white min-w-[14px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 leading-none">{isUrdu ? item.labelUrdu : item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Thermal Receipt Modal (Triggered on Checkout completion or reprint) */}
      {activeReceipt && (
        <ThermalReceiptModal
          invoice={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <PosProvider>
      <PosDashboard />
    </PosProvider>
  );
}

export default App;
