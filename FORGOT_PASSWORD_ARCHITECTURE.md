# Forgot Password Feature - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐    ┌──────────────────┐    ┌─────────────┐  │
│  │   LoginPage      │    │ ForgotPassword   │    │  ResetPass  │  │
│  │                  │───▶│      Page        │───▶│    Page     │  │
│  └──────────────────┘    └──────────────────┘    └─────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         AuthContext (Authentication Logic)                   │  │
│  │                                                              │  │
│  │  • login()                                                  │  │
│  │  • signup()                                                 │  │
│  │  • logout()                                                 │  │
│  │  • sendPasswordResetEmail() ◄─── NEW                        │  │
│  │  • confirmPasswordReset()   ◄─── NEW                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ API Calls
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                 Firebase Authentication                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  • signInWithEmailAndPassword()                                    │
│  • createUserWithEmailAndPassword()                                │
│  • signOut()                                                       │
│  • sendPasswordResetEmail() ◄─── NEW                               │
│  • confirmPasswordReset()   ◄─── NEW                               │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ Email Service
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                   Email Delivery Service                            │
│                    (Firebase Built-in)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Sends password reset emails with secure reset links               │
│  Subject: ${VITE_PASSWORD_RESET_EMAIL_SUBJECT}                    │
│  From: ${VITE_PASSWORD_RESET_EMAIL_SENDER}                         │
│  Reset Link Format:                                                │
│  ${VITE_PASSWORD_RESET_URL}/reset-password?oobCode={TOKEN}        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
User Action                Component              AuthContext           Firebase
─────────────────────────────────────────────────────────────────────────────

1. Click "Forgot Pwd?"
    │
    └──────────────────────────────────────────────────────────────────▶
                               ForgotPasswordPage

2. Enter Email & Submit
    │
    └──────────────────▶ sendPasswordResetEmail()
                               │
                               └──────────────────────────────────────▶
                                           Firebase
                                               │
                                               ├─ Verify email exists
                                               ├─ Generate reset token
                                               └─ Send email with reset link

3. Firebase sends Email
                                               │
                                    [User receives email]
                                               │

4. User clicks reset link
                                               │
                                   Redirects to:
                                   /reset-password?oobCode={TOKEN}
                                               │
    ◀─────────────────────────────────────────┘
                               ResetPasswordPage
                               │ (Validates token)
                               └─ Token is valid ✓

5. Enter new password & submit
    │
    └──────────────────▶ confirmPasswordReset(token, password)
                               │
                               └──────────────────────────────────────▶
                                           Firebase
                                               │
                                               ├─ Validate token
                                               ├─ Validate password
                                               └─ Update user password

6. Password updated ✓
                                               │
    ◀─────────────────────────────────────────┘
                     Success! Redirect to /login

7. User logs in with new password
    │
    └──────────────────▶ login(email, newPassword)
                               │
                               └──────────────────────────────────────▶
                                           Firebase
                                               │
                                      Authenticates user ✓
```

## Component Hierarchy

```
App
├── RootLayout
│   ├── AuthProvider
│   │   ├── Navbar
│   │   ├── Sidebar
│   │   └── MainLayout
│   │       └── Routes
│   │           ├── HomePage
│   │           ├── LoginPage (has "Forgot Pwd?" link)
│   │           ├── SignUpPage
│   │           ├── ForgotPasswordPage ◄─── NEW
│   │           │   └── (calls sendPasswordResetEmail)
│   │           ├── ResetPasswordPage ◄─── NEW
│   │           │   └── (calls confirmPasswordReset)
│   │           ├── CartPage
│   │           ├── OrdersPage
│   │           ├── DashboardPage
│   │           └── ... other routes
│   └── Footer
```

## Route Structure

```
Routes:
│
├── / (HomePage)
│
├── /login (LoginPage)
│   └── [link to] /forgot-password
│
├── /forgot-password (ForgotPasswordPage) ◄─── NEW
│   ├── Input: email
│   ├── Action: sendPasswordResetEmail(email)
│   └── Redirect: Stays on page with success message
│
├── /reset-password (ResetPasswordPage) ◄─── NEW
│   ├── Query Param: ?oobCode={token}
│   ├── Input: newPassword, confirmPassword
│   ├── Action: confirmPasswordReset(token, password)
│   └── Redirect: /login (on success)
│
├── /signup (SignUpPage)
├── /categories (CategoriesPage)
├── /product/:id (ProductDetails)
├── /search (SearchPage)
├── /cart (CartPage) [Protected]
├── /orders (OrdersPage) [Protected]
├── /payment (PaymentPage) [Protected]
├── /contact (ContactPage)
└── /dashboard (DashboardPage) [Protected, Admin]
```

## Authentication State Management

```
Firebase Auth State
        │
        └──▶ onAuthStateChanged()
            │
            ├─ No user logged in
            │  └─ user = null
            │
            └─ User logged in
               └─ Fetch from Firestore
                  └─ Set user with:
                     ├── uid
                     ├── email
                     ├── displayName
                     ├── role
                     ├── createdAt
                     └── lastLogin

AuthContext manages this state and provides:
├── user (User | null)
├── loading (boolean)
├── login()
├── signup()
├── logout()
├── sendPasswordResetEmail() ◄─── NEW
└── confirmPasswordReset()   ◄─── NEW
```

## Email Reset Token Lifecycle

```
Time →

[T0: User requests reset]
        │
        ▼
[T1: Firebase generates token]
        │
        ├─ Token expires in: 24 hours (Firebase default)
        │
        ▼
