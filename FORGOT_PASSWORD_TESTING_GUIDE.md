# Forgot Password Feature - Testing Guide

## Testing Checklist

### Pre-Testing Setup
- [ ] Ensure you have a registered user account in Firebase
- [ ] Firebase Authentication is enabled in your project
- [ ] Email/Password provider is active in Firebase Console
- [ ] Your domain is authorized for redirects in Firebase
- [ ] Environment variables are set in `.env` file
- [ ] Application is running (dev or production)

## Manual Testing Scenarios

### Scenario 1: Happy Path - Successful Password Reset

**Prerequisites:**
- Access to a registered email account in the system
- Email inbox access

**Steps:**
1. Open the application login page (`/login`)
2. Click "Forgot Password?" link
3. Verify you're on the "Forgot Password" page (`/forgot-password`)
4. Enter your registered email address
5. Click "Send Reset Link" button
6. Observe:
   - [ ] Loading spinner appears during submission
   - [ ] Success message is displayed
   - [ ] Toast notification shows success
   - [ ] Email is received (check inbox)
7. Check your email inbox
8. Open the password reset email
9. Click the reset link in the email
10. Verify you're redirected to reset password page (`/reset-password?oobCode=...`)
11. Verify page shows "Reset Password" form
12. Enter a new password (minimum 6 characters)
13. Confirm the password (must match)
14. Click "Reset Password" button
15. Observe:
    - [ ] Loading spinner appears
    - [ ] Success message or redirect occurs
    - [ ] You're redirected to login page
16. Wait for redirect to complete
17. Verify you're on login page
18. Try logging in with:
    - [ ] Old password → Should fail
    - [ ] New password → Should succeed
19. Verify you're successfully logged in

**Expected Result:** ✅ Password is reset and user can login with new password

---

### Scenario 2: Validation - Invalid Email

**Steps:**
1. Go to `/forgot-password`
2. Enter a non-existent email address
3. Click "Send Reset Link"
4. Observe:
   - [ ] Request is sent to Firebase
   - [ ] Firebase returns an error (email not found)
   - [ ] Error message is displayed to user
   - [ ] Toast notification shows error
5. Verify error message is user-friendly (not technical)

**Expected Result:** ✅ Error is handled gracefully with helpful message

---

### Scenario 3: Validation - Empty Email

**Steps:**
1. Go to `/forgot-password`
2. Leave email field empty
3. Click "Send Reset Link"
4. Observe:
   - [ ] Client-side validation triggers
   - [ ] Error message appears (no API call made)
   - [ ] No toast notification (client-side validation)

**Expected Result:** ✅ Client-side validation prevents empty submission

---

### Scenario 4: Password Validation - Too Short

**Prerequisites:**
- Valid reset token in URL

**Steps:**
1. Go to `/reset-password?oobCode={valid_token}`
2. Enter password with fewer than 6 characters (e.g., "12345")
3. Confirm with same password
4. Click "Reset Password"
5. Observe:
   - [ ] Client-side validation message appears
   - [ ] Error: "Password must be at least 6 characters long"
   - [ ] No API call is made

**Expected Result:** ✅ Short passwords are rejected with helpful message

---

### Scenario 5: Password Mismatch

**Prerequisites:**
- Valid reset token in URL

**Steps:**
1. Go to `/reset-password?oobCode={valid_token}`
2. Enter password "Password123"
3. Enter different confirmation "Password456"
4. Click "Reset Password"
5. Observe:
   - [ ] Client-side validation triggers
   - [ ] Error: "Passwords do not match"
   - [ ] Form is not submitted

**Expected Result:** ✅ Password mismatch is caught before submission

---

### Scenario 6: Expired Reset Link

**Prerequisites:**
- Reset token that has expired (older than 24 hours)

**Steps:**
1. Go to `/reset-password?oobCode={expired_token}`
2. Observe:
   - [ ] Page shows "Invalid Reset Link" error
   - [ ] Message explains link is expired
   - [ ] Button to "Request New Reset Link"
