import { useState } from 'react';
import type { FormEvent } from 'react';
import { Package, CheckCircle2 } from 'lucide-react';
import type { Product, ProductUnit } from '../../types/pos';
import { usePos } from '../../context/usePos';

interface ProductModalProps {
  product?: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addProduct, updateProduct, categories } = usePos();

  const [name, setName] = useState(product?.name || '');
  const [nameUrdu, setNameUrdu] = useState(product?.nameUrdu || '');
  const [barcode, setBarcode] = useState(() => product?.barcode || `8964${Math.floor(100000000 + Math.random() * 900000000)}`);
  const [sku, setSku] = useState(product?.sku || '');
  const [category, setCategory] = useState(product?.category || 'Grocery');
  const [unit, setUnit] = useState<ProductUnit>(product?.unit || 'pcs');
  const [purchasePrice, setPurchasePrice] = useState(product?.purchasePrice || 0);
  const [retailPrice, setRetailPrice] = useState(product?.retailPrice || 0);
  const [currentStock, setCurrentStock] = useState(product?.currentStock || 0);
  const [minStockAlert, setMinStockAlert] = useState(product?.minStockAlert || 5);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !barcode.trim()) {
      alert('Product name and barcode are required.');
      return;
    }

    if (product) {
      updateProduct({
        ...product,
        name,
        nameUrdu: nameUrdu || undefined,
        barcode,
        sku: sku || barcode,
        category,
        unit,
        purchasePrice,
        retailPrice,
        currentStock,
        minStockAlert,
      });
    } else {
      addProduct({
        name,
        nameUrdu: nameUrdu || undefined,
        barcode,
        sku: sku || barcode,
        category,
        unit,
        purchasePrice,
        retailPrice,
        currentStock,
        minStockAlert,
        taxRate: 0,
        isActive: true,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" />
            {product ? 'Edit Product' : 'Add New Retail Product'}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Product Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tapal Tea 450g"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1 font-urdu">
                اردو نام (Urdu Name)
              </label>
              <input
                type="text"
                value={nameUrdu}
                onChange={(e) => setNameUrdu(e.target.value)}
                placeholder="مثال: ٹپال چائے ۴۵۰ گرام"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-urdu shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Barcode (EAN-13)</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">SKU / Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="BEV-001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
              >
                {categories
                  .filter((c) => c !== 'All')
                  .concat(['Grocery', 'Beverages', 'Dairy', 'Snacks', 'Personal Care', 'Pharmacy'])
                  .filter((val, idx, arr) => arr.indexOf(val) === idx)
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Measuring Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as ProductUnit)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none shadow-2xs cursor-pointer"
              >
                <option value="pcs">Pieces (Pcs)</option>
                <option value="pack">Pack</option>
                <option value="box">Box</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="ltr">Litre (Ltr)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Purchase / Cost Price (PKR)
              </label>
              <input
                type="number"
                value={purchasePrice || ''}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Retail Selling Price (PKR)
              </label>
              <input
                type="number"
                value={retailPrice || ''}
                onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none font-bold text-emerald-700 shadow-2xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Current Stock</label>
              <input
                type="number"
                value={currentStock || ''}
                onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                value={minStockAlert || ''}
                onChange={(e) => setMinStockAlert(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none shadow-2xs"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{product ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
