import React, { useEffect } from "react";
import { type User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useAppDispatch, selectAuthLoading } from "../redux/hooks";
import { initializeAuth } from "../redux/slices/authSlice";
import { useAppSelector } from "../redux/hooks";
import type { User, UserRole } from "../types/dashboard";

interface AuthReduxInitializerProps {
  children: React.ReactNode;
}

/**
 * Component that initializes Redux auth state by listening to Firebase auth changes
 * Should wrap the entire app to ensure auth state is loaded before rendering
 */
export const AuthReduxInitializer: React.FC<AuthReduxInitializerProps> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            // Get additional user data from Firestore
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            const userData = userDoc.data();

            if (userData) {
              // Check if user's email is verified (skip for admins)
              if (!firebaseUser.emailVerified && userData.role !== "admin") {
                console.log("User email not verified. Keeping user logged out.");
                dispatch(initializeAuth(null));
                return;
              }

              const user: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName,
                role: userData.role as UserRole,
                emailVerified: firebaseUser.emailVerified,
                createdAt: userData.createdAt?.toDate
                  ? userData.createdAt.toDate()
                  : new Date(),
                lastLogin: userData.lastLogin?.toDate
                  ? userData.lastLogin.toDate()
                  : new Date(),
              };
              dispatch(initializeAuth(user));
            } else {
              dispatch(initializeAuth(null));
            }
          } catch (error) {
            console.error("Error initializing auth:", error);
            dispatch(initializeAuth(null));
          }
        } else {
          dispatch(initializeAuth(null));
        }
      }
    );

    return () => unsubscribe();
  }, [dispatch]);

  // Show loading state while initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
