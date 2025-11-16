import { useState } from "react";
import { Download, FileText } from "lucide-react";
import type { Order } from "../types/order";
import type { Product } from "../types/product";
import {
  exportToExcel,
  exportToExcelMultiSheet,
  formatProductsForExport,
  formatOrdersForExport,
  formatRevenueForExport,
  formatProductSalesForExport,
} from "../utils/exportExcel";
import { generateDetailedReportPdf } from "../utils/exportPdf";

interface AdminExportProps {
  products?: Product[];
  orders?: Order[];
}

export const AdminExportPanel = ({
  products = [],
  orders = [],
}: AdminExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (
    type: "products" | "orders" | "revenue" | "sales" | "all",
    format: "xlsx" | "pdf"
  ) => {
    setIsExporting(true);
    setError(null);

    try {
      if (format === "xlsx") {
        switch (type) {
          case "products": {
            const productsData = formatProductsForExport(products);
            exportToExcel(productsData, {
              filename: `products-export-${
                new Date().toISOString().split("T")[0]
              }.xlsx`,
              sheetName: "Products",
            });
            break;
          }

          case "orders": {
            const ordersData = formatOrdersForExport(orders);
            exportToExcel(ordersData, {
              filename: `orders-export-${
                new Date().toISOString().split("T")[0]
              }.xlsx`,
              sheetName: "Orders",
            });
            break;
          }

          case "revenue": {
            const revenueData = formatRevenueForExport(orders);
            exportToExcelMultiSheet(
              [
                {
                  name: "Revenue Details",
                  data: revenueData.details,
                },
                {
                  name: "Summary",
                  data: revenueData.summary.Metric.map((metric, idx) => ({
                    Metric: metric,
                    Value: revenueData.summary.Value[idx],
                  })),
                },
              ],
              `revenue-report-${new Date().toISOString().split("T")[0]}.xlsx`
            );
            break;
          }

          case "sales": {
            const salesData = formatProductSalesForExport(orders, products);
            exportToExcel(salesData, {
              filename: `product-sales-${
                new Date().toISOString().split("T")[0]
              }.xlsx`,
              sheetName: "Product Sales",
            });
            break;
          }

          case "all": {
            exportToExcelMultiSheet(
              [
                {
                  name: "Products",
                  data: formatProductsForExport(products),
                },
                {
                  name: "Orders",
                  data: formatOrdersForExport(orders),
                },
                {
                  name: "Revenue",
                  data: formatRevenueForExport(orders).details,
                },
                {
                  name: "Product Sales",
                  data: formatProductSalesForExport(orders, products),
                },
              ],
              `business-report-${new Date().toISOString().split("T")[0]}.xlsx`
            );
            break;
          }
        }
      } else if (format === "pdf") {
        switch (type) {
          case "products": {
            const productsExportData = formatProductsForExport(products);
            generateDetailedReportPdf("Products Export", productsExportData, {
              filename: `products-export-${
                new Date().toISOString().split("T")[0]
              }.pdf`,
            });
            break;
          }

          case "orders": {
            const ordersExportData = formatOrdersForExport(orders);
            generateDetailedReportPdf("Orders Export", ordersExportData, {
              filename: `orders-export-${
                new Date().toISOString().split("T")[0]
              }.pdf`,
            });
            break;
          }

          case "revenue": {
            const revenueExportData = formatRevenueForExport(orders);
            generateDetailedReportPdf(
              "Revenue Report",
              revenueExportData.details,
              {
                filename: `revenue-report-${
                  new Date().toISOString().split("T")[0]
                }.pdf`,
              }
            );
            break;
          }

          case "sales": {
            const salesExportData = formatProductSalesForExport(
              orders,
              products
            );
            generateDetailedReportPdf("Product Sales Report", salesExportData, {
              filename: `product-sales-${
                new Date().toISOString().split("T")[0]
              }.pdf`,
            });
            break;
          }

          case "all": {
            const allReportData = [
              { label: "Total Products", value: products.length },
              { label: "Total Orders", value: orders.length },
              {
                label: "Total Revenue",
                value: `${orders
                  .reduce((sum, o) => sum + (o.total || 0), 0)
                  .toFixed(2)}`,
              },
              {
                label: "Delivered Orders",
                value: orders.filter((o) => o.status === "delivered").length,
              },
              { label: "Generated", value: new Date().toLocaleDateString() },
            ];
            generateDetailedReportPdf(
              "Complete Business Report",
              allReportData,
              {
                filename: `business-report-${
                  new Date().toISOString().split("T")[0]
                }.pdf`,
              }
            );
            break;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md border-2 border-indigo-200 p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          📊 Export Business Data
        </h3>
        <p className="text-gray-600">
          Download your business reports in Excel or PDF format
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Products Export */}
        <ExportCard
          title="Products"
          description="Export all products list"
          icon={<FileText className="w-5 h-5" />}
          onExport={(format) => handleExport("products", format)}
          disabled={isExporting || products.length === 0}
        />

        {/* Orders Export */}
        <ExportCard
          title="Orders"
          description="Export all orders"
          icon={<FileText className="w-5 h-5" />}
          onExport={(format) => handleExport("orders", format)}
          disabled={isExporting || orders.length === 0}
        />

        {/* Revenue Export */}
        <ExportCard
          title="Revenue Report"
          description="Export revenue analysis"
          icon={<Download className="w-5 h-5" />}
          onExport={(format) => handleExport("revenue", format)}
          disabled={isExporting || orders.length === 0}
        />

        {/* Product Sales Export */}
        <ExportCard
          title="Product Sales"
          description="Export sales by product"
          icon={<FileText className="w-5 h-5" />}
          onExport={(format) => handleExport("sales", format)}
          disabled={isExporting || orders.length === 0}
        />

        {/* Complete Report */}
        <ExportCard
          title="Complete Report"
          description="Export all business data"
          icon={<FileText className="w-5 h-5" />}
          onExport={(format) => handleExport("all", format)}
          disabled={isExporting}
        />
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

interface ExportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onExport: (format: "xlsx" | "pdf") => void;
  disabled?: boolean;
}

const ExportCard = ({
  title,
  description,
  icon,
  onExport,
  disabled,
}: ExportCardProps) => {
  return (
    <div className="border-2 border-gray-200 rounded-lg p-5 hover:border-primary hover:shadow-lg transition-all bg-gradient-to-br from-gray-50 to-white">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-primary text-2xl">{icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-base">{title}</h4>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onExport("xlsx")}
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
          title="Export as Excel"
        >
          <FileText className="w-5 h-5" />
          Excel
        </button>
        <button
          onClick={() => onExport("pdf")}
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
          title="Export as PDF"
        >
          <FileText className="w-5 h-5" />
          PDF
        </button>
      </div>
    </div>
  );
};

/**
 * Inline export button for dashboard
 */
export const QuickExportButton = ({
  label,
  onClick,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download className="w-4 h-4" />
      {label}
    </button>
  );
};