[T2: Email sent with reset link]
        │
        ├─ Link: .../reset-password?oobCode={TOKEN}
        │
        ▼
[T3: User clicks link and arrives at reset page]
        │
        ├─ Page validates token
        ├─ Token valid? Yes → Show reset form
        │                  No → Show error
        │
        ▼
[T4: User submits new password]
        │
        ├─ Firebase validates token (still valid?)
        ├─ Firebase validates password (6+ chars)
        ├─ Firebase updates password
        ├─ Token becomes invalid (one-time use)
        │
        ▼
[T5: User redirected to login]
        │
        └─ User can now login with new password
```

## State Transitions

```
┌─────────────────────────────────────────────┐
│  ForgotPasswordPage States                  │
├─────────────────────────────────────────────┤
│                                             │
│  [Initial]                                  │
│    └─ email: ""                            │
│    └─ error: ""                            │
│    └─ loading: false                       │
│    └─ success: ""                          │
│       │                                    │
│       ├─ User enters email                 │
│       │  └─ [Email Entered]               │
│       │     └─ email: "user@example.com"  │
│       │        │                          │
│       │        └─ User clicks submit      │
│       │           └─ [Submitting]         │
│       │              └─ loading: true     │
│       │                 │                 │
│       │                 ├─ Email found    │
│       │                 │  └─ [Success]   │
│       │                 │     └─ success message shown
│       │                 │     └─ Email sent
│       │                 │                 │
│       │                 └─ Email not found│
│       │                    └─ [Error]     │
│       │                       └─ error message shown
│       │                                    │
│       └─ User navigates away              │
│          └─ [Initial] (reset)            │
│                                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  ResetPasswordPage States                   │
├─────────────────────────────────────────────┤
│                                             │
│  [Loading Token]                            │
│    └─ Validate oobCode from URL            │
│       │                                    │
│       ├─ Token valid                       │
│       │  └─ [Reset Form Ready]            │
│       │     └─ password: ""               │
│       │     └─ confirmPassword: ""        │
│       │     └─ error: ""                  │
│       │        │                          │
│       │        └─ User enters passwords   │
│       │           └─ User clicks submit   │
│       │              └─ [Submitting]      │
│       │                 └─ loading: true  │
│       │                    │              │
│       │                    ├─ Success     │
│       │                    │  └─ [Reset Successful]
│       │                    │     └─ Redirect to /login
│       │                    │              │
│       │                    └─ Error       │
│       │                       └─ [Error]  │
│       │                          └─ error message shown
│       │                                   │
│       └─ Token invalid/expired            │
│          └─ [Invalid Token]              │
│             └─ Show error page           │
│             └─ Offer to request new reset│
│                                             │
└─────────────────────────────────────────────┘
```

## Env Variables Flow

```
.env File
    │
    ├─ VITE_PASSWORD_RESET_URL
    │  └─ Used in AuthContext
    │     └─ sendPasswordResetEmailHandler()
    │        └─ Constructs reset URL
    │
    ├─ VITE_PASSWORD_RESET_EMAIL_SUBJECT
    │  └─ (For documentation/custom email templates)
    │
    ├─ VITE_PASSWORD_RESET_EMAIL_SENDER
    │  └─ (For documentation/email configuration)
    │
    ├─ VITE_EMAIL_SENDER_NAME
    │  └─ (For documentation/email configuration)
    │
    └─ VITE_EMAIL_SUPPORT_ADDRESS
       └─ (For documentation/support information)
```

## Error Handling Flow

```
User Action
    │
    ▼
API Call (Firebase)
    │
    ├─ Success ✓
    │  └─ Update state
    │     └─ Show success message (toast)
    │        └─ (Optional) Redirect
    │
    └─ Error ✗
       └─ Catch error
          │
          ├─ Error message parsing
          │
          ├─ Set error state
          │
          ├─ Show error message (alert + toast)
          │
          └─ Log error (console)
             │
             └─ User can retry or navigate away
```

## Security Layers

```
┌──────────────────────────────────────────────┐
│      Client-Side Validation                  │
├──────────────────────────────────────────────┤
│ • Email format validation                   │
│ • Password minimum length (6 chars)         │
│ • Password confirmation matching           │
│ • Token presence check                     │
└──────────────────────────────────────────────┘
        │
        ▼ if valid
        │
┌──────────────────────────────────────────────┐
│  Firebase Server-Side Validation             │
├──────────────────────────────────────────────┤
│ • Token signature verification              │
│ • Token expiration check (24 hours)         │
│ • Email existence check                    │
│ • Password policy enforcement               │
│ • One-time token use enforcement           │
│ • HTTPS requirement                        │
└──────────────────────────────────────────────┘
        │
        ▼ if valid
        │
┌──────────────────────────────────────────────┐
│  Password Updated Securely                   │
├──────────────────────────────────────────────┤
│ • Hashed with Firebase's algorithm          │
│ • Old password invalidated                  │
│ • All sessions may require re-login         │
│ • Audit log created                         │
└──────────────────────────────────────────────┘
```

## Integration Points

```
Forgot Password Feature integrates with:
│
├── Firebase Auth
│   ├── sendPasswordResetEmail()
│   └── confirmPasswordReset()
│
├── Firebase Firestore
│   └── User data retrieval
│
├── React Router
│   ├── Route: /forgot-password
│   └── Route: /reset-password
│
├── React Hot Toast
│   ├── Success notifications
│   └── Error notifications
│
└── UI Components
    ├── Input fields
    ├── Buttons
    ├── Error/success alerts
    └── Loading spinners
```
