# Forgot Password Feature - Setup Guide

## Overview
A complete forgot password and password reset feature has been implemented using Firebase Authentication. Users can request password resets via email, and Firebase will send them a reset link that they can use to set a new password.

## Features Implemented

### 1. **ForgotPasswordPage** (`src/pages/ForgotPasswordPage.tsx`)
- User enters their registered email address
- Sends a password reset email via Firebase
- Shows success/error messages
- Clean, user-friendly interface
- Input validation and loading states

### 2. **ResetPasswordPage** (`src/pages/ResetPasswordPage.tsx`)
- Handles the reset link from Firebase email
- Token validation
- Password and confirm password fields
- Password strength validation (minimum 6 characters)
- Toggle password visibility
- Redirects to login after successful reset

### 3. **AuthContext Updates** (`src/context/AuthContext.tsx`)
Added two new methods:
```typescript
sendPasswordResetEmail: (email: string) => Promise<void>
confirmPasswordReset: (oobCode: string, newPassword: string) => Promise<void>
```

### 4. **Routes Added** (`src/App.tsx`)
- `/forgot-password` - Forgot password page
- `/reset-password` - Reset password page (with `oobCode` query parameter)

### 5. **UI Enhancement** (`src/pages/LoginPage.tsx`)
- Added "Forgot Password?" link below the password field
- Links to forgot password page

## Environment Variables

Add these to your `.env` file (copy from `.env.example`):

```dotenv
# Password Reset Configuration
VITE_PASSWORD_RESET_URL=https://rachnacreation-2adde.web.app
VITE_PASSWORD_RESET_EMAIL_SUBJECT=Reset Your Password - Kahana
VITE_PASSWORD_RESET_EMAIL_SENDER=noreply@kahana.com

# Email Configuration
VITE_EMAIL_SENDER_NAME=Kahana Team
VITE_EMAIL_SUPPORT_ADDRESS=support@kahana.com
```

### Environment Variable Details:
| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_PASSWORD_RESET_URL` | Base URL for reset links | `https://rachnacreation-2adde.web.app` |
| `VITE_PASSWORD_RESET_EMAIL_SUBJECT` | Subject line for reset emails | `Reset Your Password - Kahana` |
| `VITE_PASSWORD_RESET_EMAIL_SENDER` | Sender email address | `noreply@kahana.com` |
| `VITE_EMAIL_SENDER_NAME` | Name displayed in emails | `Kahana Team` |
| `VITE_EMAIL_SUPPORT_ADDRESS` | Support email for inquiries | `support@kahana.com` |

## How It Works

### User Flow:

1. **User Forgets Password**
   - Clicks "Forgot Password?" on login page
   - Navigates to `/forgot-password`

2. **Request Reset**
   - Enters their registered email
   - Clicks "Send Reset Link"
   - Firebase sends a password reset email

3. **Email Contains Reset Link**
   - Email is sent from Firebase
   - Link format: `https://rachnacreation-2adde.web.app/reset-password?oobCode=...`
   - `oobCode` is the reset token from Firebase

4. **User Clicks Reset Link**
   - Navigates to `/reset-password` with `oobCode` query parameter
   - Page validates the token

5. **Reset Password**
   - User enters new password (minimum 6 characters)
   - Confirms new password
   - Clicks "Reset Password"
   - Password is updated in Firebase
   - User is redirected to login page

6. **Login with New Password**
   - User can now login with new credentials

## Technical Details

### Firebase Configuration
- Uses Firebase Authentication's built-in password reset functionality
- No custom email service required (Firebase handles email delivery)
- Reset links are secure and expire after a set time

### Security Features
- Password reset tokens are time-limited
- Tokens can only be used once
- Passwords must be at least 6 characters
- No sensitive data is logged

### Error Handling
- User-friendly error messages
- Validation on both client and server side
- Toast notifications for feedback
- Graceful handling of expired/invalid tokens

## File Structure

```
src/
├── pages/
│   ├── ForgotPasswordPage.tsx     (NEW) - Forgot password form
│   ├── ResetPasswordPage.tsx      (NEW) - Password reset form
│   └── LoginPage.tsx             (MODIFIED) - Added forgot password link
├── context/
│   └── AuthContext.tsx           (MODIFIED) - Added reset functions
└── App.tsx                       (MODIFIED) - Added routes
```

