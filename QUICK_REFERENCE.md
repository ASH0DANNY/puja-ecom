# Custom Size Feature - Quick Reference Guide

## Quick Start Examples

### 1. Creating a Product with Custom Sizes

```typescript
import type { Product } from "../types/product";

const customSizeProduct: Product = {
  id: "custom-product-1",
  name: "Custom Size Frame",
  description: "Frame with custom dimensions",
  price: 1500,
  category: "frames",
  image: "/path/to/image.jpg",
  stock: 50,
  reviews: 10,
  
  // Required: Standard sizes
  sizes: [
    { label: "Small (6×8)", isStandard: true, isCustomizable: false },
    { label: "Medium (8×10)", isStandard: true, isCustomizable: false },
    { label: "Large (12×16)", isStandard: true, isCustomizable: false },
    { label: "Custom", isStandard: false, isCustomizable: true },
  ],
  
  // Custom size configuration
  hasCustomSize: true,
  customSizeUnit: "inch",
  minDimensions: { width: 4, height: 6 },      // Minimum 4"×6"
  maxDimensions: { width: 24, height: 36 },    // Maximum 24"×36"
};
```

### 2. Product with 3D Dimensions

```typescript
const threeD_Product: Product = {
  id: "3d-product",
  name: "Custom Box",
  price: 2000,
  // ... other fields ...
  
  sizes: [
    { label: "Standard 10×10×10", isStandard: true, isCustomizable: false },
    { label: "Custom", isStandard: false, isCustomizable: true },
  ],
  
  hasCustomSize: true,
  customSizeUnit: "cm",
  minDimensions: { width: 5, height: 5, depth: 5 },
  maxDimensions: { width: 50, height: 50, depth: 50 },
};
```

### 3. Using CustomSizeSelector in Your Component

```tsx
import CustomSizeSelector from "../components/CustomSizeSelector";
import { useState } from "react";
import type { CustomDimensions } from "../types/product";

function MyProductComponent({ product }) {
  const [selectedSize, setSelectedSize] = useState<string>();
  const [customDimensions, setCustomDimensions] = useState<CustomDimensions>();

  const handleSizeSelect = (size: string, dimensions?: CustomDimensions) => {
    setSelectedSize(size);
    setCustomDimensions(dimensions);
    console.log(`Selected: ${size}`, dimensions);
  };

  return (
    <CustomSizeSelector
      product={product}
      onSelectSize={handleSizeSelect}
      selectedSize={selectedSize}
      selectedCustomDimensions={customDimensions}
    />
  );
}
```

### 4. Adding Item with Custom Dimensions to Cart

```tsx
import { useCart } from "../context/CartContext";
import type { CustomDimensions } from "../types/product";

function AddToCartButton({ product }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("Medium");
  const [customDimensions, setCustomDimensions] = useState<CustomDimensions>({
    width: 20,
    height: 30,
    depth: 10,
  });

  const handleAddToCart = () => {
    addToCart(
      product,
      1,                    // quantity
      selectedSize,         // size
      "red",               // color
      customDimensions     // custom dimensions
    );
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

### 5. Displaying Cart Items with Custom Dimensions

```tsx
import { useCart } from "../context/CartContext";

function CartItemsList() {
  const { items } = useCart();

  return (
    <div>
      {items.map((item) => (
        <div key={`${item.id}-${JSON.stringify(item.customDimensions)}`}>
          <h3>{item.name}</h3>
          <p>Size: {item.selectedSize}</p>
          
          {item.customDimensions && (
            <p>
              Dimensions: {item.customDimensions.width} × 
              {item.customDimensions.height}
              {item.customDimensions.depth && ` × ${item.customDimensions.depth}`}
              {" "}cm
            </p>
          )}
          
          <p>Quantity: {item.quantity}</p>
          <p>Price: ₹{(item.discountPrice || item.price) * item.quantity}</p>
        </div>
      ))}
    </div>
  );
}
```

### 6. Validation Rules

```typescript
// Product with custom sizes MUST have:
// ✅ hasCustomSize: true
// ✅ At least one standard size (isStandard: true)
// ✅ At least one custom option (isCustomizable: true)
// ✅ minDimensions and maxDimensions defined
// ✅ customSizeUnit specified

