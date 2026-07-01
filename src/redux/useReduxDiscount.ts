import { useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import {
  useAppDispatch,
  useAppSelector,
  selectUser,
  selectActiveDiscounts,
} from "./hooks";
import { setActiveDiscounts, setDiscountError } from "./slices/discountSlice";
import type { Discount, UserDiscountCreate } from "../types/discount";

/**
 * Custom hook for discount operations with Redux integration
 * Handles validating discounts and applying them to cart
 */
export const useReduxDiscount = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const activeDiscounts = useAppSelector(selectActiveDiscounts);

  const validateDiscount = useCallback(
    async (code: string, subtotal: number) => {
      if (!user) {
        return {
          isValid: false,
          discount: 0,
          message: "Please login to apply discount",
        };
      }

      try {
        const q = query(
          collection(db, "discounts"),
          where("code", "==", code.toUpperCase()),
          where("isActive", "==", true)
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          return {
            isValid: false,
            discount: 0,
            message: "Invalid discount code",
          };
        }

        const discount = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data(),
        } as Discount;

        // Check if discount is expired
        const endDate =
          discount.endDate instanceof Timestamp
            ? discount.endDate.toDate()
            : discount.endDate;

        if (endDate && endDate < new Date()) {
          return {
            isValid: false,
            discount: 0,
            message: "Discount code has expired",
          };
        }

        // Check if minimum purchase requirement is met
        if (discount.minPurchase && subtotal < discount.minPurchase) {
          return {
            isValid: false,
            discount: 0,
            message: `Minimum purchase of ${discount.minPurchase} required`,
          };
        }

        // Check usage limit
        if (discount.currentUsage >= discount.usageLimit) {
          return {
            isValid: false,
            discount: 0,
            message: "Discount code usage limit reached",
          };
        }

        // Check if user has already used this discount
        const usageQuery = query(
          collection(db, "discountUsage"),
          where("userId", "==", user.uid),
          where("discountId", "==", discount.id)
        );
        const usageSnapshot = await getDocs(usageQuery);

        if (!usageSnapshot.empty) {
          return {
            isValid: false,
            discount: 0,
            message: "You have already used this discount",
          };
        }

        // Calculate discount amount
        let discountAmount =
          discount.discountType === "percentage"
            ? (subtotal * discount.value) / 100
            : discount.value;

        // Apply maximum discount limit if set
        if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
          discountAmount = discount.maxDiscount;
        }

        return {
          isValid: true,
          discount: discountAmount,
          message: "Discount applied successfully",
        };
      } catch (error) {
        console.error("Error validating discount:", error);
        dispatch(setDiscountError("Error validating discount code"));
        return {
          isValid: false,
          discount: 0,
          message: "Error validating discount code",
        };
      }
    },
    [user, dispatch]
  );

  const applyDiscount = useCallback(
    async (code: string) => {
      if (!user) {
        return {
          success: false,
          discount: 0,
          message: "Please login to apply discount",
        };
      }

      try {
        const q = query(
          collection(db, "discounts"),
          where("code", "==", code.toUpperCase())
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          return {
            success: false,
            discount: 0,
            message: "Invalid discount code",
          };
        }

        const discountDoc = querySnapshot.docs[0];
        const discount = {
          id: discountDoc.id,
          ...discountDoc.data(),
        } as Discount;

        // Increment usage count
        await updateDoc(doc(db, "discounts", discount.id), {
          currentUsage: discount.currentUsage + 1,
          updatedAt: serverTimestamp(),
        });

        // Record usage
        await addDoc(collection(db, "discountUsage"), {
          discountId: discount.id,
          userId: user.uid,
          usedAt: serverTimestamp(),
          discountAmount: discount.value,
        });

        return {
          success: true,
          discount: discount.value,
          message: "Discount applied successfully",
        };
      } catch (error) {
        console.error("Error applying discount:", error);
        dispatch(setDiscountError("Error applying discount code"));
        return {
          success: false,
          discount: 0,
          message: "Error applying discount code",
        };
      }
    },
    [user, dispatch]
  );

  const refreshDiscounts = useCallback(async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, "discounts"),
        where("isActive", "==", true)
      );
      const querySnapshot = await getDocs(q);
      const discounts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const start = data.startDate;
        const end = data.endDate;
        const created = data.createdAt;
        const updated = data.updatedAt;
        return {
          id: doc.id,
          ...data,
          startDate:
            start && typeof start.toDate === "function"
              ? start.toDate().toISOString()
              : new Date(start).toISOString(),
          endDate:
            end && typeof end.toDate === "function"
              ? end.toDate().toISOString()
              : end
              ? new Date(end).toISOString()
              : null,
          createdAt:
            created && typeof created.toDate === "function"
              ? created.toDate().toISOString()
              : new Date(created).toISOString(),
          updatedAt:
            updated && typeof updated.toDate === "function"
              ? updated.toDate().toISOString()
              : new Date(updated).toISOString(),
        } as Discount;
      });

      dispatch(setActiveDiscounts(discounts));
    } catch (error) {
      console.error("Error refreshing discounts:", error);
      dispatch(setDiscountError("Failed to refresh discounts"));
    }
  }, [user, dispatch]);

  const checkFirstTimeDiscount = useCallback(async () => {
    if (!user) {
      return { hasDiscount: false };
    }

    try {
      // Check if user already has a first-time discount
      const userDiscountQuery = query(
        collection(db, "userDiscounts"),
        where("userId", "==", user.uid)
      );
      const userDiscountSnapshot = await getDocs(userDiscountQuery);

      if (!userDiscountSnapshot.empty) {
        return { hasDiscount: false };
      }

      // Get first-time user discount
      const discountQuery = query(
        collection(db, "discounts"),
        where("userType", "==", "new"),
        where("isActive", "==", true)
      );
      const discountSnapshot = await getDocs(discountQuery);

      if (discountSnapshot.empty) {
        return { hasDiscount: false };
      }

      const discount = {
        id: discountSnapshot.docs[0].id,
        ...discountSnapshot.docs[0].data(),
      } as Discount;

      // Create user discount record
      const userDiscount: UserDiscountCreate = {
        userId: user.uid,
        discountId: discount.id,
        isUsed: false,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "userDiscounts"), userDiscount);

      return { hasDiscount: true, discount };
    } catch (error) {
      console.error("Error checking first-time discount:", error);
      return { hasDiscount: false };
    }
  }, [user, dispatch]);

  return {
    activeDiscounts,
    validateDiscount,
    applyDiscount,
    refreshDiscounts,
    checkFirstTimeDiscount,
  };
};
