import { useState } from 'react';
import { Receipt, Search, CheckCircle2, Clock, Eye, RotateCcw } from 'lucide-react';
import { usePos } from '../../context/usePos';
import type { Invoice } from '../../types/pos';
import { ThermalReceiptModal } from '../pos/ThermalReceiptModal';

export function SalesHistoryView() {
  const { invoices, refundInvoice } = usePos();
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customer && inv.customer.name.toLowerCase().includes(search.toLowerCase())) ||
      (inv.customer && inv.customer.phone.includes(search))
  );

  const totalSalesAmount = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0b0f19] p-2.5 sm:p-4 gap-2.5 sm:gap-4 transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>POS Sales Invoices & Order History</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail of completed sales, tender splits, FBR invoice numbers, and sync status.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs text-xs">
            <span className="text-slate-500 dark:text-slate-400 mr-1.5 sm:mr-2">Today:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{invoices.length} inv</span>
          </div>
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs text-xs">
            <span className="text-slate-500 dark:text-slate-400 mr-1.5 sm:mr-2">Sales:</span>
            <span className="font-black text-emerald-700 dark:text-emerald-400">
              PKR {totalSalesAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice # or customer phone/name..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[740px]">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-semibold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xs">
              <tr>
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Tender Type</th>
                <th className="py-2.5 px-3 text-right">Items</th>
                <th className="py-2.5 px-3 text-right">Grand Total</th>
                <th className="py-2.5 px-3 text-center">Sync State</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    No sales invoices recorded yet. Complete a checkout in POS terminal to generate one.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                      <div>{inv.invoiceNo}</div>
                      {inv.fbrInvoiceNo && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                          FBR: {inv.fbrInvoiceNo}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                      {inv.date}
                    </td>

                    <td className="py-2.5 px-3">
                      {inv.customer ? (
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{inv.customer.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {inv.customer.phone}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">Walk-in</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        {inv.payments.cash > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                            Cash
                          </span>
                        )}
                        {inv.payments.card > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold">
                            Card
                          </span>
                        )}
                        {inv.payments.khata > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                            Khata
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300 font-semibold">
                      {inv.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700 dark:text-emerald-400">
                      PKR {inv.grandTotal.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {inv.status === 'refunded' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 inline-flex items-center gap-1">
                            Refunded
                          </span>
                        ) : inv.isSynced ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Synced
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> Local Queue
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="View & Reprint Thermal Receipt"
                        >
                          <Eye className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span>Receipt</span>
                        </button>

                        {inv.status !== 'refunded' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Process return/refund for invoice ${inv.invoiceNo} and restock items?`)) {
                                refundInvoice(inv.id, 'Customer return processed at counter');
                              }
                            }}
                            className="px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-[11px] font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Return goods & restock items"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span className="hidden sm:inline">Return</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thermal Receipt Modal Preview */}
      {selectedInvoice && (
        <ThermalReceiptModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}