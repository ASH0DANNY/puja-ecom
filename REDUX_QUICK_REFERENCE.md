# Redux Quick Reference Card

## Installation & Setup
```bash
npm install @reduxjs/toolkit react-redux
```

## App Wrapping (Done in App.tsx)
```typescript
import { Provider } from "react-redux";
import { store } from "./redux/store";

function App() {
  return (
    <Provider store={store}>
      {/* Your app */}
    </Provider>
  );
}
```

## Core Hooks

### useAppDispatch
```typescript
const dispatch = useAppDispatch();
dispatch(actionCreator(payload));
```

### useAppSelector
```typescript
const state = useAppSelector(selectSliceName);
// Or use pre-built selectors:
const user = useAppSelector(selectUser);
const items = useAppSelector(selectCartItems);
```

## Custom Hooks (Recommended)

### useReduxAuth
```typescript
const { user, login, signup, logout, sendPasswordResetEmail } = useReduxAuth();
```

### useReduxCart
```typescript
const { 
  items, 
  addToCart, 
  removeFromCart, 
  updateQuantity,
  clearCart,
  applyDiscount,
  removeDiscount 
} = useReduxCart();
```

### useReduxDiscount
```typescript
const { 
  activeDiscounts,
  validateDiscount,
  applyDiscount,
  refreshDiscounts
} = useReduxDiscount();
```

## Common Patterns

### Access State Only
```typescript
import { useAppSelector } from "@/redux/hooks";
import { selectUser } from "@/redux/hooks";

function MyComponent() {
  const user = useAppSelector(selectUser);
  return <div>{user?.email}</div>;
}
```

### Dispatch Action Only
```typescript
import { useAppDispatch } from "@/redux/hooks";
import { clearUser } from "@/redux/slices/authSlice";

function LogoutButton() {
  const dispatch = useAppDispatch();
  return <button onClick={() => dispatch(clearUser())}>Logout</button>;
}
```

### Use Custom Hook
```typescript
import { useReduxAuth } from "@/redux/useReduxAuth";

function LoginForm() {
  const { login } = useReduxAuth();
  // Use login function
}
```

## State Structure

```typescript
{
  auth: {
    user: User | null,
    loading: boolean,
    error: string | null,
    isAuthenticated: boolean
  },
  cart: {
    items: CartItem[],
    discountCode: string | null,
    discount: number,
    subtotal: number,
    total: number,
    showAnimation: boolean
  },
  discount: {
    activeDiscounts: Discount[],
    loading: boolean,
    error: string | null
  }
}
```

## File Locations

```
src/redux/
├── store.ts                      # Store config
├── hooks.ts                      # useAppDispatch, useAppSelector, selectors
├── slices/
│   ├── authSlice.ts             # Auth state & actions
│   ├── cartSlice.ts             # Cart state & actions
│   └── discountSlice.ts         # Discount state & actions
├── AuthReduxInitializer.tsx     # Auth initializer
├── CartReduxInitializer.tsx     # Cart initializer
├── DiscountReduxInitializer.tsx # Discount initializer
├── useReduxAuth.ts              # Auth operations hook
├── useReduxCart.ts              # Cart operations hook
└── useReduxDiscount.ts          # Discount operations hook
```

## All Selectors

```typescript
// Auth
selectUser
selectAuthLoading
selectAuthError
selectIsAuthenticated

// Cart
selectCartItems
selectCartTotal
selectCartSubtotal
selectCartDiscount
selectDiscountCode
selectShowCartAnimation

// Discount
selectActiveDiscounts
selectDiscountLoading
selectDiscountError
```

## Common Imports

```typescript
// Hooks
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

// Selectors
import { 
  selectUser, 
  selectCartItems, 
  selectCartTotal,
  selectActiveDiscounts 
} from "@/redux/hooks";

// Actions
import { 
  setUser, 
  clearUser, 
  addToCart, 
  removeFromCart,
  applyDiscount 
} from "@/redux/slices/[sliceName]";

// Custom Hooks
import { useReduxAuth } from "@/redux/useReduxAuth";
import { useReduxCart } from "@/redux/useReduxCart";
import { useReduxDiscount } from "@/redux/useReduxDiscount";
```

## Component Example Template

```typescript
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectUser, selectCartItems } from "@/redux/hooks";
import { useReduxAuth } from "@/redux/useReduxAuth";
import { useReduxCart } from "@/redux/useReduxCart";

function MyComponent() {
  // Access state
  const user = useAppSelector(selectUser);
  const items = useAppSelector(selectCartItems);
  
  // Get actions from custom hooks
  const { logout } = useReduxAuth();
  const { addToCart, removeFromCart } = useReduxCart();
  
  return (
    <div>
      <h1>{user?.email}</h1>
      <p>Items: {items.length}</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

## Redux DevTools Usage

1. Install browser extension
2. Open DevTools (F12)
3. Go to "Redux" tab
4. See all dispatched actions
5. Click actions to see state changes
6. Time-travel to previous states

## Tips & Tricks

- ✅ Always use custom hooks (`useReduxAuth`, `useReduxCart`)
- ✅ Use pre-built selectors for better performance
- ✅ Cart state auto-persists to cookies
- ✅ Auth state syncs with Firebase automatically
- ✅ Never mutate Redux state directly (Redux prevents this)
- ✅ Use Redux DevTools for debugging
- ❌ Don't store sensitive data in Redux
- ❌ Don't use Redux for temporary UI state

## Troubleshooting

| Issue | Solution |
|-------|----------|
| State not updating | Ensure you're using `useAppSelector()` |
| Component not re-rendering | Check selector is wrapped with `useAppSelector()` |
| Dispatch not working | Import action from correct slice |
| DevTools not showing | Install browser extension and refresh |
| Type errors | Use correct import paths and TypeScript types |

## Documentation Files

- `REDUX_INTEGRATION_GUIDE.md` - Full integration guide
- `REDUX_MIGRATION_EXAMPLES.md` - Before/after examples
- `REDUX_IMPLEMENTATION_SUMMARY.md` - Implementation overview
- `REDUX_QUICK_REFERENCE.md` - This file

---

**Last Updated**: November 19, 2025
**Redux Version**: @reduxjs/toolkit latest
**React Version**: 19.1.1
