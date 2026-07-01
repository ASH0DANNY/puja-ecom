import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Auth selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;

// Cart selectors
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotal = (state: RootState) => state.cart.total;
export const selectCartSubtotal = (state: RootState) => state.cart.subtotal;
export const selectCartDiscount = (state: RootState) => state.cart.discount;
export const selectDiscountCode = (state: RootState) => state.cart.discountCode;
export const selectShowCartAnimation = (state: RootState) =>
  state.cart.showAnimation;

// Discount selectors
export const selectActiveDiscounts = (state: RootState) =>
  state.discount.activeDiscounts;
export const selectDiscountLoading = (state: RootState) =>
  state.discount.loading;
export const selectDiscountError = (state: RootState) => state.discount.error;

// Promotion selectors
export const selectPromotions = (state: RootState) =>
  state.promotion.promotions;
export const selectActivePromotions = (state: RootState) =>
  state.promotion.promotions.filter((p: any) => p.isActive);
export const selectPromotionLoading = (state: RootState) =>
  state.promotion.loading;
export const selectPromotionError = (state: RootState) =>
  state.promotion.error;
export const selectPromotionEmailHistory = (state: RootState) =>
  state.promotion.emailHistory;

// Address selectors
export const selectAddresses = (state: RootState) => state.address.addresses;
export const selectAddressLoading = (state: RootState) => state.address.loading;
export const selectAddressFetched = (state: RootState) => state.address.fetched;
export const selectAddressError = (state: RootState) => state.address.error;

// Email subscription selectors
export const selectSubscribers = (state: RootState) =>
  state.emailSubscription.subscribers;
export const selectActiveSubscribers = (state: RootState) =>
  state.emailSubscription.subscribers.filter((sub: any) => sub.isActive);
export const selectEmailSubscriptionLoading = (state: RootState) =>
  state.emailSubscription.loading;
export const selectEmailSubscriptionError = (state: RootState) =>
  state.emailSubscription.error;

