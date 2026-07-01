import { useCallback } from "react";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAppDispatch, useAppSelector, selectUser } from "./hooks";
import {
  setAddresses,
  addAddressSuccess,
  updateAddressSuccess,
  deleteAddressSuccess,
  setDefaultAddressSuccess,
  setAddressLoading,
  setAddressError,
} from "./slices/addressSlice";
import type { SavedAddress, SavedAddressPayload } from "../types/address";

export const useReduxAddress = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const addresses = useAppSelector((state) => state.address.addresses);
  const loading = useAppSelector((state) => state.address.loading);
  const fetched = useAppSelector((state) => state.address.fetched);
  const error = useAppSelector((state) => state.address.error);

  const fetchAddresses = useCallback(
    async (forceRefresh = false) => {
      if (!user) return;
      if (fetched && !forceRefresh) return;

      console.log("useReduxAddress.fetchAddresses called", { uid: user.uid, fetched, forceRefresh });
      dispatch(setAddressLoading(true));
      try {
        const addressesCollection = collection(
          db,
          "users",
          user.uid,
          "addresses"
        );
        const addressesQuery = query(addressesCollection, orderBy("createdAt", "desc"));
        const addressSnapshot = await getDocs(addressesQuery);
        const loadedAddresses: SavedAddress[] = addressSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<SavedAddress, "id">),
        }));
        console.log("useReduxAddress.fetchAddresses result", { count: loadedAddresses.length, loadedAddresses });
        dispatch(setAddresses(loadedAddresses));
      } catch (err) {
        console.error("Error fetching saved addresses:", err);
        dispatch(setAddressError("Failed to load saved addresses."));
      }
    },
    [dispatch, fetched, user]
  );

  const sanitizeForFirestore = <T extends Record<string, any>>(obj: T) => {
    const out: Partial<T> = {};
    Object.keys(obj).forEach((key) => {
      const val = (obj as any)[key];
      if (val !== undefined) {
        (out as any)[key] = val;
      }
    });
    return out;
  };

  const setDefaultAddress = useCallback(
    async (addressId: string) => {
      if (!user) {
        throw new Error("User must be logged in to set default addresses.");
      }
      dispatch(setAddressLoading(true));
      try {
        const addressesCollection = collection(
          db,
          "users",
          user.uid,
          "addresses"
        );
        const addressSnapshot = await getDocs(addressesCollection);
        const batchUpdates: Promise<void>[] = [];
        addressSnapshot.docs.forEach((docSnap) => {
          const addressRef = doc(db, "users", user.uid, "addresses", docSnap.id);
          batchUpdates.push(
            updateDoc(addressRef, {
              isDefault: docSnap.id === addressId,
              updatedAt: serverTimestamp(),
            })
          );
        });
        await Promise.all(batchUpdates);
        dispatch(setDefaultAddressSuccess(addressId));
      } catch (err) {
        console.error("Error setting default address:", err);
        dispatch(setAddressError("Failed to set default address."));
        throw err;
      }
    },
    [dispatch, user]
  );

  const addAddress = useCallback(
    async (payload: SavedAddressPayload) => {
      if (!user) {
        throw new Error("User must be logged in to save addresses.");
      }
      dispatch(setAddressLoading(true));
      try {
        const addressesCollection = collection(
          db,
          "users",
          user.uid,
          "addresses"
        );
        const firestorePayload = sanitizeForFirestore({
          ...payload,
          country: "India",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        const newDoc = await addDoc(addressesCollection, firestorePayload as any);
        const createdAddress: SavedAddress = {
          id: newDoc.id,
          ...payload,
          country: "India",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        dispatch(addAddressSuccess(createdAddress));
        if (payload.isDefault) {
          await setDefaultAddress(createdAddress.id);
        }
        return createdAddress;
      } catch (err) {
        console.error("Error adding saved address:", err);
        dispatch(setAddressError("Failed to save address."));
        throw err;
      }
    },
    [dispatch, setDefaultAddress, user]
  );

  const updateAddress = useCallback(
    async (addressId: string, payload: Partial<SavedAddressPayload>) => {
      if (!user) {
        throw new Error("User must be logged in to update addresses.");
      }
      dispatch(setAddressLoading(true));
      try {
        const addressRef = doc(db, "users", user.uid, "addresses", addressId);
        const firestorePayload = sanitizeForFirestore({
          ...payload,
          updatedAt: serverTimestamp(),
        });
        await updateDoc(addressRef, firestorePayload as any);
        if (payload.isDefault) {
          await setDefaultAddress(addressId);
        }
        const updatedAddress: SavedAddress = {
          id: addressId,
          ...(payload as SavedAddressPayload),
          country: "India",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        dispatch(updateAddressSuccess(updatedAddress));
        return updatedAddress;
      } catch (err) {
        console.error("Error updating saved address:", err);
        dispatch(setAddressError("Failed to update address."));
        throw err;
      }
    },
    [dispatch, setDefaultAddress, user]
  );

  const deleteAddress = useCallback(
    async (addressId: string) => {
      if (!user) {
        throw new Error("User must be logged in to delete addresses.");
      }
      dispatch(setAddressLoading(true));
      try {
        const addressRef = doc(db, "users", user.uid, "addresses", addressId);
        await deleteDoc(addressRef);
        dispatch(deleteAddressSuccess(addressId));
      } catch (err) {
        console.error("Error deleting saved address:", err);
        dispatch(setAddressError("Failed to delete address."));
        throw err;
      }
    },
    [dispatch, user]
  );

  return {
    addresses,
    loading,
    fetched,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
};
