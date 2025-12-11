import { useState, useEffect } from "react";
import { doc, writeBatch, increment } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Order } from "../types/order";
import {
  Calendar,
  Eye,
  Search,
  Filter,
  Download,
  CreditCard,
} from "lucide-react";
import { InvoiceModal } from "./InvoiceModal";
import OrderEmailManager from "./OrderEmailManager";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
} from "@mui/material";

interface OrderTableProps {
  orders: Order[];
  onUpdate: () => void;
}

export const OrderTable = ({ orders, onUpdate }: OrderTableProps) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    let filtered = [...orders];

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          (order.userName || "").toLowerCase().includes(query) ||
          order.userEmail.toLowerCase().includes(query) ||
          order.items?.some((item) =>
            item.product.name?.toLowerCase().includes(query)
          )
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery]);

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: Order["status"],
    order: Order
  ) => {
    try {
      const batch = writeBatch(db);
      const orderRef = doc(db, "orders", orderId);

      batch.update(orderRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      if (newStatus === "cancelled" && order.status !== "cancelled") {
        for (const item of order.items) {
          if (!item.stockUpdated) {
            const productRef = doc(db, "products", item.product.id);
            batch.update(productRef, {
              stock: increment(item.quantity),
            });
          }
        }

        if (order.status === "delivered") {
          for (const item of order.items) {
            const productRef = doc(db, "products", item.product.id);
            batch.update(productRef, {
              sales: increment(-item.quantity),
            });
          }
        }

        batch.update(orderRef, {
          items: order.items.map((item) => ({
            ...item,
            stockUpdated: true,
          })),
        });
      } else if (order.status === "cancelled" && newStatus !== "cancelled") {
        for (const item of order.items) {
          if (item.stockUpdated) {
            const productRef = doc(db, "products", item.product.id);
            batch.update(productRef, {
              stock: increment(-item.quantity),
            });
          }
        }

        if (newStatus === "delivered") {
          for (const item of order.items) {
            const productRef = doc(db, "products", item.product.id);
            batch.update(productRef, {
              sales: increment(item.quantity),
            });
          }
        }

        batch.update(orderRef, {
          items: order.items.map((item) => ({
            ...item,
            stockUpdated: false,
          })),
        });
      }

      if (newStatus === "delivered" && order.status !== "delivered") {
        for (const item of order.items) {
          const productRef = doc(db, "products", item.product.id);
          batch.update(productRef, {
            sales: increment(item.quantity),
          });
        }
      }

      await batch.commit();
      onUpdate();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "#dcfce7";
      case "shipped":
        return "#dbeafe";
      case "processing":
        return "#fef3c7";
      case "pending":
        return "#f0f0f0";
      case "cancelled":
        return "#fee2e2";
      default:
        return "#f3f4f6";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "#166534";
      case "shipped":
        return "#1e40af";
      case "processing":
        return "#92400e";
      case "pending":
        return "#374151";
      case "cancelled":
        return "#991b1b";
      default:
        return "#374151";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPaymentMethod = (method: string) => {
    if (!method) return "N/A";
    return method.charAt(0).toUpperCase() + method.slice(1).replace(/_/g, " ");
  };

  return (
    <>
      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by ID, customer name, email or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table with Pagination */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  Order ID
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  Customer Info
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  Date
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  Payment
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  Total
                </TableCell>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  Emails
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => (
                  <TableRow
                    key={order.id}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                      },
                    }}
                  >
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-500">{order.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">
                        {order.userName || "Customer"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.userEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-900">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)
                        }
                        size="small"
                        variant="outlined"
                        sx={{
                          backgroundColor: getStatusColor(order.status),
                          color: getStatusTextColor(order.status),
                          border: "none",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-900">
                          {formatPaymentMethod(order.paymentMethod)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">
                        {order.total.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden xl:inline">View Details</span>
                          <span className="xl:hidden">View</span>
                        </button>
                        <button
                          onClick={() => setInvoiceModalOrder(order)}
                          className="text-green-600 hover:text-green-700 inline-flex items-center gap-1"
                          title="Download invoice"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden xl:inline">Invoice</span>
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusUpdate(
                              order.id,
                              e.target.value as Order["status"],
                              order
                            )
                          }
                          className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <OrderEmailManager order={order} onEmailSent={onUpdate} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            borderTop: "1px solid #e5e7eb",
            "& .MuiTablePagination-toolbar": {
              padding: "12px 24px",
            },
          }}
        />
      </Paper>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Order Information
                  </h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Order ID:</span>{" "}
                      {selectedOrder.id}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Date:</span>{" "}
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Payment Method:</span>{" "}
                      {formatPaymentMethod(selectedOrder.paymentMethod)}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Customer Information
                  </h3>
                  <div className="mt-2 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedOrder.customerName ||
                          selectedOrder.userName ||
                          "Customer"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedOrder.customerPhone && (
                          <span className="block">
                            📞 {selectedOrder.customerPhone}
                          </span>
                        )}
                        <span className="block">
                          ✉️ {selectedOrder.userEmail}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Shipping Address:</span>
                        <br />
                        {selectedOrder.shippingAddress.street}
                        <br />
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.state}{" "}
                        {selectedOrder.shippingAddress.postalCode}
                        <br />
                        {selectedOrder.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4">
                  Products
                </h3>
                <div className="bg-gray-50 rounded-lg">
                  <div className="flex font-medium text-gray-500 text-sm px-6 py-3 bg-gray-100 rounded-t-lg">
                    <div className="w-2/5">Product</div>
                    <div className="w-1/5 text-center">Price</div>
                    <div className="w-1/5 text-center">Quantity</div>
                    <div className="w-1/5 text-right">Total</div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={item.product.id || index}
                        className={`flex items-center text-sm px-6 py-4 ${
                          item.customDimensions
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : ""
                        }`}
                      >
                        <div className="w-2/5">
                          <div className="flex items-center gap-2">
                            {item.customDimensions && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-md">
                                <span className="text-xs font-semibold text-blue-700">
                                  📐
                                </span>
                                <span className="text-xs font-semibold text-blue-700">
                                  CUSTOM
                                </span>
                              </div>
                            )}
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-10 h-10 object-cover rounded mr-3"
                            />
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              {(item.selectedSize ||
                                item.selectedColor ||
                                item.customDimensions) && (
                                <p className="text-xs text-gray-500">
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
                                      Dimensions: {item.customDimensions.width}{" "}
                                      × {item.customDimensions.height}
                                      {item.customDimensions.depth &&
                                        ` × ${item.customDimensions.depth}`}{" "}
                                      cm
                                    </>
                                  )}
                                  {item.selectedSize &&
                                    !item.customDimensions &&
                                    item.product.sizesWithPrices && (
                                      <>
                                        {item.product.sizesWithPrices.find(
                                          (swp) =>
                                            swp.size === item.selectedSize
                                        )?.weight && (
                                          <>
                                            <br />
                                            Weight:{" "}
                                            {
                                              item.product.sizesWithPrices.find(
                                                (swp) =>
                                                  swp.size === item.selectedSize
                                              )?.weight
                                            }
                                          </>
                                        )}
                                        {item.product.sizesWithPrices.find(
                                          (swp) =>
                                            swp.size === item.selectedSize
                                        )?.dimensions && (
                                          <>
                                            <br />
                                            Dimensions:{" "}
                                            {
                                              item.product.sizesWithPrices.find(
                                                (swp) =>
                                                  swp.size === item.selectedSize
                                              )?.dimensions
                                            }
                                          </>
                                        )}
                                      </>
                                    )}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="w-1/5 text-center">
                          $
                          {(
                            item.priceAtSelectedSize || item.priceAtOrder
                          ).toFixed(2)}
                        </div>
                        <div className="w-1/5 text-center">{item.quantity}</div>
                        <div className="w-1/5 text-right">
                          $
                          {(
                            (item.priceAtSelectedSize || item.priceAtOrder) *
                            item.quantity
                          ).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center text-sm px-6 py-4 border-t-2 border-gray-300">
                      <div className="w-4/5 text-right font-medium">
                        Subtotal:
                      </div>
                      <div className="w-1/5 text-right">
                        ${selectedOrder.subtotal.toFixed(2)}
                      </div>
                    </div>
                    {(selectedOrder.discountAmount || 0) > 0 && (
                      <div className="flex items-center text-sm px-6 py-4 bg-green-50">
                        <div className="w-4/5 text-right font-medium text-green-700">
                          Discount
                          {selectedOrder.discountCode &&
                            ` (${selectedOrder.discountCode})`}
                          :
                        </div>
                        <div className="w-1/5 text-right text-green-700 font-medium">
                          -${(selectedOrder.discountAmount || 0).toFixed(2)}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center text-sm px-6 py-4 font-bold text-lg bg-gray-50 border-t border-gray-300">
                      <div className="w-4/5 text-right">Total:</div>
                      <div className="w-1/5 text-right">
                        ${selectedOrder.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        order={invoiceModalOrder!}
        isOpen={invoiceModalOrder !== null}
        onClose={() => setInvoiceModalOrder(null)}
      />
    </>
  );
};

export default OrderTable;
