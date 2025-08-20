export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  category: string;
  brand: string;
  material: string;
  weight: string;
  dimensions: string;
  sku: string;
  sizes: string[];
  colors: string[];
  tags: string[];
  inStock: boolean;
  stock: number;
  sales: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isSuggested: boolean;
  shipping: {
    width: number;
    height: number;
    depth: number;
    weight: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type CartItem = Product & {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
};
