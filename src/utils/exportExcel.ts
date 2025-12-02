import * as XLSX from "xlsx";

export interface ExcelExportOptions {
  filename: string;
  sheetName?: string;
  autoSize?: boolean;
}

/**
 * Export data to Excel
 */
export const exportToExcel = (data: any[], options: ExcelExportOptions) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns if enabled
    if (options.autoSize !== false) {
      const colWidths = getColumnWidths(data);
      worksheet["!cols"] = colWidths;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      options.sheetName || "Data"
    );

    XLSX.writeFile(workbook, options.filename);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw error;
  }
};

/**
 * Export multiple sheets to Excel
 */
export const exportToExcelMultiSheet = (
  sheets: Array<{
    name: string;
    data: any[];
  }>,
  filename: string
) => {
  try {
    const workbook = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      const colWidths = getColumnWidths(sheet.data);
      worksheet["!cols"] = colWidths;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });

    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error("Error exporting multiple sheets:", error);
    throw error;
  }
};

/**
 * Calculate column widths for auto-sizing
 */
const getColumnWidths = (data: any[]): Array<{ wch: number }> => {
  if (data.length === 0) return [];

  const headers = Object.keys(data[0]);
  const colWidths: Array<{ wch: number }> = [];

  headers.forEach((header) => {
    let maxLength = header.length;

    data.forEach((row) => {
      const cellValue = row[header] ? row[header].toString() : "";
      maxLength = Math.max(maxLength, cellValue.length);
    });

    colWidths.push({ wch: Math.min(maxLength + 2, 50) });
  });

  return colWidths;
};

/**
 * Format product data for export with sizes and prices
 */
export const formatProductsForExport = (products: any[]) => {
  const exportData: any[] = [];

  products.forEach((product) => {
    // Check if product has multiple sizes with prices
    if (product.sizesWithPrices && product.sizesWithPrices.length > 0) {
      // Create a row for each size variant
      product.sizesWithPrices.forEach((sizeVariant: any, index: number) => {
        exportData.push({
          "Product ID": product.id,
          "Product Name": product.name,
          Category: product.category,
          "Base Price": `${product.price}`,
          Size: sizeVariant.size || "N/A",
          "Size Price": `${sizeVariant.price}`,
          Weight: sizeVariant.weight || product.weight || "N/A",
          Dimensions: sizeVariant.dimensions || product.dimensions || "N/A",
          Stock: product.stock,
          Sales: product.sales || 0,
          "Has Custom Size": product.hasCustomSize ? "Yes" : "No",
          Brand: product.brand || "N/A",
          Material: product.material || "N/A",
          Rating: product.reviews || 0,
          Featured: product.isFeatured ? "Yes" : "No",
          Status: product.stock > 0 ? "In Stock" : "Out of Stock",
          "Variant #": index + 1,
        });
      });
    } else {
      // Single product entry if no size variants
      exportData.push({
        "Product ID": product.id,
        "Product Name": product.name,
        Category: product.category,
        "Base Price": `${product.price}`,
        Size: "Default",
        "Size Price": `${product.price}`,
        Weight: product.weight || "N/A",
        Dimensions: product.dimensions || "N/A",
        Stock: product.stock,
        Sales: product.sales || 0,
        "Has Custom Size": product.hasCustomSize ? "Yes" : "No",
        Brand: product.brand || "N/A",
        Material: product.material || "N/A",
        Rating: product.reviews || 0,
        Featured: product.isFeatured ? "Yes" : "No",
        Status: product.stock > 0 ? "In Stock" : "Out of Stock",
        "Variant #": 1,
      });
    }
  });

  return exportData;
};

/**
 * Format order data for export
 */
export const formatOrdersForExport = (orders: any[]) => {
  return orders.map((order) => ({
    "Order ID": order.id,
    "Customer Name": order.userName || order.customerName || "N/A",
    "Customer Email": order.userEmail,
    Phone: order.customerPhone || "N/A",
    Date: new Date(order.createdAt).toLocaleDateString(),
    Status: order.status,
    "Items Count": order.items?.length || 0,
    Subtotal: `${order.subtotal || 0}`,
    "Discount Code": order.discountCode || "N/A",
    Discount: `${order.discountAmount || 0}`,
    Total: `${order.total || 0}`,
    "Shipping Address": `${order.shippingAddress?.street || ""}, ${
      order.shippingAddress?.city || ""
    }`,
    "Payment Method": order.paymentMethod || "N/A",
  }));
};

/**
 * Format revenue data for export
 */
