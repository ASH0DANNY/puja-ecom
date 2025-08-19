import type { Order } from "./order";
import type { Product } from "./product";

export type UserRole = "admin" | "user";

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  createdAt: Date;
  lastLogin: Date;
}

export interface DashboardProduct extends Product {
  sales: number;
  revenue: number;
  stockCount: number;
}

export interface DashboardOrder extends Order {
  customerName: string;
  customerEmail: string;
  formattedTotal: string;
  statusColor: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: DashboardOrder[];
  topProducts: DashboardProduct[];
  suggestionsPending: number;
}

export interface DashboardProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
  stock: number;
  sales: number;
  rating: number;
  reviewCount: number;
  isSuggested?: boolean;
}

export interface DashboardOrder {
  id: string;
  userId: string;
  userEmail: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
}
