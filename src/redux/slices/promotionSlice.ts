import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { PromotionState, Promotion } from "../../types/promotion";

const initialState: PromotionState = {
  promotions: [],
  emailHistory: [],
  loading: false,
  error: null,
};

const promotionSlice = createSlice({
  name: "promotion",
  initialState,
  reducers: {
    setPromotions: (state, action: PayloadAction<Promotion[]>) => {
      state.promotions = action.payload;
      state.error = null;
    },
    addPromotion: (state, action: PayloadAction<Promotion>) => {
      state.promotions.push(action.payload);
      state.error = null;
    },
    updatePromotion: (state, action: PayloadAction<Promotion>) => {
      const index = state.promotions.findIndex(
        (p: any) => p.id === action.payload.id
      );
      if (index !== -1) {
        state.promotions[index] = action.payload;
      }
      state.error = null;
    },
    removePromotion: (state, action: PayloadAction<string>) => {
      state.promotions = state.promotions.filter(
        (p: any) => p.id !== action.payload
      );
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addEmailToHistory: (
      state,
      action: PayloadAction<{
        promotionId: string;
        promotionTitle: string;
        recipientCount: number;
        subject: string;
      }>
    ) => {
      state.emailHistory.push({
        id: `email_${Date.now()}`,
        ...action.payload,
        sentAt: new Date(),
        successCount: action.payload.recipientCount,
        failureCount: 0,
        status: "sent",
      });
    },
    clearPromotions: (state) => {
      state.promotions = [];
      state.error = null;
    },
  },
});

export const {
  setPromotions,
  addPromotion,
  updatePromotion,
  removePromotion,
  setLoading,
  setError,
  addEmailToHistory,
  clearPromotions,
} = promotionSlice.actions;

export default promotionSlice.reducer;
