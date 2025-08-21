import type { Order } from "./order";
import type { Product } from "./product";

export type UserRole = "admin" | "user";

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL?: string | null;
  role: UserRole;
  createdAt: Date;
  lastLogin: Date;
}

export interface DashboardProduct extends Product {
  sales: number;
  revenue: number;
  stockCount: number;
}

export interface DashboardOrder {
  id: string;
  userId: string;
  userEmail: string;
  products: DashboardOrderProduct[];
  total: number;
  status: Order['status'];
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard Order item interface
export interface DashboardOrderProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
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
