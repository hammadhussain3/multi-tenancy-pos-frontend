import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Zap,
  Scale,
  ShoppingBag,
  CheckCircle2,
  Banknote,
  Keyboard,
  Apple,
  Clock,
  Flame,
} from 'lucide-react';
import { usePos } from '../../context/usePos';
import type { Product } from '../../types/pos';

export function RapidMartView() {
  const {
    products,
    addToCart,
    cart,
    cartTotal,
    processCheckout,
    lastScannedItem,
    isUrdu,
  } = usePos();

  // Control visibility of recent scan alert banner
  const [dismissedTimestamp, setDismissedTimestamp] = useState<number>(0);
  const showRecentAlert = lastScannedItem !== null && lastScannedItem.timestamp > dismissedTimestamp;

  useEffect(() => {
    if (lastScannedItem) {
      const timer = setTimeout(() => {
        setDismissedTimestamp(lastScannedItem.timestamp);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastScannedItem]);

  // Fast-Movers / PLU Definitions with exact product barcode/SKU mappings
  const pluItems = useMemo(() => {
    const list: {
      code: string;
      label: string;
      labelUrdu: string;
      price: number;
      unit: string;
      emoji: string;
      sku: string;
    }[] = [
      { code: '101', label: 'Plastic Shopping Bag', labelUrdu: 'پلاسٹک شاپنگ بیگ', price: 10, unit: 'pcs', emoji: '🛍️', sku: 'PLU-101' },
      { code: '102', label: 'Eco Canvas Tote Bag', labelUrdu: 'بڑا کپڑے کا بیگ', price: 30, unit: 'pcs', emoji: '👜', sku: 'PLU-102' },
      { code: '103', label: 'Fresh Dawn Bread Large', labelUrdu: 'ڈان بریڈ بڑی', price: 180, unit: 'pack', emoji: '🍞', sku: 'PLU-103' },
      { code: '104', label: 'Farm Eggs (Dozen)', labelUrdu: 'فارمی انڈے (درجن)', price: 360, unit: 'box', emoji: '🥚', sku: 'PLU-104' },
      { code: '105', label: 'Fresh Loose Milk (1L)', labelUrdu: 'تازہ دودھ (۱ لیٹر)', price: 220, unit: 'ltr', emoji: '🥛', sku: 'PLU-105' },
      { code: '106', label: 'Pure Water 1.5L', labelUrdu: 'پینے کا پانی ۱.۵ لیٹر', price: 110, unit: 'pack', emoji: '💧', sku: 'PLU-106' },
      { code: '107', label: 'Fresh Bananas (Dozen)', labelUrdu: 'تازہ کیلا (درجن)', price: 190, unit: 'pack', emoji: '🍌', sku: 'PLU-107' },
      { code: '108', label: 'Red Apples (1 KG)', labelUrdu: 'سیب سرخ (۱ کلو)', price: 320, unit: 'kg', emoji: '🍎', sku: 'PLU-108' },
      { code: '109', label: 'Farm Potatoes (1 KG)', labelUrdu: 'تازہ آلو (۱ کلو)', price: 90, unit: 'kg', emoji: '🥔', sku: 'PLU-109' },
      { code: '110', label: 'Fresh Onions (1 KG)', labelUrdu: 'تازہ پیاز (۱ کلو)', price: 140, unit: 'kg', emoji: '🧅', sku: 'PLU-110' },
      { code: '111', label: 'Crushed Ice 2KG', labelUrdu: 'صاف برف کا بیگ ۲ کلو', price: 80, unit: 'pack', emoji: '🧊', sku: 'PLU-111' },
      { code: '112', label: 'Mint / Candies (1 pc)', labelUrdu: 'کینڈی / ٹافی', price: 5, unit: 'pcs', emoji: '🍬', sku: 'PLU-112' },
    ];
    return list;
  }, []);

  // Quick Produce / Weight Scale State
  const [scaleItemName, setScaleItemName] = useState<string>('Red Delicious Apples');
  const [scalePricePerKg, setScalePricePerKg] = useState<number>(320);
  const [scaleGrams, setScaleGrams] = useState<number>(1000);

  const scaleTotal = Math.round((scalePricePerKg * scaleGrams) / 1000);

  const handleRingWeighedItem = useCallback(() => {
    // Find matching produce product in catalog or fallback
    const matched = products.find(
      (p) =>
        p.name.toLowerCase().includes(scaleItemName.toLowerCase()) ||
        p.category === 'Grocery'
    );

    if (matched) {
      addToCart(matched, 1);
    } else {
      const stamp = String(Date.now());
      const tempProduct: Product = {
        id: `weighed-${stamp}`,
        uuid: `018f8b70-9999-7000-8000-${stamp.slice(-12)}`,
        barcode: `WT-${stamp}`,
        sku: `WT-${scaleItemName.slice(0, 4).toUpperCase()}`,
        name: `${scaleItemName} (${(scaleGrams / 1000).toFixed(2)} kg)`,
        category: 'Grocery',
        unit: 'kg',
        purchasePrice: Math.round(scaleTotal * 0.8),
        retailPrice: scaleTotal,
        currentStock: 999,
        minStockAlert: 10,
        taxRate: 0,
        isActive: true,
      };
      addToCart(tempProduct, 1);
    }
  }, [products, scaleItemName, scaleGrams, scaleTotal, addToCart]);

  const handlePluClick = useCallback((code: string) => {
    const found = products.find((p) => p.barcode === code || p.sku === `PLU-${code}`);
    if (found) {
      addToCart(found, 1);
    }
  }, [products, addToCart]);

  const handleFastCashCheckout = useCallback(async (tendered: number) => {
    if (cart.length === 0) return;
    const change = Math.max(0, tendered - cartTotal);
    await processCheckout(
      'cash',
      { cash: cartTotal, card: 0, khata: 0 },
      tendered,
      change
    );
  }, [cart.length, cartTotal, processCheckout]);

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 pb-2">
      {/* 1. Live Scan Flash Alert Banner */}
      {showRecentAlert && lastScannedItem && (
        <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/10 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black flex items-center gap-1.5">
                <span>{isUrdu ? 'آئٹم شامل ہو گیا:' : 'Rung Up:'}</span>
                <span className="text-slate-900 dark:text-slate-100 font-extrabold">{lastScannedItem.name}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                  ×{lastScannedItem.quantity}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Line Total: PKR {lastScannedItem.total.toLocaleString()} • Omni-Scanner Active
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
              PKR {lastScannedItem.total.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* 2. Cashier Velocity & Omni-Scanner HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Ringing Speed</div>
            <div className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <span>Rapid Mart</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Current Basket</div>
            <div className="text-xs font-black text-slate-900 dark:text-slate-100">
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Multiplier Syntax</div>
            <div className="text-xs font-black text-amber-700 dark:text-amber-400">
              12*Code Active
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Terminal Status</div>
            <div className="text-xs font-black text-purple-700 dark:text-purple-400">
              Ready for Scans
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fast-Movers & PLU (Price Look-Up) Touch Dock */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>{isUrdu ? 'فوری پی ایل یو بٹنز (بغیر بارکوڈ اشیاء)' : 'PLU Fast-Movers Dock'}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400">
                  1-Tap Ring
                </span>
              </h3>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            {isUrdu ? 'کوڈ ٹائپ کریں یا بٹن پر کلک کریں' : 'Tap hotkey or type PLU code into barcode box'}
          </div>
        </div>

        {/* 12-Button High Density Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {pluItems.map((item) => (
            <button
              key={item.code}
              onClick={() => handlePluClick(item.code)}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/70 hover:bg-indigo-50/40 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-all text-left group cursor-pointer shadow-2xs active:scale-[0.98] flex flex-col justify-between min-h-[64px]"
            >
              <div className="flex items-start justify-between gap-1 w-full">
                <span className="text-lg leading-none">{item.emoji}</span>
                <span className="px-1.5 py-0.2 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[9px] font-mono font-black text-indigo-600 dark:text-indigo-400 shadow-2xs">
                  #{item.code}
                </span>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1 leading-tight">
                  {isUrdu ? item.labelUrdu : item.label}
                </div>
                <div className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  PKR {item.price.toLocaleString()}
                  <span className="text-[9px] font-normal text-slate-400 ml-0.5">/{item.unit}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Supermarket Produce & Weight Scale Calculator */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>{isUrdu ? 'ڈیجیٹل وزن اور اسکیل کیلکولیٹر' : 'Produce & Digital Scale Weigher'}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                  By Weight
                </span>
              </h3>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Tare: 0.00kg
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
          {/* Produce Name */}
          <div className="sm:col-span-1 space-y-1">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Produce Item
            </label>
            <select
              value={scaleItemName}
              onChange={(e) => {
                setScaleItemName(e.target.value);
                if (e.target.value.includes('Apple')) setScalePricePerKg(320);
                if (e.target.value.includes('Banana')) setScalePricePerKg(190);
                if (e.target.value.includes('Potato')) setScalePricePerKg(90);
                if (e.target.value.includes('Onion')) setScalePricePerKg(140);
                if (e.target.value.includes('Tomato')) setScalePricePerKg(160);
                if (e.target.value.includes('Chicken')) setScalePricePerKg(640);
              }}
              className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Red Delicious Apples">Red Apples (PKR 320/kg)</option>
              <option value="Fresh Farm Potatoes">Farm Potatoes (PKR 90/kg)</option>
              <option value="Fresh Red Onions">Red Onions (PKR 140/kg)</option>
              <option value="Fresh Farm Tomatoes">Farm Tomatoes (PKR 160/kg)</option>
              <option value="Fresh Chicken Meat">Broiler Chicken (PKR 640/kg)</option>
            </select>
          </div>

          {/* Price per KG */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Price per KG
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-[10px] font-bold text-slate-400">
                PKR
              </span>
              <input
                type="number"
                value={scalePricePerKg}
                onChange={(e) => setScalePricePerKg(parseFloat(e.target.value) || 0)}
                className="w-full pl-9 pr-2 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right"
              />
            </div>
          </div>

          {/* Weight in Grams with Quick Presets */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Weight (Grams)
              </label>
              <div className="flex gap-1 text-[9px]">
                <button
                  type="button"
                  onClick={() => setScaleGrams(500)}
                  className="px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 cursor-pointer font-bold"
                >
                  .5k
                </button>
                <button
                  type="button"
                  onClick={() => setScaleGrams(1000)}
                  className="px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 cursor-pointer font-bold"
                >
                  1k
                </button>
                <button
                  type="button"
                  onClick={() => setScaleGrams(2000)}
                  className="px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 cursor-pointer font-bold"
                >
                  2k
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                value={scaleGrams}
                onChange={(e) => setScaleGrams(parseFloat(e.target.value) || 0)}
                step="50"
                className="w-full pl-2 pr-7 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-[10px] font-bold text-slate-400">
                g
              </span>
            </div>
          </div>

          {/* Calculated Output & Add Button */}
          <div className="flex items-center gap-2">
            <div className="text-right flex-1">
              <div className="text-[9px] text-slate-400 font-bold uppercase leading-none">Total</div>
              <div className="text-sm font-black text-emerald-700 dark:text-emerald-400 leading-tight">
                PKR {scaleTotal.toLocaleString()}
              </div>
            </div>

            <button
              onClick={handleRingWeighedItem}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 flex items-center gap-1"
            >
              <Apple className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'بل میں شامل کریں' : '+ Add Weighed'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Fast Cash Tender & Change Calculator Bar */}
      {cart.length > 0 && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-slate-100">
              <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isUrdu ? 'فوری کرنسی نوٹ کی ادائیگی (فاسٹ کیش)' : 'Fast Cash Tender & Instant Change'}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Payable: <strong className="text-emerald-700 dark:text-emerald-400 font-black">PKR {cartTotal.toLocaleString()}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Exact Cash Button */}
            <button
              onClick={() => handleFastCashCheckout(cartTotal)}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-black">Exact Cash</span>
              <span className="text-xs font-black">PKR {cartTotal.toLocaleString()}</span>
              <span className="text-[9px] text-emerald-600/70 font-semibold mt-0.5">Change: 0</span>
            </button>

            {/* Rs. 500 Note Preset */}
            {cartTotal <= 500 && (
              <button
                onClick={() => handleFastCashCheckout(500)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span className="text-[10px] text-slate-500 uppercase font-black">Received Rs. 500</span>
                <span className="text-xs font-black">PKR 500</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  Change: PKR {Math.max(0, 500 - cartTotal).toLocaleString()}
                </span>
              </button>
            )}

            {/* Rs. 1,000 Note Preset */}
            {cartTotal <= 1000 && (
              <button
                onClick={() => handleFastCashCheckout(1000)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span className="text-[10px] text-slate-500 uppercase font-black">Received Rs. 1,000</span>
                <span className="text-xs font-black">PKR 1,000</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  Change: PKR {Math.max(0, 1000 - cartTotal).toLocaleString()}
                </span>
              </button>
            )}

            {/* Rs. 5,000 Note Preset */}
            <button
              onClick={() => handleFastCashCheckout(5000)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <span className="text-[10px] text-slate-500 uppercase font-black">Received Rs. 5,000</span>
              <span className="text-xs font-black">PKR 5,000</span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                Change: PKR {Math.max(0, 5000 - cartTotal).toLocaleString()}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 6. Cashier Pro Keyboard Shortcuts Guide Bar */}
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <Keyboard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Supermarket Terminal Hotkeys:</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span><kbd className="px-1 py-0.2 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold">F2</kbd> Scan Barcode</span>
          <span><kbd className="px-1 py-0.2 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold">F4</kbd> Toggle Mart/Catalog</span>
          <span><kbd className="px-1 py-0.2 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold">F6</kbd> Park Sale</span>
          <span><kbd className="px-1 py-0.2 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold">12*Code</kbd> Multiplier</span>
        </div>
      </div>
    </div>
  );
}
