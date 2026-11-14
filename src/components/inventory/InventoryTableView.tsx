import { useState, useMemo } from 'react';
import type { FormEvent } from 'react';
import {
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  Boxes,
  ArrowUpDown,
} from 'lucide-react';
import { usePos } from '../../context/usePos';
import type { Product } from '../../types/pos';
import { ProductModal } from './ProductModal';
import { DataTablePagination } from '../common/DataTablePagination';

export function InventoryTableView() {
  const { products, categories, adjustStock, deleteProduct, isUrdu } = usePos();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustmentDelta, setAdjustmentDelta] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Restock from supplier');

  // Pagination (Default: 10 records per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Metrics
  const totalStockValueCost = products.reduce((acc, p) => acc + p.purchasePrice * p.currentStock, 0);
  const totalStockValueRetail = products.reduce((acc, p) => acc + p.retailPrice * p.currentStock, 0);
  const lowStockCount = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStockAlert).length;
  const outOfStockCount = products.filter((p) => p.currentStock <= 0).length;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const rawQ = search.trim();
      const norm = (s: string) =>
        s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      const qTokens = rawQ ? norm(rawQ).split(/\s+/).filter(Boolean) : [];
      const targetText = norm(`${p.name} ${p.barcode} ${p.sku}`);
      const matchSearch =
        qTokens.length === 0 || qTokens.every((tok) => targetText.includes(tok));

      let matchStock = true;
      if (stockFilter === 'low') matchStock = p.currentStock > 0 && p.currentStock <= p.minStockAlert;
      if (stockFilter === 'out') matchStock = p.currentStock <= 0;

      return matchCat && matchSearch && matchStock;
    });
  }, [products, selectedCategory, search, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, validPage, pageSize]);

  const handleStockAdjustSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!adjustingProduct || adjustmentDelta === 0) return;
    adjustStock(adjustingProduct.id, adjustmentDelta, adjustmentReason);
    setAdjustingProduct(null);
    setAdjustmentDelta(0);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0b0f19] p-2.5 sm:p-4 gap-2.5 sm:gap-4 transition-colors duration-200">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Retail Products & Inventory Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time stock levels, barcodes, pricing, and append-only stock movement tracking.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Catalog Items</div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{products.length} SKUs</div>
        </div>
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">Inventory Retail Valuation</div>
          <div className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            PKR {totalStockValueRetail.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Cost: PKR {totalStockValueCost.toLocaleString()}
          </div>
        </div>
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">Low Stock Warnings</div>
          <div className="text-lg sm:text-xl font-black text-amber-800 dark:text-amber-400 mt-1 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            {lowStockCount} Products
          </div>
        </div>
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">Out of Stock</div>
          <div className="text-lg sm:text-xl font-black text-rose-700 dark:text-rose-400 mt-1">
            {outOfStockCount} Products
          </div>
        </div>
      </div>

      {/* Table Filter Controls */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by name, barcode, or SKU..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-0.5">
          <button
            onClick={() => {
              setStockFilter('all');
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              stockFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            All Stock ({products.length})
          </button>
          <button
            onClick={() => {
              setStockFilter('low');
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              stockFilter === 'low'
                ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-amber-800 dark:text-amber-400 hover:text-amber-900'
            }`}
          >
            Low ({lowStockCount})
          </button>
          <button
            onClick={() => {
              setStockFilter('out');
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              stockFilter === 'out'
                ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-rose-700 dark:text-rose-400 hover:text-rose-800'
            }`}
          >
            Out ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[760px]">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-semibold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xs">
              <tr>
                <th className="py-2.5 px-3">Product Name & Barcode</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Cost Price</th>
                <th className="py-2.5 px-3 text-right">Selling Price</th>
                <th className="py-2.5 px-3 text-right">Margin %</th>
                <th className="py-2.5 px-3 text-center">Stock Level</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 dark:text-slate-400">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((prod) => {
                  const isOut = prod.currentStock <= 0;
                  const isLow = !isOut && prod.currentStock <= prod.minStockAlert;
                  const marginPercent =
                    prod.retailPrice > 0
                      ? Math.round(
                          ((prod.retailPrice - prod.purchasePrice) / prod.retailPrice) * 100
                        )
                      : 0;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {prod.name}
                        </div>
                        {isUrdu && prod.nameUrdu && (
                          <div className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
                            {prod.nameUrdu}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Barcode: {prod.barcode} • SKU: {prod.sku}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                          {prod.category}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                        PKR {prod.purchasePrice.toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 dark:text-slate-100">
                        PKR {prod.retailPrice.toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-bold ${
                            marginPercent >= 20
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : marginPercent > 10
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {marginPercent}%
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                            {prod.currentStock} {prod.unit}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                            {prod.currentStock} {prod.unit}
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setAdjustingProduct(prod);
                              setAdjustmentDelta(0);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                            title="Adjust Stock In / Out"
                          >
                            <ArrowUpDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                            <span>Stock</span>
                          </button>

                          <button
                            onClick={() => setEditingProduct(prod)}
                            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove "${prod.name}" from your catalog?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remove Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* DataTable Pagination (Default: 10 records per page) */}
        <DataTablePagination
          currentPage={validPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          isUrdu={isUrdu}
          itemLabel="products"
        />
      </div>

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Adjust Stock (Append-Only Movement)</span>
              </div>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100">{adjustingProduct.name}</div>
              <div className="text-slate-500 dark:text-slate-400 mt-1">
                Current Stock: {adjustingProduct.currentStock} {adjustingProduct.unit}
              </div>
            </div>

            <form onSubmit={handleStockAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Quantity Change (+ to Add, - to Deduct)
                </label>
                <input
                  type="number"
                  value={adjustmentDelta || ''}
                  onChange={(e) => setAdjustmentDelta(parseInt(e.target.value) || 0)}
                  placeholder="e.g. +10 or -5"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Audit Reason</label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Reason for change..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Record Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isAddModalOpen && <ProductModal onClose={() => setIsAddModalOpen(false)} />}
      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}
