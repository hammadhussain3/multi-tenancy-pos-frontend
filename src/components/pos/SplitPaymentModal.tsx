import { useState } from 'react';
import {
  CreditCard,
  Banknote,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  User,
  Calculator,
} from 'lucide-react';
import { usePos } from '../../context/usePos';

interface SplitPaymentModalProps {
  onClose: () => void;
}

export function SplitPaymentModal({ onClose }: SplitPaymentModalProps) {
  const {
    cartTotal,
    selectedCustomer,
    setSelectedCustomer,
    customers,
    processCheckout,
    isUrdu,
  } = usePos();

  const [cashAmount, setCashAmount] = useState<number>(cartTotal);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [khataAmount, setKhataAmount] = useState<number>(0);

  const [cashTendered, setCashTendered] = useState<number>(cartTotal);

  const totalAllocated = cashAmount + cardAmount + khataAmount;
  const remaining = cartTotal - totalAllocated;
  const changeGiven = Math.max(0, cashTendered - cashAmount);

  const isComplete = remaining === 0;
  const hasKhataWithoutCustomer = khataAmount > 0 && !selectedCustomer;

  const handleCheckout = () => {
    if (!isComplete) {
      alert(`The allocated payments do not match the grand total (Difference: PKR ${remaining}).`);
      return;
    }

    if (hasKhataWithoutCustomer) {
      alert('Please select a customer for Khata (Udhaar) credit transactions.');
      return;
    }

    let method: 'cash' | 'card' | 'khata' | 'split' = 'split';
    if (cashAmount === cartTotal) method = 'cash';
    else if (cardAmount === cartTotal) method = 'card';
    else if (khataAmount === cartTotal) method = 'khata';

    processCheckout(
      method,
      {
        cash: cashAmount,
        card: cardAmount,
        khata: khataAmount,
      },
      cashTendered,
      changeGiven
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <span>{isUrdu ? 'ادائیگی کا تفصیلی طریقہ' : 'Split & Multi-Tender Payment'}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Split sale between Cash, Bank Card, and Customer Khata (Udhaar).
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer">
            ✕
          </button>
        </div>

        {/* Grand Total Display */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Order Grand Total</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              PKR {cartTotal.toLocaleString()}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-slate-500">Allocated / Remaining</div>
            <div
              className={`text-sm font-bold ${
                remaining === 0 ? 'text-emerald-700' : 'text-amber-800'
              }`}
            >
              PKR {totalAllocated.toLocaleString()} /{' '}
              <span className={remaining !== 0 ? 'text-rose-600 font-bold' : ''}>
                {remaining > 0 ? `+${remaining}` : remaining}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods Input */}
        <div className="space-y-3.5">
          {/* 1. Cash Tender */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Cash Payment</div>
                <div className="text-[10px] text-slate-500">Drawer Currency</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">PKR</span>
              <input
                type="number"
                value={cashAmount || ''}
                onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                className="w-28 py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-right text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Cash Tendered & Change Return Calculation */}
          {cashAmount > 0 && (
            <div className="pl-12 pr-3 py-2 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span>Received from customer:</span>
                <input
                  type="number"
                  value={cashTendered || ''}
                  onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                  className="w-20 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-right text-emerald-800 font-bold shadow-2xs"
                />
              </div>

              <div className="text-right">
                <span className="text-slate-500 mr-1.5">Change to return:</span>
                <span className="font-bold text-emerald-700">
                  PKR {changeGiven.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* 2. Card Payment */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Card / POS Terminal</div>
                <div className="text-[10px] text-slate-500">Debit / Credit Machine</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">PKR</span>
              <input
                type="number"
                value={cardAmount || ''}
                onChange={(e) => setCardAmount(parseFloat(e.target.value) || 0)}
                className="w-28 py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-right text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
              />
            </div>
          </div>

          {/* 3. Khata (Udhaar) Credit */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Khata / Udhaar (Credit Sale)
                  </div>
                  <div className="text-[10px] text-slate-500">Added to Customer Ledger</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">PKR</span>
                <input
                  type="number"
                  value={khataAmount || ''}
                  onChange={(e) => setKhataAmount(parseFloat(e.target.value) || 0)}
                  className="w-28 py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-right text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Khata Customer selector */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <div className="text-slate-600 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Khata Account:</span>
              </div>

              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const cust = customers.find((c) => c.id === e.target.value) || null;
                  setSelectedCustomer(cust);
                }}
                className="bg-white text-slate-800 border border-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none shadow-2xs cursor-pointer"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - Current Khata: PKR {c.currentBalance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Warning / Status */}
        {hasKhataWithoutCustomer && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>You entered a Khata amount. Please select an existing customer above.</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleCheckout}
            disabled={!isComplete || hasKhataWithoutCustomer}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete & Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
