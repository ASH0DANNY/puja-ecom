import { useState, useEffect } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Order } from "../types/order";
import type { DashboardProduct } from "../types/dashboard";
import { ProductTable } from "../components/ProductTable";
import { OrderTable } from "../components/OrderTable";
import AddProductForm from "../components/AddProductForm";

type TabType = "overview" | "products" | "orders" | "suggestions";

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
    <div className="container mx-auto px-4 py-8">
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
          {["overview", "products", "orders", "suggestions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab
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
          <ProductTable
            products={products.filter((p) => p.isSuggested)}
            onUpdate={fetchData}
          />
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add New Product</h3>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <AddProductForm
                onSuccess={() => {
                  setShowAddProduct(false);
                  fetchData();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
