import type { Product } from "./product";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  name?: string;
  product: Product;
  quantity: number;
  priceAtOrder: number;
  priceAtSelectedSize?: number;
  selectedSize?: string;
  selectedColor?: string;
  customDimensions?: {
    width: number;
    height: number;
    depth?: number;
  };
  stockUpdated?: boolean;
  refunded?: boolean;
  returnRequested?: boolean;
  returnReason?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
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
  status: OrderStatus;
  createdAt: Date;
}
