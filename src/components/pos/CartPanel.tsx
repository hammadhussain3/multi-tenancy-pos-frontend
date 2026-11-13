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
  };

  return (
    <>
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col justify-between shrink-0 h-full shadow-xs">
        {/* Header: Customer Select & Cart Status */}
        <div className="p-3 border-b border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Receipt className="w-4 h-4 text-indigo-600" />
              <span>{isUrdu ? 'موجودہ بل / ٹوکری' : 'Active Sale Order'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono font-semibold">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>{isUrdu ? 'صاف کریں' : 'Clear'}</span>
              </button>
            )}
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
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
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
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-slate-600">
                  {isUrdu ? 'گاہک منتخب نہیں (واک ان)' : 'Customer: Walk-in Cash'}
                </div>
                <button
                  onClick={() => setShowCustomerPicker(true)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <BookOpen className="w-3 h-3 text-indigo-600" />
                  <span>{isUrdu ? 'کھاتہ گاہک' : 'Select Khata'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Customer Picker Dropdown Modal */}
        {showCustomerPicker && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Select Customer for Khata / Credit Sale
                </div>
                <button
                  onClick={() => setShowCustomerPicker(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setShowCustomerPicker(false);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{c.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-amber-800 font-mono">
                        PKR {c.currentBalance.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Limit: PKR {c.creditLimit.toLocaleString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
              <Receipt className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
              <div className="text-xs font-semibold text-slate-600">Your Cart is Empty</div>
              <div className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                Scan barcode or select items from catalog to start billing.
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">
                      {item.product.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      PKR {item.unitPrice.toLocaleString()} / {item.product.unit}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quantity and Line Total */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                  <div className="flex items-center gap-1.5 bg-white rounded-lg p-1 border border-slate-300 shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.product.id, parseInt(e.target.value) || 1)
                      }
                      className="w-10 text-center bg-transparent text-xs font-bold text-slate-900 focus:outline-none font-mono"
                      min="1"
                    />
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Discount Button / Input */}
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <input
                      type="number"
                      placeholder="Disc"
                      value={item.discountAmount || ''}
                      onChange={(e) =>
                        updateDiscount(item.product.id, parseFloat(e.target.value) || 0)
                      }
                      className="w-14 px-1.5 py-0.5 rounded bg-white border border-slate-300 text-right text-[11px] text-amber-800 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
                    />
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-slate-900 font-mono">
                      PKR {item.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout Actions */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-3">
          {/* Subtotal, Disc, Tax */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono text-slate-900 font-semibold">
                PKR {cartSubtotal.toLocaleString()}
              </span>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-amber-800 font-medium">
                <span>Discount</span>
                <span className="font-mono">- PKR {cartDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>FBR POS Tax (0%)</span>
              <span className="font-mono text-slate-900 font-semibold">PKR {cartTax}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
              <span className="font-extrabold text-sm text-slate-900">Grand Total</span>
              <span className="text-lg font-black text-emerald-700 font-mono">
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

      {/* Split Payment Modal */}
      {showSplitModal && (
        <SplitPaymentModal onClose={() => setShowSplitModal(false)} />
      )}
    </>
  );
}
