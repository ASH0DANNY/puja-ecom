import React, { useEffect } from "react";
import { useAppDispatch, selectShowCartAnimation } from "../redux/hooks";
import { initializeCart, setShowAnimation } from "../redux/slices/cartSlice";
import { useAppSelector } from "../redux/hooks";
import Cookies from "js-cookie";
import CartAnimation from "../components/CartAnimation";
import type { CartItem } from "../types/product";

interface CartReduxInitializerProps {
  children: React.ReactNode;
}

/**
 * Component that initializes Redux cart state from cookies
 * Also displays cart animation when items are added
 */
export const CartReduxInitializer: React.FC<CartReduxInitializerProps> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const showAnimation = useAppSelector(selectShowCartAnimation);

  useEffect(() => {
    // Initialize cart from cookies
    const savedCart = Cookies.get("cart");
    const savedDiscountCode = Cookies.get("discountCode") || null;
    const savedDiscount = parseFloat(Cookies.get("discount") || "0");

    const items: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

    dispatch(
      initializeCart({
        items,
        discountCode: savedDiscountCode,
        discount: savedDiscount,
      })
    );
  }, [dispatch]);

  // Hide animation after 2 seconds
  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        dispatch(setShowAnimation(false));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showAnimation, dispatch]);

  return (
    <>
      {children}
      <CartAnimation isVisible={showAnimation} />
    </>
  );
};
