/**
 * Firebase Cloud Function for sending order-related emails
 * Deploy with: firebase deploy --only functions
 *
 * This function handles sending emails for order placement, confirmation, and delivery.
 * It uses NodeMailer with Gmail SMTP for sending emails.
 */

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// Configure email transporter using Gmail SMTP
// You'll need to:
// 1. Enable Gmail SMTP access or use an App Password
// 2. Set these environment variables in Firebase:
//    firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail?.email || process.env.GMAIL_USER,
    pass: functions.config().gmail?.password || process.env.GMAIL_PASSWORD,
  },
});

/**
 * HTTP Cloud Function to send emails
 * Expects POST request with:
 * {
 *   to: "recipient@example.com",
 *   subject: "Email Subject",
 *   html: "<html>...</html>",
 *   type: "order-placed" | "order-confirmed" | "order-delivered",
 *   orderId: "order-id"
 * }
 */
exports.sendEmail = functions.https.onCall(async (data, context) => {
  try {
    // Verify the request is authenticated (optional, but recommended for security)
    // Uncomment to require authentication:
    // if (!context.auth) {
    //   throw new functions.https.HttpsError('unauthenticated', 'Request must be authenticated');
    // }

    const { to, subject, html, type, orderId } = data;

    // Validation
    if (!to || !subject || !html) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields: to, subject, html"
      );
    }

    // Send email
    const mailOptions = {
      from: functions.config().gmail?.email || process.env.GMAIL_USER,
      to,
      subject,
      html,
      replyTo: process.env.REPLY_TO_EMAIL || "support@example.com",
    };

    const result = await transporter.sendMail(mailOptions);

    console.log(
      `Email sent successfully for order ${orderId} (type: ${type}):`,
      result.messageId
    );

    return {
      success: true,
      messageId: result.messageId,
      orderId,
      type,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to send email: ${error.message}`
    );
  }
});

/**
 * HTTP Cloud Function to send emails via HTTP POST
 * Call with: POST /api/send-email
 * Body: { to, subject, html, type, orderId }
 */
exports.sendEmailHttp = functions.https.onRequest(async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { to, subject, html, type, orderId } = req.body;

    // Validation
    if (!to || !subject || !html) {
      return res.status(400).json({
        error: "Missing required fields: to, subject, html",
      });
    }

    // Optional: Verify request is from your app
    // You could add a secret token or API key verification here

    // Send email
    const mailOptions = {
      from: functions.config().gmail?.email || process.env.GMAIL_USER,
      to,
      subject,
      html,
      replyTo: process.env.REPLY_TO_EMAIL || "support@example.com",
    };

    const result = await transporter.sendMail(mailOptions);

    console.log(
      `Email sent via HTTP for order ${orderId} (type: ${type}):`,
      result.messageId
    );

    return res.status(200).json({
      success: true,
      messageId: result.messageId,
      orderId,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      error: "Failed to send email",
      message: error.message,
    });
  }
});

/**
 * Firestore Trigger - Automatically send email when order status changes
 * This is an optional trigger if you want automatic emails on status updates
 */
exports.onOrderStatusChange = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const previousOrder = change.before.data();
    const currentOrder = change.after.data();

    // Check if status changed to "delivered"
    if (
      previousOrder.status !== "delivered" &&
      currentOrder.status === "delivered"
    ) {
      try {
        const mailOptions = {
          from: functions.config().gmail?.email || process.env.GMAIL_USER,
          to: currentOrder.userEmail,
          subject: `Your Order Has Been Delivered - ${
            import.meta.env.VITE_APP_NAME
          }`,
          html: generateDeliveryEmailHTML(currentOrder),
          replyTo: process.env.REPLY_TO_EMAIL || import.meta.env.VITE_APP_EMAIL,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Delivery email sent for order ${context.params.orderId}`);
      } catch (error) {
        console.error(
          `Error sending delivery email for order ${context.params.orderId}:`,
          error
        );
      }
    }
  });

/**
 * Helper function to generate delivery email HTML
 */
function generateDeliveryEmailHTML(order) {
  const itemsList = order.items
    .map(
      (item) => `
    <li style="margin-bottom: 8px;">
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
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { margin-top: 20px; }
        .status-badge { display: inline-block; background-color: #10b981; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold; }
        .section { margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px; }
        .section-title { font-size: 16px; font-weight: bold; color: #111; margin-bottom: 10px; }
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
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Status:</strong> <span class="status-badge">Delivered</span></p>
          </div>

          <div class="section">
            <div class="section-title">Items Delivered</div>
            <ul>${itemsList}</ul>
          </div>

          <p style="margin-top: 20px;">We would love to hear your feedback! If you're happy with your purchase, please consider leaving a review.</p>

          <p>Thank you for shopping with us! 💚</p>

          <div class="footer">
            <p>© 2025 ${import.meta.env.VITE_APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
