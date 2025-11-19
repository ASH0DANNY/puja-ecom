import { useCallback } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import {
  setSubscribers,
  addSubscriber,
  removeSubscriber,
  toggleSubscriber,
  setLoading,
  setError,
} from "../redux/slices/emailSubscriptionSlice";
import {
  useAppDispatch,
  useAppSelector,
  selectSubscribers,
  selectActiveSubscribers,
  selectEmailSubscriptionLoading,
  selectEmailSubscriptionError,
} from "../redux/hooks";
import type { SubscribedEmail } from "../types/promotion";

export const useEmailSubscription = () => {
  const dispatch = useAppDispatch();
  const subscribers = useAppSelector(selectSubscribers);
  const activeSubscribers = useAppSelector(selectActiveSubscribers);
  const loading = useAppSelector(selectEmailSubscriptionLoading);
  const error = useAppSelector(selectEmailSubscriptionError);

  // Fetch all subscribers
  const fetchSubscribers = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const querySnapshot = await getDocs(collection(db, "subscribedEmails"));
      const subscribersData = querySnapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          subscribedAt:
            data.subscribedAt instanceof Timestamp
              ? data.subscribedAt.toDate()
              : new Date(data.subscribedAt),
        } as SubscribedEmail;
      });
      dispatch(setSubscribers(subscribersData));
      dispatch(setError(null));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch subscribers";
      dispatch(setError(errorMessage));
      console.error("Error fetching subscribers:", err);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Subscribe email
  const subscribeEmail = useCallback(
    async (email: string) => {
      try {
        // Check if email already exists
        const q = query(
          collection(db, "subscribedEmails"),
          where("email", "==", email)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const existingDoc = querySnapshot.docs[0];
          // If exists but inactive, reactivate
          if (!(existingDoc.data() as any).isActive) {
            await updateDoc(existingDoc.ref, { isActive: true });
            const reactivated: SubscribedEmail = {
              id: existingDoc.id,
              ...existingDoc.data(),
            } as SubscribedEmail;
            dispatch(toggleSubscriber({ id: existingDoc.id, isActive: true }));
            dispatch(setError(null));
            return reactivated;
          }
          dispatch(setError("Email already subscribed"));
          throw new Error("Email already subscribed");
        }

        // Add new subscriber
        const docRef = await addDoc(collection(db, "subscribedEmails"), {
          email,
          subscribedAt: Timestamp.now(),
          isActive: true,
        });

        const newSubscriber: SubscribedEmail = {
          id: docRef.id,
          email,
          subscribedAt: new Date(),
          isActive: true,
        };

        dispatch(addSubscriber(newSubscriber));
        dispatch(setError(null));
        return newSubscriber;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to subscribe email";
        dispatch(setError(errorMessage));
        console.error("Error subscribing email:", err);
        throw err;
      }
    },
    [dispatch]
  );

  // Unsubscribe email
  const unsubscribeEmail = useCallback(
    async (subscriberId: string) => {
      try {
        await updateDoc(doc(db, "subscribedEmails", subscriberId), {
          isActive: false,
        });
        dispatch(toggleSubscriber({ id: subscriberId, isActive: false }));
        dispatch(setError(null));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to unsubscribe";
        dispatch(setError(errorMessage));
        console.error("Error unsubscribing:", err);
        throw err;
      }
    },
    [dispatch]
  );

  // Delete subscriber completely
  const deleteSubscriber = useCallback(
    async (subscriberId: string) => {
      dispatch(setLoading(true));
      try {
        await deleteDoc(doc(db, "subscribedEmails", subscriberId));
        dispatch(removeSubscriber(subscriberId));
        dispatch(setError(null));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete subscriber";
        dispatch(setError(errorMessage));
        console.error("Error deleting subscriber:", err);
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  // Get emails for bulk sending (active subscribers only)
  const getSubscriberEmails = useCallback((): string[] => {
    return activeSubscribers.map((sub) => sub.email);
  }, [activeSubscribers]);

  return {
    subscribers,
    activeSubscribers,
    loading,
    error,
    fetchSubscribers,
    subscribeEmail,
    unsubscribeEmail,
    deleteSubscriber,
    getSubscriberEmails,
  };
};
