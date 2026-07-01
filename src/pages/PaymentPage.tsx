import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReduxCart } from "../redux/useReduxCart";
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  updateDoc,
  increment,
  getDocs,
} from "firebase/firestore";
import app, { db } from "../config/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useReduxAuth } from "../redux/useReduxAuth";
import { useReduxDiscount } from "../redux/useReduxDiscount";
import { useReduxAddress } from "../redux/useReduxAddress";
import type { SavedAddress } from "../types/address";
import OrderSuccessAnimation from "../components/OrderSuccessAnimation";
import { useScrollToTop } from "../utils/scrollToTop";
import { sendOrderPlacedEmails } from "../utils/emailService";
import toast from "react-hot-toast";
import { CreditCard, Loader2 } from "lucide-react";
import SavedAddressSelector from "../components/SavedAddressSelector";
import CustomerInfoForm from "../components/payment/CustomerInfoForm";
import ShippingAddressForm from "../components/payment/ShippingAddressForm";
import PaymentMethodSelector from "../components/payment/PaymentMethodSelector";
import OrderSummaryCard from "../components/payment/OrderSummaryCard";
import indianStates from "../constants/indianStates";

// Helper function to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

interface FormErrors {
  name?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [customerForm, setCustomerForm] = useState<CustomerForm>({
    name: "",
    phone: "",
  });
  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [customerTouched, setCustomerTouched] = useState({
    name: false,
    phone: false,
  });
  const [shippingTouched, setShippingTouched] = useState({
    street: false,
    city: false,
    state: false,
    postalCode: false,
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [pinLookupLoading, setPinLookupLoading] = useState(false);
  const [pinLookupError, setPinLookupError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [saveAddressChecked, setSaveAddressChecked] = useState(false);
  const [saveAddressLabel, setSaveAddressLabel] = useState<"home" | "office" | "other">("home");
  const [saveAddressCustomLabel, setSaveAddressCustomLabel] = useState("");
  const [saveLabelError, setSaveLabelError] = useState("");
  const [manualEntryStarted, setManualEntryStarted] = useState(false);
  const postalCodeTimeoutRef = useRef<number | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const streetRef = useRef<HTMLInputElement | null>(null);
  const cityRef = useRef<HTMLInputElement | null>(null);
  const stateRef = useRef<HTMLSelectElement | null>(null);
  const postalCodeRef = useRef<HTMLInputElement | null>(null);
  const { items, total, clearCart, discountCode } = useReduxCart();
  const { user } = useReduxAuth();
  const { applyDiscount } = useReduxDiscount();
  const {
    addresses,
    loading: addressesLoading,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
  } = useReduxAddress();
  const navigate = useNavigate();
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    scrollToTop();
    fetchPaymentSettings();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user, fetchAddresses]);

  const fetchPaymentSettings = async () => {
    try {
      const settingsSnapshot = await getDocs(
        collection(db, "applicationSettings")
      );
      if (!settingsSnapshot.empty) {
        const settingsData = settingsSnapshot.docs[0].data();
        setOnlinePaymentEnabled(settingsData.onlinePaymentEnabled ?? true);
        setCodEnabled(settingsData.codEnabled ?? true);
      }
    } catch (error) {
      console.error("Error fetching payment settings:", error);
    }
  };

  const validateCustomerForm = (values: CustomerForm) => {
    const errors: FormErrors = {};

    if (!values.name.trim()) {
      errors.name = "Full name is required.";
    } else if (values.name.trim().length < 3) {
      errors.name = "Full name must be at least 3 characters.";
    } else if (!/^[A-Za-z ]+$/.test(values.name.trim())) {
      errors.name = "Full name can only contain letters and spaces.";
    }

    if (!values.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^[6-9]\d{9}$/.test(values.phone.trim())) {
      errors.phone = "Enter a valid 10-digit Indian mobile number starting with 6-9.";
    }

    return errors;
  };

  const validateShippingForm = (values: ShippingForm) => {
    const errors: FormErrors = {};

    if (!values.street.trim()) {
      errors.street = "Street address is required.";
    } else if (values.street.trim().length < 5) {
      errors.street = "Street address must be at least 5 characters.";
    }

    if (!values.city.trim()) {
      errors.city = "City is required.";
    }

    if (!values.state.trim()) {
      errors.state = "State is required.";
    }

    if (!values.postalCode.trim()) {
      errors.postalCode = "Postal code is required.";
    } else if (!/^[1-9][0-9]{5}$/.test(values.postalCode.trim())) {
      errors.postalCode = "Enter a valid 6-digit PIN code that does not start with 0.";
    }

    return errors;
  };

  const focusFirstInvalidField = (errors: FormErrors) => {
    if (errors.name && nameRef.current) {
      nameRef.current.focus();
      return;
    }
    if (errors.phone && phoneRef.current) {
      phoneRef.current.focus();
      return;
    }
    if (errors.street && streetRef.current) {
      streetRef.current.focus();
      return;
    }
    if (errors.city && cityRef.current) {
      cityRef.current.focus();
      return;
    }
    if (errors.state && stateRef.current) {
      stateRef.current.focus();
      return;
    }
    if (errors.postalCode && postalCodeRef.current) {
      postalCodeRef.current.focus();
      return;
    }
  };

  const selectSavedAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setEditingAddressId(null);
    setSaveAddressChecked(false);
    setSaveAddressLabel(address.label);
    setSaveAddressCustomLabel(address.customLabel || "");
    setCustomerForm({ name: address.fullName, phone: address.phone });
    setShippingForm({
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });
    setManualEntryStarted(false);
    setFormErrors({});
  };

