import React, { useState } from "react";
import { Send, Loader, X, CheckCircle } from "lucide-react";
import {
  sendOrderConfirmationEmail,
  sendOrderCancelledEmail,
  sendOrderDeliveredEmail,
} from "../utils/emailService";
import type { Order } from "../types/order";
import toast from "react-hot-toast";

interface OrderEmailManagerProps {
  order: Order;
  onEmailSent?: () => void;
}

const OrderEmailManager: React.FC<OrderEmailManagerProps> = ({
  order,
  onEmailSent,
}) => {
  const [loading, setLoading] = useState<"confirmation" | "cancel" | "delivery" | null>(
    null
  );

  const handleSendConfirmationEmail = async () => {
    if (!order.userEmail) {
      toast.error("No customer email found");
      return;
    }

    setLoading("confirmation");
    try {
      const sent = await sendOrderConfirmationEmail(order);
      if (sent) {
        toast.success("Confirmation email sent!");
        onEmailSent?.();
      } else {
        toast.error("Failed to send confirmation email");
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      toast.error("Error sending email");
    } finally {
      setLoading(null);
    }
  };

  const handleSendCancelEmail = async () => {
    if (!order.userEmail) {
      toast.error("No customer email found");
      return;
    }

    setLoading("cancel");
    try {
      const sent = await sendOrderCancelledEmail(order);
      if (sent) {
        toast.success("Cancellation email sent!");
        onEmailSent?.();
      } else {
        toast.error("Failed to send cancellation email");
      }
    } catch (error) {
      console.error("Error sending cancellation email:", error);
      toast.error("Error sending email");
    } finally {
      setLoading(null);
    }
  };

  const handleSendDeliveryEmail = async () => {
    if (!order.userEmail) {
      toast.error("No customer email found");
      return;
    }

    setLoading("delivery");
    try {
      const sent = await sendOrderDeliveredEmail(order);
      if (sent) {
        toast.success("Delivery confirmation email sent!");
        onEmailSent?.();
      } else {
        toast.error("Failed to send delivery email");
      }
    } catch (error) {
      console.error("Error sending delivery email:", error);
      toast.error("Error sending email");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 min-w-max">
      {order.status === "processing" && (
        <button
          onClick={handleSendConfirmationEmail}
          disabled={loading !== null}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
          title="Send order confirmation email to customer"
        >
          {loading === "confirmation" ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          <span className="hidden lg:inline">Confirm</span>
          <span className="lg:hidden">Confirm</span>
        </button>
      )}

      {order.status === "cancelled" && (
        <button
          onClick={handleSendCancelEmail}
          disabled={loading !== null}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
          title="Send order cancellation email to customer"
        >
          {loading === "cancel" ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
          <span className="hidden lg:inline">Cancel</span>
          <span className="lg:hidden">Cancel</span>
        </button>
      )}

      {order.status === "delivered" && (
        <button
          onClick={handleSendDeliveryEmail}
          disabled={loading !== null}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
          title="Send delivery confirmation email to customer"
        >
          {loading === "delivery" ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden lg:inline">Delivery</span>
          <span className="lg:hidden">Deliver</span>
        </button>
      )}
    </div>
  );
};

export default OrderEmailManager;
