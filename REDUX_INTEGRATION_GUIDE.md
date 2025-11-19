# Redux Integration Guide

This guide explains how Redux is integrated into the Puja E-Commerce application and how to use it throughout the codebase.

## Directory Structure

```
src/redux/
├── store.ts                      # Redux store configuration
├── hooks.ts                      # Typed useDispatch and useSelector hooks
├── slices/
│   ├── authSlice.ts             # Authentication state slice
│   ├── cartSlice.ts             # Shopping cart state slice
│   └── discountSlice.ts         # Discount management state slice
├── AuthReduxInitializer.tsx     # Auth state initialization component
├── CartReduxInitializer.tsx     # Cart state initialization component
├── DiscountReduxInitializer.tsx # Discount state initialization component
├── useReduxAuth.ts              # Custom hook for auth operations
├── useReduxCart.ts              # Custom hook for cart operations
└── useReduxDiscount.ts          # Custom hook for discount operations
```

## Redux State Structure

### Auth State
```typescript
{
  auth: {
    user: User | null,
    loading: boolean,
    error: string | null,
    isAuthenticated: boolean
  }
}
```

### Cart State
```typescript
{
  cart: {
    items: CartItem[],
    discountCode: string | null,
    discount: number,
    subtotal: number,
    total: number,
    showAnimation: boolean
  }
}
```

### Discount State
```typescript
{
  discount: {
    activeDiscounts: Discount[],
    loading: boolean,
    error: string | null
  }
}
```

## Usage Examples

### 1. Using Redux Hooks in Components

#### Auth Example
```typescript
import { useAppDispatch, useAppSelector, selectUser, selectAuthLoading } from "@/redux/hooks";
import { setUser, clearUser } from "@/redux/slices/authSlice";

function MyComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectAuthLoading);

  const handleLogout = () => {
    dispatch(clearUser());
  };

  return <div>{user ? `Hello ${user.email}` : 'Not logged in'}</div>;
}
```

#### Cart Example
```typescript
import { useAppSelector } from "@/redux/hooks";
import { selectCartItems, selectCartTotal } from "@/redux/hooks";

function CartSummary() {
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  return <div>Items: {items.length}, Total: ${total}</div>;
}
```

### 2. Using Custom Hooks (Recommended)

#### useReduxAuth Hook
```typescript
import { useReduxAuth } from "@/redux/useReduxAuth";

function LoginForm() {
  const { user, login, logout } = useReduxAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // User is now in Redux state
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {user ? (
        <button onClick={() => logout()}>Logout</button>
      ) : (
        <button onClick={() => handleLogin('email@example.com', 'password')}>Login</button>
      )}
    </div>
  );
}
```

#### useReduxCart Hook
```typescript
import { useReduxCart } from "@/redux/useReduxCart";

function AddToCartButton({ product }) {
  const { addToCart, items } = useReduxCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <button onClick={handleAddToCart}>
      Add to Cart ({items.length})
    </button>
  );
}
```

#### useReduxDiscount Hook
```typescript
import { useReduxDiscount } from "@/redux/useReduxDiscount";

function DiscountForm() {
  const { validateDiscount, applyDiscount } = useReduxDiscount();

  const handleApplyDiscount = async (code: string) => {
    const result = await validateDiscount(code, 100);
    if (result.isValid) {
      await applyDiscount(code);
    }
  };

  return (
    <input 
      placeholder="Enter discount code"
      onBlur={(e) => handleApplyDiscount(e.target.value)}
    />
  );
}
```

### 3. App Structure with Redux Providers

The App.tsx is already configured with Redux:

```typescript
function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}
```

And RootLayout uses initializers:

```typescript
function RootLayout() {
  return (
    <AuthReduxInitializer>
      <CartReduxInitializer>
        <DiscountReduxInitializer>
          {/* Your routes and components */}
        </DiscountReduxInitializer>
      </CartReduxInitializer>
    </AuthReduxInitializer>
  );
}
```

## Available Selectors

### Auth Selectors
- `selectUser` - Current logged-in user
- `selectAuthLoading` - Auth loading state
- `selectAuthError` - Auth error message
- `selectIsAuthenticated` - Boolean indicating if user is logged in

### Cart Selectors
- `selectCartItems` - Array of items in cart
- `selectCartTotal` - Total price after discount
- `selectCartSubtotal` - Total price before discount
- `selectCartDiscount` - Discount amount applied
- `selectDiscountCode` - Current discount code
- `selectShowCartAnimation` - Animation visibility

### Discount Selectors
- `selectActiveDiscounts` - Array of active discounts
- `selectDiscountLoading` - Discount loading state
- `selectDiscountError` - Discount error message

## Available Actions

### Auth Slice Actions
- `setUser(user)` - Set authenticated user
- `clearUser()` - Clear user on logout
- `setAuthLoading(boolean)` - Set loading state
- `setAuthError(message)` - Set error message
- `initializeAuth(user)` - Initialize auth state
- `updateUserProfile(partial)` - Update user information

### Cart Slice Actions
- `initializeCart(payload)` - Initialize cart from storage
- `addToCart(payload)` - Add item to cart
- `removeFromCart(productId)` - Remove item from cart
- `updateQuantity(payload)` - Update item quantity
- `updateDimensions(payload)` - Update item size/color/custom dimensions
- `clearCart()` - Empty the cart
- `setDiscountCode(code)` - Set discount code
- `applyDiscount(amount)` - Apply discount amount
- `removeDiscount()` - Remove discount
- `setShowAnimation(boolean)` - Toggle cart animation

### Discount Slice Actions
- `setActiveDiscounts(discounts)` - Set active discounts
- `addDiscount(discount)` - Add new discount
- `updateDiscount(payload)` - Update existing discount
- `removeDiscount(id)` - Remove discount
- `setDiscountLoading(boolean)` - Set loading state
- `setDiscountError(message)` - Set error message

## Persistence

Redux state is automatically persisted to browser cookies:
- Cart items and discount are saved to cookies
- Cart state is restored on app load
- No manual persistence needed

## Migration from Context API

If migrating existing Context API code to Redux:

1. Replace `useAuth()` with `useReduxAuth()`
2. Replace `useCart()` with `useReduxCart()`
3. Replace `useDiscount()` with `useReduxDiscount()`
4. Use Redux selectors directly with `useAppSelector(selectYourState)`
5. Dispatch actions with `useAppDispatch()` and action creators

## Performance Benefits

- **Memoization**: Selectors prevent unnecessary re-renders
- **Centralized State**: Easier debugging and state management
- **DevTools**: Redux DevTools browser extension support
- **Middleware**: Extensible architecture for custom logic
- **Type Safety**: Full TypeScript support with typed hooks

## Best Practices

1. **Always use custom hooks** (`useReduxAuth`, `useReduxCart`, etc.) instead of directly using Redux
2. **Use selectors** to access state for better performance
3. **Keep components focused** on UI logic, not state management
4. **Use Redux DevTools** for debugging state changes
5. **Avoid mutating state** - Redux automatically handles immutability
6. **Persist important data** using the built-in cookie persistence

## DevTools

Redux DevTools is supported. Install the Redux DevTools browser extension to:
- See all dispatched actions
- Time-travel debug state changes
- Inspect state at any point
- Export/import state snapshots

Visit: https://github.com/reduxjs/redux-devtools-extension
