# Custom Size Feature Documentation

## Overview

This document describes the custom size feature implementation that allows customers to specify custom dimensions (width, height, depth) for products that support customization. Products with custom size capability must also offer standard size options.

## Feature Architecture

### 1. Data Types

#### SizeOption Interface
```typescript
export interface SizeOption {
  label: string;                    // Display name for the size
  isStandard: boolean;              // Whether it's a standard size
  isCustomizable: boolean;          // Whether this option allows custom dimensions
}
```

#### CustomDimensions Interface
```typescript
export interface CustomDimensions {
  width: number;                    // Width in the specified unit
  height: number;                   // Height in the specified unit
  depth?: number;                   // Optional depth in the specified unit
}
```

#### Product Interface Extensions
```typescript
export interface Product {
  // ... existing fields ...
  
  // Custom size fields
  hasCustomSize?: boolean;          // Enable/disable custom sizing
  customSizeUnit?: 'cm' | 'inch' | 'mm';  // Unit for dimensions
  minDimensions?: CustomDimensions; // Minimum allowed dimensions
  maxDimensions?: CustomDimensions; // Maximum allowed dimensions
}
```

#### CartItem Interface Extensions
```typescript
export type CartItem = Product & {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  customDimensions?: CustomDimensions;  // New field for storing custom dimensions
}
```

### 2. Components

#### CustomSizeSelector Component
**Location**: `src/components/CustomSizeSelector.tsx`

**Purpose**: Unified component for handling both standard and custom size selection.

**Features**:
- Displays standard sizes as selectable buttons
- Provides custom size input form with validation
- Respects min/max dimensions
- Supports width, height, and optional depth
- Real-time validation with error messages

**Props**:
```typescript
interface CustomSizeSelectorProps {
  product: Product;
  onSelectSize: (size: string, customDimensions?: CustomDimensions) => void;
  selectedSize?: string;
  selectedCustomDimensions?: CustomDimensions;
}
```

**Usage Example**:
```tsx
<CustomSizeSelector
  product={product}
  onSelectSize={(size, customDimensions) => {
    setSelectedSize(size);
    setSelectedCustomDimensions(customDimensions);
  }}
  selectedSize={selectedSize}
  selectedCustomDimensions={selectedCustomDimensions}
/>
```

### 3. Modified Components

#### ProductDetails Page
- Integrated `CustomSizeSelector` component
- Added state for `selectedCustomDimensions`
- Updated `handleAddToCart` to pass custom dimensions to cart context

#### ProductCard Component
- Integrated `CustomSizeSelector` in the mobile modal
- Added state for `selectedCustomDimensions`
- Updated modal add-to-cart handler to include custom dimensions

#### CartPage
- Displays custom dimensions in cart items (format: "W × H × D cm")
- Updated cart item key to include custom dimensions for proper item differentiation
- Shows custom dimensions below size information

### 4. Cart Management (CartContext)

**Updated Methods**:

```typescript
addToCart(
  product: Product,
  quantity?: number,
  size?: string,
  color?: string,
  customDimensions?: CustomDimensions
): void
```

**Key Changes**:
- Cart now differentiates items by: `id + selectedSize + selectedColor + customDimensions`
- Same product with different custom dimensions are treated as separate cart items
- Items with standard size and same custom dimensions are merged into one line item
- Cookie serialization handles complex dimension objects

### 5. Product Data Structure

**Example Product with Custom Size**:
```typescript
{
  id: "1",
  name: "Radha Krishna Idol",
  description: "Beautiful brass Radha Krishna idol with antique finish",
  price: 2999,
  category: "idols",
  image: "/assets/images/products/radha-krishna.jpg",
  stock: 10,
  reviews: 25,
  sizes: [
    { label: "Small", isStandard: true, isCustomizable: false },
    { label: "Medium", isStandard: true, isCustomizable: false },
    { label: "Large", isStandard: true, isCustomizable: false },
    { label: "Custom", isStandard: false, isCustomizable: true },
  ],
  hasCustomSize: true,
  customSizeUnit: "cm",
  minDimensions: { width: 5, height: 10 },
  maxDimensions: { width: 50, height: 100 },
}
```

## User Flow

### For Products with Custom Sizes