export const formatRevenueForExport = (orders: any[]) => {
  const revenueData = orders
    .filter((order) => order.status === "delivered")
    .map((order) => ({
      "Order ID": order.id,
      Date: new Date(order.createdAt).toLocaleDateString(),
      "Customer Name": order.userName || order.customerName || "N/A",
      "Items Count": order.items?.length || 0,
      Subtotal: order.subtotal || 0,
      "Discount Code": order.discountCode || "N/A",
      Discount: order.discountAmount || 0,
      Revenue: order.total || 0,
    }));

  // Add summary row
  const totalRevenue = revenueData.reduce((sum, row) => sum + row.Revenue, 0);
  const totalDiscount = revenueData.reduce((sum, row) => sum + row.Discount, 0);
  const totalOrders = revenueData.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    details: revenueData,
    summary: {
      Metric: [
        "Total Orders",
        "Total Gross Revenue",
        "Total Discounts",
        "Net Revenue",
        "Average Order Value",
      ],
      Value: [
        totalOrders,
        `${(totalRevenue + totalDiscount).toFixed(2)}`,
        `${totalDiscount.toFixed(2)}`,
        `${totalRevenue.toFixed(2)}`,
        `${avgOrderValue.toFixed(2)}`,
      ],
    },
  };
};

/**
 * Format product details with items sold and size breakdown
 */
export const formatProductSalesForExport = (orders: any[], products: any[]) => {
  const productSales: { [key: string]: any } = {};
  const productSizesSales: { [key: string]: any } = {};

  // Initialize product sales with size variants
  products.forEach((product) => {
    productSales[product.id] = {
      "Product Name": product.name,
      Category: product.category,
      "Base Price": product.price,
      "Units Sold": 0,
      "Total Revenue": 0,
      Status: product.stock > 0 ? "In Stock" : "Out of Stock",
      Brand: product.brand || "N/A",
      "Sizes Available": "",
    };

    // Initialize size variants for this product
    if (product.sizesWithPrices && product.sizesWithPrices.length > 0) {
      product.sizesWithPrices.forEach((sizeVariant: any) => {
        const sizeKey = `${product.id}_${sizeVariant.size}`;
        productSizesSales[sizeKey] = {
          "Product ID": product.id,
          "Product Name": product.name,
          Category: product.category,
          Size: sizeVariant.size,
          "Size Price": sizeVariant.price,
          Weight: sizeVariant.weight || product.weight || "N/A",
          Dimensions: sizeVariant.dimensions || product.dimensions || "N/A",
          "Units Sold": 0,
          "Total Revenue": 0,
          Status: product.stock > 0 ? "In Stock" : "Out of Stock",
        };
      });
    }
  });

  // Calculate sales from orders with size tracking (exclude cancelled orders)
  orders
    .filter((order) => order.status !== "cancelled")
    .forEach((order) => {
      if (order.items) {
        order.items.forEach((item: any) => {
          const productId = item.product?.id;
          if (productSales[productId]) {
            // Track overall product sales
            productSales[productId]["Units Sold"] += item.quantity || 0;
            productSales[productId]["Total Revenue"] +=
              (item.priceAtOrder || 0) * (item.quantity || 0);

            // Track size-specific sales
            if (item.selectedSize) {
              const sizeKey = `${productId}_${item.selectedSize}`;
              if (productSizesSales[sizeKey]) {
                productSizesSales[sizeKey]["Units Sold"] += item.quantity || 0;
                productSizesSales[sizeKey]["Total Revenue"] +=
                  (item.priceAtOrder || 0) * (item.quantity || 0);
              }
            }
          }
        });
      }
    });

  // Format overall product sales
  const overallSales = Object.values(productSales).map((sale: any) => ({
    ...sale,
    "Base Price": `${sale["Base Price"]}`,
    "Total Revenue": `${sale["Total Revenue"].toFixed(2)}`,
    "Avg Unit Price": `${
      sale["Units Sold"] > 0
        ? (sale["Total Revenue"] / sale["Units Sold"]).toFixed(2)
        : 0
    }`,
  }));

  // Format size-specific sales
  const sizeSales = Object.values(productSizesSales)
    .filter((sale: any) => sale["Units Sold"] > 0) // Only include sizes that have been sold
    .map((sale: any) => ({
      ...sale,
      "Size Price": `${sale["Size Price"]}`,
      "Total Revenue": `${sale["Total Revenue"].toFixed(2)}`,
      "Avg Unit Price": `${
        sale["Units Sold"] > 0
          ? (sale["Total Revenue"] / sale["Units Sold"]).toFixed(2)
          : 0
      }`,
    }));

  // If there are size-specific sales, return both summaries
  // Otherwise just return overall sales
  return sizeSales.length > 0
    ? [
        { header: "OVERALL PRODUCT SALES", data: [] },
        ...overallSales,
        { header: "SALES BY PRODUCT SIZE", data: [] },
        ...sizeSales,
      ]
    : overallSales;
};
