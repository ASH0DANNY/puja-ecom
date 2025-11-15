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
 * Generate invoice PDF with enhanced layout (updated based on reference)
 */
export const generateInvoicePdf = (
  invoiceData: {
    orderId: string;
    date: string;
    customerName: string;
    email: string;
    phone: string;
    address: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
      dimensions?: string;
      color?: string;
    }>;
    subtotal: number;
    discount: number;
    total: number;
    company?: string;
    logoUrl?: string;
  },
  _filename: string = "invoice.pdf"
) => {
  try {
    // Validate input data
    if (!invoiceData || !invoiceData.items) {
      throw new Error("Invalid invoice data provided");
    }

    const doc = new jsPDF({
      orientation: "portrait",
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
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // ============ HEADER SECTION ============
    doc.setFillColor(52, 73, 94);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("INVOICE", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(invoiceData.company || "Your Business Name", pageWidth / 2, 30, {
      align: "center",
    });

    // ============ INVOICE DETAILS ============
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    doc.text(`Invoice #: ${invoiceData.orderId}`, pageWidth - 15, 50, {
      align: "right",
    });

    const formattedDate = new Date(invoiceData.date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    doc.text(`Date: ${formattedDate}`, pageWidth - 15, 56, { align: "right" });

    // ============ CUSTOMER SECTION ============
    const customerSectionY = 70;

    doc.setFillColor(240, 240, 240);
    doc.rect(15, customerSectionY, pageWidth - 30, 25, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Customer Information:", 20, customerSectionY + 7);

    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${invoiceData.customerName}`, 20, customerSectionY + 14);
    doc.text(`Phone: ${invoiceData.phone}`, 20, customerSectionY + 21);

    // ============ ITEMS TABLE ============
    const tableColumn = ["#", "Product", "Price", "Qty", "Total"];
    const tableRows = invoiceData.items.map((item, index) => [
      index + 1,
      item.name,
      ` ${item.price.toFixed(2)}`,
      item.quantity,
      ` ${item.total.toFixed(2)}`,
    ]);

    const tableStartY = customerSectionY + 35;

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: tableStartY,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
        0: { cellWidth: 10 },
        2: { halign: "right" },
        3: { halign: "center" },
        4: { halign: "right" },
      },
      margin: { left: 15, right: 15 },
    });

    // ============ TOTALS SECTION ============
    const tableEndY = (doc as any).lastAutoTable.finalY || tableStartY;
    let currentY = tableEndY + 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    const summaryX = pageWidth - 70;

    // Subtotal
    doc.text(`Subtotal:`, summaryX, currentY);
    doc.text(` ${invoiceData.subtotal.toFixed(2)}`, pageWidth - 15, currentY, {
      align: "right",
    });
    currentY += 6;

    // Discount
    if (invoiceData.discount > 0) {
      doc.setTextColor(255, 0, 0);
      doc.text("Discount:", summaryX, currentY);
      doc.text(
        `- ${invoiceData.discount.toFixed(2)}`,
        pageWidth - 15,
        currentY,
        {
          align: "right",
        }
      );
      currentY += 6;
      doc.setTextColor(0, 0, 0);
    }

    // Total
    doc.setFont("helvetica", "bold");
    doc.text("Total:", summaryX, currentY);
    doc.text(` ${invoiceData.total.toFixed(2)}`, pageWidth - 15, currentY, {
      align: "right",
    });
    doc.setFont("helvetica", "normal");
    currentY += 10;

    // ============ FOOTER ============
    doc.setDrawColor(52, 73, 94);
    doc.setLineWidth(1);
    doc.line(15, pageHeight - 35, pageWidth - 15, pageHeight - 35);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 25, {
      align: "center",
    });
    doc.text("Terms & Conditions Apply", pageWidth / 2, pageHeight - 18, {
      align: "center",
    });

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
