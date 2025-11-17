# EmailJS Template Configuration - Fix HTML Display

## Problem: HTML Codes Showing in Email

Your EmailJS template is displaying raw HTML code instead of rendering it. This is because the template variables need to be configured correctly.

---

## Solution: Update Your EmailJS Template

### Step 1: Go to EmailJS Dashboard
1. Go to: https://www.emailjs.com/dashboard/
2. Click "Email Templates"
3. Open or edit template: `template_7f654yq`

### Step 2: Configure Template Variables

**Remove or replace the current template with this:**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; }
        .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{subject}}</h1>
        </div>
        <div class="content">
            {{{message}}}
        </div>
        <p style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            © 2025 {{email_company}}. All rights reserved.
        </p>
    </div>
</body>
</html>
```

### Step 3: Key Points

**IMPORTANT - Use 3 curly braces for HTML:**
```
Wrong:  {{message}}     (will show raw HTML as text)
Right:  {{{message}}}   (will render HTML properly)
```

**Template Variables Used:**
- `{{subject}}` - Email subject (plain text)
- `{{{message}}}` - Email HTML body (use 3 braces!)
- `{{to_email}}` - Recipient email
- `{{email_company}}` - Company name (optional)

### Step 4: Test Template

1. Click "Test It"
2. Fill in test data:
   - to_email: your@email.com
   - subject: Test Email
   - message: `<h1>Test</h1><p>This is a test</p>`
3. Click "Test It" button
4. Check your email - HTML should render properly

---

## Common Issues

### Issue 1: HTML Still Shows as Code
**Solution:** Make sure you're using `{{{message}}}` with 3 braces, not 2

### Issue 2: Template Not Found
**Solution:** Make sure template ID matches: `template_7f654yq`

### Issue 3: Variables Not Showing
**Solution:** Check variable names match exactly:
- `{{to_email}}`
- `{{subject}}`
- `{{{message}}}`

---

## What the Code Sends

Your updated code sends:
```javascript
{
  to_email: "customer@example.com",
  subject: "Order Placed Successfully - Rachna Creation",
  message: "<html>...</html>",  // Full HTML
  html_message: "<html>...</html>",  // Also sent for compatibility
  order_id: "order-123",
  customer_name: "John Doe",
  email_type: "order-placed"
}
```

Your template uses:
- `{{to_email}}` - The email address
- `{{subject}}` - The email subject
- `{{{message}}}` - The HTML email body

---

## After Updating Template

1. Save the template
2. Click "Test It" to verify
3. Run your app: `npm run dev`
4. Create a test order
5. Check inbox - HTML should now display properly!

---

## Template for Different Email Types

Since all emails go through the same template, the `subject` and `message` variables change based on email type.

Your code automatically handles:
- **Order Placed:** `subject` = "Order Placed Successfully", `message` = order details
- **Order Confirmed:** `subject` = "Order Confirmed", `message` = confirmation message
- **Order Delivered:** `subject` = "Order Delivered", `message` = delivery message

All rendered via `{{{message}}}` in your template!

---

## Quick Checklist

- [ ] Go to EmailJS dashboard
- [ ] Open email template `template_7f654yq`
- [ ] Use 3 braces: `{{{message}}}`
- [ ] Use 2 braces for other vars: `{{subject}}`, `{{to_email}}`
- [ ] Click "Test It" to verify
- [ ] Test app with new template

---

**After updating this, your emails will display HTML properly!**

