import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Discount } from "../../types/discount";

interface DiscountState {
  activeDiscounts: Discount[];
  loading: boolean;
  error: string | null;
}

const initialState: DiscountState = {
  activeDiscounts: [],
  loading: true,
  error: null,
};

const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    // Set active discounts
    setActiveDiscounts: (state, action: PayloadAction<Discount[]>) => {
      state.activeDiscounts = action.payload;
      state.loading = false;
      state.error = null;
    },
    // Add discount
    addDiscount: (state, action: PayloadAction<Discount>) => {
      state.activeDiscounts.push(action.payload);
    },
    // Update discount
    updateDiscount: (
      state,
      action: PayloadAction<{ id: string; discount: Partial<Discount> }>
    ) => {
      const index = state.activeDiscounts.findIndex(
        (d) => d.id === action.payload.id
      );
      if (index !== -1) {
        state.activeDiscounts[index] = {
          ...state.activeDiscounts[index],
          ...action.payload.discount,
        };
      }
    },
    // Remove discount
    removeDiscount: (state, action: PayloadAction<string>) => {
      state.activeDiscounts = state.activeDiscounts.filter(
        (d) => d.id !== action.payload
      );
    },
    // Set loading state
    setDiscountLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // Set error
    setDiscountError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setActiveDiscounts,
  addDiscount,
  updateDiscount,
  removeDiscount,
  setDiscountLoading,
  setDiscountError,
} = discountSlice.actions;

export default discountSlice.reducer;
