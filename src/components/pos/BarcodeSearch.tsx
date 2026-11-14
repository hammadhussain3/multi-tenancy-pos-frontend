import { useRef, useState, useMemo } from 'react';
import type { KeyboardEvent } from 'react';
import { Search, Barcode, X, Plus } from 'lucide-react';
import { usePos } from '../../context/usePos';
import { ProductModal } from '../inventory/ProductModal';
import type { Product } from '../../types/pos';

export function BarcodeSearch() {
  const {
    products,
    addToCart,
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    isUrdu,
  } = usePos();

  const inputRef = useRef<HTMLInputElement>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [unregisteredBarcode, setUnregisteredBarcode] = useState('');

  // High-performance O(1) Hash Map index for 10,000+ Mart inventory scale
  const { barcodeMap, skuMap } = useMemo(() => {
    const bMap = new Map<string, Product>();
    const sMap = new Map<string, Product>();
    for (const p of products) {
      if (p.barcode) bMap.set(p.barcode, p);
      if (p.sku) sMap.set(p.sku.toLowerCase(), p);
    }
    return { barcodeMap: bMap, skuMap: sMap };
  }, [products]);

  // Live Search: Displays ONLY top 2 to 3 matching products when cashier types
  const matchingResults = useMemo(() => {
    const raw = searchQuery.trim();
    if (!raw) return [];
    const norm = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const tokens = norm(raw).split(/\s+/).filter(Boolean);
    return products
      .filter((p) => {
        const t = norm(`${p.name} ${p.nameUrdu || ''} ${p.barcode} ${p.sku}`);
        return tokens.every((tok) => t.includes(tok));
      })
      .slice(0, 3); // STRICTLY 2 to 3 products
  }, [products, searchQuery]);

  // Category Quick Keys: Displays ONLY 2 to 3 quick-select items for the active category
  const categoryQuickProducts = useMemo(() => {
    if (selectedCategory === 'All') {
      // 3-4 Common Mart Essentials: Shopping bags, water, milk
      return products
        .filter((p) =>
          p.name.toLowerCase().includes('shopping bag') ||
          p.barcode === '8964000234567' || // MilkPak 1L
          p.barcode === '8964002000018' || // Nestle water 500ml
          p.barcode === '8964000123456'    // Tapal tea
        )
        .slice(0, 4);
    }
    // Only 2 to 3 products of the selected category
    return products.filter((p) => p.category === selectedCategory).slice(0, 3);
  }, [products, selectedCategory]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      // Supermarket Multiplier Parsing: 5*8964000123456 or 12*101
      let target = trimmed;
      let qty = 1;
      const multiplierMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*[*xX]\s*(.+)$/);
      if (multiplierMatch) {
        qty = Math.max(1, parseFloat(multiplierMatch[1]));
        target = multiplierMatch[2].trim();
      }

      // O(1) Instant Barcode Scanner Lookup (<0.05ms)
      const exactBarcode = barcodeMap.get(target);
      if (exactBarcode) {
        addToCart(exactBarcode, qty);
        setSearchQuery('');
        return;
      }

      // O(1) Instant SKU Lookup (<0.05ms)
      const exactSku = skuMap.get(target.toLowerCase());
      if (exactSku) {
        addToCart(exactSku, qty);
        setSearchQuery('');
        return;
      }

      const norm = (s: string) =>
        s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      const targetNorm = norm(target);
      const targetTokens = targetNorm.split(/\s+/).filter(Boolean);

      const partialMatch = products.find((p) => {
        const text = norm(`${p.name} ${p.nameUrdu || ''} ${p.barcode} ${p.sku}`);
        return targetTokens.every((tok) => text.includes(tok));
      });
      if (partialMatch) {
        addToCart(partialMatch, qty);
        setSearchQuery('');
        return;
      }

      // Barcode not in catalog: prompt quick product registration
      if (target.length >= 3) {
        setUnregisteredBarcode(target);
        setIsAddModalOpen(true);
        setSearchQuery('');
      }
    }
  };

  const handleManualAdd = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    let target = trimmed;
    let qty = 1;
    const multiplierMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*[*xX]\s*(.+)$/);
    if (multiplierMatch) {
      qty = Math.max(1, parseFloat(multiplierMatch[1]));
      target = multiplierMatch[2].trim();
    }

    const exactBarcode = barcodeMap.get(target);
    if (exactBarcode) {
      addToCart(exactBarcode, qty);
      setSearchQuery('');
      return;
    }

    const norm = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const targetNorm = norm(target);
    const targetTokens = targetNorm.split(/\s+/).filter(Boolean);

    const found = products.find((p) => {
      const text = norm(`${p.name} ${p.nameUrdu || ''} ${p.barcode} ${p.sku}`);
      return targetTokens.every((tok) => text.includes(tok));
    });
    if (found) {
      addToCart(found, qty);
      setSearchQuery('');
      return;
    }

    if (target.length >= 3) {
      setUnregisteredBarcode(target);
      setIsAddModalOpen(true);
      setSearchQuery('');
    }
  };

  return (
    <>
      <div className="space-y-2 shrink-0">
        {/* Top Search, Barcode Bar & Quick Add Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-600 dark:text-indigo-400">
              <Barcode className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <input
              id="barcode-search-input"
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isUrdu
                  ? 'بارکوڈ اسکین کریں یا نام تلاش کریں...'
                  : 'Scan barcode with scanner gun or type to search (e.g. 5*Milk)...'
              }
              className="w-full pl-9 sm:pl-11 pr-8 sm:pr-10 py-2 sm:py-2.5 bg-white dark:bg-slate-900 border-2 border-indigo-500/80 dark:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 transition-all shadow-xs"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={handleManualAdd}
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
            title="Search and add"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isUrdu ? 'تلاش / شامل' : 'Search / Add'}</span>
          </button>

          {/* Quick Add Product Button directly from POS screen */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
            title="Create and register a new product into catalog"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isUrdu ? 'نیا آئٹم' : '+ New Product'}</span>
          </button>
        </div>

        {/* Live Search Drawer: Appears ONLY when typing, showing just 2 to 3 matching items */}
        {searchQuery.trim() && matchingResults.length > 0 && (
          <div className="p-2 sm:p-2.5 bg-indigo-50/90 dark:bg-slate-800/90 border border-indigo-200 dark:border-indigo-800 rounded-2xl shadow-md space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-1 text-[11px] font-bold text-indigo-800 dark:text-indigo-300">
              <span>Matching Products ({matchingResults.length}) — Click or press Enter to add:</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Showing top 3</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {matchingResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    addToCart(product, 1);
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 hover:border-indigo-500 hover:shadow-md text-left flex items-center justify-between gap-2 group cursor-pointer transition-all active:scale-[0.98]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {product.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                        PKR {product.retailPrice.toLocaleString()}
                      </span>
                      <span>•</span>
                      <span>Stock: {product.currentStock} {product.unit}</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories Strip & Quick Items: Clean, uncluttered, just 2 to 3 items */}
        {!searchQuery.trim() && (
          <div className="space-y-1.5">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick 2 to 3 Items for Selected Category */}
            {categoryQuickProducts.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
                  {selectedCategory === 'All' ? 'Quick Keys:' : `${selectedCategory}:`}
                </span>
                {categoryQuickProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      addToCart(p, 1);
                      inputRef.current?.focus();
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 shrink-0 cursor-pointer shadow-2xs hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-all active:scale-95"
                    title={`Click to add ${p.name}`}
                  >
                    <span className="truncate max-w-[140px]">{p.name}</span>
                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                      PKR {p.retailPrice.toLocaleString()}
                    </span>
                    <Plus className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Add Modal */}
      {isAddModalOpen && (
        <ProductModal
          initialBarcode={unregisteredBarcode}
          onClose={() => {
            setIsAddModalOpen(false);
            setUnregisteredBarcode('');
          }}
          onProductCreated={(newProd) => {
            addToCart(newProd, 1);
          }}
        />
      )}
    </>
  );
}
