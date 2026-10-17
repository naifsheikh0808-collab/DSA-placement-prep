"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  googleProvider,
  db,
  isFirebaseConfigured,
} from "@/lib/firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { loadProgress, saveProgress, type UserProgress } from "@/lib/db";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  syncToCloud: (progressData: Record<string, UserProgress>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  signInWithGoogle: async () => {},
  logout: async () => {},
  syncToCloud: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && db) {
        // Automatically sync & merge local storage with Firestore upon sign-in
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          const localData = loadProgress();

          if (docSnap.exists()) {
            const cloudProgress = (docSnap.data()?.progress || {}) as Record<string, UserProgress>;
            // Merge cloud + local (cloud wins on conflict unless local is newer)
            const merged = { ...localData, ...cloudProgress };
            saveProgress(merged);
            // Write back merged to cloud
            await setDoc(userDocRef, { progress: merged, updatedAt: new Date().toISOString() }, { merge: true });
          } else if (Object.keys(localData).length > 0) {
            // First time sign-in: push local progress to cloud
            await setDoc(userDocRef, {
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              progress: localData,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("Firestore sync error on login:", err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      alert(
        "Firebase is not yet configured with your project API keys. Please add your Firebase credentials to .env.local to enable Google Login!"
      );
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      if (error?.code !== "auth/popup-closed-by-user") {
        alert(`Google Sign-In failed: ${error?.message || "Unknown error"}`);
      }
    }
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
  };

  const syncToCloud = async (progressData: Record<string, UserProgress>) => {
    if (!user || !db || !isFirebaseConfigured) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          progress: progressData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to sync progress to Firestore:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        signInWithGoogle,
        logout,
        syncToCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
