import emailjs from "@emailjs/browser";
import type { Order } from "../types/order";

/**
 * Email service for sending order-related emails
 * Uses EmailJS for sending emails
 */

// Initialize EmailJS with public key
const initializeEmailJS = () => {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (publicKey) {
    emailjs.init(publicKey);
  }
};

// Call initialization on module load
initializeEmailJS();

interface EmailConfig {
  recipientEmail: string;
  subject: string;
  emailType:
    | "order-placed"
    | "order-confirmed"
    | "order-delivered"
    | "order-cancelled"
    | "admin-notification";
  order: Order;
  adminEmail?: string;
}

const normalizeEmailDate = (
  value?: string | number | Date | { toDate: () => Date }
) => {
  if (!value) return undefined;
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  return new Date(value as string | number | Date);
};

const formatEmailDateTime = (
  value?: string | number | Date | { toDate: () => Date }
) => {
  const date = normalizeEmailDate(value);
  if (!date || Number.isNaN(date.getTime())) {
    return "N/A";
  }
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Generate HTML email template for order placed
 */
export const generateOrderPlacedEmail = (order: Order): string => {
  const itemsList = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
        item.product?.name || "Product"
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${
        item.quantity
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.priceAtOrder.toFixed(
        2
      )}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { margin-top: 20px; }
        .order-number { font-size: 24px; font-weight: bold; color: #6366f1; }
        .section { margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px; }
        .section-title { font-size: 16px; font-weight: bold; color: #111; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #e5e7eb; padding: 10px; text-align: left; font-weight: bold; }
        td { padding: 10px; }
        .total-row { font-weight: bold; font-size: 18px; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>

        <div class="content">
          <p>Hi ${order.customerName},</p>
          <p>Thank you for your order! We're excited to prepare your items for shipment.</p>

          <div class="section">
            <div class="section-title">Order Details</div>
            <p><strong>Order Number:</strong> <span class="order-number">${order.id
              .slice(-8)
              .toUpperCase()}</span></p>
            <p><strong>Order Date:</strong> ${formatEmailDateTime(order.createdAt)}</p>
            <p><strong>Status:</strong> <span style="color: #f97316;">Pending</span></p>
          </div>

          <div class="section">
            <div class="section-title">Items Ordered</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Order Summary</div>
            <table style="border: none;">
              <tr>
                <td>Subtotal:</td>
                <td style="text-align: right;">${order.subtotal.toFixed(
                  2
                )}</td>
              </tr>
              ${
                order.discountAmount
                  ? `<tr style="color: #10b981;">
                      <td>Discount (${order.discountCode}):</td>
                      <td style="text-align: right;">-${order.discountAmount.toFixed(
                        2
                      )}</td>
                    </tr>`
                  : ""
              }
              <tr class="total-row">
                <td>Total:</td>
                <td style="text-align: right;">${order.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Shipping Address</div>
            <p>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
    order.shippingAddress.postalCode
  }<br>
              ${order.shippingAddress.country}
            </p>
          </div>

          <div class="section">
            <div class="section-title">Payment Method</div>
            <p>${order.paymentMethod}</p>
            ${order.razorpayPaymentId ? `
              <p><strong>Payment ID:</strong> ${order.razorpayPaymentId}</p>
              <p><strong>Razorpay Timestamp:</strong> ${formatEmailDateTime(order.razorpayPaymentCreatedAt)}</p>
              <p><strong>System Confirmation:</strong> ${formatEmailDateTime(order.paidAt)}</p>
            ` : ""}
          </div>

          <p style="margin-top: 20px;">We'll notify you as soon as your order ships. You can track your order status anytime.</p>

          <p>If you have any questions, please don't hesitate to contact us.</p>

          <div class="footer">
            <p>© 2025 Rachna Creation. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this message.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate HTML email template for order confirmed
 */
export const generateOrderConfirmedEmail = (order: Order): string => {
  const itemsList = order.items
    .map(
      (item) => `
    <li style="margin-bottom: 8px; padding: 5px 0;">
      ${item.product?.name || "Product"} - Qty: ${
        item.quantity
      } @ ${item.priceAtOrder.toFixed(2)}
    </li>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { margin-top: 20px; }
        .status-badge { display: inline-block; background-color: #10b981; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold; }
        .section { margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px; }
        .section-title { font-size: 16px; font-weight: bold; color: #111; margin-bottom: 10px; }
        ul { list-style-type: none; padding-left: 0; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed!</h1>
        </div>

        <div class="content">
          <p>Hi ${order.customerName},</p>
          <p>Great news! Your order has been confirmed and is now being processed.</p>

          <div class="section">
            <div class="section-title">Order Status</div>
            <p><strong>Order ID:</strong> ${order.id
              .slice(-8)
              .toUpperCase()}</p>
            <p><strong>Status:</strong> <span class="status-badge">Processing</span></p>
            ${order.razorpayPaymentId ? `
            <p><strong>Payment ID:</strong> ${order.razorpayPaymentId}</p>
            <p><strong>Razorpay Timestamp:</strong> ${formatEmailDateTime(order.razorpayPaymentCreatedAt)}</p>
            <p><strong>System Confirmation:</strong> ${formatEmailDateTime(order.paidAt)}</p>
            ` : ""}
            <p>Your items are being carefully picked and packed for shipment.</p>
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            <ul>${itemsList}</ul>
          </div>

          <div class="section">
            <div class="section-title">Order Total</div>
            <p style="font-size: 20px; font-weight: bold; color: #6366f1;">${order.total.toFixed(
              2
            )}</p>
          </div>

          <p style="margin-top: 20px;">We'll send you a notification as soon as your order ships with tracking information.</p>

          <div class="footer">
            <p>© 2025 Rachna Creation. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate HTML email template for order delivered
 */
export const generateOrderDeliveredEmail = (order: Order): string => {
  const itemsList = order.items
    .map(
      (item) => `
    <li style="margin-bottom: 8px; padding: 5px 0;">
      ${item.product?.name || "Product"} - Qty: ${item.quantity}
    </li>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { margin-top: 20px; }
        .status-badge { display: inline-block; background-color: #10b981; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold; }
        .section { margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px; }
        .section-title { font-size: 16px; font-weight: bold; color: #111; margin-bottom: 10px; }
        ul { list-style-type: none; padding-left: 0; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Delivered! 🎉</h1>
        </div>

        <div class="content">
          <p>Hi ${order.customerName},</p>
          <p>Your order has been delivered! We hope you're delighted with your purchase.</p>

          <div class="section">
            <div class="section-title">Order Status</div>
            <p><strong>Order ID:</strong> ${order.id
              .slice(-8)
              .toUpperCase()}</p>
            <p><strong>Status:</strong> <span class="status-badge">Delivered</span></p>
            ${order.razorpayPaymentId ? `
            <p><strong>Payment ID:</strong> ${order.razorpayPaymentId}</p>
            <p><strong>Razorpay Timestamp:</strong> ${formatEmailDateTime(order.razorpayPaymentCreatedAt)}</p>
            <p><strong>System Confirmation:</strong> ${formatEmailDateTime(order.paidAt)}</p>
            ` : ""}
          </div>

          <div class="section">
            <div class="section-title">Items Delivered</div>
            <ul>${itemsList}</ul>
          </div>

          <div class="section">
            <div class="section-title">Delivery Summary</div>
            <p><strong>Delivered To:</strong><br>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
    order.shippingAddress.postalCode
  }<br>
            ${order.shippingAddress.country}
            </p>
          </div>

          <p style="margin-top: 20px;">We would love to hear your feedback! If you're happy with your purchase, please consider leaving a review.</p>

          <p>Thank you for shopping with us! 💚</p>

          <div class="footer">
            <p>© 2025 Rachna Creation. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate HTML email template for order cancelled
 */
export const generateOrderCancelledEmail = (order: Order): string => {
  const itemsList = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
        item.product?.name || "Product"
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${
        item.quantity
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.priceAtOrder.toFixed(
        2
      )}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { margin-top: 20px; }
        .section { margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px; }
        .section-title { font-size: 16px; font-weight: bold; color: #111; margin-bottom: 10px; }
        .warning-banner { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin-top: 15px; border-radius: 3px; color: #991b1b; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #e5e7eb; padding: 10px; text-align: left; font-weight: bold; }
        td { padding: 10px; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        .total-row { font-weight: bold; background-color: #fff3cd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Cancelled</h1>
        </div>

        <div class="content">
          <p>Hi ${order.customerName},</p>
          <p>Your order has been cancelled as per your request.</p>

          <div class="section">
            <div class="section-title">Cancellation Details</div>
            <p><strong>Order Number:</strong> ${order.id
              .slice(-8)
              .toUpperCase()}</p>
            <p><strong>Order Date:</strong> ${formatEmailDateTime(order.createdAt)}</p>
            <p><strong>Status:</strong> <span style="color: #dc2626;">Cancelled</span></p>
          </div>

          <div class="section">
            <div class="section-title">Cancelled Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
                <tr class="total-row">
                  <td colspan="2" style="text-align: right; padding: 12px 10px;">Total Amount:</td>
                  <td style="text-align: right; padding: 12px 10px;">${order.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="warning-banner">
            <strong>Refund Information:</strong> If payment was already processed, a refund will be initiated to your original payment method within 5-7 business days.
          </div>

          <p style="margin-top: 20px;">If you have any questions about this cancellation or need assistance, please don't hesitate to contact us.</p>

          <div class="footer">
            <p>© 2025 Rachna Creation. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this message.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate HTML email template for admin notification
 */
export const generateAdminOrderNotification = (order: Order): string => {
  const itemsList = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
        item.product?.name || "Product"
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${
        item.quantity
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.priceAtOrder.toFixed(
        2
      )}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; background-color: #f3f4f6; line-height: 1.6; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }
        .header { background-color: #8b5cf6; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .alert { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; border-radius: 3px; }
        .section { margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px; border: 1px solid #e5e7eb; }
        .section-title { font-size: 16px; font-weight: bold; color: #111; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #e5e7eb; padding: 10px; text-align: left; font-weight: bold; }
        td { padding: 10px; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
        .action-btn { display: inline-block; background-color: #8b5cf6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛍️ New Order Received</h1>
        </div>

        <div class="alert">
          <strong>New Order Alert!</strong> A new order has been placed and requires processing.
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">Order Information</div>
            <p><strong>Order ID:</strong> ${order.id
              .slice(-8)
              .toUpperCase()}</p>
            <p><strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            <p><strong>Status:</strong> Pending</p>
          </div>

          <div class="section">
            <div class="section-title">Customer Information</div>
            <p><strong>Name:</strong> ${order.customerName}</p>
            <p><strong>Email:</strong> ${order.userEmail}</p>
            <p><strong>Phone:</strong> ${
              order.customerPhone || "Not provided"
            }</p>
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Order Total</div>
            <table style="border: none;">
              <tr>
                <td><strong>Subtotal:</strong></td>
                <td style="text-align: right;">${order.subtotal.toFixed(
                  2
                )}</td>
              </tr>
              ${
                order.discountAmount
                  ? `<tr>
                      <td><strong>Discount:</strong></td>
                      <td style="text-align: right;">-${order.discountAmount.toFixed(
                        2
                      )}</td>
                    </tr>`
                  : ""
              }
              <tr style="font-size: 18px; font-weight: bold; border-top: 2px solid #e5e7eb;">
                <td>TOTAL:</td>
                <td style="text-align: right;">${order.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Shipping Address</div>
            <p>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
    order.shippingAddress.postalCode
  }<br>
              ${order.shippingAddress.country}
            </p>
          </div>

          <p style="margin-top: 20px; text-align: center;">
            <a href="https://rachnacreation-2adde.web.app/dashboard" class="action-btn">View in Dashboard</a>
          </p>
        </div>

        <div class="footer">
          <p>© 2025 Rachna Creation. All rights reserved.</p>
          <p>This is an automated email from your order management system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send email using EmailJS
 */
export const sendOrderEmail = async (config: EmailConfig): Promise<boolean> => {
  try {
    // Generate appropriate email template based on type
    let emailHtml = "";
    let subject = config.subject;

    switch (config.emailType) {
      case "order-placed":
        emailHtml = generateOrderPlacedEmail(config.order);
        subject = `Order Placed Successfully - Order #${config.order.id
          .slice(-8)
          .toUpperCase()}`;
        break;
      case "order-confirmed":
        emailHtml = generateOrderConfirmedEmail(config.order);
        subject = `Order Confirmed - Order #${config.order.id
          .slice(-8)
          .toUpperCase()}`;
        break;
      case "order-delivered":
        emailHtml = generateOrderDeliveredEmail(config.order);
        subject = `Order Delivered - Order #${config.order.id
          .slice(-8)
          .toUpperCase()}`;
        break;
      case "order-cancelled":
        emailHtml = generateOrderCancelledEmail(config.order);
        subject = `Order Cancelled - Order #${config.order.id
          .slice(-8)
          .toUpperCase()}`;
        break;
      case "admin-notification":
        emailHtml = generateAdminOrderNotification(config.order);
        subject = `🛍️ New Order #${config.order.id
          .slice(-8)
          .toUpperCase()} - Rachna Creation`;
        break;
    }

    // Get EmailJS configuration from environment variables
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

    if (!serviceId || !templateId) {
      console.error("EmailJS configuration missing. Check your .env file.");
      return false;
    }

    console.log(
      `Sending ${config.emailType} email to: ${config.recipientEmail}`
    );

    // Send email using EmailJS with correct parameter names
    const response = await emailjs.send(serviceId, templateId, {
      to_email: config.recipientEmail,
      subject: subject,
      html_content: emailHtml,
    });

    console.log(`✅ Email sent successfully:`, {
      type: config.emailType,
      to: config.recipientEmail,
      status: response.status,
      orderId: config.order.id.slice(-8).toUpperCase(),
    });

    return response.status === 200;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
};

/**
 * Send order placed email to customer only
 * Admin gets a separate notification email
 */
export const sendOrderPlacedEmails = async (
  order: Order,
  adminEmail: string
): Promise<{ customerEmailSent: boolean; adminEmailSent: boolean }> => {
  try {
    console.log("📧 Sending order placed emails:", {
      customerEmail: order.userEmail,
      adminEmail: adminEmail,
      orderId: order.id.slice(-8).toUpperCase(),
    });

    // Send customer email
    const customerEmailSent = await sendOrderEmail({
      recipientEmail: order.userEmail,
      subject: `Order Placed Successfully - Order #${order.id
        .slice(-8)
        .toUpperCase()}`,
      emailType: "order-placed",
      order,
    });

    // Send admin notification (separate template)
    const adminEmailSent = await sendOrderEmail({
      recipientEmail: adminEmail,
      subject: `New Order #${order.id
        .slice(-8)
        .toUpperCase()} - Rachna Creation`,
      emailType: "admin-notification",
      order,
    });

    console.log("📊 Email results:", {
      customer: customerEmailSent ? "✅ Sent" : "❌ Failed",
      admin: adminEmailSent ? "✅ Sent" : "❌ Failed",
    });

    return { customerEmailSent, adminEmailSent };
  } catch (error) {
    console.error("❌ Error in sendOrderPlacedEmails:", error);
    return { customerEmailSent: false, adminEmailSent: false };
  }
};

/**
 * Send order confirmation email to customer ONLY
 */
export const sendOrderConfirmationEmail = async (
  order: Order
): Promise<boolean> => {
  if (!order.userEmail) {
    console.error("❌ No customer email found for order:", order.id);
    return false;
  }

  console.log("📧 Sending confirmation email to:", order.userEmail);
  const result = await sendOrderEmail({
    recipientEmail: order.userEmail,
    subject: `Order Confirmed - Order #${order.id.slice(-8).toUpperCase()}`,
    emailType: "order-confirmed",
    order,
  });

  console.log(result ? "✅ Confirmation sent" : "❌ Confirmation failed");
  return result;
};

/**
 * Send order delivered email to customer ONLY
 */
export const sendOrderDeliveredEmail = async (
  order: Order
): Promise<boolean> => {
  if (!order.userEmail) {
    console.error("❌ No customer email found for order:", order.id);
    return false;
  }

  console.log("📧 Sending delivery email to:", order.userEmail);
  const result = await sendOrderEmail({
    recipientEmail: order.userEmail,
    subject: `Order Delivered - Order #${order.id.slice(-8).toUpperCase()}`,
    emailType: "order-delivered",
    order,
  });

  console.log(result ? "✅ Delivery email sent" : "❌ Delivery email failed");
  return result;
};

/**
 * Send order cancelled email to customer ONLY
 */
export const sendOrderCancelledEmail = async (
  order: Order
): Promise<boolean> => {
  if (!order.userEmail) {
    console.error("❌ No customer email found for order:", order.id);
    return false;
  }

  console.log("📧 Sending cancellation email to:", order.userEmail);
  const result = await sendOrderEmail({
    recipientEmail: order.userEmail,
    subject: `Order Cancelled - Order #${order.id.slice(-8).toUpperCase()}`,
    emailType: "order-cancelled",
    order,
  });

  console.log(result ? "✅ Cancellation email sent" : "❌ Cancellation email failed");
  return result;
};

/**
 * Generate HTML email template for contact us form submission
 */
export const generateContactUsEmail = (config: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { margin-top: 20px; }
        .section { margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px; }
        .section-title { font-size: 16px; font-weight: bold; color: #111; margin-bottom: 10px; }
        .info-row { margin: 12px 0; padding: 10px; background-color: white; border-left: 4px solid #6366f1; border-radius: 3px; }
        .info-label { font-weight: bold; color: #111; font-size: 14px; }
        .info-value { color: #666; margin-top: 4px; font-size: 14px; }
        .message-box { background-color: white; border-left: 4px solid #6366f1; padding: 15px; border-radius: 3px; margin-top: 15px; }
        .message-content { color: #333; line-height: 1.8; white-space: pre-wrap; word-wrap: break-word; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
        .alert-banner { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-top: 15px; border-radius: 3px; color: #92400e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📨 New Contact Form Submission</h1>
        </div>

        <div class="content">
          <p>A new message has been submitted through the contact form.</p>

          <div class="section">
            <div class="section-title">Sender Information</div>
            
            <div class="info-row">
              <div class="info-label">Name:</div>
              <div class="info-value">${config.name}</div>
            </div>

            <div class="info-row">
              <div class="info-label">Email:</div>
              <div class="info-value">
                <a href="mailto:${config.email}" style="color: #6366f1; text-decoration: none;">
                  ${config.email}
                </a>
              </div>
            </div>

            <div class="info-row">
              <div class="info-label">Subject:</div>
              <div class="info-value">${config.subject}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Message</div>
            <div class="message-box">
              <div class="message-content">${config.message}</div>
            </div>
          </div>

          <div class="alert-banner">
            <strong>Action Required:</strong> Please review this message and respond to the sender at your earliest convenience.
          </div>
        </div>

        <div class="footer">
          <p>© 2025 Rachna Creation. All rights reserved.</p>
          <p>This is an automated email from your contact form system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send contact us form email to admin
 */
export const sendContactUsEmail = async (config: {
  name: string;
  email: string;
  subject: string;
  message: string;
  adminEmail: string;
}): Promise<boolean> => {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

    if (!serviceId || !templateId) {
      console.error("EmailJS configuration missing. Check your .env file.");
      return false;
    }

    // Generate email HTML
    const emailHtml = generateContactUsEmail({
      name: config.name,
      email: config.email,
      subject: config.subject,
      message: config.message,
    });

    console.log(`📧 Sending contact form email to admin: ${config.adminEmail}`);

    // Send email using EmailJS
    const response = await emailjs.send(serviceId, templateId, {
      to_email: config.adminEmail,
      subject: `📨 New Contact Form: ${config.subject}`,
      html_content: emailHtml,
    });

    if (response.status === 200) {
      console.log(`✅ Contact email sent successfully to: ${config.adminEmail}`);
      return true;
    } else {
      console.error("Failed to send contact email:", response);
      return false;
    }
  } catch (error) {
    console.error("❌ Error sending contact email:", error);
    return false;
  }
};

/**
 * Generate HTML email template for promotional campaign
 */
export const generatePromotionalEmail = (config: {
  campaignTitle: string;
  campaignDescription: string;
  campaignType: "offer" | "product" | "discount";
  campaignContent: string;
  discountPercentage?: number;
  discountCode?: string;
  validFrom: string;
  imageUrl?: string;
}): string => {
  const discountBadge =
    config.discountPercentage && config.discountCode
      ? `
      <div style="background-color: #dc2626; color: white; padding: 15px; text-align: center; border-radius: 5px; margin: 15px 0;">
        <p style="font-size: 12px; margin: 0; opacity: 0.9;">EXCLUSIVE OFFER</p>
        <p style="font-size: 28px; font-weight: bold; margin: 5px 0;">
          <span style="font-size: 20px;">Get </span>${config.discountPercentage}%<span style="font-size: 20px;"> OFF</span>
        </p>
        <p style="font-size: 14px; margin: 10px 0; background-color: rgba(255,255,255,0.2); padding: 8px; border-radius: 3px; font-weight: bold;">
          Code: ${config.discountCode}
        </p>
      </div>
    `
      : "";

  const imageSection = config.imageUrl
    ? `
      <div style="margin: 20px 0; text-align: center;">
        <img src="${config.imageUrl}" alt="${config.campaignTitle}" style="max-width: 100%; height: auto; border-radius: 5px; max-height: 300px;">
      </div>
    `
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 5px; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { margin-top: 20px; }
        .section { margin: 20px 0; padding: 20px; background-color: #f9fafb; border-left: 4px solid #6366f1; border-radius: 5px; }
        .section-title { font-size: 18px; font-weight: bold; color: #111; margin-bottom: 10px; }
        .campaign-type { display: inline-block; background-color: #6366f1; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
        .cta-button { display: inline-block; background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0; }
        .cta-button:hover { background-color: #4f46e5; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px; }
        .highlight { color: #6366f1; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Exclusive ${
            config.campaignType.charAt(0).toUpperCase() +
            config.campaignType.slice(1)
          } Alert!</h1>
          <p>We have something special for you</p>
        </div>

        <div class="content">
          <p>Hi there,</p>
          <p>We thought you'd love to know about our latest <span class="highlight">${config.campaignType}</span>!</p>

          <div class="section">
            <span class="campaign-type">${config.campaignType.toUpperCase()}</span>
            <div class="section-title">${config.campaignTitle}</div>
            <p>${config.campaignDescription}</p>
            
            ${imageSection}

            <p style="font-size: 15px; line-height: 1.8;">${config.campaignContent}</p>

            ${discountBadge}

            <p style="font-size: 13px; color: #666; margin-top: 15px;">
              <strong>Valid from:</strong> ${new Date(
                config.validFrom
              ).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${import.meta.env.VITE_APP_BASE_URL || "https://rachnacreation-2adde.web.app"}" class="cta-button">
              Shop Now 🛍️
            </a>
          </div>

          <div class="section" style="background-color: #fef3c7; border-left-color: #f59e0b;">
            <p style="margin: 0; font-size: 13px;">
              <strong>⏰ Limited Time Offer!</strong> Don't miss out on this exclusive ${config.campaignType}. 
              ${config.discountCode ? `Use code <strong>${config.discountCode}</strong> at checkout.` : ""}
            </p>
          </div>
        </div>

        <div class="footer">
          <p>You're receiving this email because you subscribed to our newsletter at Rachna Creation.</p>
          <p>© 2024 Rachna Creation. All rights reserved.</p>
          <p><a href="${import.meta.env.VITE_APP_BASE_URL || "https://rachnacreation-2adde.web.app"}" style="color: #6366f1; text-decoration: none;">Visit our store</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send promotional campaign email to subscribers
 */
export const sendPromotionalEmailToSubscribers = async (config: {
  subscriberEmails: string[];
  campaignTitle: string;
  campaignDescription: string;
  campaignType: "offer" | "product" | "discount";
  campaignContent: string;
  discountPercentage?: number;
  discountCode?: string;
  validFrom: string;
  imageUrl?: string;
}): Promise<{ successCount: number; failureCount: number; errors: string[] }> => {
  const results = {
    successCount: 0,
    failureCount: 0,
    errors: [] as string[],
  };

  if (!config.subscriberEmails || config.subscriberEmails.length === 0) {
    console.warn("⚠️ No subscriber emails provided");
    return results;
  }

  // Get EmailJS configuration
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  if (!serviceId || !templateId) {
    console.error("EmailJS configuration missing. Check your .env file.");
    results.failureCount = config.subscriberEmails.length;
    results.errors.push("EmailJS configuration missing");
    return results;
  }

  // Generate email template
  const emailHtml = generatePromotionalEmail(config);

  console.log(
    `📧 Sending promotional campaign to ${config.subscriberEmails.length} subscribers...`
  );

  // Send email to each subscriber
  for (const email of config.subscriberEmails) {
    try {
      const response = await emailjs.send(serviceId, templateId, {
        to_email: email,
        subject: `${config.campaignTitle} - ${config.campaignType.toUpperCase()} Alert from Rachna Creation`,
        html_content: emailHtml,
      });

      if (response.status === 200) {
        results.successCount++;
        console.log(`✅ Email sent to: ${email}`);
      } else {
        results.failureCount++;
        results.errors.push(`Failed to send to ${email}`);
        console.error(`❌ Failed to send to ${email}:`, response);
      }
    } catch (error) {
      results.failureCount++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.errors.push(`${email}: ${errorMessage}`);
      console.error(`❌ Error sending to ${email}:`, error);
    }
  }

  console.log(`📊 Campaign Results: ${results.successCount} sent, ${results.failureCount} failed`);
  return results;
};
