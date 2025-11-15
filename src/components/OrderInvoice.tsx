import { useState } from "react";
import { Download, Eye, X } from "lucide-react";
import type { Order } from "../types/order";
import { generateInvoicePdf, previewPdf, downloadPdf } from "../utils/exportPdf";

interface OrderInvoiceProps {
  order: Order;
}

export const OrderInvoice = ({ order }: OrderInvoiceProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInvoice = async (action: "preview" | "download") => {
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
          price: item.priceAtOrder || 0,
          total: (item.priceAtOrder || 0) * item.quantity,
          dimensions: item.customDimensions
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

      if (action === "preview") {
        previewPdf(pdf);
      } else {
        downloadPdf(pdf, `Invoice-${order.id}.pdf`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate invoice"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => generateInvoice("preview")}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
          title="Preview invoice"
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">Preview Invoice</span>
        </button>

        <button
          onClick={() => generateInvoice("download")}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
          title="Download invoice"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Download PDF</span>
        </button>
      </div>

      {isGenerating && (
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
          Generating invoice...
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>
      )}
    </div>
  );
};

/**
 * Inline invoice preview component (for modal display)
 */
export const InvoicePreviewModal = ({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative min-h-screen flex items-center justify-center py-4 px-4">
        <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white p-4 lg:p-6 border-b border-gray-200 z-10 flex justify-between items-center">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
              Invoice Preview
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Invoice Content */}
          <div className="p-4 lg:p-6">
            <InvoiceContent order={order} />
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-gray-50 p-4 lg:p-6 border-t border-gray-200 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <OrderInvoice order={order} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Invoice content component (reusable for display)
 */
export const InvoiceContent = ({ order }: OrderInvoiceProps) => {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
        <div className="mt-4 grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-gray-600">Invoice #</p>
            <p className="text-lg font-semibold text-gray-900">{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Invoice Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-2">BILL TO</p>
          <p className="text-gray-900">{order.userName || order.customerName || "Customer"}</p>
          <p className="text-gray-600">{order.userEmail}</p>
          {order.customerPhone && (
            <p className="text-gray-600">{order.customerPhone}</p>
          )}
          <p className="text-gray-600 mt-2">
            {order.shippingAddress?.street}
            <br />
            {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
            {order.shippingAddress?.postalCode}
            <br />
            {order.shippingAddress?.country}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold text-gray-600 mb-2">ORDER STATUS</p>
          <p className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Description
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">
                Qty
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900">
                Price
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-4 px-4">
                  <p className="font-medium text-gray-900">
                    {item.product?.name}
                  </p>
                  {(item.selectedSize ||
                    item.selectedColor ||
                    item.customDimensions) && (
                    <p className="text-sm text-gray-600 mt-1">
                      {item.selectedSize &&
                        `Size: ${item.selectedSize}`}
                      {item.selectedSize &&
                        (item.selectedColor ||
                          item.customDimensions) &&
                        " | "}
                      {item.selectedColor &&
                        `Color: ${item.selectedColor}`}
                      {item.customDimensions && (
                        <>
                          {(item.selectedSize ||
                            item.selectedColor) &&
                            " | "}
                          Dimensions: {item.customDimensions.width} ×{" "}
                          {item.customDimensions.height}
                          {item.customDimensions.depth &&
                            ` × ${item.customDimensions.depth}`}{" "}
                          cm
                        </>
                      )}
                    </p>
                  )}
                </td>
                <td className="py-4 px-4 text-center text-gray-900">
                  {item.quantity}
                </td>
                <td className="py-4 px-4 text-right text-gray-900">
                  ₹{(item.priceAtOrder || 0).toFixed(2)}
                </td>
                <td className="py-4 px-4 text-right font-semibold text-gray-900">
                  ₹{((item.priceAtOrder || 0) * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-full md:w-80">
          <div className="flex justify-between py-2 border-b border-gray-300">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">₹{(order.subtotal || 0).toFixed(2)}</span>
          </div>
          {order.discountAmount && order.discountAmount > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-gray-600">Discount</span>
              <span className="text-gray-900">-₹{order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-gray-100 px-4 rounded">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-semibold text-lg text-gray-900">
              ₹{(order.total || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 text-center text-gray-600 text-sm">
        <p>Thank you for your purchase!</p>
        <p className="mt-2">For support, contact us at support@puja-ecom.com</p>
      </div>
    </div>
  );
};
