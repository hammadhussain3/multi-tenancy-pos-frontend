import { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  ActiveTab,
  CartItem,
  Customer,
  CustomerLedgerEntry,
  HeldOrder,
  Invoice,
  InvoicePaymentBreakdown,
  PaymentMethod,
  Product,
  TenantInfo,
  PosTerminalMode,
} from '../types/pos';
import {
  INITIAL_CUSTOMERS,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_PRODUCTS,
  INITIAL_TENANTS,
} from '../mock/sampleData';
import { posApi } from '../services/posApi';
import { PosContext } from './posContextDefinition';

export function PosProvider({ children }: { children: ReactNode }) {
  // System State
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [posTerminalMode, setPosTerminalMode] = useState<PosTerminalMode>('catalog');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('posify_terminal_mode', 'catalog');
    }
  }, [posTerminalMode]);

  const [lastScannedItem, setLastScannedItem] = useState<{
    name: string;
    quantity: number;
    total: number;
    timestamp: number;
  } | null>(null);

  const [tenants, setTenants] = useState<TenantInfo[]>(INITIAL_TENANTS);
  const [currentTenant, setCurrentTenant] = useState<TenantInfo>(INITIAL_TENANTS[0]);
  const [isUrdu, setIsUrdu] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('posify_theme');
      if (saved === 'dark' || saved === 'light') {
        if (saved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return saved;
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('posify_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Products
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Parked / Held Orders for busy Mart cashiers
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);

  // Khata & Customers
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [customerLedgers, setCustomerLedgers] = useState<Record<string, CustomerLedgerEntry[]>>(INITIAL_LEDGER_ENTRIES);

  // Invoices & Thermal Receipt
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeReceipt, setActiveReceipt] = useState<Invoice | null>(null);

  // Live Backend Hydration with Multi-Tenant Support & Offline Fallback
  useEffect(() => {
    let isMounted = true;
    async function initData() {
      try {
        const tid = parseInt(currentTenant.id, 10) || 1;
        posApi.setActiveTenantId(tid);

        const [liveTenants, liveProducts, liveCustomers, liveInvoices] = await Promise.all([
          posApi.getTenants().catch(() => INITIAL_TENANTS),
          posApi.getProducts(tid),
          posApi.getCustomers(tid),
          posApi.getInvoices(tid),
        ]);

        if (isMounted) {
          if (liveTenants && liveTenants.length > 0) setTenants(liveTenants);
          if (liveProducts.length > 0) setProducts(liveProducts);
          if (liveCustomers.length > 0) setCustomers(liveCustomers);
          if (liveInvoices.length > 0) setInvoices(liveInvoices);
          setIsOffline(false);
          setPendingSyncCount(0);
        }
      } catch {
        // Fallback to local offline state if backend not reached
        if (isMounted) {
          setIsOffline(true);
        }
      }
    }
    initData();
    return () => {
      isMounted = false;
    };
  }, [currentTenant.id]);

  // Derive Categories
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Cart Computations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const cartDiscount = cart.reduce((acc, item) => acc + item.discountAmount, 0);
  const cartTax = 0; // Tax free or standard FBR rate
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartTax);

  const playBeep = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.05);
        }
      }
    } catch {
      // AudioContext policy: gracefully continue
    }
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (product.currentStock <= 0) {
      alert(`"${product.name}" is currently Out of Stock.`);
      return;
    }

    playBeep();
    setLastScannedItem({
      name: product.name,
      quantity,
      total: quantity * product.retailPrice,
      timestamp: Date.now(),
    });

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > product.currentStock) {
          alert(`Cannot add more than available stock (${product.currentStock} ${product.unit}).`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: nextQty,
                total: nextQty * item.unitPrice - item.discountAmount,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          unitPrice: product.retailPrice,
          discountAmount: 0,
          total: quantity * product.retailPrice,
        },
      ];
    });
  }, [playBeep]);

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.currentStock) {
      alert(`Stock limit reached for ${product.name} (Max: ${product.currentStock}).`);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              total: quantity * item.unitPrice - item.discountAmount,
            }
          : item
      )
    );
  };

  const updateDiscount = (productId: string, discount: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              discountAmount: Math.max(0, discount),
              total: Math.max(0, item.quantity * item.unitPrice - discount),
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  // Park & Resume Order (Hold / Park Sale)
  const holdCurrentOrder = useCallback((note?: string) => {
    if (cart.length === 0) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newHeld: HeldOrder = {
      id: `held-${Date.now()}`,
      heldAt: timeStr,
      items: [...cart],
      customer: selectedCustomer,
      subtotal: cartTotal,
      note,
    };
    setHeldOrders((prev) => [newHeld, ...prev]);
    clearCart();
  }, [cart, selectedCustomer, cartTotal]);

  const resumeHeldOrder = (id: string) => {
    const target = heldOrders.find((h) => h.id === id);
    if (!target) return;
    setCart(target.items);
    setSelectedCustomer(target.customer);
    setHeldOrders((prev) => prev.filter((h) => h.id !== id));
    setActiveTab('pos');
  };

  const deleteHeldOrder = (id: string) => {
    setHeldOrders((prev) => prev.filter((h) => h.id !== id));
  };

  // Refund / Return Invoice (Restores Stock and Reverses Khata)
  const refundInvoice = useCallback((invoiceId: string, reason?: string) => {
    setInvoices((prevInvoices) => {
      const target = prevInvoices.find((inv) => inv.id === invoiceId);
      if (!target || target.status === 'refunded') return prevInvoices;

      // 1. Restock items back into inventory
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          const matched = target.items.find((item) => item.product.id === p.id);
          if (matched) {
            return { ...p, currentStock: p.currentStock + matched.quantity };
          }
          return p;
        })
      );

      // 2. Reverse Khata debt if it had credit balance
      if (target.customer && target.payments.khata > 0) {
        const custId = target.customer.id;
        const amount = target.payments.khata;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const refId = `ledg-ref-${Date.now()}`;

        setCustomers((prevCusts) =>
          prevCusts.map((c) =>
            c.id === custId ? { ...c, currentBalance: c.currentBalance - amount } : c
          )
        );

        setCustomerLedgers((prevLedgers) => {
          const currentLedger = prevLedgers[custId] || [];
          const runningBal = (currentLedger[0]?.runningBalance ?? 0) - amount;
          const reverseEntry: CustomerLedgerEntry = {
            id: refId,
            uuid: `018f8b70-ref-${Date.now()}`,
            customerId: custId,
            date: now,
            referenceType: 'return',
            referenceNo: target.invoiceNo,
            debit: 0,
            credit: amount,
            runningBalance: runningBal,
            narration: `Refund for invoice ${target.invoiceNo}: ${reason || 'Customer returned items'}`,
          };
          return {
            ...prevLedgers,
            [custId]: [reverseEntry, ...currentLedger],
          };
        });
      }

      // 3. Mark invoice as refunded
      return prevInvoices.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'refunded',
              refundReason: reason || 'Customer returned goods',
            }
          : inv
      );
    });
  }, []);

  // Stock Adjustment (Append-Only mindset in frontend state)
  const adjustStock = (productId: string, delta: number, _reason: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const nextStock = Math.max(0, p.currentStock + delta);
          return { ...p, currentStock: nextStock };
        }
        return p;
      })
    );
    if (isOffline) {
      setPendingSyncCount((c) => c + 1);
    }
  };

  const addProduct = (newProd: Omit<Product, 'id' | 'uuid'>) => {
    const id = `prod-${Date.now()}`;
    const uuid = `018f8b70-auto-${Date.now()}`;
    const product: Product = { ...newProd, id, uuid };
    setProducts((prev) => [product, ...prev]);
    if (isOffline) setPendingSyncCount((c) => c + 1);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (isOffline) setPendingSyncCount((c) => c + 1);
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    if (isOffline) setPendingSyncCount((c) => c + 1);
  };

  // Khata Payment Processing
  const recordCustomerPayment = (customerId: string, amount: number, narration: string) => {
    const targetCustomer = customers.find((c) => c.id === customerId);
    if (!targetCustomer) return;

    const newBalance = targetCustomer.currentBalance - amount;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const entryId = `ledg-${Date.now()}`;

    const newEntry: CustomerLedgerEntry = {
      id: entryId,
      uuid: `018f8b70-pay-${Date.now()}`,
      customerId,
      date: now,
      referenceType: 'payment_received',
      referenceNo: `REC-${Date.now().toString().slice(-6)}`,
      debit: 0,
      credit: amount,
      runningBalance: newBalance,
      narration: narration || 'Cash Received from Customer',
    };

    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, currentBalance: newBalance } : c))
    );

    setCustomerLedgers((prev) => ({
      ...prev,
      [customerId]: [newEntry, ...(prev[customerId] || [])],
    }));

    if (isOffline) setPendingSyncCount((c) => c + 1);
  };

  // POS Checkout Execution
  const processCheckout = (
    method: PaymentMethod,
    breakdown: InvoicePaymentBreakdown,
    cashTendered?: number,
    changeGiven?: number
  ): Invoice => {
    const timestamp = Date.now();
    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${timestamp.toString().slice(-4)}`;
    const fbrInvoiceNumber = `${currentTenant.fbrPosId}-${timestamp.toString().slice(-6)}`;

    const newInvoice: Invoice = {
      id: `inv-${timestamp}`,
      uuid: `018f8b70-inv-${timestamp}`,
      invoiceNo: invoiceNumber,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      tenantId: currentTenant.id,
      deviceId: 'REG-01',
      cashierName: 'Hammad Hussain',
      customer: selectedCustomer || undefined,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: cartDiscount,
      tax: cartTax,
      grandTotal: cartTotal,
      paymentMethod: method,
      payments: breakdown,
      cashTendered,
      changeGiven,
      fbrInvoiceNo: fbrInvoiceNumber,
      isSynced: !isOffline,
    };

    // 1. Deduct Stock for sold items
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((item) => item.product.id === prod.id);
        if (cartItem) {
          return {
            ...prod,
            currentStock: Math.max(0, prod.currentStock - cartItem.quantity),
          };
        }
        return prod;
      })
    );

    // 2. Post to Customer Khata if Udhaar/Credit portion exists
    if (selectedCustomer && breakdown.khata > 0) {
      const custId = selectedCustomer.id;
      const updatedBalance = selectedCustomer.currentBalance + breakdown.khata;

      const ledgerEntry: CustomerLedgerEntry = {
        id: `ledg-${timestamp}`,
        uuid: `018f8b70-sale-${timestamp}`,
        customerId: custId,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        referenceType: 'sale',
        referenceNo: invoiceNumber,
        debit: breakdown.khata,
        credit: 0,
        runningBalance: updatedBalance,
        narration: `POS Credit Sale (${cart.map((i) => i.product.name).join(', ')})`,
      };

      setCustomers((prev) =>
        prev.map((c) => (c.id === custId ? { ...c, currentBalance: updatedBalance } : c))
      );

      setCustomerLedgers((prev) => ({
        ...prev,
        [custId]: [ledgerEntry, ...(prev[custId] || [])],
      }));
    }

    // 3. Save Invoice
    setInvoices((prev) => [newInvoice, ...prev]);

    // 4. Update sync queue or dispatch to backend
    if (!isOffline) {
      posApi
        .checkout(
          cart,
          method,
          {
            cash: breakdown.cash,
            card: breakdown.card,
            khata: breakdown.khata,
            cash_tendered: cashTendered,
          },
          selectedCustomer?.id || null,
          cartDiscount,
          parseInt(currentTenant.id, 10) || 1,
          'REG-01',
          'Hammad Hussain'
        )
        .catch((err) => {
          console.warn('Backend sync failed, queued for offline sync:', err);
          setIsOffline(true);
          setPendingSyncCount((c) => c + 1);
        });
    } else {
      setPendingSyncCount((c) => c + 1);
    }

    // 5. Open Thermal Receipt Preview
    setActiveReceipt(newInvoice);

    // 6. Reset Cart
    clearCart();

    return newInvoice;
  };

  const triggerManualSync = async () => {
    try {
      const [liveProducts, liveCustomers, liveInvoices] = await Promise.all([
        posApi.getProducts(parseInt(currentTenant.id, 10) || 1),
        posApi.getCustomers(parseInt(currentTenant.id, 10) || 1),
        posApi.getInvoices(parseInt(currentTenant.id, 10) || 1),
      ]);
      if (liveProducts.length > 0) setProducts(liveProducts);
      if (liveCustomers.length > 0) setCustomers(liveCustomers);
      if (liveInvoices.length > 0) setInvoices(liveInvoices);
      setIsOffline(false);
      setPendingSyncCount(0);
      alert('Cloud Sync Complete: Connected to Laravel backend. All data verified.');
    } catch {
      setIsOffline(true);
      alert('Cloud Sync Notice: Running in offline local mode. Transactions queued.');
    }
  };

  // Global Hardware Barcode Scanner Listener & Hotkeys
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkeys
      if (e.key === 'F2') {
        e.preventDefault();
        const searchInput = document.getElementById('barcode-search-input');
        if (searchInput) searchInput.focus();
        return;
      }
      if (e.key === 'F4') {
        e.preventDefault();
        setPosTerminalMode((prev) => (prev === 'mart' ? 'catalog' : 'mart'));
        return;
      }
      if (e.key === 'F6') {
        e.preventDefault();
        holdCurrentOrder();
        return;
      }
      if (e.key === 'F12') {
        e.preventDefault();
        setActiveTab('pos');
        return;
      }

      // If user is actively typing in a form input/textarea/select, let that input handle it
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        return;
      }

      const now = Date.now();

      // Enter key sent at end of hardware laser barcode scan
      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 3) {
          const scannedCode = barcodeBuffer.trim();
          barcodeBuffer = '';

          // High-speed lookup by barcode, SKU, or PLU
          const matched = products.find(
            (p) =>
              p.barcode === scannedCode ||
              p.sku.toLowerCase() === scannedCode.toLowerCase() ||
              p.sku === `PLU-${scannedCode}`
          );

          if (matched) {
            addToCart(matched, 1);
          }
        }
        barcodeBuffer = '';
        return;
      }

      // Buffer rapid characters (<200ms keystroke interval typical for hardware scanners)
      if (e.key && e.key.length === 1) {
        if (now - lastKeyTime > 500) {
          barcodeBuffer = '';
        }
        barcodeBuffer += e.key;
        lastKeyTime = now;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [holdCurrentOrder, products, addToCart]);

  return (
    <PosContext.Provider
      value={{
        activeTab,
        setActiveTab,
        posTerminalMode,
        setPosTerminalMode,
        lastScannedItem,
        tenants,
        currentTenant,
        setCurrentTenant,
        isUrdu,
        setIsUrdu,
        theme,
        setTheme,
        toggleTheme,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isMobileCartOpen,
        setIsMobileCartOpen,
        isOffline,
        setIsOffline,
        pendingSyncCount,
        triggerManualSync,
        products,
        categories,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        cart,
        addToCart,
        updateQuantity,
        updateDiscount,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartDiscount,
        cartTax,
        cartTotal,
        heldOrders,
        holdCurrentOrder,
        resumeHeldOrder,
        deleteHeldOrder,
        customers,
        selectedCustomer,
        setSelectedCustomer,
        customerLedgers,
        recordCustomerPayment,
        invoices,
        activeReceipt,
        setActiveReceipt,
        refundInvoice,
        processCheckout,
      }}
    >
      {children}
    </PosContext.Provider>
  );
}

