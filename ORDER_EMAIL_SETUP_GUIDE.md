# Order Email Notifications Setup Guide

## Overview
This guide explains how to set up and configure order email notifications in the Puja E-Commerce application. The system supports:
- **Automatic emails** when orders are placed (to both admin and customer)
- **Manual emails** from the admin dashboard (order confirmation and delivery confirmation)
- **Email templates** with rich HTML formatting and order details

## Features Implemented

### 1. **Order Placed Email**
- **Sent to:** Customer (automatically) + Admin (automatically)
- **Trigger:** Order is successfully created in Firestore
- **Content:** Order details, items list, total, shipping address
- **Auto-enabled:** Yes (can be disabled via `VITE_SEND_ORDER_PLACEMENT_EMAIL`)

### 2. **Order Confirmation Email**
- **Sent to:** Customer (manual)
- **Trigger:** Admin clicks "Confirmation Email" button in Orders dashboard
- **Content:** Order confirmation with processing status
- **Location:** Orders table in Admin Dashboard

### 3. **Delivery Confirmation Email**
- **Sent to:** Customer (manual)
- **Trigger:** Admin clicks "Delivery Email" button (only visible when order status = "delivered")
- **Content:** Delivery confirmation with items delivered
- **Location:** Orders table in Admin Dashboard

## File Structure

```
src/
├── utils/
│   └── emailService.ts          # Email utility functions and templates
├── components/
│   ├── OrderEmailManager.tsx    # UI component for email buttons
│   └── OrderTable.tsx           # Updated with email manager
├── pages/
│   └── PaymentPage.tsx          # Updated to send emails on order creation
└── functions/
    └── sendEmail.js            # Firebase Cloud Function for sending emails
```

## Configuration

### Environment Variables (.env)

```dotenv
# Email Configuration
VITE_EMAIL_SENDER_NAME=Rachna Creation Team
VITE_EMAIL_SUPPORT_ADDRESS=rachnacreationrc@gmail.com
VITE_ADMIN_DASHBOARD_URL=https://rachnacreation-2adde.web.app/dashboard

# Order Email Configuration
VITE_ORDER_NOTIFICATION_ADMIN_EMAIL=rachnacreationrc@gmail.com
VITE_SEND_ORDER_PLACEMENT_EMAIL=true          # Enable/disable automatic emails
VITE_SEND_DELIVERY_CONFIRMATION_EMAIL=true    # Enable/disable delivery emails

# Email Service Provider (Choose one - see below)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# OR

VITE_FUNCTIONS_URL=https://region-project.cloudfunctions.net/sendEmail

# OR

VITE_EMAIL_API_URL=https://your-api.example.com/api/send-email
```

## Implementation Options

### Option 1: Firebase Cloud Functions (RECOMMENDED)
Best for: Secure server-side email sending, no third-party service needed

**Setup Steps:**

1. Initialize Firebase Functions:
```bash
firebase init functions
npm install nodemailer --save
```

2. Set up Gmail SMTP credentials:
```bash
firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"
```

3. Deploy the function:
```bash
firebase deploy --only functions
```

4. Update `emailService.ts` to call the Cloud Function:
```typescript
// In emailService.ts sendOrderEmail function
const response = await fetch(`https://your-region-project.cloudfunctions.net/sendEmail`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: config.recipientEmail,
    subject: emailHtml,
    html: emailHtml,
    type: config.emailType,
    orderId: config.order.id
  })
});
```

**Note:** For Gmail, you'll need:
- [Generate an App Password](https://support.google.com/accounts/answer/185833) (2FA must be enabled)
- Or use Firebase Email Extension (easier)

### Option 2: EmailJS
Best for: No backend setup required, easy integration

**Setup Steps:**

1. Create an EmailJS account at https://www.emailjs.com

2. Get your Service ID, Template ID, and Public Key

3. Install EmailJS:
```bash
npm install @emailjs/browser
```

4. Update `emailService.ts`:
```typescript
import emailjs from '@emailjs/browser';

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY!);

