import type {
  CartItem,
  Customer,
  CustomerLedgerEntry,
  Invoice,
  PaymentMethod,
  Product,
  TenantInfo,
} from '../types/pos';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1/pos';

// Active Tenant ID management
let currentTenantId: number | string = 1;

export function setActiveTenantId(id: number | string) {
  currentTenantId = id;
}

export function getActiveTenantId(): number | string {
  return currentTenantId;
}

// Active Token management (Laravel Sanctum Bearer Token)
let authToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem('posify_auth_token') : null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('posify_auth_token', token);
    } else {
      localStorage.removeItem('posify_auth_token');
    }
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Tenant-ID': String(currentTenantId),
    ...customHeaders,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  tenant_id: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
  tenant?: TenantInfo;
}

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

export interface BackendTenantDTO {
  id: number;
  uuid: string;
  name: string;
  subdomain?: string;
  branch: string;
  address?: string;
  phone?: string;
  currency: string;
  status: string;
  plan?: string;
  modules?: string[];
  expires_at?: string;
  is_expired?: boolean;
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
    date: dto.date || new Date().toISOString().substring(0, 10),
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
    items: (dto.items || []).map((i) => ({
      product: {
        id: i.product_id.toString(),
        uuid: '',
        barcode: '',
        sku: '',
        name: i.name,
        category: 'Grocery',
        unit: (i.unit || 'pcs') as Product['unit'],
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

export function mapBackendTenantToTenantInfo(dto: BackendTenantDTO): TenantInfo {
  return {
    id: dto.id.toString(),
    uuid: dto.uuid,
    name: dto.name,
    subdomain: dto.subdomain,
    branch: dto.branch,
    address: dto.address || '',
    phone: dto.phone || '',
    currency: dto.currency || 'PKR',
    plan: dto.plan,
    modules: dto.modules,
    expiresAt: dto.expires_at,
    isExpired: dto.is_expired,
  };
}

// ---------------------------------------------------------------------------
// POS API Client Operations
// ---------------------------------------------------------------------------

export const posApi = {
  // Authentication & Shift Access (Laravel Sanctum)
  auth: {
    async login(email: string, password: string, deviceName = 'POS-Terminal'): Promise<AuthResponse> {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password, device_name: deviceName }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Login failed.');
      }
      if (json.token) {
        setAuthToken(json.token);
      }
      return json;
    },

    async pinLogin(pinCode: string, tenantId?: number | string, deviceName = 'REG-01'): Promise<AuthResponse> {
      const tid = tenantId ?? currentTenantId;
      const res = await fetch(`${API_BASE_URL}/auth/pin-login`, {
        method: 'POST',
        headers: getHeaders({ 'X-Tenant-ID': String(tid) }),
        body: JSON.stringify({ pin_code: pinCode, tenant_id: tid, device_name: deviceName }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Incorrect PIN code.');
      }
      if (json.token) {
        setAuthToken(json.token);
      }
      return json;
    },

    async me(): Promise<{ user: AuthUser; tenant: TenantInfo }> {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error('Unauthenticated');
      }
      const json = await res.json();
      return json;
    },

    async logout(): Promise<void> {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: getHeaders(),
        });
      } finally {
        setAuthToken(null);
      }
    },
  },

  // Multi-Tenancy
  setActiveTenantId(id: number | string) {
    setActiveTenantId(id);
  },

  getActiveTenantId(): number | string {
    return getActiveTenantId();
  },

  async getCurrentTenant(): Promise<TenantInfo> {
    const res = await fetch(`${API_BASE_URL}/tenant/current`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch current tenant: ${res.statusText}`);
    const json = await res.json();
    return mapBackendTenantToTenantInfo(json.data);
  },

  async getTenants(): Promise<TenantInfo[]> {
    const res = await fetch(`${API_BASE_URL}/tenants`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to list tenants: ${res.statusText}`);
    const json = await res.json();
    const data: BackendTenantDTO[] = json.data || [];
    return data.map(mapBackendTenantToTenantInfo);
  },

  // 1. Products & Inventory
  async getProducts(tenantId?: number | string): Promise<Product[]> {
    const tid = tenantId ?? currentTenantId;
    const res = await fetch(`${API_BASE_URL}/products?tenant_id=${tid}`, {
      headers: getHeaders({ 'X-Tenant-ID': String(tid) }),
    });
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
    const json = await res.json();
    const data: BackendProductDTO[] = json.data || json;
    return data.map(mapBackendProductToProduct);
  },

  async createProduct(product: Omit<Product, 'id' | 'uuid'>, tenantId?: number | string): Promise<Product> {
    const tid = tenantId ?? currentTenantId;
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders({ 'X-Tenant-ID': String(tid) }),
      body: JSON.stringify({
        tenant_id: tid,
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
    tenantId?: number | string
  ): Promise<void> {
    const tid = tenantId ?? currentTenantId;
    const res = await fetch(`${API_BASE_URL}/products/${productId}/adjust-stock`, {
      method: 'POST',
      headers: getHeaders({ 'X-Tenant-ID': String(tid) }),
      body: JSON.stringify({
        tenant_id: tid,
        quantity: delta,
        type,
        notes,
      }),
    });
    if (!res.ok) throw new Error(`Failed to adjust stock: ${res.statusText}`);
  },

  // 2. Customers & Khata Ledger
  async getCustomers(tenantId?: number | string): Promise<Customer[]> {
    const tid = tenantId ?? currentTenantId;
    const res = await fetch(`${API_BASE_URL}/customers?tenant_id=${tid}`, {
      headers: getHeaders({ 'X-Tenant-ID': String(tid) }),
    });
    if (!res.ok) throw new Error(`Failed to fetch customers: ${res.statusText}`);
    const json = await res.json();
    const data: BackendCustomerDTO[] = json.data || json;
    return data.map(mapBackendCustomerToCustomer);
  },

  async getCustomerLedger(customerId: string | number, tenantId?: number | string): Promise<CustomerLedgerEntry[]> {
    const tid = tenantId ?? currentTenantId;
    const res = await fetch(`${API_BASE_URL}/customers/${customerId}/ledger?tenant_id=${tid}`, {
      headers: getHeaders({ 'X-Tenant-ID': String(tid) }),
    });
    if (!res.ok) throw new Error(`Failed to fetch customer ledger: ${res.statusText}`);
    const json = await res.json();
    const data: BackendCustomerLedgerDTO[] = json.data || json;
    return data.map(mapBackendLedgerToLedgerEntry);
  },

  async recordKhataPayment(
    customerId: string | number,
    amount: number,
    narration: string,
    tenantId?: number | string
  ): Promise<void> {
    const tid = tenantId ?? currentTenantId;
    const res = await fetch(`${API_BASE_URL}/customers/${customerId}/payment`, {
      method: 'POST',
      headers: getHeaders({ 'X-Tenant-ID': String(tid) }),
      body: JSON.stringify({
        tenant_id: tid,
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
    tenantId?: number | string,
    deviceId = 'REG-01',
    cashierName = 'Hammad Hussain'
  ): Promise<BackendInvoiceDTO> {
    const tid = tenantId ?? currentTenantId;
    const payload = {
      tenant_id: tid,
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
      headers: getHeaders({ 'X-Tenant-ID': String(tid) }),
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
  async getInvoices(tenantId?: number | string): Promise<Invoice[]> {
    const tid = tenantId ?? currentTenantId;
    const res = await fetch(`${API_BASE_URL}/invoices?tenant_id=${tid}`, {
      headers: getHeaders({ 'X-Tenant-ID': String(tid) }),
    });
    if (!res.ok) throw new Error(`Failed to fetch invoices: ${res.statusText}`);
    const json = await res.json();
    const data: BackendInvoiceDTO[] = json.data || json;
    return data.map((inv) => mapBackendInvoiceToInvoice(inv, String(tid)));
  },

  // 5. Day-End Register Closing Summary
  async getDayClosingSummary(date?: string, tenantId?: number | string): Promise<BackendDayClosingSummaryDTO> {
    const tid = tenantId ?? currentTenantId;
    const query = date ? `?date=${encodeURIComponent(date)}&tenant_id=${tid}` : `?tenant_id=${tid}`;
    const res = await fetch(`${API_BASE_URL}/day-closing${query}`, {
      headers: getHeaders({ 'X-Tenant-ID': String(tid) }),
    });
    if (!res.ok) throw new Error(`Failed to fetch day closing summary: ${res.statusText}`);
    const json = await res.json();
    return json.summary;
  },
};
