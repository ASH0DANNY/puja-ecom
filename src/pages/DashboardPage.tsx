import { useState, useEffect } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Order } from "../types/order";
import type { DashboardProduct } from "../types/dashboard";
import type { Suggestion } from "../types/suggestion";
import { ProductTable } from "../components/ProductTable";
import { OrderTable } from "../components/OrderTable";
import { SuggestionsTable } from "../components/SuggestionsTable";
import AddProductForm from "../components/AddProductForm";
import DiscountManager from "../components/DiscountManager";
import {
  Package,
  ShoppingCart,
  MessageSquare,
  Tag,
  BarChart3,
  Plus,
  Menu,
  X,
  DollarSign,
  Users,
  TrendingUp,
  Box,
} from "lucide-react";

type TabType = "overview" | "products" | "orders" | "suggestions" | "discounts";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
}

const tabConfig = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "suggestions", label: "Suggestions", icon: MessageSquare },
  { id: "discounts", label: "Discounts", icon: Tag },
];

export const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const productsSnapshot = await getDocs(collection(db, "products"));
      const productsData = productsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          sales: data.sales || 0,
          revenue: (data.sales || 0) * (data.price || 0),
          stockCount: data.stock || 0,
        } as DashboardProduct;
      });
      setProducts(productsData);

      // Fetch orders
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const ordersData = ordersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate()
              : new Date(),
        } as Order;
      });
      setOrders(ordersData);

      // Fetch suggestions
      const suggestionsSnapshot = await getDocs(collection(db, "suggestions"));
      const suggestionsData = suggestionsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate()
              : new Date(),
        } as Suggestion;
      });
      setSuggestions(suggestionsData);

      // Calculate stats
      const totalRevenue = ordersData.reduce(
        (sum, order) => sum + (order.total || 0),
        0
      );
      const usersSnapshot = await getDocs(collection(db, "users"));

      setStats({
        totalRevenue,
        totalOrders: ordersData.length,
        totalProducts: productsData.length,
        totalUsers: usersSnapshot.size,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Box,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 lg:py-10">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                Manage your store efficiently
              </p>
            </div>
            {activeTab === "products" && (
              <button
                onClick={() => setShowAddProduct(true)}
                className="hidden sm:flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
          >
            <span className="flex items-center gap-3">
              {(() => {
                const activeTabConfig = tabConfig.find(
                  (t) => t.id === activeTab
                );
                const IconComponent = activeTabConfig?.icon;
                return IconComponent ? (
                  <IconComponent className="w-5 h-5 text-primary" />
                ) : null;
              })()}
              <span className="font-medium">
                {tabConfig.find((t) => t.id === activeTab)?.label}
              </span>
            </span>
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
            {tabConfig.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)}
                className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary border-l-4 border-primary"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Desktop Tabs */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm mb-6">
          <nav className="flex flex-wrap">
            {tabConfig.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex-1 min-w-[120px] py-4 px-6 font-medium text-sm transition-all duration-200
                  flex items-center justify-center gap-2
                  ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                  ${index === 0 ? "rounded-l-xl" : ""}
                  ${index === tabConfig.length - 1 ? "rounded-r-xl" : ""}
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Add Product Button */}
        {activeTab === "products" && (
          <button
            onClick={() => setShowAddProduct(true)}
            className="sm:hidden fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors z-40"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Overview Statistics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {statCards.map((stat, index) => (
                  <div
                    key={index}
                    className={`${stat.bgColor} rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`${stat.color} bg-white p-2 rounded-lg`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium">
                      {stat.title}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent Activity Section */}
              {/* <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Recent Orders
                  </h3>
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="bg-white p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Order #{order.id.slice(-6)}
                          </span>
                          <span className="text-sm text-gray-600">
                            ${order.total?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Top Products
                  </h3>
                  <div className="space-y-3">
                    {products.slice(0, 3).map((product) => (
                      <div key={product.id} className="bg-white p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium truncate">
                            {product.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {product.sales} sales
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div> */}
            </div>
          )}

          {activeTab === "products" && (
            <div className="overflow-x-auto">
              <ProductTable products={products} onUpdate={fetchData} />
            </div>
          )}

          {activeTab === "orders" && (
            <div className="overflow-x-auto">
              <OrderTable orders={orders} onUpdate={fetchData} />
            </div>
          )}

          {activeTab === "suggestions" && (
            <div className="overflow-x-auto">
              <SuggestionsTable
                suggestions={suggestions}
                onUpdate={fetchData}
              />
            </div>
          )}

          {activeTab === "discounts" && (
            <div>
              <DiscountManager />
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative min-h-screen flex items-center justify-center py-4 px-4">
              <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white p-4 lg:p-6 border-b border-gray-200 z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                      Add New Product
                    </h3>
                    <button
                      onClick={() => setShowAddProduct(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 lg:p-6">
                  <AddProductForm
                    onSuccess={() => {
                      setShowAddProduct(false);
                      fetchData();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
