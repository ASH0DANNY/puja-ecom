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
import { OrderInvoice } from "../components/OrderInvoice";
import {
  ShoppingBag,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Calendar,
  Filter,
  Search,
  Download,
  X,
} from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [sortField, setSortField] = useState<keyof Order>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
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

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by search query
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

    // Sort the filtered results
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === bValue) return 0;

      const direction = sortDirection === "asc" ? 1 : -1;

      if (sortField === "createdAt") {
        const dateA = aValue instanceof Date ? aValue : new Date(aValue as any);
        const dateB = bValue instanceof Date ? bValue : new Date(bValue as any);
        return direction * (dateA.getTime() - dateB.getTime());
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction * aValue.localeCompare(bValue);
      }

      return direction * ((aValue as any) > (bValue as any) ? 1 : -1);
    });

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery, sortField, sortDirection]);

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
              {/* <DollarSign className="w-8 h-8 text-primary" /> */}
            </div>
          </div>
        </div>

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
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="all">All Status</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
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
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-lg p-6 shadow-md">
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
                  </div>

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
                                .toLocaleDateString()
                            : new Date(
                                selectedOrder.createdAt
                              ).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Status:</span>{" "}
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              selectedOrder.status || "pending"
                            )}`}
                          >
                            {selectedOrder.status || "Pending"}
                          </span>
                        </p>
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

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {orders.length === 0 ? "No orders yet" : "No orders found"}
              </h3>
              <p className="text-gray-500">
                {orders.length === 0
                  ? "When you place your first order, it will appear here."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>

                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        if (sortField === "createdAt") {
                          setSortDirection((prev) =>
                            prev === "asc" ? "desc" : "asc"
                          );
                        } else {
                          setSortField("createdAt");
                          setSortDirection("asc");
                        }
                      }}
                    >
                      Date
                      {sortField === "createdAt" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{order.id.slice(-8).toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Order ID: {order.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                                return date.toLocaleDateString();
                              } catch (e) {
                                return "N/A";
                              }
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status || "pending")}
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              order.status || "pending"
                            )}`}
                          >
                            {order.status
                              ? order.status.charAt(0).toUpperCase() +
                                order.status.toLowerCase().slice(1)
                              : "Pending"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.items?.length || 0}{" "}
                          {order.items?.length === 1 ? "item" : "items"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items?.[0]?.name &&
                            `${order.items[0].name}${
                              order.items.length > 1
                                ? ` +${order.items.length - 1} more`
                                : ""
                            }`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {(order.total || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium"
                            title="View order details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>

                          {order.status?.toLowerCase() === "delivered" && (
                            <button
                              onClick={() => setInvoiceOrder(order)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-xs font-medium"
                              title="Download invoice"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Invoice
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
