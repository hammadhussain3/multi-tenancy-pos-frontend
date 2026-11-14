import { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  UserCheck,
  UserX,
  CreditCard,
  Banknote,
  BookOpen,
  Receipt,
  Tag,
  X,
} from 'lucide-react';
import { usePos } from '../../context/usePos';
import { SplitPaymentModal } from './SplitPaymentModal';

export function CartPanel() {
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
    processCheckout,
    isUrdu,
    isMobileCartOpen,
    setIsMobileCartOpen,
  } = usePos();

  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);

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
    <div className="flex flex-col justify-between h-full w-full overflow-hidden">
      {/* Header: Customer Select & Cart Status */}
      <div className="p-3 border-b border-slate-200 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <span>{isUrdu ? 'موجودہ بل / ٹوکری' : 'Active Sale Order'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-semibold">
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>{isUrdu ? 'صاف کریں' : 'Clear'}</span>
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileCartOpen(false)}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              title="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Attachment / Khata Box */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          {selectedCustomer ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{selectedCustomer.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {selectedCustomer.phone} •{' '}
                  <span className="text-amber-800 font-semibold">
                    Khata: PKR {selectedCustomer.currentBalance.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-200 cursor-pointer"
                title="Remove Customer"
              >
                <UserX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              {!showCustomerPicker ? (
                <button
                  onClick={() => setShowCustomerPicker(true)}
                  className="w-full py-1 text-xs text-indigo-700 hover:text-indigo-800 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>+ Attach Khata Customer (Udhaar)</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-700 flex justify-between items-center">
                    <span>Select Customer:</span>
                    <button
                      onClick={() => setShowCustomerPicker(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1">
                    {customers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setShowCustomerPicker(false);
                        }}
                        className="w-full text-left p-1.5 rounded-lg hover:bg-white text-xs flex justify-between items-center cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <span className="font-semibold text-slate-900">{c.name}</span>
                        <span className="text-[10px] text-amber-800">
                          PKR {c.currentBalance.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
            <Receipt className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
            <div className="text-sm font-semibold text-slate-600">Cart is Empty</div>
            <div className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Scan a barcode or tap products from catalog to start ringing up sale.
            </div>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.product.id} className="pt-2 first:pt-0 space-y-1.5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold text-slate-900">{item.product.name}</div>
                  {isUrdu && item.product.nameUrdu && (
                    <div className="text-[11px] text-amber-800">{item.product.nameUrdu}</div>
                  )}
                  <div className="text-[10px] text-slate-500">
                    PKR {item.unitPrice.toLocaleString()} / {item.product.unit}
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quantity Controls & Line Discount */}
              <div className="flex items-center justify-between text-xs pt-1">
                {/* Qty Modifier */}
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1 hover:bg-slate-200 text-slate-700 rounded-l-lg transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 hover:bg-slate-200 text-slate-700 rounded-r-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Line Total & Discount Input */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <input
                      type="number"
                      value={item.discountAmount || ''}
                      onChange={(e) =>
                        updateDiscount(item.product.id, parseFloat(e.target.value) || 0)
                      }
                      placeholder="Disc"
                      className="w-12 px-1 py-0.5 text-center text-[10px] bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="text-xs font-extrabold text-slate-900 min-w-[70px] text-right">
                    PKR {item.total.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Summary & Checkout Actions */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-3 shrink-0">
        {/* Subtotal, Disc, Tax */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="text-slate-900 font-semibold">
              PKR {cartSubtotal.toLocaleString()}
            </span>
          </div>
          {cartDiscount > 0 && (
            <div className="flex justify-between text-amber-800 font-medium">
              <span>Discount</span>
              <span>- PKR {cartDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>FBR POS Tax (0%)</span>
            <span className="text-slate-900 font-semibold">PKR {cartTax}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
            <span className="font-extrabold text-sm text-slate-900">Grand Total</span>
            <span className="text-lg font-black text-emerald-700">
              PKR {cartTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleQuickCash}
            disabled={cart.length === 0}
            className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <Banknote className="w-4 h-4" />
            <span>{isUrdu ? 'فوری کیش' : 'Quick Cash'}</span>
          </button>

          <button
            onClick={() => setShowSplitModal(true)}
            disabled={cart.length === 0}
            className="py-3 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>{isUrdu ? 'کھاتہ / کارڈ' : 'Split / Khata'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Cart Panel */}
      <aside className="hidden lg:flex w-80 xl:w-96 bg-white border-l border-slate-200 flex-col justify-between shrink-0 h-full shadow-xs">
        {cartContent}
      </aside>

      {/* Mobile Cart Drawer & Backdrop */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileCartOpen(false)}
          />
          <aside
            className={`fixed inset-y-0 ${
              isUrdu ? 'left-0' : 'right-0'
            } z-50 w-full sm:w-96 bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200`}
          >
            {cartContent}
          </aside>
        </div>
      )}

      {/* Split Payment Modal */}
      {showSplitModal && (
        <SplitPaymentModal
          onClose={() => {
            setShowSplitModal(false);
            setIsMobileCartOpen(false);
          }}
        />
      )}
    </>
  );
}