## Testing

### Test Forgot Password:
1. Go to `/login`
2. Click "Forgot Password?"
3. Enter a valid email address from your Firebase database
4. Check the email inbox for reset link
5. Click the reset link in the email

### Test Reset Password:
1. Click the reset link from the email
2. You should be redirected to `/reset-password?oobCode=...`
3. Enter a new password (6+ characters)
4. Confirm the password
5. Click "Reset Password"
6. You should be redirected to `/login`
7. Try logging in with the new password

## Firebase Configuration Required

Ensure your Firebase project has email verification enabled:

1. Go to Firebase Console
2. Navigate to Authentication → Sign-in method
3. Enable "Email/Password" provider
4. Configure email templates for password reset (optional - Firebase provides defaults)

## Customization

### Customize Email Template (Optional)
In Firebase Console:
1. Go to Authentication → Templates
2. Edit the "Password reset" email template
3. Customize the message and styling
4. Include `%LINK%` placeholder for reset URL

### Change Reset URL
If you want to customize the reset URL format, update the `sendPasswordResetEmailHandler` function in `AuthContext.tsx`:

```typescript
const passwordResetUrl = import.meta.env.VITE_PASSWORD_RESET_URL || window.location.origin;

await sendPasswordResetEmail(auth, email, {
  url: `${passwordResetUrl}/reset-password`, // Customize this path
  handleCodeInApp: false,
});
```

## Deployment

When deploying to production:

1. Update `VITE_PASSWORD_RESET_URL` to your production domain
2. Ensure Firebase is configured for your production domain
3. Test the entire flow in production

Example for production:
```dotenv
VITE_PASSWORD_RESET_URL=https://yourdomain.com
VITE_PASSWORD_RESET_EMAIL_SUBJECT=Reset Your Password - Your App Name
VITE_PASSWORD_RESET_EMAIL_SENDER=noreply@yourdomain.com
```

## API Reference

### AuthContext Methods

#### `sendPasswordResetEmail(email: string)`
Sends a password reset email to the specified email address.

**Parameters:**
- `email` (string): The user's email address

**Throws:** Error if email not found or other Firebase errors

**Example:**
```typescript
const { sendPasswordResetEmail } = useAuth();

try {
  await sendPasswordResetEmail("user@example.com");
  toast.success("Reset email sent!");
} catch (error) {
  console.error("Error:", error.message);
}
```

#### `confirmPasswordReset(oobCode: string, newPassword: string)`
Confirms the password reset with the reset token and new password.

**Parameters:**
- `oobCode` (string): The reset token from the reset link
- `newPassword` (string): The new password (minimum 6 characters)

**Throws:** Error if token is invalid/expired or password validation fails

**Example:**
```typescript
const { confirmPasswordReset } = useAuth();

try {
  await confirmPasswordReset("reset-token", "newPassword123");
  toast.success("Password reset successfully!");
} catch (error) {
  console.error("Error:", error.message);
}
```

## Troubleshooting

### Issue: "Email not found"
- Ensure the email is registered in Firebase
- Check email spelling

### Issue: "Invalid reset link"
- Reset links expire after 24 hours
- User needs to request a new reset email
- Check URL has `oobCode` parameter

### Issue: "Password reset failed"
- Password might be too short (minimum 6 characters)
- Check Firebase project is properly configured
- Verify network connection

### Issue: "Email not received"
- Check spam/junk folder
- Verify email address is correct
- Allow Firebase to send emails in your email provider's settings
- Check Firebase project has email sending configured

## Future Enhancements

1. **Custom Email Templates**: Create branded email templates
2. **Email Notifications**: Send confirmation after password reset
3. **Security Alerts**: Notify user when password is changed
4. **Recovery Codes**: Generate backup recovery codes
5. **Two-Factor Authentication**: Add 2FA for extra security
6. **Password Requirements**: Enforce stronger password policies

## Support

For issues or questions:
- Check Firebase documentation: https://firebase.google.com/docs/auth
- Review error messages in browser console
- Check your Firebase project configuration
- Verify environment variables are set correctly
