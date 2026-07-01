import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import discountReducer from "./slices/discountSlice";
import promotionReducer from "./slices/promotionSlice";
import emailSubscriptionReducer from "./slices/emailSubscriptionSlice";
import addressReducer from "./slices/addressSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    discount: discountReducer,
    promotion: promotionReducer,
    emailSubscription: emailSubscriptionReducer,
    address: addressReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths when checking for non-serializable values
        ignoredActions: ["auth/initializeAuth", "auth/setUser"],
        ignoredPaths: ["auth.user"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
