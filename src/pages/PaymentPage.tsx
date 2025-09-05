import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import type { Order } from "../types/order";
import OrderSuccessAnimation from "../components/OrderSuccessAnimation";

// Shipping form interface
interface ShippingForm {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate user authentication
    if (!user) {
      alert("Please login to complete your purchase");
      navigate("/login");
      return;
    }

    // Validate cart items
    if (items.length === 0) {
      alert("Your cart is empty");
      navigate("/cart");
      return;
    }

    // Validate payment method
    if (!paymentMethod) {
      alert("Please select a payment method");
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
      alert("Please fill in all shipping information");
      return;
    }

    setLoading(true);
    try {
      // Create a new order
      const orderData: Partial<Order> = {
        userId: user.uid,
        userEmail: user.email || "",
        items: items.map((item) => ({
          product: {
            id: item.id,
            name: item.name,
            description: item.description || "",
            price: item.price,
            discountPrice: item.discountPrice || null,
            image: item.image,
            category: item.category,
            brand: item.brand || "",
            material: item.material || "",
            weight: item.weight || "",
            dimensions: item.dimensions || "",
            sku: item.sku || "",
            sizes: item.sizes || [],
            colors: item.colors || [],
            tags: item.tags || [],
            inStock: item.inStock ?? true,
            stock: item.stock || 0,
            sales: item.sales || 0,
            rating: item.rating || 0,
            reviewCount: item.reviewCount || 0,
            isFeatured: item.isFeatured || false,
            isSuggested: item.isSuggested || false,
            shipping: {
              width: item.shipping?.width || 0,
              height: item.shipping?.height || 0,
              depth: item.shipping?.depth || 0,
              weight: item.shipping?.weight || 0,
            },
            createdAt: item.createdAt || new Date(),
            updatedAt: item.updatedAt || new Date(),
          },
          quantity: item.quantity,
          selectedSize: item.selectedSize || "",
          selectedColor: item.selectedColor || "",
          priceAtOrder: item.price,
        })),
        total: total,
        status: "pending" as const,
        paymentMethod,
        shippingAddress: {
          street: shippingForm.street.trim(),
          city: shippingForm.city.trim(),
          state: shippingForm.state.trim(),
          postalCode: shippingForm.postalCode.trim(),
          country: shippingForm.country.trim(),
        },
      };

      try {
        try {
          setLoading(true);

          // Generate order number (in production this would be more sophisticated)
          const orderNum = `ORD${Date.now().toString().slice(-6)}`;
          setOrderNumber(orderNum);

          // Create order record in Firebase
          const orderRef = doc(collection(db, "orders"));
          const orderData = {
            id: orderRef.id,
            orderNumber: orderNum,
            userId: user.uid,
            items: items.map(item => ({
              product: {
                id: item.id,
                name: item.name,
                image: item.image
              },
              quantity: item.quantity,
              priceAtOrder: item.price,
              selectedSize: item.selectedSize,
              selectedColor: item.selectedColor
            })),
            total: total,
            status: "pending",
            paymentMethod: paymentMethod,
            shippingAddress: shippingForm,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          await setDoc(orderRef, orderData);

          // Clear cart and show success animation
          clearCart();
          setOrderNumber(orderRef.id);
          setShowOrderSuccess(true);

          // Navigate to orders page after animation
          setTimeout(() => {
            setShowOrderSuccess(false);
            navigate("/orders");
          }, 3000);
        } catch (error) {
          console.error("Payment failed:", error);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error creating order:", error);
        throw error; // Re-throw to be caught by outer try-catch
      }
    } catch (error) {
      console.error("Error in checkout process:", error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("There was an error processing your payment. Please try again.");
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
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Payment</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="street"
                  className="block text-sm font-medium text-gray-700"
                >
                  Street Address
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  required
                  value={shippingForm.street}
                  onChange={handleShippingFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={shippingForm.city}
                  onChange={handleShippingFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  required
                  value={shippingForm.state}
                  onChange={handleShippingFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  required
                  value={shippingForm.postalCode}
                  onChange={handleShippingFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  value={shippingForm.country}
                  onChange={handleShippingFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Payment Method</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="upi"
                  name="paymentMethod"
                  value="upi"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="upi" className="text-gray-700">
                  UPI
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="card"
                  name="paymentMethod"
                  value="card"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="card" className="text-gray-700">
                  Credit/Debit Card
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="other"
                  name="paymentMethod"
                  value="other"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="other" className="text-gray-700">
                  Other
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !paymentMethod}
              className={`w-full py-3 mt-6 rounded-lg text-white font-semibold
                ${loading || !paymentMethod
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90"
                }`}
            >
              {loading ? "Processing..." : "Make Payment"}
            </button>
          </form>
        </div>
      </div>

      {/* Success Animation */}
      {showOrderSuccess && (
        <OrderSuccessAnimation orderNumber={orderNumber} />
      )}
    </div>
  );
};

export default PaymentPage;