1. **Product Page Display**
   - Standard sizes shown as buttons (Small, Medium, Large)
   - "Add Custom Size" button available

2. **Customer Selection Flow**
   - Customer clicks "Add Custom Size" button
   - Form appears with input fields for width and height (and depth if applicable)
   - Min/max constraints displayed as hints
   - Customer enters dimensions
   - System validates dimensions against min/max
   - "Confirm Custom Size" button adds to cart

3. **Cart Display**
   - Product shown with selected size or custom dimensions
   - Custom dimensions displayed as: "W × H × D cm"
   - Can adjust quantity or remove

4. **Validation Rules**
   - Width must be between minDimensions.width and maxDimensions.width
   - Height must be between minDimensions.height and maxDimensions.height
   - Depth (if applicable) must be between minDimensions.depth and maxDimensions.depth
   - Error messages show valid range

## Implementation Examples

### Adding a Product with Custom Sizes

```typescript
const product: Product = {
  id: "4",
  name: "Brass Diya Stand",
  description: "Decorative brass diya stand",
  price: 899,
  category: "decorative",
  image: "/assets/images/products/diya-stand.jpg",
  stock: 20,
  reviews: 15,
  sizes: [
    { label: "Small", isStandard: true, isCustomizable: false },
    { label: "Medium", isStandard: true, isCustomizable: false },
    { label: "Large", isStandard: true, isCustomizable: false },
    { label: "Custom", isStandard: false, isCustomizable: true },
  ],
  hasCustomSize: true,
  customSizeUnit: "cm",
  minDimensions: { width: 10, height: 15, depth: 10 },
  maxDimensions: { width: 60, height: 80, depth: 50 },
};
```

### Getting Cart Items with Custom Dimensions

```typescript
const { items } = useCart();

items.forEach(item => {
  console.log(`Product: ${item.name}`);
  console.log(`Size: ${item.selectedSize}`);
  
  if (item.customDimensions) {
    console.log(`Custom Dimensions: ${item.customDimensions.width} × ${item.customDimensions.height} × ${item.customDimensions.depth} cm`);
  }
});
```

## Key Features

✅ **Standard Sizes Always Available**: Products with custom sizes must include standard sizes
✅ **Min/Max Constraints**: Admins can set dimensional limits
✅ **Real-time Validation**: User gets immediate feedback on invalid dimensions
✅ **Unit Flexibility**: Support for cm, inch, or mm
✅ **Optional Depth**: Width and height are required; depth is optional
✅ **Cart Differentiation**: Items with different dimensions are separate cart entries
✅ **Responsive UI**: Works on both desktop and mobile
✅ **Data Persistence**: Custom dimensions saved in cart cookies

## Files Modified

1. **src/types/product.ts** - Added SizeOption, CustomDimensions interfaces
2. **src/components/CustomSizeSelector.tsx** - New component (created)
3. **src/pages/ProductDetails.tsx** - Integrated CustomSizeSelector
4. **src/components/ProductCard.tsx** - Integrated CustomSizeSelector in modal
5. **src/pages/CartPage.tsx** - Display custom dimensions
6. **src/context/CartContext.tsx** - Handle custom dimensions
7. **src/data/products.ts** - Updated sample products with custom sizes

## Testing Checklist

- [ ] Select standard size on product details page
- [ ] Select custom size on product details page
- [ ] Enter custom dimensions within valid range
- [ ] Attempt to enter custom dimensions outside valid range (should show error)
- [ ] Add item with custom size to cart
- [ ] Verify custom dimensions display in cart
- [ ] Add same product with different custom dimensions (should be separate item)
- [ ] Add same product with standard size (should be different item from custom)
- [ ] Test on mobile with product card modal
- [ ] Verify cart persists through page refresh
- [ ] Test with 2D and 3D products (depth optional)

## Future Enhancements

1. **Price Adjustment**: Add surcharge for custom sizes
2. **Presets**: Save frequently used custom sizes
3. **Bulk Upload**: Upload dimensions via CSV
4. **Size Chart**: Visual size chart for reference
5. **Admin Dashboard**: Manage custom size options per product
6. **Order Details**: Show custom dimensions in order confirmation and invoice
7. **Image Customization**: Allow customers to see preview of custom dimensions
