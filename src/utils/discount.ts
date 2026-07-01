import type { Discount } from "../types/discount";

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
};

export const isDiscountValid = (
  discount: Discount,
  subtotal: number
): boolean => {
  if (!discount.isActive) return false;

  const now = new Date();
  const startDate = parseDate(discount.startDate);
  const endDate = parseDate(discount.endDate);

  if (startDate && now < startDate) return false;
  if (endDate && now > endDate) return false;
  if (discount.minPurchase != null && subtotal < discount.minPurchase)
    return false;
  if (
    discount.usageLimit != null &&
    discount.usageLimit > 0 &&
    discount.currentUsage >= discount.usageLimit
  )
    return false;

  return true;
};
