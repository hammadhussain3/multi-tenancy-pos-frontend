import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Search, Barcode, X, Plus } from 'lucide-react';
import { usePos } from '../../context/usePos';
import { ProductModal } from '../inventory/ProductModal';

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      const exactBarcode = products.find((p) => p.barcode === trimmed);
      if (exactBarcode) {
        addToCart(exactBarcode, 1);
        setSearchQuery('');
        return;
      }

      const exactSku = products.find((p) => p.sku.toLowerCase() === trimmed.toLowerCase());
      if (exactSku) {
        addToCart(exactSku, 1);
        setSearchQuery('');
        return;
      }

      const partialMatch = products.find(
        (p) =>
          p.name.toLowerCase().includes(trimmed.toLowerCase()) ||
          p.barcode.includes(trimmed)
      );
      if (partialMatch) {
        addToCart(partialMatch, 1);
        setSearchQuery('');
      }
    }
  };

  return (
    <>
      <div className="space-y-3">
        {/* Top Search, Barcode Bar & Quick Add Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Barcode className="w-5 h-5 text-indigo-600" />
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
                  ? 'بارکوڈ اسکین کریں یا پروڈکٹ کا نام تلاش کریں... (F2)'
                  : 'Scan Barcode or Search Products by Name/SKU... (Press F2 to focus)'
              }
              className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono shadow-xs"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              const trimmed = searchQuery.trim();
              const found = products.find(
                (p) =>
                  p.barcode === trimmed ||
                  p.name.toLowerCase().includes(trimmed.toLowerCase())
              );
              if (found) {
                addToCart(found, 1);
                setSearchQuery('');
              }
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'تلاش' : 'Search / Add'}</span>
          </button>

          {/* Quick Add Product Button directly from POS screen */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
            title="Create and register a new product into catalog"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isUrdu ? 'نیا آئٹم' : '+ New Product'}</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Add Modal */}
      {isAddModalOpen && <ProductModal onClose={() => setIsAddModalOpen(false)} />}
    </>
  );
}
