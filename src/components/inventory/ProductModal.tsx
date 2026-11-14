import { useState } from 'react';
import type { FormEvent } from 'react';
import { Package, CheckCircle2 } from 'lucide-react';
import type { Product, ProductUnit } from '../../types/pos';
import { usePos } from '../../context/usePos';

interface ProductModalProps {
  product?: Product;
  initialBarcode?: string;
  onClose: () => void;
  onProductCreated?: (product: Product) => void;
}

export function ProductModal({
  product,
  initialBarcode,
  onClose,
  onProductCreated,
}: ProductModalProps) {
  const { addProduct, updateProduct, categories } = usePos();

  const [name, setName] = useState(product?.name || '');
  const [nameUrdu, setNameUrdu] = useState(product?.nameUrdu || '');
  const [barcode, setBarcode] = useState(
    () => initialBarcode || product?.barcode || `8964${Math.floor(100000000 + Math.random() * 900000000)}`
  );
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
      const payload = {
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
      };
      addProduct(payload);
      if (onProductCreated) {
        onProductCreated({
          ...payload,
          id: `prod-${Date.now()}`,
          uuid: `018f8b70-1111-7000-8000-${Date.now().toString().slice(-12)}`,
        });
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {product ? 'Edit Product' : 'Add New Retail Product'}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Product Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tapal Tea 450g"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                اردو نام (Urdu Name)
              </label>
              <input
                type="text"
                value={nameUrdu}
                onChange={(e) => setNameUrdu(e.target.value)}
                placeholder="مثال: ٹپال چائے ۴۵۰ گرام"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Barcode (EAN-13)</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">SKU / Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="BEV-001"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
              >
                {categories
                  .filter((c) => c !== 'All')
                  .concat(['Grocery', 'Beverages', 'Dairy', 'Snacks', 'Personal Care', 'Pharmacy'])
                  .filter((val, idx, arr) => arr.indexOf(val) === idx)
                  .map((cat) => (
                    <option key={cat} value={cat} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                      {cat}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Measuring Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as ProductUnit)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none shadow-2xs cursor-pointer"
              >
                <option value="pcs" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Pieces (Pcs)</option>
                <option value="pack" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Pack</option>
                <option value="box" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Box</option>
                <option value="kg" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Kilogram (kg)</option>
                <option value="g" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Gram (g)</option>
                <option value="ltr" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Litre (Ltr)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Purchase / Cost Price (PKR)
              </label>
              <input
                type="number"
                value={purchasePrice || ''}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Retail Selling Price (PKR)
              </label>
              <input
                type="number"
                value={retailPrice || ''}
                onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-emerald-700 dark:text-emerald-400 font-bold focus:outline-none shadow-2xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Current Stock</label>
              <input
                type="number"
                value={currentStock || ''}
                onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                value={minStockAlert || ''}
                onChange={(e) => setMinStockAlert(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none shadow-2xs"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
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