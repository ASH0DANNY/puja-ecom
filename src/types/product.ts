export interface SizeOption {
  label: string;
  isStandard: boolean;
  isCustomizable: boolean;
}

export interface CustomDimensions {
  width: number;
  height: number;
  depth?: number;
}

export interface SizeWithPrice {
  size: string;
  price: number;
  weight?: string;
  dimensions?: string;
}

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
  sizes?: SizeOption[] | string[];
  colors?: string[];
  tags?: string[];
  sizesWithPrices?: SizeWithPrice[];
  images?: string[];
  // Custom size feature flag - admin enables/disables only
  hasCustomSize?: boolean;
}

export type CartItem = Product & {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  customDimensions?: CustomDimensions;
};
