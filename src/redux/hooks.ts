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
