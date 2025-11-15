# Custom Size Feature - Visual Implementation Guide

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCT TYPES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Product with Custom Sizes          Product without Custom       │
│  ┌──────────────────────────┐       ┌──────────────────────────┐ │
│  │ • Standard sizes (req)   │       │ • Standard sizes only     │ │
│  │ • Custom option (opt)    │       │ • No custom input        │ │
│  │ • Min/Max dimensions     │       │ • Simple selection       │ │
│  │ • Validation rules       │       │                          │ │
│  └──────────────────────────┘       └──────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Product Page                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Standard Sizes:                                          │   │
│  │ [Small] [Medium] [Large]                                │   │
│  │                                                          │   │
│  │ Custom Size Option:                                      │   │
│  │ [+ Add Custom Size] ────┐                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  Custom Size Form                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Width (cm): [____] min: 5, max: 50                      │   │
│  │ Height (cm): [____] min: 10, max: 100                   │   │
│  │ Depth (cm): [____] min: 5, max: 50 (optional)          │   │
│  │                                                          │   │
│  │ [✓ Confirm Custom Size]                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  Add to Cart                                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CART DISPLAY                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Cart Item                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Product: Frame                                           │   │
│  │ Size: Custom                                             │   │
│  │ Dimensions: 20 × 30 × 10 cm                             │   │
│  │ Color: Red                                               │   │
│  │ Quantity: 1  |  Price: ₹1500                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Data Structure Relationships

```
Product
├── id: string
├── name: string
├── price: number
│
├── sizes: SizeOption[] ◄─── MUST have at least one standard size
│   ├── { label: "Small", isStandard: true, isCustomizable: false }
│   ├── { label: "Medium", isStandard: true, isCustomizable: false }
│   └── { label: "Custom", isStandard: false, isCustomizable: true }
│
├── hasCustomSize: boolean ◄─── Enables custom size feature
├── customSizeUnit: "cm" | "inch" | "mm"
│
├── minDimensions: CustomDimensions
│   ├── width: number
│   ├── height: number
│   └── depth?: number
│
└── maxDimensions: CustomDimensions
    ├── width: number
    ├── height: number
    └── depth?: number

CartItem extends Product
└── customDimensions?: CustomDimensions
    ├── width: number
    ├── height: number
    └── depth?: number
```

## 🔄 Data Flow

```
┌──────────────────┐
│  Product Page    │
│  with Sizes      │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────────┐
│ User Selects Size                  │
│ ├─ Standard: "Medium"              │
│ └─ Custom: Width: 25, Height: 30   │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ CustomSizeSelector Component       │
│ ├─ Validates dimensions            │
│ ├─ Shows error if invalid          │
│ └─ Returns: (size, dimensions)     │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ CartContext.addToCart()            │
│ ├─ Stores: size + dimensions       │
│ ├─ Cookie persistence              │
│ └─ Smart item merging              │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Cart Display                       │
│ ├─ Shows item details              │
│ ├─ Displays dimensions             │
│ └─ Allows quantity adjustment      │
└────────────────────────────────────┘
```

## 📱 Component Integration Points

```
App Structure:
│
├── ProductDetails Page ◄──────┐
│   ├── CustomSizeSelector     │
│   ├── Size Selection Logic   │
│   └── Add to Cart            │
│                              │
├── ProductCard ◄──────────────┤
│   ├── Modal                  │
│   ├── CustomSizeSelector     │
│   └── Add to Cart            │
│                              │
├── CartPage ◄─────────────────┤
│   ├── Display Items          │
│   ├── Show Dimensions        │
│   └── Item Quantity Control  │
│                              │
└── CartContext (Provider)
    ├── State: items[]
    ├── addToCart(product, qty, size, color, dimensions)
    ├── removeFromCart()
    └── updateQuantity()

CustomSizeSelector Component:
├── Input: product, selectedSize, selectedCustomDimensions
├── Display: Standard sizes + Custom input form
├── Logic: Validation, Min/Max checking
└── Output: onSelectSize(size, customDimensions)
```

## 🎨 UI State Transitions

