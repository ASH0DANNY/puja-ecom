import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import type { Discount, UserDiscountCreate } from '../types/discount';

interface DiscountContextType {
    applyDiscount: (code: string) => Promise<{ success: boolean; discount: number; message: string; }>;
    validateDiscount: (code: string, subtotal: number) => Promise<{ isValid: boolean; discount: number; message: string; }>;
    checkFirstTimeDiscount: () => Promise<{ hasDiscount: boolean; discount?: Discount; }>;
    activeDiscounts: Discount[];
    loading: boolean;
}

const DiscountContext = createContext<DiscountContextType | undefined>(undefined);

export const useDiscount = () => {
    const context = useContext(DiscountContext);
    if (!context) {
        throw new Error('useDiscount must be used within a DiscountProvider');
    }
    return context;
};

export const DiscountProvider = ({ children }: { children: ReactNode }) => {
    const [activeDiscounts, setActiveDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const ensureFirstTimeDiscount = async () => {
            try {
                const firstTimeQuery = query(
                    collection(db, 'discounts'),
                    where('userType', '==', 'new'),
                    where('isActive', '==', true)
                );
                const snapshot = await getDocs(firstTimeQuery);

                if (snapshot.empty) {
                    // Create a default first-time discount if none exists
                    await addDoc(collection(db, 'discounts'), {
                        code: 'WELCOME10',
                        description: 'Welcome discount for new users',
                        discountType: 'percentage',
                        value: 10,
                        minPurchase: 0,
                        maxDiscount: 100,
                        userType: 'new',
                        isActive: true,
                        usageLimit: 1,
                        currentUsage: 0,
                        startDate: Timestamp.now(),
                        endDate: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                }
            } catch (error) {
                console.error('Error ensuring first-time discount:', error);
            }
        };

        const fetchActiveDiscounts = async () => {
            if (!user) return;

            try {
                await ensureFirstTimeDiscount();
                const q = query(
                    collection(db, 'discounts'),
                    where('isActive', '==', true),
                    where('endDate', '>', Timestamp.now())
                );

                const querySnapshot = await getDocs(q);
                const discounts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    startDate: doc.data().startDate.toDate(),
                    endDate: doc.data().endDate?.toDate() || null,
                    createdAt: doc.data().createdAt.toDate(),
                    updatedAt: doc.data().updatedAt.toDate(),
                }) as Discount);

                setActiveDiscounts(discounts);
            } catch (error) {
                console.error('Error fetching discounts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveDiscounts();
    }, [user]);

    const validateDiscount = async (code: string, subtotal: number) => {
        if (!user) {
            return { isValid: false, discount: 0, message: 'Please login to apply discount' };
        }

        try {
            const q = query(
                collection(db, 'discounts'),
                where('code', '==', code.toUpperCase()),
                where('isActive', '==', true)
            );

            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                return { isValid: false, discount: 0, message: 'Invalid discount code' };
            }

            const discount = {
                id: querySnapshot.docs[0].id,
                ...querySnapshot.docs[0].data()
            } as Discount;

            // Check if discount is expired
            const endDate = discount.endDate instanceof Timestamp
                ? discount.endDate.toDate()
                : discount.endDate;

            if (endDate && endDate < new Date()) {
                return { isValid: false, discount: 0, message: 'Discount code has expired' };
            }

            // Check if minimum purchase requirement is met
            if (discount.minPurchase && subtotal < discount.minPurchase) {
                return {
                    isValid: false,
                    discount: 0,
                    message: `Minimum purchase of $${discount.minPurchase} required`
                };
            }

            // Check usage limit
            if (discount.currentUsage >= discount.usageLimit) {
                return { isValid: false, discount: 0, message: 'Discount code usage limit reached' };
            }

            // Check if user has already used this discount
            const usageQuery = query(
                collection(db, 'discountUsage'),
                where('userId', '==', user.uid),
                where('discountId', '==', discount.id)
            );
            const usageSnapshot = await getDocs(usageQuery);

            if (!usageSnapshot.empty) {
                return { isValid: false, discount: 0, message: 'You have already used this discount' };
            }

            // Calculate discount amount
            let discountAmount = discount.discountType === 'percentage'
                ? (subtotal * discount.value / 100)
                : discount.value;

            // Apply maximum discount limit if set
            if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
                discountAmount = discount.maxDiscount;
            }

            return {
                isValid: true,
                discount: discountAmount,
                message: 'Discount applied successfully'
            };
        } catch (error) {
            console.error('Error validating discount:', error);
            return { isValid: false, discount: 0, message: 'Error validating discount code' };
        }
    };

    const applyDiscount = async (code: string) => {
        if (!user) {
            return { success: false, discount: 0, message: 'Please login to apply discount' };
        }

        try {
            const q = query(
                collection(db, 'discounts'),
                where('code', '==', code.toUpperCase())
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return { success: false, discount: 0, message: 'Invalid discount code' };
            }

            const discountDoc = querySnapshot.docs[0];
            const discount = { id: discountDoc.id, ...discountDoc.data() } as Discount;

            // Increment usage count
            await updateDoc(doc(db, 'discounts', discount.id), {
                currentUsage: discount.currentUsage + 1,
                updatedAt: serverTimestamp()
            });

            // Record usage
            await addDoc(collection(db, 'discountUsage'), {
                discountId: discount.id,
                userId: user.uid,
                usedAt: serverTimestamp(),
                discountAmount: discount.value
            });

            return {
                success: true,
                discount: discount.value,
                message: 'Discount applied successfully'
            };
        } catch (error) {
            console.error('Error applying discount:', error);
            return { success: false, discount: 0, message: 'Error applying discount code' };
        }
    };

    const checkFirstTimeDiscount = async () => {
        if (!user) {
            return { hasDiscount: false };
        }

        try {
            // Check if user already has a first-time discount
            const userDiscountQuery = query(
                collection(db, 'userDiscounts'),
                where('userId', '==', user.uid)
            );
            const userDiscountSnapshot = await getDocs(userDiscountQuery);

            if (!userDiscountSnapshot.empty) {
                return { hasDiscount: false };
            }

            // Get first-time user discount
            const discountQuery = query(
                collection(db, 'discounts'),
                where('userType', '==', 'new'),
                where('isActive', '==', true)
            );
            const discountSnapshot = await getDocs(discountQuery);

            if (discountSnapshot.empty) {
                return { hasDiscount: false };
            }

            const discount = {
                id: discountSnapshot.docs[0].id,
                ...discountSnapshot.docs[0].data()
            } as Discount;

            // Create user discount record
            const userDiscount: UserDiscountCreate = {
                userId: user.uid,
                discountId: discount.id,
                isUsed: false,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'userDiscounts'), userDiscount);

            return { hasDiscount: true, discount };
        } catch (error) {
            console.error('Error checking first-time discount:', error);
            return { hasDiscount: false };
        }
    };

    const value = {
        applyDiscount,
        validateDiscount,
        checkFirstTimeDiscount,
        activeDiscounts,
        loading
    };

    return (
        <DiscountContext.Provider value={value}>
            {children}
        </DiscountContext.Provider>
    );
};
