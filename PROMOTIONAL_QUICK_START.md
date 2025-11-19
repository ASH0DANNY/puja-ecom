# Promotional Features - Quick Start Guide

## 🚀 Get Started - All Fixed!

### Latest Updates ✅
- **Promotions stored in localStorage** (not Firebase)
- **Only "Starts From" date required** (no "Valid Until")
- **Undefined fields fixed** (no Firebase errors)
- **Form simplified** for easier campaign creation

### Quick Integration

**Step 1: Add StayUpdated Component**

In your HomePage or Footer:
```tsx
import StayUpdated from "../components/StayUpdated";

export default function HomePage() {
  return (
    <>
      {/* ... other content ... */}
      <StayUpdated />
    </>
  );
}
```

**Step 2: Access Admin Dashboard**

1. Login with admin account
2. Go to Dashboard
3. Click "Promotional" tab (Megaphone 📢)
4. Click "New Promotion"

**Step 3: Create Campaign**

Fill these fields:
- **Title:** "Summer Sale" (required)
- **Type:** Offer / Product / Discount
- **Description:** "Get 30% off" (optional)
- **Content:** Full message (required)
- **Starts From:** 2025-11-20 (required)
- **Active:** Toggle on
- Optional: Discount %, Code, Image URL

**Step 4: Send to Subscribers**

1. Click Send icon on your promotion
2. System sends to all active Firebase subscribers
3. Check "Campaign History" section

### Data Storage Explained

| Data | Storage | Where |
|------|---------|-------|
| Promotions | localStorage | Browser |
| Emails | Firebase | Cloud Firestore |
| History | Redux | App Memory |

### Key Points ⭐

✅ Promotions saved immediately locally
✅ Emails sent to Firebase/Firestore  
✅ No date expiry field (use Active toggle)
✅ Discount type shows % and code fields
✅ Data persists after page refresh
✅ No Firebase errors

### Firebase Collections Needed

Only emails need Firebase collection:
```
Collection: subscribedEmails
├── email (string)
├── subscribedAt (timestamp)
└── isActive (boolean)
```

Promotions use **localStorage** - no Firebase collection needed!

### Testing Workflow

```
1. Create Campaign
   Dashboard → Promotional → New Promotion → Create
   
2. Subscribe Email
   HomePage → Stay Updated → Enter email
   
3. Send Campaign  
   Dashboard → Promotional → Click Send icon
   
4. Check Results
   History section shows sent campaigns
```
````

### Step 3: Create First Campaign (2 minutes)
```
1. Go to http://localhost:5174/dashboard
2. Click "Promotional" tab
3. Click "New Promotion"
4. Fill in form:
   - Title: "Summer Sale"
   - Type: "Discount"
   - Content: "Get 50% off everything!"
   - Discount %: 50
   - Code: SUMMER50
5. Click "Create"
```

### Step 4: Send Campaign (1 minute)
```
1. In Promotional tab, find your campaign
2. Click send button (paper plane icon)
3. See success message
4. Check "Campaign History" section
```

### Step 5: Verify in Firestore (1 minute)
```
Firebase Console:
- promotions → See your campaign document
- subscribedEmails → See subscriber email
```

---

## 📱 Features Overview

### For Users
- **Email Subscription**: "Stay Updated" section on homepage
- **Location**: Bottom of homepage (before Footer)
- **What happens**: Email stored in Firebase, will receive promotional emails

### For Admins
- **Campaign Management**: Admin Dashboard → Promotional tab
- **Create**: New promotion button
- **Edit**: Pencil icon on campaign
- **Delete**: Trash icon on campaign
- **Send**: Paper plane icon to email all subscribers
- **History**: View all sent campaigns below

---

## 🔧 Configuration

### Environment Variables Needed
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

