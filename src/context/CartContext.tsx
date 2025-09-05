import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "../types/product";
import { useDiscount } from "./DiscountContext";
import Cookies from "js-cookie";
import CartAnimation from "../components/CartAnimation";

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    size?: string,
    color?: string
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
  discount: number;
  discountCode: string | null;
  setDiscountCode: (code: string | null) => void;
  applyDiscount: (
    code: string
  ) => Promise<{ success: boolean; message: string }>;
  removeDiscount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = Cookies.get("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [discountCode, setDiscountCode] = useState<string | null>(() => {
    return Cookies.get("discountCode") || null;
  });
  const [discount, setDiscount] = useState(0);
  const [showCartAnimation, setShowCartAnimation] = useState(false);

  // Save cart items and discount to cookies whenever they change
  useEffect(() => {
    Cookies.set("cart", JSON.stringify(items), { expires: 7 }); // Expires in 7 days
    if (discountCode) {
      Cookies.set("discountCode", discountCode, { expires: 7 });
    } else {
      Cookies.remove("discountCode");
    }
  }, [items, discountCode]);

  const addToCart = (
    product: Product,
    quantity = 1,
    size?: string,
    color?: string
  ) => {
    setItems((currentItems: CartItem[]) => {
      const existingItem = currentItems.find(
        (item) =>
          item.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      // Show animation
      setShowCartAnimation(true);
      setTimeout(() => setShowCartAnimation(false), 2000);

      if (existingItem) {
        return currentItems.map((item) =>
          item === existingItem
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...currentItems,
        { ...product, quantity, selectedSize: size, selectedColor: color },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setDiscountCode(null);
    setDiscount(0);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const { validateDiscount } = useDiscount();

  const applyDiscount = async (
    code: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await validateDiscount(code, subtotal);
      if (result.isValid) {
        // Store the code and calculated discount amount
        setDiscountCode(code);
        // Make sure to set the exact discount amount from validation
        setDiscount(result.discount);
        // Calculate the percentage for the message
        const discountPercent = ((result.discount / subtotal) * 100).toFixed(1);
        return {
          success: true,
          message: `Discount of $${result.discount.toFixed(
            2
          )} (${discountPercent}%) will be applied at checkout`,
        };
      }
      return { success: false, message: result.message };
    } catch (error) {
      console.error("Error validating discount:", error);
      return { success: false, message: "Error validating discount" };
    }
  };

  const removeDiscount = () => {
    setDiscountCode(null);
    setDiscount(0);
  };

  // Calculate final total after discount
  const total = Math.max(0, subtotal - discount);

  // Recalculate discount when cart items change
  useEffect(() => {
    const revalidateDiscount = async () => {
      if (discountCode) {
        const result = await validateDiscount(discountCode, subtotal);
        if (result.isValid) {
          setDiscount(result.discount);
        } else {
          // If discount is no longer valid (e.g., cart total below minimum), remove it
          setDiscountCode(null);
          setDiscount(0);
        }
      }
    };
    revalidateDiscount();
  }, [items, discountCode, validateDiscount, subtotal]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        subtotal,
        discount,
        discountCode,
        setDiscountCode,
        applyDiscount,
        removeDiscount,
      }}
    >
      {children}
      <CartAnimation isVisible={showCartAnimation} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
