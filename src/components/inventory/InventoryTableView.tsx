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

  // Metrics
  const totalStockValueCost = products.reduce((acc, p) => acc + p.purchasePrice * p.currentStock, 0);
  const totalStockValueRetail = products.reduce((acc, p) => acc + p.retailPrice * p.currentStock, 0);
  const lowStockCount = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStockAlert).length;
  const outOfStockCount = products.filter((p) => p.currentStock <= 0).length;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.sku.toLowerCase().includes(q);

      let matchStock = true;
      if (stockFilter === 'low') matchStock = p.currentStock > 0 && p.currentStock <= p.minStockAlert;
      if (stockFilter === 'out') matchStock = p.currentStock <= 0;

      return matchCat && matchSearch && matchStock;
    });
  }, [products, selectedCategory, search, stockFilter]);

  const handleStockAdjustSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!adjustingProduct || adjustmentDelta === 0) return;
    adjustStock(adjustingProduct.id, adjustmentDelta, adjustmentReason);
    setAdjustingProduct(null);
    setAdjustmentDelta(0);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 p-4 gap-4">
      {/* Top Header & Metrics */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            <span>Retail Products & Inventory Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock levels, barcodes, pricing, and append-only stock movement tracking.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Catalog Items</div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">{products.length} SKUs</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Inventory Retail Valuation</div>
          <div className="text-xl font-black text-emerald-700 font-mono mt-1">
            PKR {totalStockValueRetail.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            Cost: PKR {totalStockValueCost.toLocaleString()}
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Low Stock Warnings</div>
          <div className="text-xl font-black text-amber-800 font-mono mt-1 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            {lowStockCount} Products
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Out of Stock</div>
          <div className="text-xl font-black text-rose-700 font-mono mt-1">
            {outOfStockCount} Products
          </div>
        </div>
      </div>

      {/* Table Filter Controls */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, barcode, or SKU..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              stockFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Stock ({products.length})
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              stockFilter === 'low'
                ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 text-amber-800 hover:text-amber-900'
            }`}
          >
            Low ({lowStockCount})
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              stockFilter === 'out'
                ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 text-rose-700 hover:text-rose-800'
            }`}
          >
            Out ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold sticky top-0 z-10 border-b border-slate-200 backdrop-blur-xs">
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
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
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
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {prod.name}
                        </div>
                        {isUrdu && prod.nameUrdu && (
                          <div className="text-[11px] text-amber-800 font-urdu mt-0.5">
                            {prod.nameUrdu}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                          <span>Barcode: {prod.barcode}</span>
                          <span>•</span>
                          <span>SKU: {prod.sku}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          {prod.category}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        PKR {prod.purchasePrice.toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        PKR {prod.retailPrice.toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold">
                        {marginPercent}%
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            0 {prod.unit} (Out of Stock)
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {prod.currentStock} {prod.unit} (Low)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                            title="Adjust Stock In / Out"
                          >
                            <ArrowUpDown className="w-3 h-3 text-indigo-600" />
                            <span>Stock</span>
                          </button>

                          <button
                            onClick={() => setEditingProduct(prod)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
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
                            className="p-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
      </div>

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-indigo-600" />
                <span>Adjust Stock (Append-Only Movement)</span>
              </div>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="font-bold text-slate-900">{adjustingProduct.name}</div>
              <div className="text-slate-500 mt-1 font-mono">
                Current Stock: {adjustingProduct.currentStock} {adjustingProduct.unit}
              </div>
            </div>

            <form onSubmit={handleStockAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Quantity Change (+ to Add, - to Deduct)
                </label>
                <input
                  type="number"
                  value={adjustmentDelta || ''}
                  onChange={(e) => setAdjustmentDelta(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 24 or -5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Movement Reason / Reference
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none shadow-2xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Record Movement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modals */}
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
