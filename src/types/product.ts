export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;

  reviews: number;
  isFeatured?: boolean;
  isSuggested?: boolean;
  sales?: number;
  selectedSize?: string;
  selectedColor?: string;
  // Additional fields for product management
  brand?: string;
  material?: string;
  weight?: string;
  dimensions?: string;
  sku?: string;
  discountPrice?: number;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  shipping?: {
    width: string;
    height: string;
    depth: string;
    weight: string;
  };
  images?: string[];
}

export type CartItem = Product & {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
};
