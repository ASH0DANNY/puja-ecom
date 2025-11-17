# Quick Start: Order Email Notifications

## What's New

✅ **Email notifications system fully implemented** with 3 email types
✅ **Admin dashboard buttons** to send emails to customers
✅ **Auto-emails** when order is placed (configurable)
✅ **Professional HTML email templates** with order details
✅ **Firebase Cloud Function** ready for deployment

## Quick Setup (5 minutes)

### Step 1: Update Environment Variables
Copy `.env.example` to `.env` and update:

```dotenv
# Set your admin email
VITE_ORDER_NOTIFICATION_ADMIN_EMAIL=rachnacreationrc@gmail.com

# Optional: Disable auto-emails
VITE_SEND_ORDER_PLACEMENT_EMAIL=true
```

### Step 2: Choose Email Service

**Option A: Firebase Cloud Functions (Easiest)**
```bash
cd functions
npm install
firebase deploy --only functions
```

**Option B: EmailJS (Free, No Backend)**
1. Sign up at https://www.emailjs.com
2. Get Service ID, Template ID, Public Key
3. Add to `.env`:
```dotenv
VITE_EMAILJS_SERVICE_ID=your_id
VITE_EMAILJS_TEMPLATE_ID=your_id
VITE_EMAILJS_PUBLIC_KEY=your_key
```

### Step 3: Test
1. Place a test order
2. Check admin dashboard Orders tab
3. Click "Confirmation Email" to test manual sending

## Features by User

### 👥 Customers
- Automatic order confirmation email when order placed
- Can receive order status update emails from admin

### 👨‍💼 Admins
- **Automatic:** Get email when new order is placed
- **Manual:** Send order confirmation email to customer
- **Manual:** Send delivery confirmation (when order status = "delivered")
- **Location:** Orders tab → Actions & Emails column

## Files Added/Modified

### New Files
- `src/utils/emailService.ts` - Email templates and sending logic
- `src/components/OrderEmailManager.tsx` - Admin email buttons UI
- `functions/sendEmail.js` - Firebase Cloud Function
- `ORDER_EMAIL_SETUP_GUIDE.md` - Full documentation

### Modified Files
- `src/pages/PaymentPage.tsx` - Auto-send emails on order creation
- `src/components/OrderTable.tsx` - Added email manager to admin orders
- `.env.example` - Added email configuration variables

## Email Types

### 1️⃣ Order Placed (Automatic)
**To:** Customer & Admin  
**When:** Order successfully created  
**Content:** Order details, items, total, shipping address

### 2️⃣ Order Confirmation (Manual)
**To:** Customer  
**When:** Admin clicks button  
**Content:** Confirmation that order is being processed

### 3️⃣ Order Delivery (Manual)
**To:** Customer  
**When:** Admin clicks button (only available when order status = "delivered")  
**Content:** Delivery confirmation and thank you message

## Current Status

✅ **Code Implementation:** Complete
✅ **Email Templates:** Ready
✅ **Admin UI:** Ready with buttons
✅ **Firebase Function:** Ready to deploy
⏳ **Email Service Setup:** Need to configure (choose Option A, B, or C)

## Next Steps

1. **Choose** your email service provider (Firebase Functions, EmailJS, or custom API)
2. **Configure** credentials in `.env` file
3. **Deploy** (if using Firebase Functions)
4. **Test** by placing an order
5. **Monitor** email service for success/failures

## Troubleshooting

**Emails not sending?**
1. Check `.env` file has correct configuration
2. Verify email service credentials
3. Check browser console for errors
4. Look at email service provider logs

**Buttons not appearing in admin?**
1. Refresh page (Cmd+R or Ctrl+R)
2. Check that user is logged in as admin
3. Ensure you're viewing the Orders tab in Dashboard

## Support Files

- Full setup guide: `ORDER_EMAIL_SETUP_GUIDE.md`
- Email templates: `src/utils/emailService.ts`
- Admin UI: `src/components/OrderEmailManager.tsx`
- Firebase function: `functions/sendEmail.js`

## Environment Variables Reference

```dotenv
# Email Configuration
VITE_EMAIL_SENDER_NAME=Rachna Creation Team
VITE_EMAIL_SUPPORT_ADDRESS=rachnacreationrc@gmail.com
VITE_ADMIN_DASHBOARD_URL=https://rachnacreation-2adde.web.app/dashboard

# Order Email Settings
VITE_ORDER_NOTIFICATION_ADMIN_EMAIL=rachnacreationrc@gmail.com
VITE_SEND_ORDER_PLACEMENT_EMAIL=true
VITE_SEND_DELIVERY_CONFIRMATION_EMAIL=true

# Email Service Provider (configure based on your choice)
# Firebase Cloud Functions
VITE_FUNCTIONS_URL=https://region-project.cloudfunctions.net/sendEmail

# EmailJS
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Custom API
VITE_EMAIL_API_URL=https://your-api.example.com/api/send-email
```

---

**Status:** 🟢 Ready for deployment  
**Last Updated:** 2025  
**Questions?** See `ORDER_EMAIL_SETUP_GUIDE.md`

