import { useState } from "react";
import { Download, Eye, X, Loader } from "lucide-react";
import type { Order } from "../types/order";
import { generateInvoicePdf, downloadPdf, previewPdf } from "../utils/exportPdf";

interface InvoiceModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal = ({
  order,
  isOpen,
  onClose,
}: InvoiceModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePreview = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const invoiceData = {
        orderId: order.id,
        date: new Date(order.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        customerName: order.userName || order.customerName || "Customer",
        email: order.userEmail,
        phone: order.customerPhone || "N/A",
        address: `${order.shippingAddress?.street || ""}, ${
          order.shippingAddress?.city || ""
        }, ${order.shippingAddress?.state || ""} ${
          order.shippingAddress?.postalCode || ""
        }, ${order.shippingAddress?.country || ""}`,
        items: order.items.map((item) => ({
          name: item.product?.name || "Product",
          quantity: item.quantity,
          price: item.priceAtSelectedSize || item.priceAtOrder || 0,
          total: (item.priceAtSelectedSize || item.priceAtOrder || 0) * item.quantity,
          size: item.selectedSize,
          weight: item.product?.sizesWithPrices?.find(
            (swp) => swp.size === item.selectedSize
          )?.weight,
          dimensions: item.selectedSize && item.product?.sizesWithPrices?.find(
            (swp) => swp.size === item.selectedSize
          )?.dimensions,
          customDimensions: item.customDimensions
            ? `${item.customDimensions.width} × ${item.customDimensions.height}${
                item.customDimensions.depth
                  ? ` × ${item.customDimensions.depth}`
                  : ""
              } cm`
            : undefined,
          color: item.selectedColor,
        })),
        subtotal: order.subtotal || 0,
        discount: order.discountAmount || 0,
        total: order.total || 0,
      };

      const pdf = generateInvoicePdf(invoiceData, `Invoice-${order.id}.pdf`);
      previewPdf(pdf);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate invoice"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const invoiceData = {
        orderId: order.id,
        date: new Date(order.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        customerName: order.userName || order.customerName || "Customer",
        email: order.userEmail,
        phone: order.customerPhone || "N/A",
        address: `${order.shippingAddress?.street || ""}, ${
          order.shippingAddress?.city || ""
        }, ${order.shippingAddress?.state || ""} ${
          order.shippingAddress?.postalCode || ""
        }, ${order.shippingAddress?.country || ""}`,
        items: order.items.map((item) => ({
          name: item.product?.name || "Product",
          quantity: item.quantity,
          price: item.priceAtSelectedSize || item.priceAtOrder || 0,
          total: (item.priceAtSelectedSize || item.priceAtOrder || 0) * item.quantity,
          size: item.selectedSize,
          weight: item.product?.sizesWithPrices?.find(
            (swp) => swp.size === item.selectedSize
          )?.weight,
          dimensions: item.selectedSize && item.product?.sizesWithPrices?.find(
            (swp) => swp.size === item.selectedSize
          )?.dimensions,
          customDimensions: item.customDimensions
            ? `${item.customDimensions.width} × ${item.customDimensions.height}${
                item.customDimensions.depth
                  ? ` × ${item.customDimensions.depth}`
                  : ""
              } cm`
            : undefined,
          color: item.selectedColor,
        })),
        subtotal: order.subtotal || 0,
        discount: order.discountAmount || 0,
        total: order.total || 0,
      };

      const pdf = generateInvoicePdf(
        invoiceData,
        `Invoice-${order.id}.pdf`
      );
      downloadPdf(pdf, `Invoice-${order.id}.pdf`);
      // Optionally close the modal after download
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download invoice"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Invoice Options</h2>
              <p className="text-blue-100 text-sm mt-1">
                Order #{order.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="p-1 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Invoice Details Preview */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium text-gray-900">
                {order.userName || order.customerName || "Customer"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Items:</span>
              <span className="font-medium text-gray-900">
                {order.items?.length || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-600 font-medium">Total Amount:</span>
              <span className="font-bold text-lg text-blue-600">
                {(order.total || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePreview}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isGenerating ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
              <span>Preview Invoice</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg"
            >
              {isGenerating ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span>Download PDF</span>
            </button>
          </div>

          {/* Info Text */}
          <div className="text-xs text-gray-500 text-center pt-2">
            <p>Choose an option above to view or download your invoice</p>
          </div>
        </div>
      </div>
    </div>
  );
};
