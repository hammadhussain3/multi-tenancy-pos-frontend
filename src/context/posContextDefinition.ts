import { createContext } from 'react';
import type {
  ActiveTab,
  AuthUser,
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

export interface PosContextType {
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  pinLogin: (pinCode: string, tenantId?: number | string) => Promise<void>;
  logout: () => Promise<void>;

  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  posTerminalMode: PosTerminalMode;
  setPosTerminalMode: (mode: PosTerminalMode) => void;
  lastScannedItem: { name: string; quantity: number; total: number; timestamp: number } | null;
  tenants: TenantInfo[];
  currentTenant: TenantInfo;
  setCurrentTenant: (tenant: TenantInfo) => void;
  isUrdu: boolean;
  setIsUrdu: React.Dispatch<React.SetStateAction<boolean>>;

  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

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

  heldOrders: HeldOrder[];
  holdCurrentOrder: (note?: string) => void;
  resumeHeldOrder: (id: string) => void;
  deleteHeldOrder: (id: string) => void;

  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (cust: Customer | null) => void;
  customerLedgers: Record<string, CustomerLedgerEntry[]>;
  recordCustomerPayment: (customerId: string, amount: number, narration: string) => void;

  invoices: Invoice[];
  activeReceipt: Invoice | null;
  setActiveReceipt: (inv: Invoice | null) => void;
  refundInvoice: (invoiceId: string, reason?: string) => void;
  processCheckout: (
    method: PaymentMethod,
    breakdown: InvoicePaymentBreakdown,
    cashTendered?: number,
    changeGiven?: number
  ) => Invoice;
}

export const PosContext = createContext<PosContextType | undefined>(undefined);
