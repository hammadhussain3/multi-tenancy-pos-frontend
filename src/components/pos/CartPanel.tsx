import { useState, useMemo } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  UserCheck,
  CreditCard,
  Banknote,
  BookOpen,
  Receipt,
  Tag,
  X,
  Search,
  Zap,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  PauseCircle,
  PlayCircle,
  Clock,
} from 'lucide-react';
import { usePos } from '../../context/usePos';
import { SplitPaymentModal } from './SplitPaymentModal';

interface CartPanelProps {
  isMobileFullView?: boolean;
  onBackToCatalog?: () => void;
}

export function CartPanel({
  isMobileFullView = false,
  onBackToCatalog,
}: CartPanelProps) {
  const {
    cart,
    updateQuantity,
    updateDiscount,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartDiscount,
    cartTax,
    cartTotal,
    customers,
    selectedCustomer,
    setSelectedCustomer,
    heldOrders,
    holdCurrentOrder,
    resumeHeldOrder,
    deleteHeldOrder,
    processCheckout,
    isUrdu,
    isMobileCartOpen,
    setIsMobileCartOpen,
  } = usePos();

  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showHeldModal, setShowHeldModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showSplitModal, setShowSplitModal] = useState(false);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuickCash = () => {
    if (cart.length === 0) return;
    processCheckout(
      'cash',
      {
        cash: cartTotal,
        card: 0,
        khata: 0,
      },
      cartTotal,
      0
    );
    setIsMobileCartOpen(false);
  };

  const cartContent = (
    <div className="flex flex-col h-full max-h-full min-h-0 w-full overflow-hidden select-none bg-white dark:bg-slate-900 transition-colors duration-200">
      {/* 1. Header: Order Bar & Customer Chip */}
      <div className="p-2.5 sm:p-3 border-b border-slate-200/80 dark:border-slate-800 space-y-2 shrink-0 bg-slate-50/70 dark:bg-slate-900/90 backdrop-blur-xs">
        {/* Top Order Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBackToCatalog && (
              <button
                onClick={onBackToCatalog}
                className="lg:hidden p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 flex items-center gap-1 cursor-pointer font-bold text-xs"
                title="Back to Catalog"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isUrdu ? 'کیٹلاگ' : 'Catalog'}</span>
              </button>
            )}

            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5 leading-none">
                <span>{isUrdu ? 'موجودہ آرڈر' : 'Current Order'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none font-medium">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {heldOrders.length > 0 && (
              <button
                onClick={() => setShowHeldModal(true)}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 flex items-center gap-1 transition-all cursor-pointer shadow-2xs animate-pulse"
                title="View parked / held sales"
              >
                <Clock className="w-3 h-3" />
                <span>Parked ({heldOrders.length})</span>
              </button>
            )}

            {cart.length > 0 && (
              <button
                onClick={() => holdCurrentOrder()}
                className="px-2 py-1 rounded-lg text-[11px] text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                title="Hold / Park current order (F6)"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'روکیں' : 'Hold'}</span>
              </button>
            )}

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="px-2 py-1 rounded-lg text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                title="Empty cart"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'صاف کریں' : 'Clear'}</span>
              </button>
            )}

            {/* Mobile Drawer Close (only when in drawer mode) */}
            {!isMobileFullView && (
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Close cart"
                aria-label="Close cart drawer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Customer / Khata Selection Bar */}
        <div className="relative">
          {selectedCustomer ? (
            <div className="p-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                  <UserCheck className="w-3 h-3" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
                    {selectedCustomer.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 leading-tight">
                    <span>{selectedCustomer.phone}</span>
                    <span>•</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      PKR {selectedCustomer.currentBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Switch back to Walk-in Customer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomerPicker(true)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-200 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {isUrdu ? 'گاہک منتخب کریں (کھاتہ)' : 'Walk-in Customer'}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block leading-tight">
                    {isUrdu ? 'نقد فروخت' : 'Cash sale (Tap to attach Khata)'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                <span>+ Khata</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Middle: Cart Items or Compact Engaging Empty State */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-3 space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
        {cart.length === 0 ? (
          <div className="h-full min-h-0 flex flex-col items-center justify-center text-center p-2 sm:p-3 py-2">
            {/* Visual Icon Badge */}
            <div className="relative mb-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-500/10 via-indigo-500/20 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-200/50 dark:border-indigo-800/60 flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-2 h-2" />
              </div>
            </div>

            {/* Title & Microcopy */}
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
              {isUrdu ? 'ٹوکری خالی ہے' : 'Ready for Next Sale'}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[210px] leading-snug">
              {isUrdu
                ? 'بارکوڈ اسکین کریں یا کیٹلاگ سے پروڈکٹ منتخب کریں۔'
                : 'Scan barcodes or tap products on the catalog to begin order.'}
            </p>

            {/* Quick POS Pro-Tips Card */}
            <div className="mt-2 w-full max-w-[220px] p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-[10px] text-left space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold text-[9px] uppercase tracking-wider">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Quick Shortcuts</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[9px]">
                <span>Scan Barcode:</span>
                <kbd className="px-1 py-0.2 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono font-bold text-slate-800 dark:text-slate-200">
                  F2
                </kbd>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[9px]">
                <span>Switch Tab:</span>
                <kbd className="px-1 py-0.2 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono font-bold text-slate-800 dark:text-slate-200">
                  F12
                </kbd>
              </div>
            </div>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.product.id}
              className="pt-2 first:pt-0 space-y-1.5 group transition-all"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {item.product.name}
                  </div>
                  {isUrdu && item.product.nameUrdu && (
                    <div className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">
                      {item.product.nameUrdu}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      PKR {item.unitPrice.toLocaleString()}
                    </span>
                    <span>/</span>
                    <span>{item.product.unit}</span>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Controls Row: Qty Stepper, Line Discount, Line Total */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                {/* Stepper */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 shadow-2xs overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1 px-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer active:scale-95"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center text-xs font-black text-slate-900 dark:text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 px-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer active:scale-95"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Line Discount Input */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                    <Tag className="w-2.5 h-2.5 text-slate-400" />
                    <input
                      type="number"
                      value={item.discountAmount || ''}
                      onChange={(e) =>
                        updateDiscount(item.product.id, parseFloat(e.target.value) || 0)
                      }
                      placeholder="Disc"
                      className="w-9 text-center text-[9px] bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none placeholder-slate-400"
                      title="Item discount in PKR"
                    />
                  </div>

                  {/* Line Total */}
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100 min-w-[65px] text-right">
                    PKR {item.total.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Footer Summary & Checkout Actions (Sticky & High-Contrast) */}
      <div className="p-2.5 sm:p-3 border-t border-slate-200/90 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xs space-y-2 shrink-0 mt-auto shadow-lg z-10">
        {/* Financial Breakdown */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
            <span>Subtotal:</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">
              PKR {cartSubtotal.toLocaleString()}
            </span>
          </div>

          {cartDiscount > 0 && (
            <div className="flex justify-between text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Discount:</span>
              </span>
              <span>- PKR {cartDiscount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[10px]">
            <span>FBR POS Sales Tax (0%):</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">PKR {cartTax}</span>
          </div>

          {/* Grand Total Display Bar */}
          <div className="pt-1 mt-0.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
            <div>
              <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isUrdu ? 'کل رقم' : 'TOTAL PAYABLE'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight leading-none">
                PKR {cartTotal.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* High-Impact POS Action Buttons: ALWAYS VISIBLE, NEVER CUT OFF */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {/* Quick Cash Checkout */}
          <button
            onClick={handleQuickCash}
            disabled={cart.length === 0}
            className={`h-9 sm:h-10 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-[0.98] ${cart.length > 0
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed shadow-none'
              }`}
          >
            <Banknote className="w-4 h-4 shrink-0" />
            <span className="truncate">{isUrdu ? 'فوری کیش' : 'Quick Cash'}</span>
          </button>

          {/* Multi-Tender & Khata Split */}
          <button
            onClick={() => setShowSplitModal(true)}
            disabled={cart.length === 0}
            className={`h-9 sm:h-10 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-[0.98] ${cart.length > 0
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed shadow-none'
              }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span className="truncate">{isUrdu ? 'کھاتہ / کارڈ' : 'Split / Khata'}</span>
          </button>
        </div>
      </div>

      {/* 4. Customer Selection Modal Dialog */}
      {showCustomerPicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-4 sm:p-5 shadow-2xl space-y-3.5 my-auto max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-slate-100">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Attach Khata Customer to Order</span>
              </div>
              <button
                onClick={() => setShowCustomerPicker(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customer by name, phone, or city..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                autoFocus
              />
            </div>

            {/* Customer List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No customers found matching &quot;{customerSearch}&quot;.
                </div>
              ) : (
                filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setShowCustomerPicker(false);
                      setCustomerSearch('');
                    }}
                    className="w-full text-left p-2.5 pt-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{c.phone}</span>
                        <span>•</span>
                        <span>{c.city}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[9px] text-slate-400 font-medium">Outstanding Udhaar</div>
                      <div className="text-xs font-extrabold text-amber-700 dark:text-amber-400">
                        PKR {c.currentBalance.toLocaleString()}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Quick Option to Revert to Walk-in */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomer(null);
                  setShowCustomerPicker(false);
                }}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
              >
                Clear / Stay as Walk-in Customer
              </button>
              <button
                type="button"
                onClick={() => setShowCustomerPicker(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Split Payment Modal */}
      {showSplitModal && (
        <SplitPaymentModal
          onClose={() => {
            setShowSplitModal(false);
            setIsMobileCartOpen(false);
          }}
        />
      )}

      {/* 6. Parked / Held Orders Modal Dialog */}
      {showHeldModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-4 sm:p-5 shadow-2xl space-y-3.5 my-auto max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-slate-100">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Parked Sales (Held Orders)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 text-[10px] font-bold">
                  {heldOrders.length}
                </span>
              </div>
              <button
                onClick={() => setShowHeldModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {heldOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No parked sales currently held.
                </div>
              ) : (
                heldOrders.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 pt-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                          {h.customer ? h.customer.name : 'Walk-in Customer'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {h.heldAt}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {h.items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')}
                      </div>
                      <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 mt-1">
                        PKR {h.subtotal.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          resumeHeldOrder(h.id);
                          setShowHeldModal(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                        title="Resume order to active cart"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </button>

                      <button
                        onClick={() => deleteHeldOrder(h.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Discard parked sale"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHeldModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobileFullView) {
    return (
      <div className="w-full h-full max-h-full min-h-0 flex flex-col overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
        {cartContent}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Persistent Cart Panel */}
      <aside className="hidden lg:flex flex-col w-80 xl:w-96 bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 shrink-0 h-[95%] max-h-[95%] min-h-0 shadow-xs transition-colors duration-200 overflow-hidden">
        {cartContent}
      </aside>

      {/* Mobile Cart Drawer & Backdrop */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileCartOpen(false)}
          />
          <aside
            className={`fixed inset-y-0 ${isUrdu ? 'left-0' : 'right-0'
              } z-50 w-full sm:w-96 max-h-full min-h-0 bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200/80 dark:border-slate-800 transition-colors duration-200 overflow-hidden`}
          >
            {cartContent}
          </aside>
        </div>
      )}
    </>
  );
}
