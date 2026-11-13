import { useState } from 'react';
import { Receipt, Search, CheckCircle2, Clock, Eye } from 'lucide-react';
import { usePos } from '../../context/usePos';
import type { Invoice } from '../../types/pos';
import { ThermalReceiptModal } from '../pos/ThermalReceiptModal';

export function SalesHistoryView() {
  const { invoices } = usePos();
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 p-4 gap-4">
      {/* Top Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <span>POS Sales Invoices & Order History</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of completed sales, tender splits, FBR invoice numbers, and sync status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-500 mr-2">Invoices Today:</span>
            <span className="font-bold text-slate-900 font-mono">{invoices.length}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-500 mr-2">Total Sales:</span>
            <span className="font-black text-emerald-700 font-mono">
              PKR {totalSalesAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs shrink-0">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice # or customer phone/name..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold sticky top-0 z-10 border-b border-slate-200 backdrop-blur-xs">
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
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No sales invoices recorded yet. Complete a checkout in POS terminal to generate one.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      <div>{inv.invoiceNo}</div>
                      {inv.fbrInvoiceNo && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          FBR: {inv.fbrInvoiceNo}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {inv.date}
                    </td>

                    <td className="py-2.5 px-3">
                      {inv.customer ? (
                        <div>
                          <div className="font-bold text-slate-900">{inv.customer.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {inv.customer.phone}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Walk-in</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        {inv.payments.cash > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            Cash
                          </span>
                        )}
                        {inv.payments.card > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                            Card
                          </span>
                        )}
                        {inv.payments.khata > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                            Khata
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {inv.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-700">
                      PKR {inv.grandTotal.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {inv.isSynced ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Synced
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Local Queue
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-indigo-600" />
                        <span>Receipt</span>
                      </button>
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
