export type PaymentMethod = 'cash' | 'card' | 'khata' | 'split';

export type ProductUnit =
  | 'pcs'
  | 'kg'
  | 'g'
  | 'pack'
  | 'box'
  | 'ltr'
  | 'tin'
  | 'bottle'
  | 'can'
  | 'jar'
  | 'tub'
  | 'cup'
  | 'tube'
  | 'crate'
  | 'doz';

export interface Product {
  id: string;
  uuid: string;
  barcode: string;
  sku: string;
  name: string;
  nameUrdu?: string;
  category: string;
  unit: ProductUnit;
  purchasePrice: number;
  retailPrice: number;
  currentStock: number;
  minStockAlert: number;
  taxRate: number; // e.g., 0% or 1% or 18%
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  total: number;
}

export interface Customer {
  id: string;
  uuid: string;
  name: string;
  phone: string;
  city: string;
  creditLimit: number;
  currentBalance: number; // Positive means customer owes money (Udhaar)
  notes?: string;
}

export interface CustomerLedgerEntry {
  id: string;
  uuid: string;
  customerId: string;
  date: string;
  referenceType: 'sale' | 'payment_received' | 'return' | 'adjustment';
  referenceNo: string;
  debit: number;   // Increase in Udhaar (e.g. credit sale)
  credit: number;  // Decrease in Udhaar (e.g. payment made)
  runningBalance: number;
  narration: string;
}

export interface InvoicePaymentBreakdown {
  cash: number;
  card: number;
  khata: number;
}

export interface Invoice {
  id: string;
  uuid: string;
  invoiceNo: string;
  date: string;
  tenantId: string;
  deviceId: string;
  cashierName: string;
  customer?: Customer;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  payments: InvoicePaymentBreakdown;
  cashTendered?: number;
  changeGiven?: number;
  fbrInvoiceNo?: string;
  isSynced: boolean;
  status?: 'completed' | 'refunded';
  refundReason?: string;
}

export interface HeldOrder {
  id: string;
  heldAt: string;
  items: CartItem[];
  customer: Customer | null;
  subtotal: number;
  note?: string;
}

export interface TenantInfo {
  id: string;
  uuid?: string;
  name: string;
  subdomain?: string;
  branch: string;
  address: string;
  phone: string;
  ntn?: string;
  strn?: string;
  fbrPosId?: string;
  currency: string;
  plan?: string;
  modules?: string[];
  expiresAt?: string;
  isExpired?: boolean;
}

export type ActiveTab = 'pos' | 'inventory' | 'khata' | 'sales' | 'register' | 'reports';

export type PosTerminalMode = 'mart' | 'catalog';