```
Initial State
     │
     ▼
┌──────────────────────────┐
│ Product with sizes:      │
│ [Small] [Medium] [Large] │
│ [+ Custom Size]          │
└──────────────┬───────────┘
               │
          User clicks "Custom"
               │
               ▼
┌──────────────────────────┐
│ [✓ Custom Size Selected] │
│ Width: [25_] min-max     │
│ Height: [30_] min-max    │
│ Depth: [10_] (optional)  │
│ [✓ Confirm]              │
└──────────────┬───────────┘
               │
      User confirms dimensions
               │
               ▼
┌──────────────────────────┐
│ Item Added to Cart       │
│ Size: Custom             │
│ Dimensions: 25×30×10 cm  │
│ [Added] ✓                │
└──────────────────────────┘
```

## 🔐 Validation Flow

```
User Enters Dimensions
         │
         ▼
┌────────────────────────┐
│ Check if empty         │
│ Width & Height required│
└────────┬───────────────┘
         │
    ┌────┴────────────────────────────┐
    │                                 │
   YES                               NO
    │                                 │
    ▼                                 ▼
[Show Error]              ┌─────────────────────┐
    │                     │ Check min bounds    │
    │                     └────────┬────────────┘
    │                              │
    │                         ┌────┴────────────────────┐
    │                        YES                       NO
    │                         │                         │
    │                        ▼                         ▼
    │                  [Show Error]        ┌──────────────────────┐
    │                         │            │ Check max bounds     │
    │                         │            └────────┬─────────────┘
    │                         │                     │
    │                         │            ┌────────┴──────────────┐
    │                         │           YES                     NO
    │                         │            │                      │
    │                         │           ▼                      ▼
    │                         │      [Show Error]       ┌─────────────────┐
    │                         │            │           │ All Valid       │
    │                         │            │           └────────┬────────┘
    │                         │            │                    │
    └────────────┬────────────┴────────────┴────────────────────┤
                 │                                              │
                 ▼                                              ▼
        [Show Error Message]                    [Enable Confirm Button]
             Block submission                         │
                                                      ▼
                                           [Add to Cart with Dimensions]
```

## 💾 Storage Structure

```
Browser Cookies (Persistent)
├── cart: CartItem[]
│   ├── {
│   │   id: "1",
│   │   name: "Frame",
│   │   selectedSize: "Custom",
│   │   customDimensions: {
│   │     width: 25,
│   │     height: 30,
│   │     depth: 10
│   │   },
│   │   quantity: 1
│   │ }
│   └── ...more items
│
└── discountCode: string | null

Cart State (Runtime)
├── items: CartItem[]
├── total: number
├── subtotal: number
└── discount: number
```

## 🔍 Item Differentiation Logic

```
Same Product, Different Selections = Different Cart Items

Product ID: "frame-1"

┌─────────────────────┐
│ Selection A:        │
│ Size: Small         │
│ Dimensions: null    │
│ Color: Red          │
└─────────────────────┘
        │
        ├─ Key: "frame-1-Small-Red-null"
        │
        ▼
┌─────────────────────┐
│ Selection B:        │
│ Size: Custom        │
│ Dimensions: 25×30×10│
│ Color: Red          │
└─────────────────────┘
        │
        ├─ Key: "frame-1-Custom-Red-{...}"
        │
        ▼
Two Different Cart Entries!

Merging Logic:
- Same Product ID ✓
- Same Size ✓
- Same Color ✓
- Same Dimensions ✓
= Merge into one line item + qty
```

## 📋 Sample Product Structure

```
Radha Krishna Idol
├── id: "1"
├── name: "Radha Krishna Idol"
├── price: 2999
├── category: "idols"
│
├── sizes: [
│   { label: "Small", isStandard: true, isCustomizable: false },
│   { label: "Medium", isStandard: true, isCustomizable: false },
│   { label: "Large", isStandard: true, isCustomizable: false },
│   { label: "Custom", isStandard: false, isCustomizable: true }
│ ]
│
├── hasCustomSize: true
├── customSizeUnit: "cm"
├── minDimensions: { width: 5, height: 10 }
├── maxDimensions: { width: 50, height: 100 }
│
└── Result:
    Customer can choose:
    1. Standard: Small, Medium, or Large
    2. Custom: Enter width (5-50cm) and height (10-100cm)
```

---

**Visual Elements Summary:**
- ✅ Products with custom sizes have 4 size options (3 standard + 1 custom)
- ✅ Standard sizes work like before
- ✅ Custom size opens form with validation
- ✅ Cart stores all dimension data
- ✅ Different dimensions = different cart items
- ✅ Responsive on mobile and desktop