// Valid product example:
const validProduct: Product = {
  // ... other fields ...
  hasCustomSize: true,
  
  sizes: [
    { label: "Small", isStandard: true, isCustomizable: false },   // ✅ Standard
    { label: "Medium", isStandard: true, isCustomizable: false },  // ✅ Standard
    { label: "Custom", isStandard: false, isCustomizable: true },  // ✅ Custom
  ],
  
  customSizeUnit: "cm",
  minDimensions: { width: 10, height: 10 },
  maxDimensions: { width: 100, height: 100 },
};
```

### 7. Checking Dimension Validity

```typescript
function isValidDimension(
  dimension: CustomDimensions,
  product: Product
): { valid: boolean; error?: string } {
  
  if (!product.minDimensions || !product.maxDimensions) {
    return { valid: false, error: "Product doesn't support custom sizes" };
  }

  const { minDimensions, maxDimensions, customSizeUnit } = product;
  const unit = customSizeUnit || "cm";

  // Validate width
  if (dimension.width < minDimensions.width || 
      dimension.width > maxDimensions.width) {
    return {
      valid: false,
      error: `Width must be between ${minDimensions.width} and ${maxDimensions.width} ${unit}`,
    };
  }

  // Validate height
  if (dimension.height < minDimensions.height || 
      dimension.height > maxDimensions.height) {
    return {
      valid: false,
      error: `Height must be between ${minDimensions.height} and ${maxDimensions.height} ${unit}`,
    };
  }

  // Validate depth (if applicable)
  if (minDimensions.depth && maxDimensions.depth) {
    const depth = dimension.depth || 0;
    if (depth < minDimensions.depth || depth > maxDimensions.depth) {
      return {
        valid: false,
        error: `Depth must be between ${minDimensions.depth} and ${maxDimensions.depth} ${unit}`,
      };
    }
  }

  return { valid: true };
}
```

### 8. Filtering Products with Custom Sizes

```typescript
import { products } from "../data/products";

// Get only products that support custom sizes
const customSizeProducts = products.filter(p => p.hasCustomSize);

// Get products without custom sizes
const standardOnlyProducts = products.filter(p => !p.hasCustomSize);

// Get custom size options for a product
const getCustomSizeOption = (product: Product) => {
  if (!product.sizes) return null;
  return product.sizes.find(
    size => typeof size === "object" && size.isCustomizable
  );
};
```

### 9. Storing Custom Dimensions in Database

```typescript
interface OrderItem {
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
  customDimensions?: {
    width: number;
    height: number;
    depth?: number;
  };
  price: number;
}

// Save to Firestore
async function saveOrder(cartItems: CartItem[]) {
  const orderItems: OrderItem[] = cartItems.map(item => ({
    productId: item.id,
    quantity: item.quantity,
    selectedSize: item.selectedSize || "N/A",
    selectedColor: item.selectedColor,
    customDimensions: item.customDimensions,
    price: item.discountPrice || item.price,
  }));

  // Save to Firestore
  await addDoc(collection(db, "orders"), {
    items: orderItems,
    timestamp: new Date(),
  });
}
```

### 10. Displaying in Order Summary

```tsx
function OrderSummary({ items }) {
  return (
    <div>
      {items.map((item) => (
        <div key={item.productId}>
          <h4>{item.name}</h4>
          
          {item.selectedSize && <p>Size: {item.selectedSize}</p>}
          
          {item.customDimensions && (
            <p className="text-sm text-gray-600">
              Custom: {item.customDimensions.width} × 
              {item.customDimensions.height}
              {item.customDimensions.depth && 
                ` × ${item.customDimensions.depth}`}
              {" "}cm
            </p>
          )}
          
          <p>Qty: {item.quantity}</p>
          <p>₹{(item.price * item.quantity).toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}
```

## Common Issues & Solutions

### Issue: Custom dimensions not showing in cart
**Solution**: Ensure `customDimensions` is passed to `addToCart()` and check cart key includes dimensions:
```typescript
key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${JSON.stringify(item.customDimensions)}`}
```

### Issue: Validation not working
**Solution**: Verify `minDimensions` and `maxDimensions` are defined in product:
```typescript
if (!product.minDimensions || !product.maxDimensions) {
  // Custom sizes not available
}
```

### Issue: Items not merging in cart
**Solution**: Ensure identical items have exactly same dimensions (use strict equality):
```typescript
JSON.stringify(item.customDimensions) === JSON.stringify(newDimensions)
```

## Type Reference

```typescript
interface SizeOption {
  label: string;
  isStandard: boolean;
  isCustomizable: boolean;
}

interface CustomDimensions {
  width: number;
  height: number;
  depth?: number;
}

interface Product {
  // ... existing fields ...
  hasCustomSize?: boolean;
  customSizeUnit?: 'cm' | 'inch' | 'mm';
  minDimensions?: CustomDimensions;
  maxDimensions?: CustomDimensions;
}

type CartItem = Product & {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  customDimensions?: CustomDimensions;
}
```

---

**For detailed documentation**, see `CUSTOM_SIZE_FEATURE.md`
