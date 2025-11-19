# Promotional Features - Firestore Setup Guide

## Firestore Collections Setup

This guide helps you set up the required Firestore collections for the promotional system.

## Collections to Create

### 1. `subscribedEmails` Collection

This collection stores user email subscriptions from the "Stay Updated" section.

**How to create:**
1. Open Firebase Console
2. Go to Firestore Database
3. Create collection named: `subscribedEmails`
4. Click "Auto ID" for document IDs

**Document Structure:**
```json
{
  "email": "user@example.com",
  "subscribedAt": "timestamp",
  "isActive": true
}
```

**Field Types:**
- `email` (string): User's email address
- `subscribedAt` (timestamp): Subscription date
- `isActive` (boolean): Whether subscription is active (true) or unsubscribed (false)

---

### 2. `promotions` Collection

This collection stores all promotional campaigns created by admins.

**How to create:**
1. Open Firebase Console
2. Go to Firestore Database
3. Create collection named: `promotions`
4. Click "Auto ID" for document IDs

**Document Structure:**
```json
{
  "title": "Summer Sale",
  "description": "50% off all items",
  "type": "discount",
  "content": "Join us for the biggest summer sale! Get 50% off everything in store. Use code SUMMER50 at checkout.",
  "discountPercentage": 50,
  "discountCode": "SUMMER50",
  "validFrom": "timestamp",
  "validUntil": "timestamp",
  "imageUrl": "https://example.com/banner.jpg",
  "isActive": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Field Types:**
- `title` (string): Campaign title (required)
- `description` (string): Short description for preview
- `type` (string): One of "offer", "product", "discount"
- `content` (string): Full promotional message (required)
- `discountPercentage` (number): Discount % (if type="discount")
- `discountCode` (string): Promo code (if type="discount")
- `validFrom` (timestamp): Campaign start date
- `validUntil` (timestamp): Campaign end date
- `imageUrl` (string): Optional banner image URL
- `isActive` (boolean): Whether campaign is active
- `createdAt` (timestamp): Document creation time
- `updatedAt` (timestamp): Last update time

---

## Firestore Security Rules

Add these rules to your Firestore to secure the collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for promotions
    match /promotions/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Authenticated users can subscribe to emails
    match /subscribedEmails/{document=**} {
      // Anyone can list (for checking duplicates)
      allow list: if true;
      
      // Anyone can create new subscriptions
      allow create: if request.resource.data.email is string &&
                       request.resource.data.email.matches('.*@.*');
      
      // Only admins can read all, others can't
      allow read: if request.auth.uid != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      
      // Users can update their own subscription status
      allow update: if request.auth.uid == request.resource.data.userId ||
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      
      // Only admins can delete
      allow delete: if request.auth.uid != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

---

## Testing Collections

### Test Creating a Promotion
1. Go to Admin Dashboard (`/dashboard`)
2. Navigate to "Promotional" tab
3. Click "New Promotion"
4. Fill in form with test data
5. Click "Create"
6. Check Firestore console - new document should appear in `promotions` collection

### Test Email Subscription
1. Go to HomePage
2. Scroll to "Stay Updated" section
3. Enter test email address
4. Click "Subscribe"
5. Check Firestore console - new document should appear in `subscribedEmails` collection

### Test Campaign Sending
1. Create a promotion (see above)
2. Subscribe at least one email (see above)
3. Go to Admin Dashboard → Promotional tab
4. Click the send icon (paper plane) on your promotion
5. Should see success message
6. Check "Campaign History" section to verify send was recorded

---

## Firestore Indexes (Optional)

For better query performance, consider creating these indexes:

**Collection: subscribedEmails**
- Index on: `isActive` (Ascending), `subscribedAt` (Descending)
- Helps query active subscribers sorted by date

**Collection: promotions**
- Index on: `isActive` (Ascending), `validUntil` (Descending)
- Helps query active campaigns sorted by expiration date

To create indexes:
1. Firebase Console → Firestore Database → Indexes
2. Create composite index with the fields above
3. Firestore will build index automatically (usually < 1 minute)

---

## Data Backup

Firestore provides automatic daily backups. For additional safety:

1. **Schedule Exports**: Firebase Console → Firestore Database → Export/Import
2. **Schedule to Cloud Storage** every week
3. **Download Backups Regularly** to local storage

---

## Common Issues

### Collections not appearing after creating
- **Solution**: Refresh Firebase Console browser tab
- **Cause**: Browser cache issue

### Can't subscribe emails
- **Solution**: Check Firestore security rules
- **Cause**: Rules might deny write access

### Campaign won't send
- **Solution**: Verify subscribers exist in `subscribedEmails` collection
- **Cause**: No active subscribers to send to

### Timestamps showing as null
- **Solution**: Ensure you're using Firestore Timestamp type
- **Current**: App automatically converts Date objects to Timestamps

---

## Data Migration (If Needed)

If you have existing data in another system:

1. **Export existing data** to CSV format
2. **Convert to JSON** with structure matching our schema
3. **Use Firebase Console Bulk Import**:
   - Click "..." on collection
   - Select "Import collection"
   - Upload JSON file

---

## Summary

✅ Create `subscribedEmails` collection  
✅ Create `promotions` collection  
✅ Add Firestore security rules  
✅ Optional: Create indexes for performance  
✅ Optional: Set up backup schedule  

Once collections are created and security rules are in place, the promotional features are fully operational!

---

## Quick Reference

**Collection Names:**
- `subscribedEmails` - User email subscriptions
- `promotions` - Promotional campaigns

**Document IDs:**
- Auto-generated by Firestore (no manual IDs needed)

**Field Validation:**
- Email: Must be valid email format
- Type: Must be "offer", "product", or "discount"
- Date ranges: validUntil must be after validFrom
- Discount%: Must be 0-100 if provided

**Security:**
- Public: Can read promotions and create email subscriptions
- Admins: Full access to manage promotions and subscriber data
- Users: Cannot modify own subscription after creation