  const editSavedAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setEditingAddressId(address.id);
    setSaveAddressChecked(true);
    setSaveAddressLabel(address.label);
    setSaveAddressCustomLabel(address.customLabel || "");
    setCustomerForm({ name: address.fullName, phone: address.phone });
    setShippingForm({
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });
    setManualEntryStarted(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Delete this saved address?")) return;
    try {
      await deleteAddress(addressId);
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
      }
      if (editingAddressId === addressId) {
        setEditingAddressId(null);
        setSaveAddressChecked(false);
      }
    } catch (err) {
      console.error("Error deleting saved address:", err);
      toast.error("Could not delete saved address.");
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    const customerErrors = validateCustomerForm(customerForm);
    const shippingErrors = validateShippingForm(shippingForm);
    const errors = { ...customerErrors, ...shippingErrors };
    setFormErrors(errors);

    if ((saveAddressChecked || editingAddressId) && saveAddressLabel === "other" && !saveAddressCustomLabel.trim()) {
      setSaveLabelError("Please enter a name for this address.");
      return;
    }

    if (!user) {
      toast.error("Please login to complete your purchase");
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (Object.keys(errors).length > 0) {
      focusFirstInvalidField(errors);
      return;
    }

    setLoading(true);
    if (paymentMethod === "cod") {
      try {
        // Generate order number
        const orderNum = `ORD${Date.now().toString().slice(-6)}`;
        setOrderNumber(orderNum);

        // Create order record in Firebase
        const orderRef = doc(collection(db, "orders"));
        const calculatedSubtotal = items.reduce((sum, item) => {
          let itemPrice = item.price || 0;
          if (
            item.selectedSize &&
            item.sizesWithPrices &&
            item.sizesWithPrices.length > 0
          ) {
            const sizePrice = item.sizesWithPrices.find(
              (s) => s.size === item.selectedSize
            );
            if (sizePrice) {
              itemPrice = sizePrice.price;
            }
          }
          return sum + itemPrice * item.quantity;
        }, 0);
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
          items: items.map((item) => {
            let priceAtSelectedSize = item.price || 0;
            if (
              item.selectedSize &&
              item.sizesWithPrices &&
              item.sizesWithPrices.length > 0
            ) {
              const sizePrice = item.sizesWithPrices.find(
                (s) => s.size === item.selectedSize
              );
              if (sizePrice) {
                priceAtSelectedSize = sizePrice.price;
              }
            }

            return {
              product: {
                id: item.id || "",
                name: item.name || "",
                image: item.image || "",
              },
              quantity: item.quantity || 0,
              priceAtOrder: item.price || 0,
              priceAtSelectedSize: priceAtSelectedSize,
              selectedSize: item.selectedSize || null,
              selectedColor: item.selectedColor || null,
              customDimensions: item.customDimensions || null,
            };
          }),
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

        // Save the address if requested
        if (saveAddressChecked || editingAddressId) {
          const addressPayload = {
            label: saveAddressLabel,
            ...(saveAddressLabel === "other" && { customLabel: saveAddressCustomLabel.trim() }),
            fullName: customerForm.name,
            phone: customerForm.phone,
            street: shippingForm.street,
            city: shippingForm.city,
            state: shippingForm.state,
            postalCode: shippingForm.postalCode,
            country: "India" as const,
            isDefault: addresses.length === 0 || Boolean(editingAddressId),
          };

          try {
            if (editingAddressId) {
              await updateAddress(editingAddressId, addressPayload);
            } else {
              await addAddress(addressPayload);
            }
          } catch (saveError) {
            console.error("Error saving address (full):", saveError);
            toast.error("Failed to save address. See console for details.");
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
    } else if (paymentMethod === "online") {
      // --- RAZORPAY LOGIC ---
      try {
        // 1. Load Script
        const res = await loadRazorpayScript();
        if (!res) throw new Error("Razorpay SDK failed to load");

        // 2. Call createRazorpayOrder
        const functions = getFunctions(app, "asia-south1");
        const createOrder = httpsCallable(functions, "createRazorpayOrder");

        const payload = {
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize || null,
            selectedColor: item.selectedColor || null,
            customDimensions: item.customDimensions || null,
          })),
          shippingAddress: shippingForm,
          discountCode: discountCode || null,
          customerName: customerForm.name,
          customerPhone: customerForm.phone,
        };

        const { data } = (await createOrder(payload)) as any;

        // 3. Open Razorpay Checkout
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: data.razorpayOrderId,
          name: "Rachna Creation",
          description: "Order Payment",
          prefill: {
            name: customerForm.name,
            email: user.email || "",
            contact: customerForm.phone,
          },
          handler: async function (response: any) {
            // 4. On Success Callback: Verify Payment
            try {
              setLoading(true);
              const verifyPayment = httpsCallable(functions, "verifyRazorpayPayment");
              await verifyPayment({
                firestoreOrderId: data.firestoreOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              // 5. Verification Success UI
              clearCart();
              setShowOrderSuccess(true);
              setTimeout(() => {
                setShowOrderSuccess(false);
                navigate("/orders");
              }, 3000);
            } catch (verifyError) {
              console.error("Payment verification failed", verifyError);
              toast.error("Payment verification failed. If money was deducted, please contact support.");
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              toast.error("Payment cancelled. You can try again.");
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", async function (response: any) {
          const reason =
            response?.error?.description ||
            response?.error?.reason ||
            response?.error?.code ||
            "Payment failed";

          toast.error(reason);

          if (data?.firestoreOrderId) {
            try {
              const failedOrderRef = doc(db, "orders", data.firestoreOrderId);
              await updateDoc(failedOrderRef, {
                status: "payment_failed",
                paymentFailureReason: reason,
                paymentFailureAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                razorpayPaymentId: response?.error?.metadata?.payment_id || null,
              });
            } catch (updateError) {
              console.error("Failed to update failed order status:", updateError);
            }
          }

          setLoading(false);
        });
        rzp.open();
      } catch (error: any) {
        console.error("Razorpay initialization failed:", error);
        toast.error(error.message || "Could not initialize payment gateway.");
        setLoading(false);
      }
    }
  };

  const lookupPinCode = async (pincode: string) => {
    setPinLookupError("");
    setPinLookupLoading(true);
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`
      );
      const data = await response.json();
      if (Array.isArray(data) && data[0]?.Status === "Success") {
        const postOffice = data[0]?.PostOffice?.[0];
        if (postOffice) {
          const district = postOffice.District || "";
          const stateFromApi = postOffice.State || "";
          const normalized = stateFromApi.trim().toLowerCase();
          const aliasMap: Record<string, string> = {
            "jammu and kashmir": "Jammu and Kashmir",
            "jammu & kashmir": "Jammu and Kashmir",
            "dadra and nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
            "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
            "andaman & nicobar islands": "Andaman and Nicobar Islands",
          };
          const matchedState =
            indianStates.find((state) => state.toLowerCase() === normalized) ||
            aliasMap[normalized];

          setShippingForm((prev) => ({
            ...prev,
            city: district || prev.city,
            state: matchedState || prev.state,
          }));
        } else {
          setPinLookupError(
            "Couldn't find this PIN code, please enter city/state manually"
          );
        }
      } else {
        setPinLookupError(
          "Couldn't find this PIN code, please enter city/state manually"
        );
      }
    } catch (error) {
      setPinLookupError(
        "Couldn't find this PIN code, please enter city/state manually"
      );
    } finally {
      setPinLookupLoading(false);
    }
  };

  const debouncePinLookup = (postalCode: string) => {
    if (postalCodeTimeoutRef.current) {
      window.clearTimeout(postalCodeTimeoutRef.current);
    }
    postalCodeTimeoutRef.current = window.setTimeout(() => {
      if (/^[1-9][0-9]{5}$/.test(postalCode)) {
        lookupPinCode(postalCode);
      } else {
        setPinLookupError("");
      }
    }, 500);
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleCustomerBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setCustomerTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    const errors = validateCustomerForm(customerForm);
    setFormErrors((prev) => ({
      ...prev,
      [name]: errors[name as keyof FormErrors],
    }));
  };

  const handleShippingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
    if (!manualEntryStarted) {
      setManualEntryStarted(true);
      if (selectedAddressId) {
        setEditingAddressId(selectedAddressId);
      }
    }
    if (selectedAddressId) {
      setSelectedAddressId(null);
    }
    if (name === "postalCode") {
      setPinLookupError("");
      if (/^[0-9]{6}$/.test(value)) {
        debouncePinLookup(value);
      } else {
        if (postalCodeTimeoutRef.current) {
          window.clearTimeout(postalCodeTimeoutRef.current);
        }
        setPinLookupLoading(false);
      }
    }
  };

  const handleShippingBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setShippingTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    const errors = validateShippingForm(shippingForm);
    setFormErrors((prev) => ({
      ...prev,
      [name]: errors[name as keyof FormErrors],
    }));
  };

  useEffect(() => {
    return () => {
      if (postalCodeTimeoutRef.current) {
        window.clearTimeout(postalCodeTimeoutRef.current);
      }
    };
  }, []);

  const currentFormErrors = {
    ...validateCustomerForm(customerForm),
    ...validateShippingForm(shippingForm),
  };
  const isFormValid = Object.keys(currentFormErrors).length === 0;

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
          <OrderSummaryCard items={items} total={total} discountCode={discountCode} />

          {/* Payment Form */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              {/* Customer Information */}
              <CustomerInfoForm
                customerForm={customerForm}
                formErrors={formErrors}
                formSubmitted={formSubmitted}
                customerTouched={customerTouched}
                onChange={handleCustomerChange}
                onBlur={handleCustomerBlur}
                nameRef={nameRef}
                phoneRef={phoneRef}
              />

              {/* Shipping Address */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Shipping Address
                </h2>
                <SavedAddressSelector
                  addresses={addresses}
                  addressesLoading={addressesLoading}
                  selectedAddressId={selectedAddressId}
                  onSelectAddress={selectSavedAddress}
                  onEditAddress={editSavedAddress}
                  onDeleteAddress={handleDeleteAddress}
                  saveAddressChecked={saveAddressChecked}
                  onSaveAddressCheckedChange={(checked) => {
                    setSaveAddressChecked(checked);
                    if (!checked && !editingAddressId) {
                      setSaveAddressLabel("home");
                      setSaveAddressCustomLabel("");
                      setSaveLabelError("");
                    }
                  }}
                  saveAddressLabel={saveAddressLabel}
                  onSaveAddressLabelChange={(label) => {
                    setSaveAddressLabel(label);
                    if (label !== "other") {
                      setSaveAddressCustomLabel("");
                      setSaveLabelError("");
                    }
                  }}
                  saveAddressCustomLabel={saveAddressCustomLabel}
                  onSaveAddressCustomLabelChange={(v) => {
                    setSaveAddressCustomLabel(v);
                    setSaveLabelError("");
                  }}
                  saveLabelError={saveLabelError}
                  editingAddressId={editingAddressId}
                />
                <ShippingAddressForm
                  shippingForm={shippingForm}
                  formErrors={formErrors}
                  formSubmitted={formSubmitted}
                  shippingTouched={shippingTouched}
                  onChange={handleShippingChange}
                  onBlur={handleShippingBlur}
                  pinLookupLoading={pinLookupLoading}
                  pinLookupError={pinLookupError}
                  streetRef={streetRef}
                  cityRef={cityRef}
                  stateRef={stateRef}
                  postalCodeRef={postalCodeRef}
                />
              </div>

              {/* Payment Method */}
              <PaymentMethodSelector
                paymentMethod={paymentMethod}
                onlinePaymentEnabled={onlinePaymentEnabled}
                codEnabled={codEnabled}
                onChange={setPaymentMethod}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !paymentMethod || !isFormValid}
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