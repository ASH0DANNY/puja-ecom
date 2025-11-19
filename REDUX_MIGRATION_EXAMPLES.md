# Redux Migration Guide - Before and After Examples

This guide shows how to migrate existing components from Context API to Redux.

## 1. Login Component Migration

### Before (Using Context API)
```typescript
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // User context is updated
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button disabled={loading}>Login</button>
    </form>
  );
}
```

### After (Using Redux)
```typescript
import { useReduxAuth } from "../redux/useReduxAuth";
import { useAppSelector } from "../redux/hooks";
import { selectAuthLoading } from "../redux/hooks";

function LoginPage() {
  const { login } = useReduxAuth();
  const loading = useAppSelector(selectAuthLoading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // User is automatically in Redux state
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button disabled={loading}>Login</button>
    </form>
  );
}
```

## 2. Cart Component Migration

### Before (Using Context API)
```typescript
import { useCart } from "../context/CartContext";

function CartPage() {
  const { items, total, removeFromCart, updateQuantity, applyDiscount } = useCart();
  const [discountCode, setDiscountCode] = useState("");

  const handleApplyDiscount = async () => {
    const result = await applyDiscount(discountCode);
    if (result.success) {
      // Discount applied
    }
  };

  return (
    <div>
      <div>Total: ${total}</div>
      {items.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
          <input 
            value={item.quantity} 
            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
          />
          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}
      <input 
        value={discountCode}
        onChange={(e) => setDiscountCode(e.target.value)}
      />
      <button onClick={handleApplyDiscount}>Apply Discount</button>
    </div>
  );
}
```

### After (Using Redux)
```typescript
import { useReduxCart } from "../redux/useReduxCart";
import { useReduxDiscount } from "../redux/useReduxDiscount";
import { useAppSelector } from "../redux/hooks";
import { selectCartItems, selectCartTotal } from "../redux/hooks";

function CartPage() {
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const { removeFromCart, updateQuantity } = useReduxCart();
  const { validateDiscount, applyDiscount } = useReduxDiscount();
  const [discountCode, setDiscountCode] = useState("");

  const handleApplyDiscount = async () => {
    const validation = await validateDiscount(discountCode, 100); // Use actual subtotal
    if (validation.isValid) {
      const result = await applyDiscount(discountCode);
      if (result.success) {
        // Discount applied
      }
    }
  };

  return (
    <div>
      <div>Total: ${total}</div>
      {items.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
          <input 
            value={item.quantity} 
            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
          />
          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}
      <input 
        value={discountCode}
        onChange={(e) => setDiscountCode(e.target.value)}
      />
      <button onClick={handleApplyDiscount}>Apply Discount</button>
    </div>
  );
}
```

## 3. Product Card Component Migration

### Before (Using Context API)
```typescript
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div>
      <img src={product.image} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <input 
        type="number" 
        value={quantity} 
        onChange={(e) => setQuantity(parseInt(e.target.value))}
      />
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

### After (Using Redux)
```typescript
import { useReduxCart } from "../redux/useReduxCart";

function ProductCard({ product }) {
  const { addToCart } = useReduxCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div>
      <img src={product.image} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <input 
        type="number" 
        value={quantity} 
        onChange={(e) => setQuantity(parseInt(e.target.value))}
      />
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

## 4. Navbar Component Migration

### Before (Using Context API)
```typescript
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();

  return (
    <nav>
      <div>{user?.email}</div>
      <button onClick={logout}>Logout</button>
      <div>Cart ({items.length})</div>
    </nav>
  );
}
```

### After (Using Redux)
```typescript
import { useReduxAuth } from "../redux/useReduxAuth";
import { useAppSelector } from "../redux/hooks";
import { selectUser, selectCartItems } from "../redux/hooks";

function Navbar() {
  const { logout } = useReduxAuth();
  const user = useAppSelector(selectUser);
  const items = useAppSelector(selectCartItems);

  return (
    <nav>
      <div>{user?.email}</div>
      <button onClick={() => logout()}>Logout</button>
      <div>Cart ({items.length})</div>
    </nav>
  );
}
```

## 5. Protected Route Component Migration

### Before (Using Context API)
```typescript
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
```

### After (Using Redux)
```typescript
import { useAppSelector } from "../redux/hooks";
import { selectUser, selectAuthLoading } from "../redux/hooks";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectAuthLoading);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
```

## 6. Search Component with Discounts Migration

### Before (Using Context API)
```typescript
import { useDiscount } from "../context/DiscountContext";

function SearchWithDiscounts() {
  const { activeDiscounts, loading } = useDiscount();

  return (
    <div>
      {loading ? (
        <p>Loading discounts...</p>
      ) : (
        <div>
          {activeDiscounts.map((discount) => (
            <div key={discount.id}>
              <p>{discount.code}: {discount.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### After (Using Redux)
```typescript
import { useAppSelector } from "../redux/hooks";
import { selectActiveDiscounts, selectDiscountLoading } from "../redux/hooks";

function SearchWithDiscounts() {
  const activeDiscounts = useAppSelector(selectActiveDiscounts);
  const loading = useAppSelector(selectDiscountLoading);

  return (
    <div>
      {loading ? (
        <p>Loading discounts...</p>
      ) : (
        <div>
          {activeDiscounts.map((discount) => (
            <div key={discount.id}>
              <p>{discount.code}: {discount.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Migration Checklist

- [ ] Replace `useAuth()` with `useReduxAuth()`
- [ ] Replace `useCart()` with `useReduxCart()`
- [ ] Replace `useDiscount()` with `useReduxDiscount()`
- [ ] Update state access to use `useAppSelector(selectXxx)`
- [ ] Verify Redux DevTools shows correct state updates
- [ ] Test all functionality (login, cart, discounts)
- [ ] Run `npm run build` to verify TypeScript compilation
- [ ] Test in browser and verify no console errors

## Key Differences

| Aspect | Context API | Redux |
|--------|-------------|-------|
| State Access | `const { items } = useContext()` | `const items = useAppSelector()` |
| Dispatching | Directly call context function | `dispatch(action(payload))` |
| Performance | Less optimized | More optimized with selectors |
| DevTools | Limited debugging | Full Redux DevTools support |
| Persistence | Manual (cookies/localStorage) | Built-in middleware support |
| Testing | Harder to test | Easier to test (pure functions) |

## Additional Resources

- Redux Documentation: https://redux.js.org/
- Redux Toolkit: https://redux-toolkit.js.org/
- React-Redux Hooks: https://react-redux.js.org/api/hooks
- Redux DevTools: https://github.com/reduxjs/redux-devtools-extension
