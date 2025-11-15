# Custom Size Feature - Deployment & Admin Guide

## 🚀 Deployment Instructions

### Pre-Deployment Checklist
```bash
# 1. Verify build succeeds
npm run build

# 2. Check for TypeScript errors
npm run type-check

# 3. Run linter
npm run lint

# 4. All checks should pass ✅
```

### Deployment Steps
```bash
# 1. Stage changes
git add -A

# 2. Commit with descriptive message
git commit -m "feat: Add custom size feature for products with dimensions"

# 3. Push to main branch
git push origin main

# 4. Deploy using your CI/CD pipeline
# (Vercel, Netlify, AWS, etc.)
```

## 👨‍💼 Admin Guide - Managing Custom Sizes

### Adding a New Product with Custom Sizes

**Location**: `src/data/products.ts`

```typescript
{
  id: "new-product-id",
  name: "Product Name",
  description: "Product description",
  price: 5000,
  category: "category-name",
  image: "/assets/images/products/image.jpg",
  stock: 50,
  reviews: 0,
  
  // Step 1: Define all sizes (REQUIRED)
  sizes: [
    { label: "Small", isStandard: true, isCustomizable: false },
    { label: "Medium", isStandard: true, isCustomizable: false },
    { label: "Large", isStandard: true, isCustomizable: false },
    { label: "Custom", isStandard: false, isCustomizable: true },
  ],
  
  // Step 2: Enable custom sizes
  hasCustomSize: true,
  
  // Step 3: Set unit of measurement
  customSizeUnit: "cm",  // or "inch" or "mm"
  
  // Step 4: Define minimum allowed dimensions
  minDimensions: {
    width: 10,      // Minimum 10cm width
    height: 10,     // Minimum 10cm height
    depth: 5,       // Minimum 5cm depth (optional)
  },
  
  // Step 5: Define maximum allowed dimensions
  maxDimensions: {
    width: 100,     // Maximum 100cm width
    height: 100,    // Maximum 100cm height
    depth: 50,      // Maximum 50cm depth (optional)
  },
}
```

### Adding a 2D Product (Width × Height only)

```typescript
{
  // ... common fields ...
  
  sizes: [
    { label: "Small (10x15)", isStandard: true, isCustomizable: false },
    { label: "Large (20x30)", isStandard: true, isCustomizable: false },
    { label: "Custom", isStandard: false, isCustomizable: true },
  ],
  
  hasCustomSize: true,
  customSizeUnit: "inch",
  
  minDimensions: { width: 5, height: 8 },
  maxDimensions: { width: 30, height: 40 },
  // Note: No depth field for 2D products
}
```

### Adding a 3D Product (Width × Height × Depth)

```typescript
{
  // ... common fields ...
  
  sizes: [
    { label: "Small", isStandard: true, isCustomizable: false },
    { label: "Custom", isStandard: false, isCustomizable: true },
  ],
  
  hasCustomSize: true,
  customSizeUnit: "cm",
  
  minDimensions: { width: 10, height: 10, depth: 5 },
  maxDimensions: { width: 100, height: 100, depth: 50 },
  // All three dimensions defined for 3D product
}
```

### Product without Custom Sizes

```typescript
{
  // ... common fields ...
  
  sizes: [
    { label: "One Size", isStandard: true, isCustomizable: false },
  ],
  
  // IMPORTANT: Don't set hasCustomSize or leave it as false
  hasCustomSize: false,
  
  // No need to define: customSizeUnit, minDimensions, maxDimensions
}
```

## 📊 Database Schema (Firebase)

If storing in Firestore, use this structure for orders:

```typescript
// Collection: orders
// Document: {orderId}
{
  userId: "user-id-123",
  createdAt: Timestamp,
  items: [
    {
      productId: "1",
      quantity: 2,
      selectedSize: "Custom",      // or "Small", "Medium", etc.
      selectedColor: "Red",
      customDimensions: {
        width: 25,
        height: 30,
        depth: 10
      },
      price: 5000,
      subtotal: 10000,
    },
    // ... more items
  ],
  total: 10000,
  discount: 0,
  status: "pending"  // or "confirmed", "shipped", "delivered"
}
```

## 📧 Communication Templates

### Email to Customers (Order Confirmation)

```
Dear [Customer Name],

Thank you for your order!

Order Summary:
─────────────────────────────────────
Item: [Product Name]
Size: [Size Selection]
Custom Dimensions: [20 × 30 × 10 cm]
Quantity: [2]
Unit Price: ₹[5000]
Subtotal: ₹[10000]
─────────────────────────────────────

Order Details:
- Order ID: #12345
- Order Date: [Date]
- Estimated Delivery: [Date]

[Thank you message]
```

## 🔧 API Integration (For Future)

If integrating with backend API:

```typescript
// Add to Cart Request
POST /api/cart/add
{
  productId: "1",
  quantity: 1,
  selectedSize: "Custom",
  selectedColor: "Red",
  customDimensions: {
    width: 25,
    height: 30,
    depth: 10
  }
}

// Order Creation Request
POST /api/orders
{
  items: [
    {
      productId: "1",
      quantity: 2,
      selectedSize: "Custom",
      customDimensions: {
        width: 25,
        height: 30,
        depth: 10
      }
    }
  ],
  shippingAddress: { ... },
  paymentMethod: "credit-card"
}
```

## 🎯 Best Practices

### When Creating Products

✅ **DO**:
- Include at least 3 standard sizes
- Set reasonable min/max dimensions
- Use consistent units across related products
- Test dimension constraints thoroughly
- Document unusual size requirements

❌ **DON'T**:
- Create products with custom sizes but no standard options
- Set min/max dimensions too restrictively
- Mix units (don't have some in cm and some in inch)
- Leave dimension fields undefined
- Allow zero or negative dimensions

### Unit Selection Guidelines

```
Use CM (Centimeters) for:
- Most products
- International shipping
- India-based products

Use INCH for:
- Western market products
- Picture frames
- Artwork

Use MM for:
- Small detailed items
- Jewelry (rarely)
- Precision items
```

### Dimension Constraints Guidelines

```
Frame Example:
minDimensions: { width: 4, height: 6 }      // 4" × 6" (postcard size)
maxDimensions: { width: 24, height: 36 }    // 24" × 36" (large poster)

Idol Example:
minDimensions: { width: 5, height: 10 }     // 5cm × 10cm (small)
maxDimensions: { width: 50, height: 100 }   // 50cm × 100cm (large)

Box Example:
minDimensions: { width: 10, height: 10, depth: 5 }
maxDimensions: { width: 100, height: 100, depth: 50 }
```

## 📱 Testing in Production

### Test Case 1: Standard Size
1. Open product page
2. Select "Small"
3. Add to cart
4. Verify "Small" in cart

### Test Case 2: Custom Size
1. Open product page
2. Click "Add Custom Size"
3. Enter: Width=25, Height=30, Depth=10
4. Click "Confirm Custom Size"
5. Add to cart
6. Verify "Dimensions: 25 × 30 × 10 cm" in cart

### Test Case 3: Invalid Dimensions
1. Open custom size form
2. Enter: Width=2 (below minimum of 5)
3. Error message should appear
4. Try with valid: Width=25
5. Confirm button should enable

### Test Case 4: Multiple Items
1. Add product with custom: 25×30×10
2. Add same product with custom: 20×20×10
3. Should be 2 separate cart items
4. Add same product with custom: 25×30×10
5. Should merge with first item (qty=2)

## 🆘 Troubleshooting

### Issue: Custom size form not showing
**Solution**: Check `hasCustomSize: true` in product definition

### Issue: Dimensions not showing in cart
**Solution**: Verify `customDimensions` object is passed to `addToCart()`

### Issue: Validation not working
**Solution**: Ensure `minDimensions` and `maxDimensions` are defined

### Issue: Different dimensions not creating separate items
**Solution**: Verify cart key includes `customDimensions` in JSON.stringify()

## 📞 Support Information

For issues related to custom sizes:
1. Check `CUSTOM_SIZE_FEATURE.md` for architecture details
2. Check `QUICK_REFERENCE.md` for code examples
3. Check `VISUAL_GUIDE.md` for data flow
4. Check component source: `src/components/CustomSizeSelector.tsx`

## 🔐 Security Considerations

### Input Validation
```typescript
// Always validate on backend
if (customDimensions.width < minDimensions.width ||
    customDimensions.width > maxDimensions.width) {
  return error("Invalid width");
}
```

### SQL Injection Prevention
- Use parameterized queries
- Validate all inputs before storing
- Sanitize customer input

### XSS Prevention
- React automatically escapes JSX
- Never use `dangerouslySetInnerHTML`
- Validate string inputs

## 📈 Performance Optimization

### Current Performance
- Build size: 1,082.53 kB gzipped
- Component bundle: Minimal overhead
- Cart operations: O(n) where n = items count

### Future Optimizations
- Lazy load CustomSizeSelector for products without custom sizes
- Cache validation rules
- Implement virtual scrolling for large carts
- Debounce dimension input validation

## 🎓 Training Checklist

For team members adding custom size products:

- [ ] Understand SizeOption interface
- [ ] Know how to define min/max constraints
- [ ] Understand 2D vs 3D products
- [ ] Know unit selection guidelines
- [ ] Can test custom size workflow
- [ ] Know troubleshooting steps
- [ ] Familiar with data structure

---

**Document Version**: 1.0
**Last Updated**: November 15, 2025
**Status**: ✅ Production Ready
