import type {
  CartItem,
  Customer,
  CustomerLedgerEntry,
  Invoice,
  PaymentMethod,
  Product,
} from '../types/pos';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1/pos';

// Backend DTO representations (snake_case)
export interface BackendProductDTO {
  id: number;
  uuid: string;
  name: string;
  name_urdu: string | null;
  barcode: string;
  sku: string;
  category: string;
  unit: string;
  purchase_price: number;
  retail_price: number;
  current_stock: number;
  min_stock_alert: number;
  is_active: boolean;
}

export interface BackendCustomerDTO {
  id: number;
  uuid: string;
  name: string;
  phone: string;
  city: string;
  credit_limit: number;
  current_balance: number;
  notes?: string;
}

export interface BackendCustomerLedgerDTO {
  id: number;
  uuid: string;
  customer_id: number;
  reference_type: 'sale' | 'payment_received' | 'return' | 'adjustment';
  reference_no: string;
  debit: number;
  credit: number;
  running_balance: number;
  narration: string;
  created_at: string;
}

export interface BackendInvoiceDTO {
  id: number;
  uuid: string;
  invoice_no: string;
  fbr_invoice_no?: string;
  date: string;
  cashier_name: string;
  device_id: string;
  customer?: {
    id: number;
    name: string;
    phone: string;
  };
  items: Array<{
    id: number;
    product_id: number;
    name: string;
    unit: string;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  grand_total: number;
  payment_method: PaymentMethod;
  payments: {
    cash: number;
    card: number;
    khata: number;
  };
  cash_tendered?: number;
  change_given?: number;
  is_synced: boolean;
}

export interface BackendDayClosingSummaryDTO {
  total_invoices: number;
  total_sales: number;
  cash_sales: number;
  card_sales: number;
  khata_sales: number;
}

// ---------------------------------------------------------------------------
// Adapters (DTO <-> Domain Model)
// ---------------------------------------------------------------------------

export function mapBackendProductToProduct(dto: BackendProductDTO): Product {
  return {
    id: dto.id.toString(),
    uuid: dto.uuid,
    name: dto.name,
    nameUrdu: dto.name_urdu || undefined,
    barcode: dto.barcode,
    sku: dto.sku || dto.barcode,
    category: dto.category,
    unit: dto.unit as Product['unit'],
    purchasePrice: Number(dto.purchase_price),
    retailPrice: Number(dto.retail_price),
    currentStock: Number(dto.current_stock),
    minStockAlert: Number(dto.min_stock_alert),
    taxRate: 0,
    isActive: Boolean(dto.is_active),
  };
}

export function mapBackendCustomerToCustomer(dto: BackendCustomerDTO): Customer {
  return {
    id: dto.id.toString(),
    uuid: dto.uuid,
    name: dto.name,
    phone: dto.phone,
    city: dto.city,
    creditLimit: Number(dto.credit_limit),
    currentBalance: Number(dto.current_balance),
    notes: dto.notes,
  };
}

export function mapBackendLedgerToLedgerEntry(dto: BackendCustomerLedgerDTO): CustomerLedgerEntry {
  return {
    id: dto.id.toString(),
    uuid: dto.uuid,
    customerId: dto.customer_id.toString(),
    date: dto.created_at ? dto.created_at.substring(0, 16).replace('T', ' ') : '',
    referenceType: dto.reference_type,
    referenceNo: dto.reference_no,
    debit: Number(dto.debit),
    credit: Number(dto.credit),
    runningBalance: Number(dto.running_balance),
    narration: dto.narration,
  };
}

export function mapBackendInvoiceToInvoice(dto: BackendInvoiceDTO, tenantId = '1'): Invoice {
  return {
    id: dto.id.toString(),
    uuid: dto.uuid,
    invoiceNo: dto.invoice_no,
    date: dto.date,
    tenantId,
    deviceId: dto.device_id,
    cashierName: dto.cashier_name,
    customer: dto.customer
      ? {
          id: dto.customer.id.toString(),
          uuid: '',
          name: dto.customer.name,
          phone: dto.customer.phone,
          city: '',
          creditLimit: 0,
          currentBalance: 0,
        }
      : undefined,
    items: dto.items.map((i) => ({
      product: {
        id: i.product_id.toString(),
        uuid: '',
        name: i.name,
        barcode: '',
        sku: '',
        category: '',
        unit: i.unit as Product['unit'],
        purchasePrice: 0,
        retailPrice: i.unit_price,
        currentStock: 0,
        minStockAlert: 0,
        taxRate: 0,
        isActive: true,
      },
      quantity: i.quantity,
      unitPrice: i.unit_price,
      discountAmount: i.discount_amount,
      total: i.total,
    })),
    subtotal: Number(dto.subtotal),
    discount: Number(dto.discount),
    tax: Number(dto.tax),
    grandTotal: Number(dto.grand_total),
    paymentMethod: dto.payment_method,
    payments: {
      cash: Number(dto.payments.cash),
      card: Number(dto.payments.card),
      khata: Number(dto.payments.khata),
    },
    cashTendered: dto.cash_tendered !== null && dto.cash_tendered !== undefined ? Number(dto.cash_tendered) : undefined,
    changeGiven: dto.change_given !== null && dto.change_given !== undefined ? Number(dto.change_given) : undefined,
    fbrInvoiceNo: dto.fbr_invoice_no,
    isSynced: dto.is_synced,
  };
}

// ---------------------------------------------------------------------------
// POS API Client Operations
// ---------------------------------------------------------------------------

export const posApi = {
  // 1. Products & Inventory
  async getProducts(tenantId = 1): Promise<Product[]> {
    const res = await fetch(`${API_BASE_URL}/products?tenant_id=${tenantId}`);
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
    const json = await res.json();
    const data: BackendProductDTO[] = json.data || json;
    return data.map(mapBackendProductToProduct);
  },

  async createProduct(product: Omit<Product, 'id' | 'uuid'>, tenantId = 1): Promise<Product> {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        tenant_id: tenantId,
        name: product.name,
        name_urdu: product.nameUrdu || null,
        barcode: product.barcode,
        sku: product.sku || product.barcode,
        category: product.category,
        unit: product.unit,
        purchase_price: product.purchasePrice,
        retail_price: product.retailPrice,
        min_stock_alert: product.minStockAlert,
        initial_stock: product.currentStock,
      }),
    });
    if (!res.ok) throw new Error(`Failed to create product: ${res.statusText}`);
    const json = await res.json();
    return mapBackendProductToProduct(json.data || json);
  },

  async adjustStock(
    productId: string | number,
    delta: number,
    type: 'purchase' | 'return' | 'adjustment' | 'damage',
    notes: string,
    tenantId = 1
  ): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/adjust-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        tenant_id: tenantId,
        quantity: delta,
        type,
        notes,
      }),
    });
    if (!res.ok) throw new Error(`Failed to adjust stock: ${res.statusText}`);
  },

  // 2. Customers & Khata Ledger
  async getCustomers(tenantId = 1): Promise<Customer[]> {
    const res = await fetch(`${API_BASE_URL}/customers?tenant_id=${tenantId}`);
    if (!res.ok) throw new Error(`Failed to fetch customers: ${res.statusText}`);
    const json = await res.json();
    const data: BackendCustomerDTO[] = json.data || json;
    return data.map(mapBackendCustomerToCustomer);
  },

  async getCustomerLedger(customerId: string | number, tenantId = 1): Promise<CustomerLedgerEntry[]> {
    const res = await fetch(`${API_BASE_URL}/customers/${customerId}/ledger?tenant_id=${tenantId}`);
    if (!res.ok) throw new Error(`Failed to fetch customer ledger: ${res.statusText}`);
    const json = await res.json();
    const data: BackendCustomerLedgerDTO[] = json.data || json;
    return data.map(mapBackendLedgerToLedgerEntry);
  },

  async recordKhataPayment(
    customerId: string | number,
    amount: number,
    narration: string,
    tenantId = 1
  ): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/customers/${customerId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        tenant_id: tenantId,
        amount,
        narration,
        receipt_no: `REC-${Date.now().toString().slice(-6)}`,
      }),
    });
    if (!res.ok) throw new Error(`Failed to record payment: ${res.statusText}`);
  },

  // 3. POS Checkout Execution
  async checkout(
    items: CartItem[],
    method: PaymentMethod,
    tenderBreakdown: { cash: number; card: number; khata: number; cash_tendered?: number },
    customerId: string | null,
    discount = 0,
    tenantId = 1,
    deviceId = 'REG-01',
    cashierName = 'Hammad Hussain'
  ): Promise<BackendInvoiceDTO> {
    const payload = {
      tenant_id: tenantId,
      items: items.map((item) => ({
        product_id: parseInt(item.product.id, 10),
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_amount: item.discountAmount,
      })),
      payment_method: method,
      tender_breakdown: {
        cash: tenderBreakdown.cash,
        card: tenderBreakdown.card,
        khata: tenderBreakdown.khata,
        cash_tendered: tenderBreakdown.cash_tendered,
      },
      customer_id: customerId ? parseInt(customerId, 10) : null,
      discount,
      device_id: deviceId,
      cashier_name: cashierName,
    };

    const res = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.message || `Checkout failed: ${res.statusText}`);
    }

    const json = await res.json();
    return json.invoice || json.data || json;
  },

  // 4. Invoices & Sales History
  async getInvoices(tenantId = 1): Promise<Invoice[]> {
    const res = await fetch(`${API_BASE_URL}/invoices?tenant_id=${tenantId}`);
    if (!res.ok) throw new Error(`Failed to fetch invoices: ${res.statusText}`);
    const json = await res.json();
    const data: BackendInvoiceDTO[] = json.data || json;
    return data.map((inv) => mapBackendInvoiceToInvoice(inv, tenantId.toString()));
  },

  // 5. Day-End Register Closing Summary
  async getDayClosingSummary(date?: string, tenantId = 1): Promise<BackendDayClosingSummaryDTO> {
    const query = date ? `?date=${encodeURIComponent(date)}&tenant_id=${tenantId}` : `?tenant_id=${tenantId}`;
    const res = await fetch(`${API_BASE_URL}/day-closing${query}`);
    if (!res.ok) throw new Error(`Failed to fetch day closing summary: ${res.statusText}`);
    const json = await res.json();
    return json.summary;
  },
};
