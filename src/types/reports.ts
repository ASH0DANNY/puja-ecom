// Base report interfaces
export interface SalesReport {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  salesByDate: {
    date: string;
    orders: number;
    revenue: number;
  }[];
  discountUsage: {
    code: string;
    timesUsed: number;
    totalDiscount: number;
  }[];
}

export interface InventoryReport {
  totalProducts: number;
  lowStock: {
    productId: string;
    name: string;
    currentStock: number;
    reorderPoint: number;
  }[];
  stockMovement: {
    productId: string;
    name: string;
    incoming: number;
    outgoing: number;
    remaining: number;
    turnoverRate: number;
  }[];
  stockTrend: "up" | "down" | "stable";
}

export interface CustomerReport {
  totalCustomers: number;
  newCustomers: number;
  topCustomers: {
    userId: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
  }[];
  customerRetention: {
    month: string;
    retained: number;
    lost: number;
    new: number;
  }[];
}

export interface Report {
  id: string;
  type: "sales" | "inventory" | "customers" | "discounts";
  title: string;
  description: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  data: SalesReport | InventoryReport | CustomerReport;
  createdAt: Date;
  createdBy: string;
  format: "pdf" | "excel" | "csv";
}

export interface Invoice {
  id: string;
  orderId: string;
  userId: string;
  invoiceNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  tax: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  createdAt: Date;
  dueDate: Date;
  status: "paid" | "unpaid" | "overdue";
  companyDetails: CompanyDetails;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  size?: string;
  color?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  name: string;
  email: string;
  phone: string;
}

export interface CompanyDetails {
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  taxId: string;
}

export interface Report {
  id: string;
  type: "sales" | "inventory" | "customers" | "discounts";
  title: string;
  description: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  data: SalesReport | InventoryReport | CustomerReport;
  createdAt: Date;
  createdBy: string;
  format: "pdf" | "excel" | "csv";
}
