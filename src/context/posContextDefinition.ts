import { createContext } from 'react';
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

export interface PosContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  tenants: TenantInfo[];
  currentTenant: TenantInfo;
  setCurrentTenant: (tenant: TenantInfo) => void;
  isUrdu: boolean;
  setIsUrdu: React.Dispatch<React.SetStateAction<boolean>>;

  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileCartOpen: boolean;
  setIsMobileCartOpen: React.Dispatch<React.SetStateAction<boolean>>;

  isOffline: boolean;
  setIsOffline: React.Dispatch<React.SetStateAction<boolean>>;
  pendingSyncCount: number;
  triggerManualSync: () => void;

  products: Product[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'uuid'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  adjustStock: (productId: string, delta: number, reason: string) => void;

  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateDiscount: (productId: string, discount: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartTax: number;
  cartTotal: number;

  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (cust: Customer | null) => void;
  customerLedgers: Record<string, CustomerLedgerEntry[]>;
  recordCustomerPayment: (customerId: string, amount: number, narration: string) => void;

  invoices: Invoice[];
  activeReceipt: Invoice | null;
  setActiveReceipt: (inv: Invoice | null) => void;
  processCheckout: (
    method: PaymentMethod,
    breakdown: InvoicePaymentBreakdown,
    cashTendered?: number,
    changeGiven?: number
  ) => Invoice;
}

export const PosContext = createContext<PosContextType | undefined>(undefined);
