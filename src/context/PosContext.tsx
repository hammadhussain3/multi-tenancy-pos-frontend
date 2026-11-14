import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  ActiveTab,
  CartItem,
  Customer,
  CustomerLedgerEntry,
  Invoice,
  InvoicePaymentBreakdown,
  PaymentMethod,
  Product,
  TenantInfo,
} from '../types/pos';
import {
  INITIAL_CUSTOMERS,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_PRODUCTS,
  INITIAL_TENANTS,
} from '../mock/sampleData';
import { PosContext } from './posContextDefinition';

export function PosProvider({ children }: { children: ReactNode }) {
  // System State
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [tenants] = useState<TenantInfo[]>(INITIAL_TENANTS);
  const [currentTenant, setCurrentTenant] = useState<TenantInfo>(INITIAL_TENANTS[0]);
  const [isUrdu, setIsUrdu] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(3);

  // Products
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Khata & Customers
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [customerLedgers, setCustomerLedgers] = useState<Record<string, CustomerLedgerEntry[]>>(INITIAL_LEDGER_ENTRIES);

  // Invoices & Thermal Receipt
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeReceipt, setActiveReceipt] = useState<Invoice | null>(null);

  // Derive Categories
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Cart Computations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const cartDiscount = cart.reduce((acc, item) => acc + item.discountAmount, 0);
  const cartTax = 0; // Tax free or standard FBR rate
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartTax);

  const addToCart = (product: Product, quantity = 1) => {
    if (product.currentStock <= 0) {
      alert(`"${product.name}" is currently Out of Stock.`);
      return;
    }

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
  };

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

    // 4. Update sync queue
    if (isOffline) {
      setPendingSyncCount((c) => c + 1);
    }

    // 5. Open Thermal Receipt Preview
    setActiveReceipt(newInvoice);

    // 6. Reset Cart
    clearCart();

    return newInvoice;
  };

  const triggerManualSync = () => {
    if (pendingSyncCount === 0) return;
    setTimeout(() => {
      setPendingSyncCount(0);
      alert('Cloud Sync Complete: All local offline transactions pushed and verified.');
    }, 800);
  };

  // Keyboard Shortcuts for POS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        const searchInput = document.getElementById('barcode-search-input');
        if (searchInput) searchInput.focus();
      }
      if (e.key === 'F12') {
        e.preventDefault();
        setActiveTab('pos');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <PosContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tenants,
        currentTenant,
        setCurrentTenant,
        isUrdu,
        setIsUrdu,
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
        customers,
        selectedCustomer,
        setSelectedCustomer,
        customerLedgers,
        recordCustomerPayment,
        invoices,
        activeReceipt,
        setActiveReceipt,
        processCheckout,
      }}
    >
      {children}
    </PosContext.Provider>
  );
}

