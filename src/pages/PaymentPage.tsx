import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import type { Order } from "../types/order";

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    setLoading(true);
    try {
      // Create a new order
      const orderData: Partial<Order> = {
        userId: user?.uid || "",
        userEmail: user?.email || "",
        items: items.map(item => ({
          product: {
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
          },
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          priceAtOrder: item.price
        })),
        total: total,
        status: "pending",
        paymentMethod,
        createdAt: new Date(),
        updatedAt: new Date(),
        shippingAddress: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: ""
        }
      };

      // Add order to Firestore
      const ordersRef = collection(db, "orders");
      const newOrderRef = doc(ordersRef);
      await setDoc(newOrderRef, orderData);

      // Clear the cart
      clearCart();

      // Redirect to orders page
      navigate("/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("There was an error processing your payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Payment</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} × {item.quantity}</span>
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
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
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
                <label htmlFor="upi" className="text-gray-700">UPI</label>
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
                <label htmlFor="card" className="text-gray-700">Credit/Debit Card</label>
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
                <label htmlFor="other" className="text-gray-700">Other</label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !paymentMethod}
              className={`w-full py-3 rounded-lg text-white font-semibold
                ${loading || !paymentMethod 
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90"}`}
            >
              {loading ? "Processing..." : "Make Payment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;