3. Click "Request New Reset Link"
4. Verify redirect to `/forgot-password`

**Expected Result:** ✅ Expired tokens are handled gracefully

---

### Scenario 7: Invalid Reset Token

**Prerequisites:**
- Invalid/tampered reset token in URL

**Steps:**
1. Go to `/reset-password?oobCode=invalid_or_tampered_token`
2. Observe:
   - [ ] Page detects invalid token
   - [ ] Error message is displayed
   - [ ] Reset form is not shown
   - [ ] Option to request new reset link is provided

**Expected Result:** ✅ Invalid tokens are rejected

---

### Scenario 8: Missing Reset Token

**Steps:**
1. Go to `/reset-password` (without oobCode parameter)
2. Observe:
   - [ ] Page shows error (missing token)
   - [ ] Reset form is not shown
   - [ ] User can request new reset link

**Expected Result:** ✅ Missing tokens are handled

---

### Scenario 9: UI/UX - Password Visibility Toggle

**Prerequisites:**
- On `/reset-password` page with valid token

**Steps:**
1. Look at password input field
2. Click eye icon next to password field
3. Observe:
   - [ ] Password becomes visible (shows characters)
   - [ ] Icon changes to indicate visibility
4. Click eye icon again
5. Observe:
   - [ ] Password becomes hidden (shows dots)
   - [ ] Icon changes back

**Expected Result:** ✅ Password visibility toggle works correctly

---

### Scenario 10: UI/UX - Responsive Design

**Mobile Testing:**
1. Open `/forgot-password` on mobile device (320px width)
2. Observe:
   - [ ] Layout is readable
   - [ ] Form fields are full width
   - [ ] Button is easily clickable
   - [ ] No horizontal scrolling
3. Repeat for `/reset-password`

**Tablet Testing:**
1. Open on tablet (768px width)
2. Observe:
   - [ ] Proper spacing
   - [ ] Readable text
   - [ ] Good form layout

**Desktop Testing:**
1. Open on desktop (1440px+ width)
2. Observe:
   - [ ] Centered layout
   - [ ] Proper form width
   - [ ] Good visual hierarchy

**Expected Result:** ✅ Responsive design works on all device sizes

---

### Scenario 11: UI/UX - Error Messages

**Steps:**
1. Trigger various errors (empty email, invalid email, etc.)
2. Observe:
   - [ ] Error messages are clear and helpful
   - [ ] Error messages are not technical
   - [ ] Color indicates error (red)
   - [ ] Icon indicates error
   - [ ] Messages suggest next steps

**Expected Result:** ✅ All error messages are user-friendly

---

### Scenario 12: Navigation Flow

**Steps:**
1. From `/forgot-password`, click "Back to Login" link
2. Verify redirect to `/login`
3. From reset email link, verify automatic redirect to `/reset-password`
4. After successful reset, verify automatic redirect to `/login`
5. From login page, verify "Forgot Password?" link works

**Expected Result:** ✅ Navigation flows smoothly between pages

---

### Scenario 13: Success Messages

**Steps:**
1. Successfully send reset email
2. Observe:
   - [ ] Success message is displayed
   - [ ] Message shows email address
   - [ ] Toast notification appears
   - [ ] Message auto-clears after 10 seconds
3. Click "Reset Password" successfully
4. Observe:
   - [ ] Success message appears
   - [ ] Toast notification shows success
   - [ ] Auto-redirect to login occurs

**Expected Result:** ✅ Success feedback is clear and helpful

---

### Scenario 14: Loading States

**Steps:**
1. Trigger API calls (send reset email, confirm reset)
2. Observe:
   - [ ] Button text changes to "Sending..." or "Resetting..."
   - [ ] Loading spinner appears in button
   - [ ] Button is disabled during request
   - [ ] Cannot submit multiple times
3. After response:
   - [ ] Button returns to normal state
   - [ ] Spinner disappears
   - [ ] Button becomes enabled again

**Expected Result:** ✅ Loading states provide clear feedback