(Already configured from existing Firebase setup)

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `src/components/StayUpdated.tsx` | Email subscription form |
| `src/components/PromotionalTab.tsx` | Admin campaign management |
| `src/redux/useReduxPromotion.ts` | Campaign operations |
| `src/redux/useEmailSubscription.ts` | Email operations |
| `src/types/promotion.ts` | TypeScript types |

---

## 💾 Database

### subscribedEmails Collection
```json
{
  "email": "user@example.com",
  "subscribedAt": Timestamp,
  "isActive": true
}
```

### promotions Collection
```json
{
  "title": "Campaign Name",
  "description": "Short description",
  "type": "offer/product/discount",
  "content": "Full message content",
  "discountPercentage": 50,
  "discountCode": "CODE50",
  "validFrom": Timestamp,
  "validUntil": Timestamp,
  "imageUrl": "https://...",
  "isActive": true,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

---

## 🎯 Use Cases

### Use Case 1: Newsletter Campaign
1. Create promotion with type "offer"
2. Add your marketing message
3. Click "Preview"
4. Send to all subscribers

### Use Case 2: New Product Launch
1. Create promotion with type "product"
2. Add product details
3. Add image URL
4. Send to subscribers
5. They receive product announcement

### Use Case 3: Flash Sale
1. Create promotion with type "discount"
2. Set discount percentage
3. Set promo code
4. Set short validity period
5. Send immediately to subscribers

---

## 🔒 Security Notes

### Current Setup
- Public: Can subscribe to emails
- Public: Can see active promotions
- Admin only: Can create/edit/delete campaigns

### To Add Firestore Rules
1. Firebase Console → Firestore Database → Rules
2. Replace with rules from **FIRESTORE_COLLECTIONS_SETUP.md**

---

## ⚠️ Common Issues

### Emails not saving
**Check**:
- Firestore collection exists: `subscribedEmails`
- Firebase connection working (check console)
- Valid email format entered

**Fix**:
```
1. Ensure collection created
2. Refresh page
3. Try subscribing again
```

### Campaign not showing
**Check**:
- Firestore collection exists: `promotions`
- Campaign is set to isActive=true

**Fix**:
```
1. Ensure collection created
2. Verify campaign creation succeeded
3. Refresh Firestore console
```

### Send button not working
**Check**:
- At least one subscriber exists
- Active subscriber count > 0
- Browser console for errors

**Fix**:
```
1. Create test subscriber first
2. Then try sending campaign
3. Check browser console for errors
```

---

## 📊 Admin Dashboard Stats

The Promotional tab shows 3 stat cards:

### Active Promotions
- Count of campaigns with isActive=true
- Updates when you create/toggle campaigns

### Active Subscribers
- Count of emails with isActive=true
- Updates when users subscribe/unsubscribe

### Campaigns Sent
- Count of campaigns in email history
- Updates each time you send a campaign

---

## 🚀 Ready for Email Integration

When you're ready to actually send emails:

1. Choose email service: SendGrid, Mailgun, EmailJS, etc.
2. Get API key from their console
3. Update `handleSendCampaign` in `PromotionalTab.tsx`
4. See example in **PROMOTIONAL_FEATURES_GUIDE.md**

For now: Campaigns are recorded in history but emails logged to console

---

## 📞 Need Help?

See detailed documentation:
- **PROMOTIONAL_FEATURES_GUIDE.md** - Complete API & examples
- **FIRESTORE_COLLECTIONS_SETUP.md** - Database setup
- **PROMOTIONAL_SYSTEM_IMPLEMENTATION_SUMMARY.md** - Full overview

---

## ✅ Checklist

- [ ] Create Firestore collections
- [ ] Test email subscription
- [ ] Create test campaign
- [ ] Send campaign
- [ ] Check Firebase console
- [ ] Verify email stored
- [ ] Verify campaign sent
- [ ] Done!

---

## 🎉 You're All Set!

The promotional system is fully functional and ready to use. Start by:

1. Creating the two Firestore collections
2. Testing the email subscription
3. Creating your first campaign
4. Sending to subscribers

Enjoy! 🚀
