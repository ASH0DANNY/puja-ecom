import { useState, useEffect } from "react";
import { useReduxCart } from "../redux/useReduxCart";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import DiscountSelector from "../components/DiscountSelector";
import DiscountField from "../components/DiscountField";
import OrderSuccessAnimation from "../components/OrderSuccessAnimation";
import { useReduxAuth } from "../redux/useReduxAuth";
import { useScrollToTop } from "../utils/scrollToTop";
import type { CartItem, CustomDimensions } from "../types/product";

const CartPage = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    updateDimensions,
    total,
    subtotal,
    discount,
  } = useReduxCart();
  const { user } = useReduxAuth();
  const navigate = useNavigate();
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [discountMessage, setDiscountMessage] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editDimensions, setEditDimensions] = useState<CustomDimensions | null>(
    null
  );
  const [editError, setEditError] = useState("");
  const scrollToTop = useScrollToTop();

  const handleEditDimensions = (item: CartItem) => {
    setEditingItemId(item.id);
    setEditDimensions(item.customDimensions || { width: 0, height: 0 });
    setEditError("");
  };

  const handleSaveDimensions = (item: CartItem) => {
    if (!editDimensions) {
      setEditError("Dimensions are required");
      return;
    }

    if (editDimensions.width <= 0 || editDimensions.height <= 0) {
      setEditError("Width and height must be greater than 0");
      return;
    }

    if (
      editDimensions.depth !== undefined &&
      editDimensions.depth !== null &&
      editDimensions.depth <= 0
    ) {
      setEditError("Depth must be greater than 0");
      return;
    }

    updateDimensions(
      item.id,
      item.selectedSize,
      item.selectedColor,
      editDimensions
    );
    setEditingItemId(null);
    setEditDimensions(null);
    setEditError("");
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditDimensions(null);
    setEditError("");
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 lg:py-10">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
              Your Cart
            </h1>
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2-10M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
              </div>
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8 text-sm lg:text-base">
                Looks like you haven't added any items to your cart yet
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 lg:py-10">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Your Cart
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                Review your items before checkout
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Custom Size Info Banner */}
          <div className="lg:col-span-2">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-900 text-sm">
                <strong>💡 Tip:</strong> Items with custom dimensions show "Edit
                Dimensions" button. Click it to modify width, height, or depth
                before checkout.
              </p>
            </div>
          </div>

          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Cart Items
              </h2>
              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedSize}-${
                      item.selectedColor
                    }-${JSON.stringify(item.customDimensions)}`}
                    className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-base lg:text-lg text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm lg:text-base mb-2">
                        {
                          // Get price from selected size if available
                          item.selectedSize &&
                          item.sizesWithPrices &&
                          item.sizesWithPrices.length > 0
                            ? (
                                item.sizesWithPrices.find(
                                  (s) => s.size === item.selectedSize
                                )?.price || item.price
                              ).toFixed(2)
                            : (item.discountPrice
                                ? item.discountPrice
                                : item.price
                              ).toFixed(2)
                        }
                      </p>
                      {item.selectedSize && (
                        <p className="text-sm text-gray-500 mb-1">
                          Size:{" "}
                          <span className="font-medium">
                            {item.selectedSize}
                          </span>
                        </p>
                      )}
                      {item.customDimensions && (
                        <p className="text-sm text-gray-500 mb-1">
                          Dimensions:{" "}
                          <span className="font-medium">
                            {item.customDimensions.width} ×{" "}
                            {item.customDimensions.height}
                            {item.customDimensions.depth
                              ? ` × ${item.customDimensions.depth}`
                              : ""}{" "}
                            cm
                          </span>
                        </p>
                      )}
                      {item.selectedColor && (
                        <p className="text-sm text-gray-500 mb-3">
                          Color:{" "}
                          <span className="font-medium">
                            {item.selectedColor}
                          </span>
                        </p>
                      )}
                      <div className="flex items-center space-x-3">
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, Number(e.target.value))
                          }
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option key={num} value={num}>
                              Qty: {num}
                            </option>
                          ))}
                        </select>
                        {item.hasCustomSize && (
                          <button
                            onClick={() => handleEditDimensions(item)}
                            className="px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                            title="Edit dimensions"
                          >
                            Edit Dimensions
                          </button>
                        )}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-base lg:text-lg text-gray-900">
                        {(
                          (item.selectedSize &&
                          item.sizesWithPrices &&
                          item.sizesWithPrices.length > 0
                            ? item.sizesWithPrices.find(
                                (s) => s.size === item.selectedSize
                              )?.price || item.price
                            : item.discountPrice !== undefined
                            ? item.discountPrice
                            : item.price) * item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Dimensions Modal */}
            {editingItemId && editDimensions && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Edit Custom Dimensions
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width (cm)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editDimensions.width}
                        onChange={(e) =>
                          setEditDimensions({
                            ...editDimensions,
                            width: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editDimensions.height}
                        onChange={(e) =>
                          setEditDimensions({
                            ...editDimensions,
                            height: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Depth (cm) - Optional
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editDimensions.depth || ""}
                        onChange={(e) =>
                          setEditDimensions({
                            ...editDimensions,
                            depth: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                        placeholder="Leave empty for 2D items"
                      />
                    </div>
                  </div>

                  {editError && (
                    <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                      <p className="text-sm text-red-700 font-medium">
                        {editError}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const item = items.find((i) => i.id === editingItemId);
                        if (item) {
                          handleSaveDimensions(item);
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      Save Dimensions
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg">
                    <span>Discount Applied</span>
                    <span>-{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span>{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Available Discounts Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Available Discounts
                </h3>
                {user ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <DiscountSelector
                      subtotal={subtotal}
                      onDiscountApplied={async (amount: number) => {
                        setDiscountMessage(
                          `Discount of ${amount.toFixed(
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
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                    <div className="text-gray-400 mb-3">
                      <svg
                        className="w-8 h-8 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      Please log in to view available discounts
                    </p>
                    <button
                      onClick={() => navigate("/login")}
                      className="text-primary hover:text-primary/80 font-medium text-sm"
                    >
                      Log in →
                    </button>
                  </div>
                )}
                {discountMessage && (
                  <div className="mt-3 text-sm text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg">
                    {discountMessage}
                  </div>
                )}
              </div>

              {/* Manual Discount Code Input */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Have a Discount Code?
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <DiscountField />
                </div>
              </div>

              <button
                onClick={() => navigate("/payment")}
                className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Proceed to Payment • {total.toFixed(2)}
              </button>

              {showOrderSuccess && !discountMessage && (
                <OrderSuccessAnimation orderNumber="" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
