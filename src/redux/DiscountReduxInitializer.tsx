import React, { useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAppDispatch, selectUser } from "../redux/hooks";
import {
  setActiveDiscounts,
  setDiscountLoading,
  setDiscountError,
} from "../redux/slices/discountSlice";
import { useAppSelector } from "../redux/hooks";
import type { Discount } from "../types/discount";

interface DiscountReduxInitializerProps {
  children: React.ReactNode;
}

/**
 * Component that initializes Redux discount state by fetching active discounts from Firestore
 */
export const DiscountReduxInitializer: React.FC<
  DiscountReduxInitializerProps
> = ({ children }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  useEffect(() => {
    const fetchActiveDiscounts = async () => {
      if (!user) {
        dispatch(setDiscountLoading(false));
        return;
      }

      try {
        dispatch(setDiscountLoading(true));

        // Setup default discounts if none exist
        const allDiscountsQuery = query(
          collection(db, "discounts"),
          where("isActive", "==", true)
        );
        const allDiscountsSnapshot = await getDocs(allDiscountsQuery);

        if (allDiscountsSnapshot.empty) {
          console.log("No active discounts found, creating defaults...");
          const defaultDiscounts = [
            {
              code: "WELCOME10",
              description: "Welcome discount for new users",
              discountType: "percentage" as const,
              value: 10,
              minPurchase: 0,
              maxDiscount: 100,
              userType: "new" as const,
              isActive: true,
              usageLimit: 1,
              currentUsage: 0,
              startDate: Timestamp.now(),
              endDate: Timestamp.fromDate(new Date(2025, 11, 31)),
            },
            {
              code: "SAVE20",
              description: "Save 20% on your purchase",
              discountType: "percentage" as const,
              value: 20,
              minPurchase: 50,
              maxDiscount: 200,
              userType: "all" as const,
              isActive: true,
              usageLimit: 100,
              currentUsage: 0,
              startDate: Timestamp.now(),
              endDate: Timestamp.fromDate(new Date(2025, 11, 31)),
            },
          ];

          for (const discount of defaultDiscounts) {
            await addDoc(collection(db, "discounts"), {
              ...discount,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }

        // Fetch all active discounts
        const q = query(
          collection(db, "discounts"),
          where("isActive", "==", true)
        );
        const querySnapshot = await getDocs(q);
        const discounts = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              startDate: doc.data().startDate.toDate(),
              endDate: doc.data().endDate?.toDate() || null,
              createdAt: doc.data().createdAt.toDate(),
              updatedAt: doc.data().updatedAt.toDate(),
            } as Discount)
        );

        dispatch(setActiveDiscounts(discounts));
      } catch (error) {
        console.error("Error fetching discounts:", error);
        dispatch(setDiscountError("Failed to load discounts"));
      } finally {
        dispatch(setDiscountLoading(false));
      }
    };

    fetchActiveDiscounts();
  }, [user, dispatch]);

  return <>{children}</>;
};
