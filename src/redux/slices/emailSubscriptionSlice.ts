import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  EmailSubscriptionState,
  SubscribedEmail,
} from "../../types/promotion";

const initialState: EmailSubscriptionState = {
  subscribers: [],
  loading: false,
  error: null,
};

const emailSubscriptionSlice = createSlice({
  name: "emailSubscription",
  initialState,
  reducers: {
    setSubscribers: (state, action: PayloadAction<SubscribedEmail[]>) => {
      state.subscribers = action.payload;
      state.error = null;
    },
    addSubscriber: (state, action: PayloadAction<SubscribedEmail>) => {
      // Check if email already exists
      const exists = state.subscribers.some(
        (sub: any) => sub.email === action.payload.email
      );
      if (!exists) {
        state.subscribers.push(action.payload);
      }
      state.error = null;
    },
    removeSubscriber: (state, action: PayloadAction<string>) => {
      state.subscribers = state.subscribers.filter(
        (sub: any) => sub.id !== action.payload
      );
      state.error = null;
    },
    toggleSubscriber: (
      state,
      action: PayloadAction<{ id: string; isActive: boolean }>
    ) => {
      const subscriber = state.subscribers.find(
        (sub) => sub.id === action.payload.id
      );
      if (subscriber) {
        subscriber.isActive = action.payload.isActive;
      }
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearSubscribers: (state) => {
      state.subscribers = [];
      state.error = null;
    },
  },
});

export const {
  setSubscribers,
  addSubscriber,
  removeSubscriber,
  toggleSubscriber,
  setLoading,
  setError,
  clearSubscribers,
} = emailSubscriptionSlice.actions;

export default emailSubscriptionSlice.reducer;
