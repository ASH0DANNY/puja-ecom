# EmailJS Testing Guide

## Quick Test Steps

### 1. Start Dev Server
```bash
cd /workspaces/puja-ecom
npm run dev
```

Open browser to `http://localhost:5173`

### 2. Create Test Order

**Step-by-step:**
1. Click "Products" or go to home page
2. Click on any product
3. Click "Add to Cart"
4. Go to "Cart" page
5. Click "Proceed to Checkout"
6. You'll be directed to Payment page
7. Fill in:
   - Full Name: Your name
   - Phone: Any phone number
   - Street Address: Your address
   - City: Your city
   - State: Your state
   - Postal Code: Any code
   - Country: India
8. Select payment method: "Card"
9. Click "Submit Order"

### 3. Check for Order Success

You should see:
- ✅ Green success message: "Order placed! Confirmation email will be sent."
- ✅ Animated success screen
- ✅ Redirect to Orders page

### 4. Check Your Email Inbox

**You should receive:**
1. ✉️ **Email 1:** Order confirmation
   - From: noreply@emailjs.com (or your sender)
   - Subject: "Order Placed Successfully - Rachna Creation"
   - Content: Order details table with items

2. ✉️ **Email 2:** Admin notification
   - To: rachnacreationrc@gmail.com (your admin email)
   - Subject: "New Order Received"
   - Content: Admin order notification with customer details

**Timeline:**
- Email should arrive within seconds
- Check spam folder if not in inbox

### 5. Test Admin Email Buttons

1. **Go to Dashboard:**
   - Click "Dashboard" or login as admin
   - Go to "Orders" tab

2. **Find your test order:**
   - Look for the order you just created
   - Should be at the top of the list

3. **Test "Confirmation Email" button:**
   - Click "Confirmation Email" button
   - Should show loading spinner
   - Should show toast notification: "Confirmation email sent!"
   - Check inbox for new email

4. **Test "Delivery Email" button:**
   - Change order status from "Pending" to "Delivered"
   - "Delivery Email" button will appear
   - Click it
   - Should show toast notification
   - Check inbox for delivery confirmation email

### 6. Check EmailJS Dashboard

1. Go to: https://www.emailjs.com/dashboard/
2. Click "Email Activity" or "Logs"
3. You should see your sent emails listed

**For each email, you should see:**
- ✅ Status: "Sent"
- ✅ Service ID: service_zhuc5cv
- ✅ Template ID: template_7f654yq
- ✅ To email: Your test email
- ✅ Sent time: Recent

---

## 🔍 Debugging

### Issue: No success message after order submission

**Check:**
1. Did you fill in ALL fields?
2. Are there console errors? (F12 → Console)
3. Did Firebase save the order? (Check Firestore)

### Issue: No emails received

**Check 1: Browser Console**
```
F12 → Console tab
Look for errors starting with "Error"
```

**Check 2: EmailJS Configuration**
```bash
grep VITE_EMAILJS .env
```

Should show 3 variables (not commented out)

**Check 3: EmailJS Dashboard**
1. Go to https://www.emailjs.com/dashboard/
2. Check "Email Activity" tab
3. Were emails attempted?

**Check 4: Email Template**
1. Go to EmailJS Dashboard → Email Templates
2. Click your template (template_7f654yq)
3. Does it have {{to_email}}, {{subject}}, {{{message}}}?
4. Click "Test It" to send test email

**Check 5: Spam Folder**
- Check your email spam/junk folder
- Mark as "Not Spam" if found there

### Issue: Email looks wrong/broken

**Check:**
1. Is template using correct HTML?
2. Try sending test email from EmailJS dashboard
3. If test email looks good, issue is in our code
4. If test email looks broken, issue is in your EmailJS template

---

## 📋 Verification Checklist

- [ ] npm run dev starts without errors
- [ ] Can create product and add to cart
- [ ] Can fill payment form
- [ ] Order submission shows success
- [ ] First email arrives within 2 minutes
- [ ] Second email (admin) arrives
- [ ] Both emails are readable
- [ ] Dashboard shows your order
- [ ] Can click "Confirmation Email" button
- [ ] Can change status to "Delivered"
- [ ] Can click "Delivery Email" button
- [ ] All button clicks show toast notification
- [ ] Emails appear in EmailJS dashboard

---

## 💡 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "EmailJS config missing" | .env not configured | Check .env has 3 EMAILJS vars |
| No toast notification | Button not responding | Check browser console for errors |
| Emails not arriving | Template issue | Test template in EmailJS dashboard |
| Emails in spam | Sender reputation | EmailJS reputation, may improve over time |
| Admin email not received | Wrong admin email | Check VITE_ORDER_NOTIFICATION_ADMIN_EMAIL |

---

## 📊 Test Results Template

When you test, note:

```
Test Date: ___________
Test Email: ___________

Order Placed: ✓ ✗
Success Message: ✓ ✗
Customer Email Received: ✓ ✗ (Time: _____)
Admin Email Received: ✓ ✗ (Time: _____)
Confirmation Button Sent: ✓ ✗
Delivery Email Sent: ✓ ✗
EmailJS Dashboard Shows Sent: ✓ ✗

Issues: ________________
```

---

## 🚀 If All Tests Pass

Congratulations! Your EmailJS email system is working!

### Deploy to Production

```bash
npm run build
firebase deploy
```

Your email system will work on the live app!

---

## 📞 Need Help?

1. Check browser console (F12)
2. Check EmailJS dashboard logs
3. Check this troubleshooting guide
4. Check EMAILJS_SETUP.md for detailed info

