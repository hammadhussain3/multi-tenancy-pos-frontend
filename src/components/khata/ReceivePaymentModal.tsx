import { useState } from 'react';
import type { FormEvent } from 'react';
import { Banknote, CheckCircle2 } from 'lucide-react';
import type { Customer } from '../../types/pos';
import { usePos } from '../../context/usePos';

interface ReceivePaymentModalProps {
  customer: Customer;
  onClose: () => void;
}

export function ReceivePaymentModal({
  customer,
  onClose,
}: ReceivePaymentModalProps) {
  const { recordCustomerPayment } = usePos();
  const [amount, setAmount] = useState<number>(customer.currentBalance);
  const [narration, setNarration] = useState<string>('Cash received against outstanding Udhaar');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Payment amount must be greater than 0.');
      return;
    }
    recordCustomerPayment(customer.id, amount, narration);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Receive Khata Payment</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Record cash payment received from {customer.name}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Current Balance Card */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
          <div>
            <div className="text-slate-500 dark:text-slate-400">Total Outstanding Udhaar:</div>
            <div className="text-base font-extrabold text-amber-800 dark:text-amber-400 mt-0.5">
              PKR {customer.currentBalance.toLocaleString()}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAmount(customer.currentBalance)}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer shadow-2xs transition-colors"
          >
            Clear Full
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Amount Received (PKR)
            </label>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Narration / Receipt Note
            </label>
            <input
              type="text"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}