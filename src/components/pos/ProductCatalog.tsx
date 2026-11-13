import { useMemo } from 'react';
import { Package, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { usePos } from '../../context/usePos';
import type { Product } from '../../types/pos';

export function ProductCatalog() {
  const { products, selectedCategory, searchQuery, addToCart, isUrdu } = usePos();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.nameUrdu && p.nameUrdu.includes(q)) ||
        p.barcode.includes(q) ||
        p.sku.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto pr-1">
      {filteredProducts.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Package className="w-10 h-10 mb-2 stroke-1 text-slate-400" />
          <div className="text-sm font-semibold text-slate-700">No products found</div>
          <div className="text-xs text-slate-500 mt-1">
            Try a different search term, barcode, or category filter.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
          {filteredProducts.map((product: Product) => {
            const isOutOfStock = product.currentStock <= 0;
            const isLowStock = !isOutOfStock && product.currentStock <= product.minStockAlert;

            return (
              <button
                key={product.id}
                onClick={() => addToCart(product, 1)}
                disabled={isOutOfStock}
                className={`text-left p-3 rounded-xl border flex flex-col justify-between transition-all group relative overflow-hidden ${
                  isOutOfStock
                    ? 'bg-slate-100/60 border-slate-200 opacity-60 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-indigo-500/70 hover:shadow-md hover:shadow-indigo-500/5 cursor-pointer active:scale-[0.98]'
                }`}
              >
                {/* Top: Category & Stock Pill */}
                <div className="flex items-center justify-between gap-1 w-full text-[10px] mb-1.5">
                  <span className="text-slate-500 font-medium truncate">{product.category}</span>
                  {isOutOfStock ? (
                    <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {product.currentStock} {product.unit}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {product.currentStock} {product.unit}
                    </span>
                  )}
                </div>

                {/* Middle: Name & Barcode */}
                <div className="my-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                    {product.name}
                  </div>
                  {isUrdu && product.nameUrdu && (
                    <div className="text-[11px] text-amber-800 font-medium mt-0.5">
                      {product.nameUrdu}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 mt-1">
                    {product.barcode}
                  </div>
                </div>

                {/* Bottom: Price & Add Icon */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between w-full">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">PKR </span>
                    <span className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {product.retailPrice.toLocaleString()}
                    </span>
                  </div>

                  {!isOutOfStock && (
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
