import { useCallback } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset,
  sendEmailVerification as firebaseSendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import {
  useAppDispatch,
  useAppSelector,
  selectUser,
  selectAuthLoading,
} from "./hooks";
import { setUser, clearUser, setAuthError } from "./slices/authSlice";
import type { User, UserRole } from "../types/dashboard";

/**
 * Custom hook for authentication operations with Redux integration
 * Handles login, signup, logout, and password reset
 */
export const useReduxAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectAuthLoading);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Update last login time
        await setDoc(
          doc(db, "users", userCredential.user.uid),
          {
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );

        // Get updated user data from Firestore
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        const userData = userDoc.data();

        if (userData) {
          const user: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email!,
            displayName: userCredential.user.displayName,
            role: userData.role as UserRole,
            emailVerified: userCredential.user.emailVerified,
            createdAt: userData.createdAt?.toDate
              ? userData.createdAt.toDate()
              : new Date(),
            lastLogin: userData.lastLogin?.toDate
              ? userData.lastLogin.toDate()
              : new Date(),
          };
          dispatch(setUser(user));
        }
      } catch (error) {
        console.error("Login error:", error);
        dispatch(setAuthError((error as Error).message));
        throw error;
      }
    },
    [dispatch]
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Create a user document in Firestore
        const userData = {
          email: email,
          role: "user" as UserRole,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          displayName: null,
          emailVerified: false, // Mark email as not verified
        };

        await setDoc(doc(db, "users", userCredential.user.uid), userData);

        // DO NOT set user in Redux - keep them logged out until email is verified
        // User will only be authenticated after clicking verification link
        console.log("Account created. User must verify email before access.");
      } catch (error) {
        console.error("Signup error:", error);
        dispatch(setAuthError((error as Error).message));
        throw error;
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
    } catch (error) {
      console.error("Logout error:", error);
      dispatch(setAuthError((error as Error).message));
      throw error;
    }
  }, [dispatch]);

  const sendPasswordResetEmail = useCallback(
    async (email: string) => {
      try {
        const passwordResetUrl =
          import.meta.env.VITE_PASSWORD_RESET_URL || window.location.origin;

        await firebaseSendPasswordResetEmail(auth, email, {
          url: `${passwordResetUrl}/reset-password`,
          handleCodeInApp: false,
        });
      } catch (error) {
        console.error("Password reset email error:", error);
        dispatch(setAuthError((error as Error).message));
        throw error;
      }
    },
    [dispatch]
  );

  const confirmPasswordResetHandler = useCallback(
    async (oobCode: string, newPassword: string) => {
      try {
        await confirmPasswordReset(auth, oobCode, newPassword);
      } catch (error) {
        console.error("Password confirmation error:", error);
        dispatch(setAuthError((error as Error).message));
        throw error;
      }
    },
    [dispatch]
  );

  const sendEmailVerification = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No user is currently signed in");
      }

      const verificationUrl =
        import.meta.env.VITE_APP_BASE_URL || window.location.origin;

      await firebaseSendEmailVerification(currentUser, {
        url: `${verificationUrl}/?emailVerified=true`,
        handleCodeInApp: true,
      });

      console.log("Email verification link sent to:", currentUser.email);
      return true;
    } catch (error) {
      console.error("Email verification error:", error);
      dispatch(setAuthError((error as Error).message));
      throw error;
    }
  }, [dispatch]);

  const verifyEmailWithCode = useCallback(async () => {
    try {
      // Verify the email with Firebase
      // Firebase automatically verifies when user clicks link in email
      // This function checks if email is verified on current user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No user is currently signed in");
      }

      // Reload user to get latest verification status
      await currentUser.reload();

      if (currentUser.emailVerified) {
        console.log("Email successfully verified!");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Email verification error:", error);
      dispatch(setAuthError((error as Error).message));
      throw error;
    }
  }, [dispatch]);

  return {
    user,
    loading,
    login,
    signup,
    logout,
    sendPasswordResetEmail,
    confirmPasswordReset: confirmPasswordResetHandler,
    sendEmailVerification,
    verifyEmailWithCode,
  };
};
