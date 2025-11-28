import { useState } from "react";
import { useReduxCart } from "../redux/useReduxCart";
import { useReduxDiscount } from "../redux/useReduxDiscount";
import { motion, AnimatePresence } from "framer-motion";

const DiscountField = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const { removeDiscount, discountCode, discount, subtotal, setDiscountCode, applyDiscount } = useReduxCart();
  const { validateDiscount } = useReduxDiscount();

  const handleApplyDiscount = async () => {
    if (!code.trim()) return;

    setLoading(true);
    try {
      const result = await validateDiscount(code.trim().toUpperCase(), subtotal);
      setMessage(result.message);
      if (result.isValid) {
        // Apply the discount and store the code
        applyDiscount(result.discount);
        setDiscountCode(code.trim().toUpperCase());
        setCode("");
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 3000);
      }
    } catch (error) {
      setMessage("Error applying discount code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">Apply Discount Code</h3>

      {discountCode ? (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
            <div>
              <p className="font-medium text-gray-900">{discountCode}</p>
              <p className="text-sm text-gray-600">
                Discount: ₹{discount.toFixed(2)}
              </p>
            </div>
            <button
              onClick={removeDiscount}
              className="text-red-600 hover:text-red-800 text-sm font-medium transform transition-all duration-300 hover:scale-110"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {/* Responsive input and button layout */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter discount code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary min-w-0"
              disabled={loading}
            />
            <button
              onClick={handleApplyDiscount}
              disabled={loading || !code.trim()}
              className={`px-4 py-2 text-white rounded-md transition-all duration-300 whitespace-nowrap sm:min-w-0 min-w-full ${
                loading || !code.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 hover:shadow-md"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="hidden xs:inline">Applying...</span>
                  <span className="xs:hidden">...</span>
                </span>
              ) : (
                "Apply"
              )}
            </button>
          </div>
          {message && (
            <p
              className={`text-sm ${
                message.toLowerCase().includes("success")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      )}

      {/* Success Animation */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-xs"
          >
            <div className="flex items-center space-x-2">
              <svg
                className="w-6 h-6 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm sm:text-base">
                Discount applied successfully!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiscountField;