---

## Browser Compatibility Testing

Test on these browsers:

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | Latest | | |
| Firefox | Latest | | |
| Safari | Latest | | |
| Edge | Latest | | |
| Mobile Safari (iOS) | Latest | | |
| Chrome Mobile (Android) | Latest | | |

---

## Email Testing

### Email Content Check
When you receive the reset email:
- [ ] Email subject is correct
- [ ] Email is from correct sender
- [ ] Reset link is present
- [ ] Link format is correct
- [ ] Email is not in spam folder
- [ ] Email loads properly in email client

### Email Link Testing
- [ ] Reset link is clickable
- [ ] Link contains oobCode parameter
- [ ] Link redirects to correct page
- [ ] Link works from different email clients

---

## Firebase Console Verification

After testing, verify in Firebase Console:

1. Go to Firebase Console → Authentication
2. Click on the test user
3. Verify:
   - [ ] Password was updated (in Recent security events)
   - [ ] Last sign-in time is recent
   - [ ] No suspicious activities

---

## Performance Testing

**Page Load Times:**
- [ ] ForgotPasswordPage loads in < 2 seconds
- [ ] ResetPasswordPage loads in < 2 seconds
- [ ] Reset email sends in < 3 seconds
- [ ] Password confirmation in < 2 seconds

**Network Requests:**
- [ ] Only necessary API calls are made
- [ ] No duplicate requests
- [ ] Requests are properly canceled if user navigates away

---

## Security Testing

### Password Security
- [ ] New passwords are hashed in Firebase
- [ ] Old password becomes invalid
- [ ] User can't see password in console logs
- [ ] HTTPS is enforced for all requests

### Token Security
- [ ] Reset links expire after 24 hours
- [ ] Tokens can only be used once
- [ ] Tokens can't be reused
- [ ] Token is secure (not easily guessable)

### Session Security
- [ ] User session not affected by password reset
- [ ] Existing sessions may require re-login (Firebase behavior)
- [ ] No session hijacking possible

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all form fields
- [ ] All buttons are reachable via keyboard
- [ ] Can submit form with Enter key
- [ ] Tab order is logical

### Screen Reader Testing
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Buttons have proper labels

### Color Contrast
- [ ] Text has sufficient contrast
- [ ] Error colors meet WCAG standards
- [ ] All text is readable

---

## Test Results Template

Copy and use this template to document your testing:

```
Date: _______________
Tester: _______________
Environment: [Development/Production] [Browser] [Device]

Scenario 1: Happy Path
Result: [ ] PASS [ ] FAIL
Notes: _______________

Scenario 2: Invalid Email
Result: [ ] PASS [ ] FAIL
Notes: _______________

[... continue for all scenarios ...]

Overall Status: [ ] ALL PASS [ ] SOME FAILED [ ] CRITICAL ISSUES

Issues Found:
1. _______________
2. _______________

Recommendations:
_______________
```

---

## Debugging Tips

### Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for any JavaScript errors
4. Check for warnings
5. Verify API calls in Network tab

### Firebase Console
1. Go to Firebase Console
2. Check Authentication logs
3. Look for failed login attempts
4. Verify email delivery status

### Common Issues

**Issue: Email not received**
- Check spam folder
- Verify email address
- Check Firebase email sending logs
- Verify Firebase is configured for your domain

**Issue: Reset link not working**
- Check if link is complete with oobCode
- Verify link hasn't expired
- Check if using same domain as configured in Firebase
- Try clicking link in different email client

**Issue: "Invalid reset link" error**
- Verify oobCode parameter is present in URL
- Check if token has expired
- Try requesting new reset email

---

## Sign-Off

Once all tests pass, have them reviewed by:
- [ ] Developer
- [ ] QA Tester
- [ ] Product Owner

---

## Continuous Testing

After deployment:
- [ ] Monitor error logs
- [ ] Check for user complaints
- [ ] Test periodically (weekly)
- [ ] Update if Firebase changes
- [ ] Test after any code changes
