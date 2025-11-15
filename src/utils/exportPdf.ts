import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
      pdf.text(options.title, 10, yPosition);
      yPosition += 15;
    }

    // Add image
    pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);

    // Handle multiple pages if needed
    let heightLeft = imgHeight - (pdf.internal.pageSize.getHeight() - yPosition - 10);
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
 * Generate invoice PDF
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
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let yPosition = 10;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  const maxWidth = pageWidth - 2 * margin;

  // Header
  pdf.setFontSize(20);
  pdf.text("INVOICE", margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.text(`Invoice #: ${invoiceData.orderId}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Date: ${invoiceData.date}`, margin, yPosition);
  yPosition += 10;

  // Customer Info
  pdf.setFontSize(11);
  pdf.text("Bill To:", margin, yPosition);
  yPosition += 5;

  pdf.setFontSize(10);
  pdf.text(invoiceData.customerName, margin, yPosition);
  yPosition += 5;
  pdf.text(invoiceData.email, margin, yPosition);
  yPosition += 5;
  pdf.text(invoiceData.phone || "", margin, yPosition);
  yPosition += 5;

  const addressLines = pdf.splitTextToSize(invoiceData.address, maxWidth - margin);
  pdf.text(addressLines, margin, yPosition);
  yPosition += addressLines.length * 5 + 10;

  // Items Table
  pdf.setFontSize(11);
  pdf.text("Items:", margin, yPosition);
  yPosition += 7;

  // Table header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition, maxWidth, 6, "F");
  pdf.setFontSize(9);
  pdf.text("Description", margin + 2, yPosition + 4);
  pdf.text("Qty", margin + 85, yPosition + 4);
  pdf.text("Price", margin + 105, yPosition + 4);
  pdf.text("Total", margin + 135, yPosition + 4);
  yPosition += 7;

  // Table rows
  pdf.setFontSize(9);
  invoiceData.items.forEach((item) => {
    let description = item.name;
    if (item.color) description += ` (${item.color})`;
    if (item.dimensions) description += ` - ${item.dimensions}`;

    const lines = pdf.splitTextToSize(description, 80);
    const lineHeight = lines.length * 4;

    lines.forEach((line: string, index: number) => {
      pdf.text(line, margin + 2, yPosition + index * 4);
    });

    pdf.text(item.quantity.toString(), margin + 85, yPosition);
    pdf.text(`₹${item.price.toFixed(2)}`, margin + 105, yPosition);
    pdf.text(`₹${item.total.toFixed(2)}`, margin + 135, yPosition);

    yPosition += lineHeight + 2;
  });

  yPosition += 5;

  // Totals
  pdf.setFillColor(250, 250, 250);
  pdf.rect(margin + 80, yPosition, maxWidth - 80, 5, "F");
  pdf.setFontSize(10);
  pdf.text("Subtotal:", margin + 100, yPosition + 3);
  pdf.text(`₹${invoiceData.subtotal.toFixed(2)}`, margin + 135, yPosition + 3);
  yPosition += 6;

  if (invoiceData.discount > 0) {
    pdf.text("Discount:", margin + 100, yPosition + 3);
    pdf.text(`-₹${invoiceData.discount.toFixed(2)}`, margin + 135, yPosition + 3);
    yPosition += 6;
  }

  pdf.setFillColor(200, 200, 200);
  pdf.rect(margin + 80, yPosition, maxWidth - 80, 6, "F");
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Total:", margin + 100, yPosition + 4);
  pdf.text(`₹${invoiceData.total.toFixed(2)}`, margin + 135, yPosition + 4);

  return pdf;
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
