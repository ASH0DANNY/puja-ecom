export interface Discount {
    id: string;
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    startDate: Date;
    endDate: Date | null;
    usageLimit: number;
    currentUsage: number;
    userType: 'new' | 'all' | 'specific';
    specificUsers?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface DiscountUsage {
    id: string;
    discountId: string;
    userId: string;
    orderId: string;
    discountAmount: number;
    usedAt: Date;
}

import type { FieldValue } from 'firebase/firestore';

export interface UserDiscountCreate {
    userId: string;
    discountId: string;
    isUsed: boolean;
    expiryDate: Date;
    createdAt: FieldValue;
}

export interface UserDiscount extends Omit<UserDiscountCreate, 'createdAt'> {
    createdAt: Date;
}

export interface UserDiscountWithId extends UserDiscount {
    id: string;
}
