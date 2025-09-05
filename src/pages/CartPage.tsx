import { useState } from "react";
import { useCart } from "../context/CartContext";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import DiscountSelector from "../components/DiscountSelector";
import DiscountField from "../components/DiscountField";
import OrderSuccessAnimation from "../components/OrderSuccessAnimation";
import { useAuth } from "../context/AuthContext";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, total, subtotal, discount } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [discountMessage, setDiscountMessage] = useState("");

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Your cart is empty</p>
          <a
            href="/"
            className="text-primary hover:text-primary/80 mt-4 inline-block font-medium"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
              className="flex items-start space-x-4 border-b border-gray-200 py-4"
            >
              <div className="w-24 h-24 flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-600 text-sm">
                  ${item.price.toFixed(2)}
                </p>
                {item.selectedSize && (
                  <p className="text-sm text-gray-500">
                    Size: {item.selectedSize}
                  </p>
                )}
                {item.selectedColor && (
                  <p className="text-sm text-gray-500">
                    Color: {item.selectedColor}
                  </p>
                )}
                <div className="flex items-center mt-2">
                  <select
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, Number(e.target.value))
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount Applied</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-4 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Available Discounts Section */}
            <div className="mt-6 mb-4">
              <h3 className="text-lg font-semibold mb-4">
                Available Discounts
              </h3>
              {user ? (
                <DiscountSelector
                  subtotal={subtotal}
                  onDiscountApplied={async (amount: number) => {
                    setDiscountMessage(
                      `Discount of $${amount.toFixed(
                        2
                      )} applied. Total updated!`
                    );
                    setShowOrderSuccess(true);
                    setTimeout(() => {
                      setShowOrderSuccess(false);
                      setDiscountMessage("");
                    }, 3000);
                  }}
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600">
                    Please log in to view available discounts
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="mt-2 text-primary hover:text-primary/80 font-medium"
                  >
                    Log in
                  </button>
                </div>
              )}
              {discountMessage && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  {discountMessage}
                </div>
              )}
            </div>

            {/* Manual Discount Code Input */}
            <div className="mt-6 mb-4">
              <h3 className="text-lg font-semibold mb-2">
                Have a Discount Code?
              </h3>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <DiscountField />
              </div>
            </div>

            <button
              onClick={() => navigate("/payment")}
              className="w-full bg-primary text-white py-3 rounded-lg mt-6 hover:bg-primary/90 transition-all transform hover:scale-105"
            >
              Proceed to Payment (${total.toFixed(2)})
            </button>

            {showOrderSuccess && !discountMessage && (
              <OrderSuccessAnimation orderNumber="" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
