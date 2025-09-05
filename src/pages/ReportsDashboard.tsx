import { useState } from "react";
import type {
  SalesReport,
  InventoryReport,
  CustomerReport,
} from "../types/reports";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportsDashboard = () => {
  const [selectedReport, setSelectedReport] = useState<
    "sales" | "inventory" | "customers"
  >("sales");
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date(),
  });

  // Render different report sections based on the selected type
  const renderReport = () => {
    switch (selectedReport) {
      case "sales":
        return <SalesReportSection dateRange={dateRange} />;
      case "inventory":
        return <InventoryReportSection />;
      case "customers":
        return <CustomerReportSection dateRange={dateRange} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>

        {/* Report Type Selection */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setSelectedReport("sales")}
            className={`px-4 py-2 rounded-lg ${
              selectedReport === "sales"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Sales Report
          </button>
          <button
            onClick={() => setSelectedReport("inventory")}
            className={`px-4 py-2 rounded-lg ${
              selectedReport === "inventory"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Inventory Report
          </button>
          <button
            onClick={() => setSelectedReport("customers")}
            className={`px-4 py-2 rounded-lg ${
              selectedReport === "customers"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Customer Report
          </button>
        </div>

        {/* Date Range Selection */}
        <div className="flex space-x-4">
          <input
            type="date"
            value={dateRange.start.toISOString().split("T")[0]}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: new Date(e.target.value) })
            }
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="date"
            value={dateRange.end.toISOString().split("T")[0]}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: new Date(e.target.value) })
            }
            className="border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow p-6">{renderReport()}</div>
    </div>
  );
};

// Sales Report Section
const SalesReportSection = ({
  dateRange,
}: {
  dateRange: { start: Date; end: Date };
}) => {
  // Filter data based on date range
  const filterDataByDateRange = (data: any[], dateField: string) => {
    return data.filter((item) => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
  };

  // Mock data with date range filtering
  const salesData: SalesReport = {
    totalSales: 25000,
    totalOrders: 150,
    averageOrderValue: 166.67,
    topProducts: [
      { productId: "1", name: "Product 1", quantity: 50, revenue: 5000 },
      { productId: "2", name: "Product 2", quantity: 30, revenue: 3000 },
    ],
    salesByDate: filterDataByDateRange(
      Array.from({ length: 90 }, (_, i) => ({
        date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        orders: Math.floor(Math.random() * 10) + 1,
        revenue: Math.floor(Math.random() * 1000) + 500,
      })),
      "date"
    ),
    discountUsage: [
      { code: "SUMMER21", timesUsed: 30, totalDiscount: 1500 },
      { code: "FIRST10", timesUsed: 25, totalDiscount: 750 },
    ],
  };

  const chartData = {
    labels: salesData.salesByDate.map((d) => d.date),
    datasets: [
      {
        label: "Daily Revenue",
        data: salesData.salesByDate.map((d) => d.revenue),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Total Sales</h3>
          <p className="text-3xl font-bold text-blue-900">
            ${salesData.totalSales.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Total Orders</h3>
          <p className="text-3xl font-bold text-green-900">
            {salesData.totalOrders}
          </p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800">
            Average Order Value
          </h3>
          <p className="text-3xl font-bold text-purple-900">
            ${salesData.averageOrderValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
        <div className="h-[300px]">
          <Line data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Top Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.topProducts.map((product) => (
                <tr key={product.productId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${product.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discount Usage */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Discount Usage</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Times Used
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Discount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.discountUsage.map((discount) => (
                <tr key={discount.code}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {discount.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {discount.timesUsed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${discount.totalDiscount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Inventory Report Section
const InventoryReportSection = () => {
  // Calculate stock trend based on movement
  const calculateStockTrend = (
    stockMovement: InventoryReport["stockMovement"]
  ): "up" | "down" | "stable" => {
    const totalIncoming = stockMovement.reduce(
      (sum, item) => sum + item.incoming,
      0
    );
    const totalOutgoing = stockMovement.reduce(
      (sum, item) => sum + item.outgoing,
      0
    );
    if (totalIncoming > totalOutgoing) return "up";
    if (totalIncoming < totalOutgoing) return "down";
    return "stable";
  };

  // Mock data with calculated metrics
  const inventoryData: InventoryReport = {
    totalProducts: 250,
    lowStock: [
      { productId: "1", name: "Product 1", currentStock: 5, reorderPoint: 10 },
      { productId: "2", name: "Product 2", currentStock: 3, reorderPoint: 8 },
    ],
    stockMovement: [
      {
        productId: "1",
        name: "Product 1",
        incoming: 50,
        outgoing: 45,
        remaining: 5,
        turnoverRate: 0.9, // 90% turnover
      },
      {
        productId: "2",
        name: "Product 2",
        incoming: 30,
        outgoing: 27,
        remaining: 3,
        turnoverRate: 0.85, // 85% turnover
      },
    ],
    stockTrend: "stable", // This will be calculated in real implementation
  };

  const chartData = {
    labels: inventoryData.stockMovement.map((item) => item.name),
    datasets: [
      {
        label: "Stock Levels",
        data: inventoryData.stockMovement.map((item) => item.remaining),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">
            Total Products
          </h3>
          <p className="text-3xl font-bold text-blue-900">
            {inventoryData.totalProducts}
          </p>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-800">
            Low Stock Items
          </h3>
          <p className="text-3xl font-bold text-orange-900">
            {inventoryData.lowStock.length}
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Stock Trend</h3>
          <div className="flex items-center">
            <p className="text-3xl font-bold text-green-900">
              {calculateStockTrend(inventoryData.stockMovement) === "up" && "↑"}
              {calculateStockTrend(inventoryData.stockMovement) === "down" &&
                "↓"}
              {calculateStockTrend(inventoryData.stockMovement) === "stable" &&
                "→"}
            </p>
            <p className="ml-2 text-green-800">
              {calculateStockTrend(inventoryData.stockMovement).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Inventory Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4">Stock Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inventoryData.stockMovement.map((item) => (
            <div key={item.productId} className="border p-4 rounded-lg">
              <h4 className="font-semibold">{item.name}</h4>
              <div className="mt-2 space-y-2">
                <p>Turnover Rate: {(item.turnoverRate * 100).toFixed(1)}%</p>
                <div className="flex justify-between text-sm">
                  <span>In: {item.incoming}</span>
                  <span>Out: {item.outgoing}</span>
                  <span>Remaining: {item.remaining}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Levels Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Current Stock Levels</h3>
        <div className="h-[300px]">
          <Bar data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Low Stock Alerts</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reorder Point
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryData.lowStock.map((item) => (
                <tr key={item.productId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {item.currentStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {item.reorderPoint}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Customer Report Section
const CustomerReportSection = ({
  dateRange,
}: {
  dateRange: { start: Date; end: Date };
}) => {
  // Filter data based on date range and calculate metrics
  const dateRangeInDays = Math.ceil(
    (dateRange.end.getTime() - dateRange.start.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const customerData: CustomerReport = {
    totalCustomers: 500,
    newCustomers: Math.floor(50 * (dateRangeInDays / 30)), // Adjust for selected period
    topCustomers: [
      { userId: "1", name: "John Doe", totalOrders: 10, totalSpent: 2500 },
      { userId: "2", name: "Jane Smith", totalOrders: 8, totalSpent: 2000 },
    ],
    customerRetention: Array.from(
      { length: Math.min(6, Math.ceil(dateRangeInDays / 30)) },
      (_, i) => {
        const monthDate = new Date(
          dateRange.end.getTime() - i * 30 * 24 * 60 * 60 * 1000
        );
        return {
          month: monthDate.toLocaleString("default", { month: "short" }),
          retained: Math.floor(Math.random() * 50) + 50,
          lost: Math.floor(Math.random() * 10),
          new: Math.floor(Math.random() * 20) + 10,
        };
      }
    ).reverse(),
  };

  const retentionChartData = {
    labels: customerData.customerRetention.map((d) => d.month),
    datasets: [
      {
        label: "Retained Customers",
        data: customerData.customerRetention.map((d) => d.retained),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "New Customers",
        data: customerData.customerRetention.map((d) => d.new),
        borderColor: "rgb(54, 162, 235)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">
            Total Customers
          </h3>
          <p className="text-3xl font-bold text-blue-900">
            {customerData.totalCustomers}
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">
            New Customers
          </h3>
          <p className="text-3xl font-bold text-green-900">
            {customerData.newCustomers}
          </p>
        </div>
      </div>

      {/* Customer Retention Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Customer Retention</h3>
        <div className="h-[300px]">
          <Line
            data={retentionChartData}
            options={{ maintainAspectRatio: false }}
          />
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customerData.topCustomers.map((customer) => (
                <tr key={customer.userId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {customer.totalOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${customer.totalSpent.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
