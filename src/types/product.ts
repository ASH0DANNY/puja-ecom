export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  isSuggested?: boolean;
}

export type CartItem = Product & {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
};
