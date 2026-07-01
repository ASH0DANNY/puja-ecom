import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useReduxAuth } from "../redux/useReduxAuth";
import type { Order } from "../types/order";
import { useScrollToTop } from "../utils/scrollToTop";
import { InvoiceModal } from "../components/InvoiceModal";
import {
  ShoppingBag,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Calendar,
  Search,
  Download,
  X,
  CreditCard,
} from "lucide-react";
import {
  Tabs,
  Tab,
  Box,
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

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useReduxAuth();
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid)
        );
        const ordersSnapshot = await getDocs(q);
        const ordersData = ordersSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Order)
        );

        // Sort orders by date (newest first)
        ordersData.sort((a, b) => {
          const dateA =
            a.createdAt instanceof Timestamp
              ? a.createdAt.toDate()
              : new Date(a.createdAt || 0);
          const dateB =
            b.createdAt instanceof Timestamp
              ? b.createdAt.toDate()
              : new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });

        setOrders(ordersData);
        setFilteredOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

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
    setPage(0); // Reset to first page when filters change
  }, [orders, statusFilter, searchQuery]);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-blue-500" />;
      case "processing":
        return <Package className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPaymentMethod = (method: string) => {
    if (!method) return "N/A";
    return method.charAt(0).toUpperCase() + method.slice(1).replace(/_/g, " ");
  };

  const formatDateTime = (value?: any) => {
    if (!value) return "N/A";
    try {
      const date = value?.toDate ? value.toDate() : new Date(value);
      if (Number.isNaN(date.getTime())) return "N/A";
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "N/A";
    }
  };

  const mapStatusForDisplay = (order: Order) => {
    const raw = (order.status || "").toString().toLowerCase();

    // Handle legacy/variant values like 'pending_payment' or 'Pending_payment'
    if (raw === "pending_payment" || raw === "pending-payment") {
      if (order.paymentFailureReason || order.razorpayPaymentStatus === "failed" || order.razorpayPaymentStatus === "failed") {
        return "Payment Failed";
      }
      return "Pending Payment";
    }

    if (raw === "payment_failed") return "Payment Failed";

    // Default: Title case the status
    if (!raw) return "Pending";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  const orderStats = {
    total: orders.filter((o) => o.status?.toLowerCase() !== "cancelled").length,
    delivered: orders.filter((o) => o.status?.toLowerCase() === "delivered")
      .length,
    shipped: orders.filter((o) => o.status?.toLowerCase() === "shipped").length,
    processing: orders.filter((o) => o.status?.toLowerCase() === "processing")
      .length,
    totalSpent: orders
      .filter((o) => o.status?.toLowerCase() !== "cancelled")
      .reduce((sum, order) => sum + (order.total || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 lg:py-10">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  My Orders
                </h1>
                <p className="text-gray-600 mt-1 text-sm lg:text-base">
                  Track and manage your purchase history
                </p>
              </div>
            </div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orderStats.total}
                </p>
              </div>
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {orderStats.delivered}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shipped</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orderStats.shipped}
                </p>
              </div>
              <Truck className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orderStats.processing}
                </p>
              </div>
              <Package className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-primary">
                  {orderStats.totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Status Filter */}
        <Paper sx={{ mb: 4, borderRadius: 2 }}>
          <Tabs
            value={statusFilter}
            onChange={(_, newValue) => {
              setStatusFilter(newValue);
              setPage(0);
            }}
            variant="fullWidth"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#3b82f6",
              },
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 500,
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: "rgba(59, 130, 246, 0.05)",
                },
                "&.Mui-selected": {
                  color: "#3b82f6",
                },
              },
            }}
          >
            <Tab label={`All Orders (${orders.length})`} value="all" />
            <Tab
              label={`Processing (${orders.filter((o) => o.status?.toLowerCase() === "processing").length})`}
              value="processing"
            />
            <Tab
              label={`Shipped (${orders.filter((o) => o.status?.toLowerCase() === "shipped").length})`}
              value="shipped"
            />
            <Tab
              label={`Delivered (${orders.filter((o) => o.status?.toLowerCase() === "delivered").length})`}
              value="delivered"
            />
          </Tabs>
        </Paper>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative min-h-screen flex items-center justify-center py-4 px-4">
              <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-4 lg:p-6 border-b border-gray-200 z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                      Order Details
                    </h3>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="p-4 lg:p-6 space-y-6">
                  {/* Invoice Actions */}
                  {/* <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-lg p-6 shadow-md">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="font-bold text-lg text-gray-900">
                          📄 Invoice Management
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Download or preview your order invoice with complete
                          details
                        </p>
                      </div>
                      <OrderInvoice order={selectedOrder} />
                    </div>
                  </div> */}

                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Order Information
                      </h3>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Order Number:</span> #
                          {selectedOrder.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Date:</span>{" "}
                          {selectedOrder.createdAt instanceof Timestamp
                            ? selectedOrder.createdAt
                                .toDate()
                                .toLocaleString("en-IN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                            : new Date(selectedOrder.createdAt).toLocaleString(
                                "en-IN",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Status:</span>{" "}
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              selectedOrder.status || "pending"
                            )}`}
                          >
                            {mapStatusForDisplay(selectedOrder)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-900 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Payment Method:</span>{" "}
                          {formatPaymentMethod(selectedOrder.paymentMethod)}
                        </p>

                        {/* Razorpay / Payment metadata */}
                        {selectedOrder.razorpayPaymentId && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Payment ID:</span>{" "}
                            {selectedOrder.razorpayPaymentId}
                          </p>
                        )}

                        {selectedOrder.razorpayPaymentCreatedAt && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Razorpay Timestamp:</span>{" "}
                            {formatDateTime(selectedOrder.razorpayPaymentCreatedAt)}
                          </p>
                        )}

                        {selectedOrder.paidAt && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">System Confirmation:</span>{" "}
                            {formatDateTime(selectedOrder.paidAt)}
                          </p>
                        )}

                        {selectedOrder.paymentFailureReason && (
                          <p className="text-sm text-red-700">
                            <span className="font-medium">Payment Failure:</span>{" "}
                            {selectedOrder.paymentFailureReason}
                            {selectedOrder.paymentFailureAt && (
                              <span>{` on ${formatDateTime(selectedOrder.paymentFailureAt)}`}</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Customer & Shipping Information
                      </h3>
                      <div className="mt-2 space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedOrder.userName || "Customer"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedOrder.userEmail}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">
                            {selectedOrder.shippingAddress?.street}
                            <br />
                            {selectedOrder.shippingAddress?.city},{" "}
                            {selectedOrder.shippingAddress?.state}{" "}
                            {selectedOrder.shippingAddress?.postalCode}
                            <br />
                            {selectedOrder.shippingAddress?.country}
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
                        {selectedOrder.items?.map((item, index) => (
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
                                {item.product.image && (
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-10 h-10 object-cover rounded mr-3"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">
                                    {item.product.name}
                                  </p>
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
                                          Dimensions:{" "}
                                          {item.customDimensions.width} ×{" "}
                                          {item.customDimensions.height}
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
                                                {item.product.sizesWithPrices.find(
                                                  (swp) =>
                                                    swp.size ===
                                                    item.selectedSize
                                                )?.weight}
                                              </>
                                            )}
                                            {item.product.sizesWithPrices.find(
                                              (swp) =>
                                                swp.size === item.selectedSize
                                            )?.dimensions && (
                                              <>
                                                <br />
                                                Dimensions:{" "}
                                                {item.product.sizesWithPrices.find(
                                                  (swp) =>
                                                    swp.size ===
                                                    item.selectedSize
                                                )?.dimensions}
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
                              {(item.priceAtSelectedSize || item.priceAtOrder)?.toFixed(2)}
                            </div>
                            <div className="w-1/5 text-center">
                              {item.quantity}
                            </div>
                            <div className="w-1/5 text-right">
                              
                              {(
                                (item.priceAtSelectedSize || item.priceAtOrder || 0) * (item.quantity || 0)
                              ).toFixed(2)}
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center text-sm px-6 py-4">
                          <div className="w-4/5 text-right font-medium">
                            Subtotal:
                          </div>
                          <div className="w-1/5 text-right">
                            
                            {(
                              selectedOrder.subtotal ||
                              selectedOrder.total ||
                              0
                            ).toFixed(2)}
                          </div>
                        </div>
                        {selectedOrder.discountAmount &&
                          selectedOrder.discountAmount > 0 && (
                            <div className="flex items-center text-sm px-6 py-4">
                              <div className="w-4/5 text-right font-medium">
                                Discount
                                {selectedOrder.discountCode
                                  ? ` (${selectedOrder.discountCode})`
                                  : ""}
                                :
                              </div>
                              <div className="w-1/5 text-right text-green-600">
                                -{selectedOrder.discountAmount.toFixed(2)}
                              </div>
                            </div>
                          )}
                        <div className="flex items-center text-sm px-6 py-4 font-bold">
                          <div className="w-4/5 text-right">Total:</div>
                          <div className="w-1/5 text-right">
                            {(selectedOrder.total || 0).toFixed(2)}
                          </div>
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
          order={invoiceOrder || ({} as Order)}
          isOpen={!!invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />

        {/* Orders Table with Pagination */}
        <Paper sx={{ borderRadius: 2, overflow: "hidden", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
          {filteredOrders.length === 0 ? (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {orders.length === 0 ? "No orders yet" : "No orders found"}
              </h3>
              <p className="text-gray-500">
                {orders.length === 0
                  ? "When you place your first order, it will appear here."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                        Order Details
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
                        Items
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                        Total
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                        Actions
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
                              <div className="text-sm text-gray-500">
                                Order ID: {order.id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div className="text-sm text-gray-900">
                                {(() => {
                                  try {
                                    if (!order.createdAt) return "N/A";
                                    const date =
                                      order.createdAt instanceof Timestamp
                                        ? order.createdAt.toDate()
                                        : new Date(order.createdAt);
                                    return date.toLocaleString("en-IN", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    });
                                  } catch (e) {
                                    return "N/A";
                                  }
                                })()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.status || "pending")}
                              <Chip
                                label={mapStatusForDisplay(order)}
                                size="small"
                                variant="outlined"
                                sx={{
                                  backgroundColor:
                                    order.status?.toLowerCase() === "delivered"
                                      ? "#dcfce7"
                                      : order.status?.toLowerCase() === "shipped"
                                        ? "#dbeafe"
                                        : order.status?.toLowerCase() === "processing"
                                          ? "#fef3c7"
                                          : "#f3f4f6",
                                  color:
                                    order.status?.toLowerCase() === "delivered"
                                      ? "#166534"
                                      : order.status?.toLowerCase() === "shipped"
                                        ? "#1e40af"
                                        : order.status?.toLowerCase() === "processing"
                                          ? "#92400e"
                                          : "#374151",
                                  border: "none",
                                }}
                              />
                            </div>
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
                            <div className="text-sm text-gray-900">
                              {order.items?.length || 0}{" "}
                              {order.items?.length === 1 ? "item" : "items"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items?.[0]?.product?.name &&
                                `${order.items[0].product.name}${
                                  order.items.length > 1
                                    ? ` +${order.items.length - 1} more`
                                    : ""
                                }`}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-gray-900">
                              {(order.total || 0).toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium"
                                title="View order details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>

                              {(order.status?.toLowerCase() === "cancelled" ||
                                order.status?.toLowerCase() === "delivered") ? (
                                <button
                                  onClick={() => setInvoiceOrder(order)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-xs font-medium"
                                  title="Download invoice"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Invoice
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed text-xs font-medium opacity-50"
                                  title="Invoice available after delivery or cancellation"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Invoice
                                </button>
                              )}
                            </div>
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
            </>
          )}
        </Paper>
      </div>
    </div>
  );
};

export default OrdersPage;