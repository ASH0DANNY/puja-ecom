import { useCallback, useEffect } from "react";
import Cookies from "js-cookie";
import {
  useAppDispatch,
  useAppSelector,
  selectCartItems,
  selectCartDiscount,
  selectDiscountCode,
  selectCartSubtotal,
  selectCartTotal,
} from "./hooks";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  updateDimensions,
  clearCart,
  setDiscountCode,
  applyDiscount,
  removeDiscount,
} from "./slices/cartSlice";
import type { Product, CustomDimensions } from "../types/product";

/**
 * Custom hook for cart operations with Redux integration and persistence
 * Handles adding/removing items, applying discounts, and syncing with cookies
 */
export const useReduxCart = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const discount = useAppSelector(selectCartDiscount);
  const discountCode = useAppSelector(selectDiscountCode);
  const subtotal = useAppSelector(selectCartSubtotal);
  const total = useAppSelector(selectCartTotal);

  // Persist cart to cookies whenever it changes
  useEffect(() => {
    Cookies.set("cart", JSON.stringify(items), { expires: 7 });
    Cookies.set("discount", discount.toString(), { expires: 7 });
    if (discountCode) {
      Cookies.set("discountCode", discountCode, { expires: 7 });
    } else {
      Cookies.remove("discountCode");
    }
  }, [items, discount, discountCode]);

  const handleAddToCart = useCallback(
    (
      product: Product,
      quantity = 1,
      size?: string,
      color?: string,
      customDimensions?: CustomDimensions
    ) => {
      dispatch(
        addToCart({
          product,
          quantity,
          size,
          color,
          customDimensions,
        })
      );
    },
    [dispatch]
  );

  const handleRemoveFromCart = useCallback(
    (productId: string) => {
      dispatch(removeFromCart(productId));
    },
    [dispatch]
  );

  const handleUpdateQuantity = useCallback(
    (productId: string, quantity: number) => {
      dispatch(updateQuantity({ productId, quantity }));
    },
    [dispatch]
  );

  const handleUpdateDimensions = useCallback(
    (
      productId: string,
      size?: string,
      color?: string,
      customDimensions?: CustomDimensions
    ) => {
      dispatch(updateDimensions({ productId, size, color, customDimensions }));
    },
    [dispatch]
  );

  const handleClearCart = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const handleSetDiscountCode = useCallback(
    (code: string | null) => {
      dispatch(setDiscountCode(code));
    },
    [dispatch]
  );

  const handleApplyDiscount = useCallback(
    (discountAmount: number) => {
      dispatch(applyDiscount(discountAmount));
    },
    [dispatch]
  );

  const handleRemoveDiscount = useCallback(() => {
    dispatch(removeDiscount());
  }, [dispatch]);

  return {
    items,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    updateDimensions: handleUpdateDimensions,
    clearCart: handleClearCart,
    discount,
    discountCode,
    subtotal,
    total,
    setDiscountCode: handleSetDiscountCode,
    applyDiscount: handleApplyDiscount,
    removeDiscount: handleRemoveDiscount,
  };
};
