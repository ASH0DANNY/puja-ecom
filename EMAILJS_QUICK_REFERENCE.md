# EmailJS Integration - Quick Reference

## ✅ Status: Ready to Test

EmailJS is now fully integrated into your order email system.

---

## 🎯 3-Step Quick Start

### Step 1: Setup (.env file)
```bash
# Make sure .env exists with EmailJS credentials
cp .env.example .env
```

Your credentials in `.env`:
```dotenv
VITE_EMAILJS_SERVICE_ID=service_zhuc5cv
VITE_EMAILJS_TEMPLATE_ID=template_7f654yq
VITE_EMAILJS_PUBLIC_KEY=udu7f4W-Gs_dwB9d6
```

### Step 2: Create Email Template
Go to: https://www.emailjs.com/dashboard/

1. Click "Email Templates"
2. Create or edit template `template_7f654yq`
3. Add these variables:
   - `{{to_email}}` - recipient email
   - `{{subject}}` - email subject
   - `{{{message}}}` - email body (HTML, use 3 braces!)
   - `{{customer_name}}` - customer name (optional)
   - `{{order_id}}` - order ID (optional)

4. Click "Test It" to verify

### Step 3: Test Your Emails
```bash
npm run dev
# Create test order
# Check inbox for 2 emails
```

---

## 📧 Email Sending Flow

```
AUTOMATIC (on order creation):
  Customer places order
    → Order saved to Firestore
    → sendOrderPlacedEmails() called
    → 2 emails via EmailJS
      ├─ To: customer (order confirmation)
      └─ To: admin (new order notification)

MANUAL (from admin dashboard):
  Admin clicks button
    → sendOrderConfirmationEmail() or sendOrderDeliveredEmail()
    → 1 email via EmailJS to customer
```

---

## 🧪 Test Checklist

- [ ] `.env` file exists with 3 EMAILJS variables
- [ ] Email template created in EmailJS dashboard
- [ ] Template has `{{to_email}}`, `{{subject}}`, `{{{message}}}`
- [ ] `npm run dev` starts without errors
- [ ] Can create product and add to cart
- [ ] Can fill payment form and submit
- [ ] Receive order confirmation email
- [ ] Receive admin notification email
- [ ] Dashboard shows order
- [ ] Can click "Confirmation Email" button
- [ ] Can change status to "Delivered" and click delivery button
- [ ] All 3+ emails received successfully
- [ ] No errors in browser console (F12)

---

## 📊 What Gets Sent

### Order Placed Email (Auto)
**To:** Customer  
**Subject:** Order Placed Successfully - Rachna Creation  
**Content:** Order details, items, total, shipping address

### Admin Notification (Auto)
**To:** Admin (rachnacreationrc@gmail.com)  
**Subject:** New Order Received  
**Content:** Full order details with customer info

### Confirmation Email (Manual)
**To:** Customer  
**Subject:** Order Confirmed - Rachna Creation  
**Content:** Order confirmation and processing status

### Delivery Email (Manual)
**To:** Customer (when order status = "delivered")  
**Subject:** Order Delivered - Rachna Creation  
**Content:** Delivery confirmation and thank you

---

## 🔧 EmailJS Template Variables

Your code sends these variables to EmailJS:

```javascript
{
  to_email: "customer@example.com",      // Where to send
  subject: "Order Placed Successfully",  // Email subject
  message: "<html>...</html>",           // HTML email body
  order_id: "order-123",                 // Order ID
  customer_name: "John Doe"              // Customer name
}
```

**In your EmailJS template, use:**
- `{{to_email}}` - recipient email
- `{{subject}}` - email subject
- `{{{message}}}` - HTML content (3 braces!)
- `{{order_id}}` - order ID
- `{{customer_name}}` - customer name

---

## 🚀 Testing Steps

### Quick Test (5 minutes)
```bash
1. npm run dev
2. Create test order
3. Check inbox
4. See 2 emails? ✅ Success!
```

### Full Test (15 minutes)
```bash
1. npm run dev
2. Create test order
3. Receive 2 emails
4. Go to Dashboard
5. Click "Confirmation Email" button
6. Receive 1 more email
7. Change status to "Delivered"
8. Click "Delivery Email" button
9. Receive 1 more email
10. Total: 4 emails? ✅ All working!
```

### Check EmailJS Dashboard
1. Go to: https://www.emailjs.com/dashboard/
2. Click "Email Activity" or "Logs"
3. See your sent emails listed
4. Check for any failures

---

## 🐛 Troubleshooting

| Problem | Check | Solution |
|---------|-------|----------|
| No success message | Browser console (F12) | Look for error messages |
| Emails not received | .env file has 3 vars | grep VITE_EMAILJS .env |
| Template error | EmailJS dashboard | Check template variables match |
| Slow email arrival | EmailJS logs | Usually arrives in <1 min |
| Email in spam | Email settings | Mark as "not spam" |

---

## 📱 Files Modified

**New:**
- `EMAILJS_SETUP.md` - Complete setup guide
- `EMAILJS_TESTING.md` - Testing guide

**Updated:**
- `src/utils/emailService.ts` - Now uses EmailJS
- `.env.example` - Added EmailJS credentials

---

## 🎯 Key Points

✅ EmailJS is **already installed** (@emailjs/browser)  
✅ Code is **already integrated**  
✅ Credentials are **already in .env.example**  
✅ Build is **successful** (0 errors)  
✅ Ready to **test immediately**

You just need to:
1. Create email template in EmailJS (if not done)
2. Test by creating an order
3. Deploy when ready!

---

## 📞 Quick Links

- **EmailJS Dashboard:** https://www.emailjs.com/dashboard/
- **Setup Guide:** See EMAILJS_SETUP.md
- **Testing Guide:** See EMAILJS_TESTING.md
- **Original Docs:** See START_HERE_EMAIL.md

---

## 🚀 Next Action

**Create your email template in EmailJS:**

1. Go to: https://www.emailjs.com/dashboard/
2. Click "Email Templates"
3. Create template `template_7f654yq`
4. Add variables: `{{to_email}}`, `{{subject}}`, `{{{message}}}`
5. Click "Test It"
6. Come back and test with `npm run dev`

**Then test with an order and watch the emails arrive!**

---

**Status:** 🟢 Ready to Test  
**Build:** ✅ Successful  
**Errors:** 0  
**Next:** Create EmailJS template → Test → Deploy

