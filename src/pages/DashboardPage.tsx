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

type TabType = "overview" | "products" | "orders" | "suggestions" | "discounts";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
}

export const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
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
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {activeTab === "products" && (
          <button
            onClick={() => setShowAddProduct(true)}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Add New Product
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {["overview", "products", "orders", "suggestions", "discounts"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm">Total Revenue</h3>
            <p className="text-2xl font-bold">
              ${stats.totalRevenue.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm">Total Orders</h3>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm">Total Products</h3>
            <p className="text-2xl font-bold">{stats.totalProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm">Total Users</h3>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div>
          <ProductTable products={products} onUpdate={fetchData} />
        </div>
      )}

      {activeTab === "orders" && (
        <div>
          <OrderTable orders={orders} onUpdate={fetchData} />
        </div>
      )}

      {activeTab === "suggestions" && (
        <div>
          <SuggestionsTable suggestions={suggestions} onUpdate={fetchData} />
        </div>
      )}

      {activeTab === "discounts" && (
        <div>
          <DiscountManager />
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Add New Product</h3>
                  <button
                    onClick={() => setShowAddProduct(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
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
  );
};
