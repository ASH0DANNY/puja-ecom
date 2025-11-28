import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, Product, CustomDimensions } from "../../types/product";

interface CartState {
  items: CartItem[];
  discountCode: string | null;
  discount: number;
  subtotal: number;
  total: number;
  showAnimation: boolean;
}

const initialState: CartState = {
  items: [],
  discountCode: null,
  discount: 0,
  subtotal: 0,
  total: 0,
  showAnimation: false,
};

const calculateTotals = (
  items: CartItem[],
  discount: number
): { subtotal: number; total: number } => {
  const subtotal = items.reduce(
    (sum, item) => {
      // Get the correct price: either from selected size or from base price
      let itemPrice = item.price;
      
      if (item.selectedSize && item.sizesWithPrices && item.sizesWithPrices.length > 0) {
        const sizeWithPrice = item.sizesWithPrices.find(
          (swp) => swp.size === item.selectedSize
        );
        if (sizeWithPrice) {
          itemPrice = sizeWithPrice.price;
        }
      }

      // Use discount price if available, otherwise use base price
      const finalPrice = item.discountPrice ? item.discountPrice : itemPrice;

      return sum + parseFloat(finalPrice.toFixed(2)) * item.quantity;
    },
    0
  );

  const total = Math.max(0, subtotal - discount);
  return { subtotal, total };
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Initialize cart from storage
    initializeCart: (
      state,
      action: PayloadAction<{
        items: CartItem[];
        discountCode: string | null;
        discount: number;
      }>
    ) => {
      state.items = action.payload.items;
      state.discountCode = action.payload.discountCode;
      state.discount = action.payload.discount;
      const { subtotal, total } = calculateTotals(state.items, state.discount);
      state.subtotal = subtotal;
      state.total = total;
    },
    // Add item to cart
    addToCart: (
      state,
      action: PayloadAction<{
        product: Product;
        quantity?: number;
        size?: string;
        color?: string;
        customDimensions?: CustomDimensions;
      }>
    ) => {
      const {
        product,
        quantity = 1,
        size,
        color,
        customDimensions,
      } = action.payload;

      const existingItem = state.items.find(
        (item) =>
          item.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color &&
          JSON.stringify(item.customDimensions) ===
            JSON.stringify(customDimensions)
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          ...product,
          quantity,
          selectedSize: size,
          selectedColor: color,
          customDimensions,
          name: product.name,
        });
      }

      state.showAnimation = true;
      const { subtotal, total } = calculateTotals(state.items, state.discount);
      state.subtotal = subtotal;
      state.total = total;
    },
    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      const { subtotal, total } = calculateTotals(state.items, state.discount);
      state.subtotal = subtotal;
      state.total = total;
    },
    // Update item quantity
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      const { subtotal, total } = calculateTotals(state.items, state.discount);
      state.subtotal = subtotal;
      state.total = total;
    },
    // Update item dimensions
    updateDimensions: (
      state,
      action: PayloadAction<{
        productId: string;
        size?: string;
        color?: string;
        customDimensions?: CustomDimensions;
      }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.productId);
      if (item) {
        item.selectedSize = action.payload.size;
        item.selectedColor = action.payload.color;
        item.customDimensions = action.payload.customDimensions;
      }
    },
    // Clear cart
    clearCart: (state) => {
      state.items = [];
      state.discountCode = null;
      state.discount = 0;
      state.showAnimation = false;
      const { subtotal, total } = calculateTotals(state.items, 0);
      state.subtotal = subtotal;
      state.total = total;
    },
    // Set discount code
    setDiscountCode: (state, action: PayloadAction<string | null>) => {
      state.discountCode = action.payload;
    },
    // Apply discount
    applyDiscount: (state, action: PayloadAction<number>) => {
      state.discount = action.payload;
      const { subtotal, total } = calculateTotals(state.items, state.discount);
      state.subtotal = subtotal;
      state.total = total;
    },
    // Remove discount
    removeDiscount: (state) => {
      state.discountCode = null;
      state.discount = 0;
      const { subtotal, total } = calculateTotals(state.items, 0);
      state.subtotal = subtotal;
      state.total = total;
    },
    // Show/hide cart animation
    setShowAnimation: (state, action: PayloadAction<boolean>) => {
      state.showAnimation = action.payload;
    },
  },
});

export const {
  initializeCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  updateDimensions,
  clearCart,
  setDiscountCode,
  applyDiscount,
  removeDiscount,
  setShowAnimation,
} = cartSlice.actions;

export default cartSlice.reducer;
