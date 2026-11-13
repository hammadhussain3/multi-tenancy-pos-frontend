import { useState } from 'react';
import {
  Calculator,
  Banknote,
  CreditCard,
  BookOpen,
  DollarSign,
  Printer,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { usePos } from '../../context/usePos';

export function DayClosingView() {
  const { invoices, currentTenant } = usePos();

  const openingFloat = 10000;
  const [physicalCashCounted, setPhysicalCashCounted] = useState<number>(0);
  const [shiftClosed, setShiftClosed] = useState(false);

  const totalCashSales = invoices.reduce((sum, inv) => sum + inv.payments.cash, 0);
  const totalCardSales = invoices.reduce((sum, inv) => sum + inv.payments.card, 0);
  const totalKhataCredit = invoices.reduce((sum, inv) => sum + inv.payments.khata, 0);
  const totalSalesRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  const expectedDrawerCash = openingFloat + totalCashSales;
  const cashVariance = physicalCashCounted > 0 ? physicalCashCounted - expectedDrawerCash : 0;

  const handleCloseShift = () => {
    if (physicalCashCounted <= 0) {
      alert('Please enter the physically counted cash in the drawer.');
      return;
    }
    setShiftClosed(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <span>Day-End Register Closing & Cash Reconciliation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Shift reconciliation report for Register REG-01 ({currentTenant.name} - {currentTenant.branch}).
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <Printer className="w-4 h-4 text-indigo-600" />
          <span>Print Z-Report</span>
        </button>
      </div>

      {/* Primary KPI Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-slate-500">Total Gross Sales</div>
          <div className="text-2xl font-black text-slate-900">
            PKR {totalSalesRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">
            {invoices.length} invoices generated
          </div>
        </div>

        {/* Cash Sales */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
            <Banknote className="w-4 h-4" />
            <span>Cash Sales</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            PKR {totalCashSales.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">Collected in register drawer</div>
        </div>

        {/* Card Sales */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4" />
            <span>Card / Bank POS</span>
          </div>
          <div className="text-2xl font-black text-indigo-700">
            PKR {totalCardSales.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">Settled to merchant bank account</div>
        </div>

        {/* Khata Credit */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Khata (Udhaar) Sales</span>
          </div>
          <div className="text-2xl font-black text-amber-800">
            PKR {totalKhataCredit.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">Recorded in customer receivables</div>
        </div>
      </div>

      {/* Cash Drawer Reconciliation Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6 max-w-3xl">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Cash Float & Physical Drawer Count</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify actual currency notes inside drawer against system calculations.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center py-2 border-b border-slate-100 text-slate-700">
            <span>Opening Cash Fund (Float / Change Money):</span>
            <span className="font-bold text-slate-900">
              PKR {openingFloat.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100 text-slate-700">
            <span>Cash Sales Collected in Shift:</span>
            <span className="font-bold text-emerald-700">
              + PKR {totalCashSales.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-sm font-bold text-slate-900 bg-slate-50 px-3 rounded-xl">
            <span>Expected Total Cash in Drawer:</span>
            <span className="text-emerald-700 font-extrabold">
              PKR {expectedDrawerCash.toLocaleString()}
            </span>
          </div>

          <div className="pt-3">
            <label className="block text-slate-800 font-bold mb-1.5">
              Physical Cash Counted in Drawer (PKR)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={physicalCashCounted || ''}
                onChange={(e) => setPhysicalCashCounted(parseFloat(e.target.value) || 0)}
                placeholder="Enter total physical currency count..."
                className="w-72 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-base font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setPhysicalCashCounted(expectedDrawerCash)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-indigo-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Match Expected
              </button>
            </div>
          </div>

          {physicalCashCounted > 0 && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                cashVariance === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : cashVariance > 0
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {cashVariance === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>
                  {cashVariance === 0
                    ? 'Drawer Balanced: Exact match with system.'
                    : cashVariance > 0
                    ? `Cash Surplus: PKR ${cashVariance.toLocaleString()} extra in drawer.`
                    : `Cash Shortage: PKR ${Math.abs(cashVariance).toLocaleString()} missing.`}
                </span>
              </div>
              <div className="font-bold text-sm">
                Variance: {cashVariance > 0 ? `+${cashVariance}` : cashVariance}
              </div>
            </div>
          )}
        </div>

        {shiftClosed ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Shift successfully reconciled and closed for Register REG-01.</span>
          </div>
        ) : (
          <div className="pt-2">
            <button
              onClick={handleCloseShift}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalize & Close Shift</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