export const sendOrderEmail = async (config: EmailConfig): Promise<boolean> => {
  try {
    const emailHtml = generateEmailTemplate(config);
    
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID!,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID!,
      {
        to_email: config.recipientEmail,
        subject: config.subject,
        message: emailHtml,
        order_id: config.order.id
      }
    );
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
```

5. Update environment variables with your credentials

### Option 3: Custom Backend API
Best for: Full control, existing backend infrastructure

Create an API endpoint on your backend:
```
POST /api/send-email
Body: {
  to: string,
  subject: string,
  html: string,
  type: string,
  orderId: string
}
```

Update `emailService.ts`:
```typescript
export const sendOrderEmail = async (config: EmailConfig): Promise<boolean> => {
  try {
    const response = await fetch(import.meta.env.VITE_EMAIL_API_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: config.recipientEmail,
        subject: config.subject,
        html: emailHtml,
        type: config.emailType,
        orderId: config.order.id
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
```

## Usage

### For Customers
1. Customer places an order on the Payment page
2. Order is created in Firestore
3. **Automatic emails** are sent:
   - Order confirmation to customer
   - New order notification to admin

### For Admins
1. Login to the Dashboard
2. Navigate to Orders tab
3. Each order row shows:
   - **View Details** button
   - **Invoice** button
   - Status dropdown
   - **Email buttons:**
     - "Confirmation Email" - Send order confirmation to customer
     - "Delivery Email" - Only visible when order status is "delivered"

## Email Templates

### Order Placed Email (Customer)
- Order ID and number
- Items ordered with quantities and prices
- Subtotal, discount (if any), and total
- Shipping address
- Payment method
- Professional HTML formatting with Rachna Creation branding

### Order Confirmation Email (Customer)
- Order status (Processing)
- Item list
- Order total
- Message about order processing

### Order Delivery Email (Customer)
- Order delivered notification
- Items delivered
- Delivery address
- Thank you message with review request

### Admin Notification Email
- New order alert
- Full order details
- Customer information
- Items with pricing
- Link to dashboard for processing

## Testing

### Manual Testing
1. Create a test order from the Payment page
2. Check the email service logs (Firebase, EmailJS, or your backend)
3. Verify email was sent to both customer and admin
4. Test admin buttons by clicking email buttons in Orders tab
5. Verify proper email is sent to customer

### Environment Variables for Testing
```dotenv
# Test with your personal email first
VITE_ORDER_NOTIFICATION_ADMIN_EMAIL=your-personal-email@gmail.com
VITE_SEND_ORDER_PLACEMENT_EMAIL=true
```

## Troubleshooting

### Emails Not Sending

1. **Check environment variables:**
   - Verify `.env` file has correct email configuration
   - Restart dev server after changing `.env`

2. **Check browser console:**
   - Look for error messages in DevTools console
   - Check Network tab for failed API calls

3. **Firebase Functions (if using):**
   - Run: `firebase functions:log` to see function logs
   - Check that function is deployed: `firebase deploy --only functions`

4. **Gmail SMTP (if using):**
   - Verify App Password is correct
   - Ensure 2FA is enabled on Gmail account
   - Check that "Less secure app access" is not blocking connection

5. **EmailJS (if using):**
   - Verify Service ID, Template ID, and Public Key are correct
   - Check EmailJS dashboard for failed emails
   - Verify email template is set up correctly in EmailJS

### Emails Going to Spam

1. Add verification to sender email
2. Implement SPF, DKIM, and DMARC records
3. Use a professional email domain instead of Gmail
4. Add unsubscribe link and proper email headers

## Security Considerations

1. **Never expose sensitive credentials** in client-side code
2. Use environment variables for all secrets
3. For Firebase Functions, use `functions:config` for secrets
4. Implement authentication checks in your API
5. Rate-limit email sending to prevent abuse
6. Validate all email addresses before sending

## Future Enhancements

1. **Email tracking:** Track when emails are opened/clicked
2. **Email history:** Store sent emails in Firestore for auditing
3. **Custom templates:** Allow admins to customize email templates
4. **Scheduled emails:** Send emails at specific times
5. **SMS notifications:** Add SMS option for order status updates
6. **Email scheduling:** Queue emails and send in batches
7. **Unsubscribe management:** Allow customers to opt-out of emails

## Support

For issues or questions:
1. Check the console for error messages
2. Review Firebase Functions logs (if applicable)
3. Verify email service provider account status
4. Check network requests in browser DevTools
5. Contact support at rachnacreationrc@gmail.com

