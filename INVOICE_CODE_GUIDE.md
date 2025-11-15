# Invoice System - Code Structure & Usage

## Quick Start

### For Displaying Invoice Button in Any Order:
```tsx
import { OrderInvoice } from "./components/OrderInvoice";
import type { Order } from "./types/order";

// In your component:
const MyComponent = ({ order }: { order: Order }) => {
  return (
    <div>
      <OrderInvoice order={order} />
    </div>
  );
};
```

The OrderInvoice component will:
1. Render a blue "Invoice" button
2. Handle all modal logic internally
3. Manage PDF generation and download

### For Direct Modal Control:
```tsx
import { InvoiceModal } from "./components/InvoiceModal";
import { useState } from "react";

export const MyComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const order = /* your order data */;

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Open Invoice
      </button>
      
      <InvoiceModal
        order={order}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
```

## Component Files

### 1. InvoiceModal.tsx
**Location**: `src/components/InvoiceModal.tsx`
**Purpose**: Modal UI for preview/download options

**Props**:
```typescript
interface InvoiceModalProps {
  order: Order;           // Order object with all details
  isOpen: boolean;        // Modal visibility state
  onClose: () => void;    // Callback to close modal
}
```

**Features**:
- Automatic PDF generation on button click
- Error handling and loading states
- Order summary preview
- Two action buttons (Preview & Download)

### 2. OrderInvoice.tsx (Updated)
**Location**: `src/components/OrderInvoice.tsx`
**Purpose**: Wrapper component for easy integration

**Usage**:
```tsx
<OrderInvoice order={selectedOrder} />
```

**What it does**:
- Renders a single button
- Manages modal open/close state
- Passes all logic to InvoiceModal

### 3. OrderTable.tsx (Updated)
**Location**: `src/components/OrderTable.tsx`
**Purpose**: Admin dashboard orders table with invoice button

**Changes**:
- Added `invoiceModalOrder` state
- Added Invoice button in actions column (green color)
- Added InvoiceModal component at bottom

### 4. exportPdf.ts (Enhanced)
**Location**: `src/utils/exportPdf.ts`
**Function**: `generateInvoicePdf(invoiceData, filename)`

**Input**:
```typescript
{
  orderId: string;
  date: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
    dimensions?: string;
    color?: string;
  }>;
  subtotal: number;
  discount: number;
  total: number;
}
```

**Output**: jsPDF object ready for preview/download

## Data Flow

```
User clicks "Invoice" button
        ↓
OrderInvoice component opens modal
        ↓
InvoiceModal displays summary & options
        ↓
User clicks "Preview" or "Download"
        ↓
Invoice data compiled from Order object
        ↓
generateInvoicePdf() creates PDF
        ↓
previewPdf() [opens in tab] OR downloadPdf() [saves file]
        ↓
Modal closes (optional on download)
```

## Styling Guide

### Modal Styling
```css
Header: bg-gradient-to-r from-blue-600 to-blue-700
Content: bg-white with light gray preview section
Buttons: 
  - Preview: blue outline style
  - Download: green solid style
```

### PDF Styling
```
Header: Large bold title with blue line
Colors: Blue (#0066CC) for headers and totals
Table: Gray alternating rows for readability
Footer: Italic gray text
```

## Type Definitions

The system uses the existing Order type from `src/types/order.ts`:

```typescript
export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  priceAtOrder: number;
  selectedSize?: string;
  selectedColor?: string;
  customDimensions?: {
    width: number;
    height: number;
    depth?: number;
  };
}
```

## Error Handling

### In InvoiceModal:
- Try-catch wraps PDF generation
- Error messages displayed in modal
- User feedback on failures
- Buttons disabled during generation

```typescript
try {
  const pdf = generateInvoicePdf(invoiceData, filename);
  previewPdf(pdf) // or downloadPdf()
} catch (err) {
  setError(err instanceof Error ? err.message : "Failed");
}
```

## Browser APIs Used

- **window.open()**: For preview (opens in new tab)
- **Blob**: For file creation
- **URL.createObjectURL()**: For blob URLs
- **PDF.save()**: jsPDF download method

## Performance Notes

- PDF generation is fast (< 1 second for most orders)
- Large orders with many items may take slightly longer
- Automatic pagination handles long invoices
- No network calls required (all client-side)

## Testing Notes

### Manual Testing:
1. Place an order as a customer
2. Go to "My Orders"
3. Click "View Details" on an order
4. Click the "Invoice" button
5. Test both "Preview Invoice" and "Download PDF"

### Admin Testing:
1. Go to Admin Dashboard
2. Navigate to Orders section
3. Find any order row
4. Click the "Invoice" button
5. Test preview and download functionality

### Edge Cases to Test:
- Orders with custom dimensions
- Orders with discount codes
- Orders with multiple items
- Very long product names
- Orders with special characters in names

## Customization

### To Change Colors:
Edit `InvoiceModal.tsx` button classes and `exportPdf.ts` PDF colors:
```typescript
// In InvoiceModal.tsx
pdf.setFillColor(0, 102, 204); // Change RGB values

// In button styles
className="bg-blue-500 hover:bg-blue-600" // Change Tailwind classes
```

### To Change Invoice Format:
Edit `generateInvoicePdf()` function in `exportPdf.ts`:
- Adjust margins: `const margin = 15;`
- Change fonts: `pdf.setFont("helvetica", "bold");`
- Modify colors: `pdf.setFillColor(r, g, b);`
- Add/remove sections as needed

### To Add Company Logo:
Add to InvoiceModal or generateInvoicePdf:
```typescript
const logoImg = new Image();
logoImg.src = "/logo.png";
pdf.addImage(logoImg, "PNG", x, y, width, height);
```

## Dependencies

- **jsPDF**: PDF generation (already installed)
- **lucide-react**: Icons (already installed)
- **React 18+**: Hooks (useState)
- **TypeScript**: Type safety

No additional npm packages needed!

## Related Files
- `src/pages/OrdersPage.tsx` - User's orders list
- `src/pages/DashboardPage.tsx` - Admin dashboard
- `src/types/order.ts` - Type definitions
- `src/config/firebase.ts` - Firebase setup
- `src/context/AuthContext.tsx` - User authentication
