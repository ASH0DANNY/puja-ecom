import { useState } from "react";
import { Download } from "lucide-react";
import type { Order } from "../types/order";
import { InvoiceModal } from "./InvoiceModal";

interface OrderInvoiceProps {
  order: Order;
}

export const OrderInvoice = ({ order }: OrderInvoiceProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
        title="Download or preview invoice"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">Invoice</span>
      </button>

      <InvoiceModal
        order={order}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
