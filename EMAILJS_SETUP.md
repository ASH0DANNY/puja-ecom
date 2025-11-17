# EmailJS Setup Guide - Quick Start

## ✅ Current Status

Your EmailJS credentials are already configured in `.env.example`:
- ✅ Service ID: `service_zhuc5cv`
- ✅ Template ID: `template_7f654yq`
- ✅ Public Key: `udu7f4W-Gs_dwB9d6`
- ✅ EmailJS library installed: `@emailjs/browser`
- ✅ Code integrated: `emailService.ts` updated

---

## 🎯 What You Need to Do

### Step 1: Copy Your .env File

Make sure `.env` file exists in your project root:
```bash
cp .env.example .env
```

The EmailJS credentials are already in `.env.example`, so they should be in `.env` now.

### Step 2: Create EmailJS Email Template

You need to create an email template in your EmailJS account. Here's how:

1. **Go to:** https://www.emailjs.com/dashboard/
2. **Login** with your account
3. **Click:** "Email Templates"
4. **Create New Template** (or edit existing `template_7f654yq`)

### Step 3: Configure the Email Template

Your template should accept these variables:

**Template Variables:**
```
{{to_email}}        - Recipient email address
{{subject}}         - Email subject
{{message}}         - Email body (HTML content)
{{order_id}}        - Order ID
{{customer_name}}   - Customer name
```

**Basic Template Structure:**
```html
<h2>{{subject}}</h2>
<div>{{{message}}}</div>
<p>Thank you!</p>
```

**Important:** Use `{{{message}}}` (three curly braces) for HTML content so it renders properly.

### Step 4: Test EmailJS Connection

Click "Test It" in your EmailJS dashboard to verify the template works.

### Step 5: Test Your App

1. **Start dev server:**
```bash
npm run dev
```

2. **Create a test order:**
   - Go to Products
   - Add item to cart
   - Go to Payment
   - Fill in customer & shipping info
   - Submit order

3. **Check your inbox:**
   - You should receive 2 emails:
     - ✉️ Order confirmation (to customer email)
     - ✉️ New order notification (to admin email)

4. **Check EmailJS dashboard:**
   - Go to https://www.emailjs.com/dashboard/
   - Click "Email activity" or "Logs"
   - You should see the sent emails

---

## 📧 Email Types

### 1. Order Placed Email
- **Sent to:** Customer & Admin (automatic)
- **Variables:** `{{to_email}}`, `{{subject}}`, `{{{message}}}`
- **HTML:** Order details table in `{{message}}`

### 2. Order Confirmation Email
- **Sent to:** Customer (manual button in admin)
- **Variables:** Same as above
- **HTML:** Confirmation message in `{{message}}`

### 3. Order Delivery Email
- **Sent to:** Customer (manual button in admin when delivered)
- **Variables:** Same as above
- **HTML:** Delivery confirmation in `{{message}}`

---

## 🔧 EmailJS Configuration

Your credentials in `.env`:
```dotenv
VITE_EMAILJS_SERVICE_ID=service_zhuc5cv
VITE_EMAILJS_TEMPLATE_ID=template_7f654yq
VITE_EMAILJS_PUBLIC_KEY=udu7f4W-Gs_dwB9d6
```

To get these:
1. Go to https://www.emailjs.com/dashboard/admin/
2. **Accounts:** Copy your "Service ID"
3. **Email Templates:** Copy your "Template ID"
4. **API Keys:** Copy your "Public Key"

---

## ✨ How It Works

1. **Customer places order** → Order saved to Firebase
2. **Automatic trigger** → `sendOrderPlacedEmails()` called
3. **EmailJS sends emails** → Using your template
4. **Email arrives** → In customer & admin inbox

**Admin buttons:**
1. **Admin clicks button** in Orders dashboard
2. **Trigger** → `sendOrderConfirmationEmail()` or `sendOrderDeliveredEmail()`
3. **EmailJS sends email** → Using your template
4. **Email arrives** → In customer inbox

---

## 🧪 Testing

### Test 1: Create Order
```bash
npm run dev
# Go to app → Products → Cart → Payment
# Fill form and submit
```

Expected: 2 emails arrive (customer + admin)

### Test 2: Admin Buttons
```
Go to Dashboard → Orders
Click "Confirmation Email" button
```

Expected: 1 email arrives to customer

### Test 3: Delivery Email
```
1. Change order status to "Delivered" (status dropdown)
2. Click "Delivery Email" button
```

Expected: 1 delivery confirmation email arrives

---

## 📊 EmailJS Limits

**Free Tier:**
- ✅ 200 emails/month
- ✅ Unlimited templates
- ✅ Unlimited service/template IDs

**Pro Tier:**
- ✅ 25,000 emails/month
- ✅ More features

Current limit should be fine for testing. Upgrade to Pro if needed for production.

---

## 🐛 Troubleshooting

### Problem: "EmailJS configuration missing"
**Solution:** Check your `.env` file has all 3 EmailJS variables:
```bash
grep VITE_EMAILJS .env
```

Should show:
- `VITE_EMAILJS_SERVICE_ID=...`
- `VITE_EMAILJS_TEMPLATE_ID=...`
- `VITE_EMAILJS_PUBLIC_KEY=...`

### Problem: Emails not arriving
**Solution 1:** Check browser console (F12)
- Look for error messages
- Check "Network" tab for API calls

**Solution 2:** Check EmailJS dashboard
- https://www.emailjs.com/dashboard/
- Click "Email activity" or "Logs"
- See if emails were attempted to send

**Solution 3:** Check email template
- Go to EmailJS → Email Templates
- Make sure template variables are correct
- Try "Test It" to send test email

### Problem: Template not working
**Solution:** Use three curly braces for HTML:
```
Wrong: {{message}}
Right: {{{message}}}
```

### Problem: Email looks different than expected
**Solution:** Check HTML in template
- EmailJS templates support basic HTML
- Some CSS might not work (use inline styles)
- Test with simple HTML first

---

## ✅ Setup Verification

Run this checklist:

- [ ] `.env` file exists with EmailJS credentials
- [ ] `npm run dev` works without errors
- [ ] EmailJS account has active template
- [ ] Template has `to_email`, `subject`, `message` variables
- [ ] Test order created successfully
- [ ] Received order confirmation email
- [ ] Received admin notification email
- [ ] Admin email buttons visible in dashboard
- [ ] Confirmation email button sends email
- [ ] No errors in browser console

If all checked → ✅ **EmailJS is working!**

---

## 📚 Resources

- **EmailJS Documentation:** https://www.emailjs.com/docs/
- **EmailJS Dashboard:** https://www.emailjs.com/dashboard/
- **Email Activity Log:** Check sent emails here

---

## 🚀 Next Steps

1. ✅ You have your EmailJS credentials
2. ✅ Code is integrated
3. Create/configure your email template in EmailJS
4. Test by creating a sample order
5. Monitor email delivery in EmailJS dashboard
6. Deploy to production when ready!

---

**Status:** Ready for EmailJS emails to start sending!

**Next:** Create your email template in EmailJS dashboard → https://www.emailjs.com/dashboard/

