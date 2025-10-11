import React, { useState } from "react";
import { useDiscount } from "../context/DiscountContext";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";
import CelebrationEffects from "./animations/CelebrationEffects";
import { X, Tag, Percent, Gift } from "lucide-react";

interface DiscountSelectorProps {
  subtotal: number;
  onDiscountApplied: (amount: number) => void;
}

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  onDiscountApplied: (amount: number) => void;
}

const DiscountModal: React.FC<DiscountModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  onDiscountApplied,
}) => {
  const { activeDiscounts, validateDiscount, loading } = useDiscount();
  const { applyDiscount } = useCart();
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  }>({
    text: "",
    type: "success",
  });

  const handleDiscountSelect = async (code: string) => {
    if (code === selectedCode) {
      return;
    }

    setSelectedCode(code);
    const {
      isValid,
      discount,
      message: validationMessage,
    } = await validateDiscount(code, subtotal);

    if (isValid) {
      const discountPercent = ((discount / subtotal) * 100).toFixed(1);

      // Apply the discount to the cart first
      const result = await applyDiscount(code);
      if (result.success) {
        onDiscountApplied(discount);
        setMessage({
          text: `Discount of $${discount.toFixed(
            2
          )} (${discountPercent}%) applied successfully!`,
          type: "success",
        });
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage({ text: result.message, type: "error" });
        setSelectedCode("");
      }
    } else {
      setMessage({ text: validationMessage, type: "error" });
      setSelectedCode("");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen pt-24 px-4 pb-20 text-center sm:block sm:p-0 mx-auto md:pt-28">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white p-4 lg:p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                    Available Offers
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Select a discount to apply to your order
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white p-4 lg:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Loading available offers...
                  </p>
                </div>
              </div>
            ) : activeDiscounts.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Tag className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No offers available
                </h3>
                <p className="text-gray-600">
                  Check back later for exciting discounts and deals!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-h-[60vh] overflow-y-auto">
                {activeDiscounts.map((discount) => (
                  <motion.div
                    key={discount.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      cursor-pointer rounded-xl p-4 lg:p-6 transition-all duration-300 border-2
                      ${
                        selectedCode === discount.code
                          ? "bg-primary/5 border-primary shadow-lg scale-105"
                          : "border-gray-200 hover:border-primary/50 hover:shadow-md hover:scale-102"
                      }
                    `}
                    onClick={() => handleDiscountSelect(discount.code)}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-2 rounded-lg ${
                            selectedCode === discount.code
                              ? "bg-primary/20"
                              : "bg-gray-100"
                          }`}
                        >
                          <Percent
                            className={`h-4 w-4 ${
                              selectedCode === discount.code
                                ? "text-primary"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <span className="text-lg font-bold text-primary">
                          {discount.code}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          selectedCode === discount.code
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {discount.discountType === "percentage"
                          ? `${discount.value}% OFF`
                          : `₹${discount.value} OFF`}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 text-sm lg:text-base">
                      {discount.description}
                    </p>

                    <div className="space-y-1">
                      {discount.minPurchase != null &&
                        discount.minPurchase > 0 && (
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                            Minimum purchase: ${discount.minPurchase}
                          </div>
                        )}
                      {discount.maxDiscount != null &&
                        discount.maxDiscount > 0 && (
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                            Maximum discount: ₹{discount.maxDiscount}
                          </div>
                        )}
                    </div>

                    {selectedCode === discount.code && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 pt-3 border-t border-primary/20"
                      >
                        <div className="text-center text-sm text-primary font-medium">
                          ✓ Selected
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`mt-6 p-4 rounded-xl border ${
                  message.type === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {message.type === "success" ? (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                  )}
                  <span className="font-medium">{message.text}</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      {showCelebration && <CelebrationEffects type="success" />}
    </div>
  );
};

const DiscountSelector: React.FC<DiscountSelectorProps> = ({
  subtotal,
  onDiscountApplied,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { activeDiscounts } = useDiscount();
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Tag className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Available Offers
          </h3>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 font-medium"
        >
          <Gift className="h-4 w-4" />
          <span>View Offers</span>
          {activeDiscounts.length > 0 && (
            <span className="bg-white text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold ml-1">
              {activeDiscounts.length}
            </span>
          )}
        </button>
      </div>

      {activeDiscounts.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
          <div className="text-gray-400 mb-2">
            <Tag className="w-6 h-6 mx-auto" />
          </div>
          <p className="text-gray-600 text-sm">
            No offers available at the moment
          </p>
        </div>
      )}

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={`p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center space-x-2">
            {message.type === "success" ? (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
            ) : (
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">!</span>
              </div>
            )}
            <span className="font-medium text-sm">{message.text}</span>
          </div>
        </motion.div>
      )}

      <DiscountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subtotal={subtotal}
        onDiscountApplied={(amount) => {
          onDiscountApplied(amount);
          const discountPercent = ((amount / subtotal) * 100).toFixed(1);
          setMessage({
            text: `Discount of ₹${amount.toFixed(
              2
            )} (${discountPercent}%) will be applied at checkout`,
            type: "success",
          });
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default DiscountSelector;
