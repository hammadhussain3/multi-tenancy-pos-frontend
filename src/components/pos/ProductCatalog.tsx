import { useState, useMemo } from 'react';
import { usePos } from '../../context/usePos';
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  Barcode,
  CheckCircle2,
  ScanLine,
} from 'lucide-react';
import { DataTablePagination } from '../common/DataTablePagination';

export function ProductCatalog() {
  const {
    cart,
    updateQuantity,
    updateDiscount,
    removeFromCart,
    lastScannedItem,
    isUrdu,
  } = usePos();

  // Scanned Register Pagination (Default: 10 records per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(cart.length / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedCart = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return cart.slice(start, start + pageSize);
  }, [cart, validPage, pageSize]);

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
      {/* 1. Live Scan Feedback Hero Banner */}
      {lastScannedItem && (
        <div className="shrink-0 p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-indigo-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-2 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 leading-none">
                {isUrdu ? 'آخری آئٹم اسکین ہوا' : 'Just Scanned'}
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate mt-0.5 leading-tight">
                {lastScannedItem.name}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
              {lastScannedItem.quantity} × PKR {(lastScannedItem.total / lastScannedItem.quantity).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Line: PKR {lastScannedItem.total.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Scanned Items Register Table */}
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden">
        {cart.length === 0 ? (
          /* High-Tech Cashier Terminal Standby Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                <ScanLine className="w-8 h-8 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Barcode className="w-3.5 h-3.5" />
              </div>
            </div>

            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
              {isUrdu ? 'کیشیئر اسکینر تیار ہے' : 'Cashier Scanner Gun Ready'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
              {isUrdu
                ? 'بارکوڈ گن سے بارکوڈ اسکین کریں یا نام تلاش کریں۔ اسکین شدہ آئٹمز یہاں رجسٹر ٹیپ میں آئیں گے۔'
                : 'Point scanner gun at product barcodes or type name/SKU in the top bar. Rung-up items appear here in real time.'}
            </p>

            {/* Quick Terminal Guide */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200">F2:</span>
                <span>Focus Scanner</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200">Enter:</span>
                <span>Add Scanned Code</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200">5*Code:</span>
                <span>Quantity Multiplier</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Scanned Items Table */}
            <div className="flex-1 min-h-0 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-xs border-b border-slate-200 dark:border-slate-700/80 z-10 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 hidden md:table-cell">Category</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-center w-28">Quantity</th>
                  <th className="py-2.5 px-3 text-right hidden sm:table-cell w-24">Discount</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedCart.map((item, idx) => (
                  <tr
                    key={item.product.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Line Index */}
                    <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-400 font-semibold">
                      {(validPage - 1) * pageSize + idx + 1}
                    </td>

                    {/* Product Name & Barcode */}
                    <td className="py-2.5 px-3">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        {item.product.name}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                        <span>{item.product.barcode}</span>
                        <span className="sm:hidden font-semibold text-slate-600 dark:text-slate-300">
                          PKR {item.unitPrice.toLocaleString()} / {item.product.unit}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3 hidden md:table-cell text-xs text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-medium">
                        {item.product.category}
                      </span>
                    </td>

                    {/* Unit Price */}
                    <td className="py-2.5 px-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
                      PKR {item.unitPrice.toLocaleString()}
                    </td>

                    {/* Quantity Stepper */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-2xs w-fit mx-auto overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer active:scale-95"
                          title="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-black text-slate-900 dark:text-slate-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer active:scale-95"
                          title="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Line Discount */}
                    <td className="py-2.5 px-3 text-right hidden sm:table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        <input
                          type="number"
                          value={item.discountAmount || ''}
                          onChange={(e) =>
                            updateDiscount(item.product.id, parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="w-14 text-right text-[11px] font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </td>

                    {/* Line Total */}
                    <td className="py-2.5 px-3 text-right text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                      PKR {item.total.toLocaleString()}
                    </td>

                    {/* Remove Action */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Void line item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            {/* Scanned Items Pagination Bar (Default: 10 items per page) */}
            {cart.length > pageSize && (
              <DataTablePagination
                currentPage={validPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={cart.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                isUrdu={isUrdu}
                itemLabel="items"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
