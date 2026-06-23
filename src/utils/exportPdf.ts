import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => any;
  }
}

export interface PDFGeneratorOptions {
  filename: string;
  title?: string;
  orientation?: "portrait" | "landscape";
  format?: "a4" | "letter";
}

/**
 * Generate PDF from HTML element
 */
export const generatePdfFromHtml = async (
  elementId: string,
  options: PDFGeneratorOptions
) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: options.orientation || "portrait",
      unit: "mm",
      format: options.format || "a4",
    });

    const imgWidth = pdf.internal.pageSize.getWidth() - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yPosition = 10;

    // Add title if provided
    if (options.title) {
      pdf.setFontSize(16);
      const titleText = String(options.title);
      pdf.text(titleText, 10, yPosition);
      yPosition += 15;
    }

    // Add image
    pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);

    // Handle multiple pages if needed
    let heightLeft =
      imgHeight - (pdf.internal.pageSize.getHeight() - yPosition - 10);
    let position = 0;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight() - 20;
    }

    return pdf;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

/**
 * Generate invoice PDF matching tax invoice format
 */
export const generateInvoicePdf = (
  invoiceData: {
    orderId: string;
    invoiceNumber?: string;
    date: string;
    customerName: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod?: string;
    billingAddress?: {
      name: string;
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    shippingAddress?: {
      name: string;
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    razorpayPaymentId?: string;
    paymentMethodDetails?: {
      network?: string;
      last4?: string;
      issuer?: string;
      vpa?: string;
      bank?: string;
      wallet?: string;
      method?: string;
    };
    paidAt?: Date;
    status?: string;
    items: Array<{
      name: string;
      hsn?: string;
      quantity: number;
      price: number;
      total: number;
      discount?: number;
      taxRate?: number;
      dimensions?: string;
      color?: string;
      size?: string;
      weight?: string;
      customDimensions?: string;
    }>;
    discount: number;
    taxAmount?: number;
    taxRate?: number;
    total: number;
    company?: string;
    companyAddress?: string;
    companyGST?: string;
    logoUrl?: string;
    placeOfSupply?: string;
    paymentTerms?: string;
  },
  _filename: string = "invoice.pdf"
) => {
  try {
    // Validate input data
    if (!invoiceData || !invoiceData.items) {
      throw new Error("Invalid invoice data provided");
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Ensure all required fields are strings
    invoiceData.customerName = String(invoiceData.customerName || "Customer");
    invoiceData.email = String(invoiceData.email || "");
    invoiceData.phone = String(invoiceData.phone || "N/A");
    invoiceData.address = String(invoiceData.address || "");
    invoiceData.date = String(
      invoiceData.date || new Date().toLocaleDateString()
    );
    invoiceData.orderId = String(invoiceData.orderId || "");

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    // Helper function to format payment method
    const formatPaymentMethod = (method: string | undefined) => {
      if (!method) return "N/A";
      return method
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    // ============ HEADER - Tax Invoice Title ============
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Tax Invoice", pageWidth - margin, 15, { align: "right" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Original For Recipient", pageWidth - margin, 20, {
      align: "right",
    });

    // ============ COMPANY NAME IN CENTER ============
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(
      invoiceData.company ||
        import.meta.env.VITE_APP_NAME ||
        "Your Business Name",
      pageWidth / 2,
      15,
      {
        align: "center",
      }
    );

    if (invoiceData.companyAddress || import.meta.env.VITE_APP_ADDREDSS) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        invoiceData.companyAddress
          ? invoiceData.companyAddress
          : import.meta.env.VITE_APP_ADDREDSS,
        pageWidth / 2,
        20,
        {
          align: "center",
        }
      );
    }

    // ============ CUSTOMER DETAILS SECTION ============
    let yPos = 28;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("CUSTOMER DETAILS", margin, yPos);

    // Draw a separator line
    doc.setLineWidth(0.3);
    doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);

    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    // Customer Name
    doc.setFont("helvetica", "bold");
    doc.text("Name:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(invoiceData.customerName, margin + 35, yPos);

    yPos += 5;

    // Email
    doc.setFont("helvetica", "bold");
    doc.text("Email:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(invoiceData.email, margin + 35, yPos);

    yPos += 5;

    // Phone
    doc.setFont("helvetica", "bold");
    doc.text("Phone:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(invoiceData.phone, margin + 35, yPos);

    yPos += 5;

    if (invoiceData.paymentMethod === 'cod') {
      doc.setFont("helvetica", "bold");
      doc.text("Payment Method:", margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text("Cash on Delivery", margin + 35, yPos);
    } else {
      // Online Payment
      doc.setFont("helvetica", "bold");
      doc.text("Payment Status:", margin, yPos);
      doc.setFont("helvetica", "normal");
      
      let statusText = "Paid";
      if (invoiceData.paidAt) {
        const paidDate = new Date(invoiceData.paidAt);
        statusText += ` (on ${paidDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })})`;
      } else if (invoiceData.status === "paid" || invoiceData.status === "processing" || invoiceData.status === "shipped" || invoiceData.status === "delivered") {
        statusText = "Paid";
      }
      doc.text(statusText, margin + 35, yPos);
      
      yPos += 5;
      doc.setFont("helvetica", "bold");
      doc.text("Payment Method:", margin, yPos);
      doc.setFont("helvetica", "normal");
      
      const method = invoiceData.paymentMethodDetails?.method || invoiceData.paymentMethod;
      let methodText = formatPaymentMethod(method);
      
      if (invoiceData.paymentMethodDetails) {
        const d = invoiceData.paymentMethodDetails;
        if (d.network && d.last4) {
          methodText += ` (${d.network} ending in ${d.last4})`;
        } else if (d.vpa) {
          methodText += ` (VPA: ${d.vpa})`;
        } else if (d.bank) {
          methodText += ` (${d.bank})`;
        } else if (d.wallet) {
          methodText += ` (${d.wallet})`;
        }
      }
      
      doc.text(methodText, margin + 35, yPos);
      
      if (invoiceData.razorpayPaymentId) {
        yPos += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Payment ID:", margin, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(invoiceData.razorpayPaymentId, margin + 35, yPos);
      }
    }

    // ============ BILL TO & SHIP TO SECTION ============
    yPos += 8;

    // Store starting Y position for both columns
    const addressStartY = yPos;

    // Bill To (Left Column)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("BILL TO:", margin, yPos);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    yPos += 5;

    let billToEndY = yPos;

    if (invoiceData.billingAddress) {
      doc.text(
        invoiceData.billingAddress.name || invoiceData.customerName,
        margin,
        yPos
      );
      yPos += 4;
      doc.text(invoiceData.billingAddress.street, margin, yPos);
      yPos += 4;
      doc.text(
        `${invoiceData.billingAddress.city}, ${invoiceData.billingAddress.state}, ${invoiceData.billingAddress.postalCode}`,
        margin,
        yPos
      );
      yPos += 4;
      doc.text(invoiceData.billingAddress.country, margin, yPos);
      billToEndY = yPos + 4;
    } else {
      doc.text(invoiceData.customerName, margin, yPos);
      yPos += 4;
      const addressLines = doc.splitTextToSize(invoiceData.address, 80);
      doc.text(addressLines, margin, yPos);
      billToEndY = yPos + addressLines.length * 4;
    }

    if (invoiceData.placeOfSupply) {
      doc.setFont("helvetica", "italic");
      doc.text(
        `Place of Supply: ${invoiceData.placeOfSupply}`,
        margin,
        billToEndY
      );
      doc.setFont("helvetica", "normal");
      billToEndY += 4;
    }

    // Ship To (Right Column - starts at same Y as Bill To)
    const shipToX = pageWidth / 2 + 10;
    let shipToY = addressStartY;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("SHIP TO:", shipToX, shipToY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    shipToY += 5;

    let shipToEndY = shipToY;

    if (invoiceData.shippingAddress) {
      doc.text(
        invoiceData.shippingAddress.name || invoiceData.customerName,
        shipToX,
        shipToY
      );
      shipToY += 4;
      doc.text(invoiceData.shippingAddress.street, shipToX, shipToY);
      shipToY += 4;
      doc.text(
        `${invoiceData.shippingAddress.city}, ${invoiceData.shippingAddress.state}, ${invoiceData.shippingAddress.postalCode}`,
        shipToX,
        shipToY
      );
      shipToY += 4;
      doc.text(invoiceData.shippingAddress.country, shipToX, shipToY);
      shipToEndY = shipToY + 4;
    } else {
      doc.text(invoiceData.customerName, shipToX, shipToY);
      shipToY += 4;
      const addressLines = doc.splitTextToSize(invoiceData.address, 80);
      doc.text(addressLines, shipToX, shipToY);
      shipToEndY = shipToY + addressLines.length * 4;
    }

    // ============ ORDER & INVOICE DETAILS ============
    yPos = Math.max(billToEndY, shipToEndY) + 8;

    // Draw separator line
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 5;

    // Left side - Order Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Order Number:", margin, yPos);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(invoiceData.orderId, margin + 30, yPos);

    yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Order Date:", margin, yPos);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const formattedDate = new Date(invoiceData.date)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
    doc.text(
      formattedDate +
        " " +
        new Date(invoiceData.date).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      margin + 30,
      yPos
    );

    // Right side - Invoice Details
    const rightX = pageWidth - margin;
    let rightY = yPos - 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Invoice Number:", rightX - 60, rightY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      invoiceData.invoiceNumber || `INV-${invoiceData.orderId.slice(-8)}`,
      rightX,
      rightY,
      { align: "right" }
    );

    rightY += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Invoice Date:", rightX - 60, rightY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      formattedDate +
        " " +
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      rightX,
      rightY,
      { align: "right" }
    );

    // ============ ITEMS TABLE ============
    const tableStartY = yPos + 8;

    // Calculate discount per item if order-level discount exists
    const totalOrderDiscount = invoiceData.discount || 0;
    const totalItemsPrice = invoiceData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Simple table without tax calculations
    const tableRows = invoiceData.items.map((item, index) => {
      const grossAmount = item.price * item.quantity;
      // Distribute order discount proportionally to each item
      const itemDiscount =
        totalItemsPrice > 0
          ? (grossAmount / totalItemsPrice) * totalOrderDiscount
          : 0;
      const netAmount = grossAmount - itemDiscount;

      // Build description with size, dimensions, color, and custom dimensions
      let description = item.name;

      if (item.size) {
        description += ` - Size: ${item.size}`;
      }

      if (item.customDimensions) {
        description += ` - Custom Dims: ${item.customDimensions}`;
      } else if (item.dimensions) {
        description += ` - Dims: ${item.dimensions}`;
      }

      if (item.weight) {
        description += ` (${item.weight})`;
      }

      if (item.color) {
        description += ` - Color: ${item.color}`;
      }

      return [
        index + 1,
        description,
        item.hsn || "N/A",
        item.quantity,
        `Rs.${grossAmount.toFixed(2)}`,
        `Rs.${itemDiscount.toFixed(2)}`,
        `Rs.${netAmount.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      head: [
        [
          "SN.",
          "Description",
          "HSN",
          "Qty.",
          "Gross Amount",
          "Discount",
          "Total",
        ],
      ],
      body: tableRows,
      startY: tableStartY,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { cellWidth: 115 },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 35, halign: "right" },
        5: { cellWidth: 30, halign: "right" },
        6: { cellWidth: 35, halign: "right" },
      },
      margin: { left: margin, right: margin },
      theme: "grid",
      tableWidth: "auto",
    });

    // ============ TOTALS ROW ============
    const tableEndY = (doc as any).lastAutoTable.finalY || tableStartY;

    // Create totals table with total
    const totalsData = [];

    totalsData.push([
      "",
      "Total Amount",
      "",
      "",
      "",
      "",
      `Rs.${invoiceData.total.toFixed(2)}`,
    ]);

    autoTable(doc, {
      body: totalsData,
      startY: tableEndY,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        fontStyle: "bold",
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { cellWidth: 115 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 35 },
        5: { cellWidth: 30 },
        6: { cellWidth: 35, halign: "right" },
      },
      margin: { left: margin, right: margin },
      theme: "grid",
      tableWidth: "auto",
    });

    // ============ TERMS & CONDITIONS ============
    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Draw separator line
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("TERMS & CONDITIONS", margin, yPos);

    yPos += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    if (invoiceData.company) {
      doc.text(`Sold by: ${invoiceData.company}`, margin, yPos);
      yPos += 4;
    }

    if (invoiceData.companyAddress) {
      const addressLines = doc.splitTextToSize(
        invoiceData.companyAddress,
        pageWidth - 2 * margin
      );
      doc.text(addressLines, margin, yPos);
      yPos += addressLines.length * 4;
    }

    if (invoiceData.companyGST) {
      doc.text(`GST: ${invoiceData.companyGST}`, margin, yPos);
      yPos += 4;
    }

    yPos += 2;
    doc.text(
      invoiceData.paymentTerms || "Tax is not payable on reverse charge basis",
      margin,
      yPos
    );
    yPos += 4;
    doc.text(
      "This is a computer generated invoice and does not require signature",
      margin,
      yPos
    );
    yPos += 4;
    doc.text(
      "Includes discounts for your city, limited returns and/or for online payments (as applicable)",
      margin,
      yPos
    );

    // ============ FOOTER ============
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generated on ${new Date().toLocaleString("en-GB")}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" }
    );

    return doc;
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    throw new Error(
      `Failed to generate invoice: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Generate report PDF
 */
export const generateReportPdf = (
  reportTitle: string,
  reportData: Array<{
    label: string;
    value: string | number;
  }>,
  dateRange?: { start: Date; end: Date }
) => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.setFont("helvetica", "bold");
    doc.text(reportTitle, margin, yPosition);

    yPosition += 12;

    // Date range if provided
    if (dateRange) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      const dateText = `Report Period: ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`;
      doc.text(dateText, margin, yPosition);
      yPosition += 8;
    }

    // Generated date
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);

    yPosition += 12;

    // Data section
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    reportData.forEach((item) => {
      const labelStr = String(item.label);
      const valueStr = String(item.value);

      doc.text(labelStr, margin, yPosition);
      doc.text(valueStr, pageWidth - margin - 30, yPosition);
      yPosition += 6;
    });

    // Footer
    yPosition += 8;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 6;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text("Puja E-Commerce Business Report", margin, yPosition);

    return doc;
  } catch (error) {
    console.error("Error generating report PDF:", error);
    throw new Error(
      `Failed to generate report PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Generate detailed report PDF with data table
 */
export const generateDetailedReportPdf = (
  reportTitle: string,
  data: Array<any>,
  options?: { filename?: string; dateRange?: { start: Date; end: Date } }
) => {
  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.setFont("helvetica", "bold");
    doc.text(reportTitle, margin, yPosition);

    yPosition += 12;

    // Date range if provided
    if (options?.dateRange) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      const dateText = `Report Period: ${options.dateRange.start.toLocaleDateString()} to ${options.dateRange.end.toLocaleDateString()}`;
      doc.text(dateText, margin, yPosition);
      yPosition += 8;
    }

    // Generated date
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);

    yPosition += 12;

    // Generate table from data
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      const rows = data.map((item: any) =>
        columns.map((col) => {
          const value = item[col];
          if (typeof value === "string" && value.length > 50) {
            return value.substring(0, 47) + "...";
          }
          return value;
        })
      );

      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: yPosition,
        margin: margin,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        columnStyles: {},
      });
    }

    // Footer
    yPosition = pageHeight - 15;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 6;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text("Puja E-Commerce Business Report", margin, yPosition);

    // Auto-download if filename provided
    if (options?.filename) {
      doc.save(options.filename);
    }

    return doc;
  } catch (error) {
    console.error("Error generating detailed report PDF:", error);
    throw new Error(
      `Failed to generate report PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Download PDF file
 */
export const downloadPdf = (pdf: jsPDF, filename: string) => {
  pdf.save(filename);
};

/**
 * Preview PDF in new window
 */
export const previewPdf = (pdf: jsPDF) => {
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};

/**
 * Download or preview PDF
 */
export const handlePdfAction = (
  pdf: jsPDF,
  filename: string,
  action: "download" | "preview" = "download"
) => {
  if (action === "download") {
    downloadPdf(pdf, filename);
  } else {
    previewPdf(pdf);
  }
};
