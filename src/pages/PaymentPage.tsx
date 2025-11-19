import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReduxCart } from "../redux/useReduxCart";
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useReduxAuth } from "../redux/useReduxAuth";
import { useReduxDiscount } from "../redux/useReduxDiscount";
import OrderSuccessAnimation from "../components/OrderSuccessAnimation";
import { useScrollToTop } from "../utils/scrollToTop";
import { sendOrderPlacedEmails } from "../utils/emailService";
import toast from "react-hot-toast";
import {
  User,
  Phone,
  MapPin,
  Home,
  Globe,
  CreditCard,
  ShoppingBag,
  Loader2,
} from "lucide-react";

// Form interfaces
interface ShippingForm {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CustomerForm {
  name: string;
  phone: string;
}

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [customerForm, setCustomerForm] = useState<CustomerForm>({
    name: "",
    phone: "",
  });
  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const { items, total, clearCart, discountCode } = useReduxCart();
  const { user } = useReduxAuth();
  const { applyDiscount } = useReduxDiscount();
  const navigate = useNavigate();
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    scrollToTop();
  }, []);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate user authentication
    if (!user) {
      toast.error("Please login to complete your purchase");
      navigate("/login");
      return;
    }

    // Validate cart items
    if (items.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    // Validate payment method
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    // Validate customer form
    if (!customerForm.name || !customerForm.phone) {
      toast.error("Please fill in all customer information");
      return;
    }

    // Validate shipping form
    if (
      !shippingForm.street ||
      !shippingForm.city ||
      !shippingForm.state ||
      !shippingForm.postalCode ||
      !shippingForm.country
    ) {
      toast.error("Please fill in all shipping information");
      return;
    }

    setLoading(true);
    try {
      // Generate order number
      const orderNum = `ORD${Date.now().toString().slice(-6)}`;
      setOrderNumber(orderNum);

      // Create order record in Firebase
      const orderRef = doc(collection(db, "orders"));
      const calculatedSubtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const calculatedDiscountAmount = discountCode
        ? calculatedSubtotal - total
        : 0;

      const orderData = {
        id: orderRef.id,
        orderNumber: orderNum,
        userId: user.uid,
        userEmail: user.email || "",
        customerName: customerForm.name,
        customerPhone: customerForm.phone,
        userName: customerForm.name,
        items: items.map((item) => ({
          product: {
            id: item.id || "",
            name: item.name || "",
            image: item.image || "",
          },
          quantity: item.quantity || 0,
          priceAtOrder: item.price || 0,
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
          customDimensions: item.customDimensions || null,
        })),
        total: total || 0,
        subtotal: calculatedSubtotal,
        discountCode: discountCode || null,
        discountAmount: calculatedDiscountAmount,
        status: "pending",
        paymentMethod: paymentMethod,
        shippingAddress: {
          street: shippingForm.street || "",
          city: shippingForm.city || "",
          state: shippingForm.state || "",
          postalCode: shippingForm.postalCode || "",
          country: shippingForm.country || "",
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Apply discount if one is selected
      if (discountCode) {
        try {
          await applyDiscount(discountCode);
        } catch (error) {
          console.error("Error applying discount:", error);
        }
      }

      // Update product stock
      for (const item of items) {
        if (item.id) {
          const productRef = doc(db, "products", item.id);
          await updateDoc(productRef, {
            stock: increment(-(item.quantity || 0)),
          });
        }
      }

      // Save the order
      await setDoc(orderRef, orderData);

      // Send order placement emails if enabled
      if (import.meta.env.VITE_SEND_ORDER_PLACEMENT_EMAIL !== "false") {
        const adminEmail =
          import.meta.env.VITE_ORDER_NOTIFICATION_ADMIN_EMAIL ||
          import.meta.env.VITE_EMAIL_SUPPORT_ADDRESS ||
          import.meta.env.VITE_APP_EMAIL ||
          "rachnacreationrc@gmail.com";

        const emailResult = await sendOrderPlacedEmails(
          orderData as any,
          adminEmail
        );

        if (emailResult.customerEmailSent || emailResult.adminEmailSent) {
          toast.success("Order created! Confirmation email will be sent.");
        } else {
          toast.success("Order placed successfully!");
        }
      }

      // Clear cart and show success animation
      clearCart();
      setShowOrderSuccess(true);

      // Navigate to orders page after animation
      setTimeout(() => {
        setShowOrderSuccess(false);
        navigate("/orders");
      }, 3000);
    } catch (error) {
      console.error("Payment failed:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error(
          "There was an error processing your payment. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShippingFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 lg:py-10">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Order
          </h1>
          <p className="text-gray-600">
            Fill in your details to finalize your purchase
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 h-fit">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-6">
              <ShoppingBag className="w-5 h-5" />
              Order Summary
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}-${JSON.stringify(
                    item.customDimensions
                  )}`}
                  className="pb-4 border-b last:border-b-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        {item.name}
                      </span>
                      <span className="text-gray-500 ml-2">
                        × {item.quantity}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ₹{(item.discountPrice || item.price).toFixed(2)}
                    </span>
                  </div>
                  {item.selectedSize && (
                    <p className="text-sm text-gray-600">
                      Size: {item.selectedSize}
                    </p>
                  )}
                  {item.selectedColor && (
                    <p className="text-sm text-gray-600">
                      Color: {item.selectedColor}
                    </p>
                  )}
                  {item.customDimensions && (
                    <p className="text-sm text-gray-600">
                      Dimensions: {item.customDimensions.width} ×{" "}
                      {item.customDimensions.height}
                      {item.customDimensions.depth
                        ? ` × ${item.customDimensions.depth}`
                        : ""}{" "}
                      cm
                    </p>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="font-bold text-primary text-xl">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
                {discountCode && (
                  <p className="text-sm text-green-600 mt-2">
                    Discount code "{discountCode}" applied
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              {/* Customer Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Customer Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="customerName"
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                    >
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      name="name"
                      required
                      value={customerForm.name}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customerPhone"
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                    >
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="customerPhone"
                      name="phone"
                      required
                      value={customerForm.phone}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="street"
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                    >
                      <Home className="w-4 h-4" />
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      required
                      value={shippingForm.street}
                      onChange={handleShippingFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      placeholder="House number and street name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                      >
                        <MapPin className="w-4 h-4" />
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        required
                        value={shippingForm.city}
                        onChange={handleShippingFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                      >
                        <MapPin className="w-4 h-4" />
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        required
                        value={shippingForm.state}
                        onChange={handleShippingFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="State"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="postalCode"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                      >
                        <MapPin className="w-4 h-4" />
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        required
                        value={shippingForm.postalCode}
                        onChange={handleShippingFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="Postal code"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                      >
                        <Globe className="w-4 h-4" />
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        required
                        value={shippingForm.country}
                        onChange={handleShippingFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-4">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700 font-medium">UPI</span>
                  </label>

                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700 font-medium">
                      Credit/Debit Card
                    </span>
                  </label>

                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700 font-medium">
                      Cash on Delivery
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !paymentMethod}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Complete Payment
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      {showOrderSuccess && <OrderSuccessAnimation orderNumber={orderNumber} />}
    </div>
  );
};

export default PaymentPage;
