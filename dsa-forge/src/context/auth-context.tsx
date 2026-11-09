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
import {
  loadProgress,
  saveProgress,
  resetProgress,
  PROGRESS_UPDATED_EVENT,
  type UserProgress,
} from "@/lib/db";
import {
  savePlan,
  deletePlan,
  savePlannerProfile,
  deletePlannerProfile,
  PLAN_UPDATED_EVENT,
} from "@/lib/plan-storage";

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
        // Automatically sync cloud data with local store upon sign-in
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const cloudProgress = (data?.progress || {}) as Record<string, UserProgress>;
            saveProgress(cloudProgress, true);

            if (data?.studyPlan) {
              savePlan(data.studyPlan, true);
            } else {
              deletePlan(true);
            }

            if (data?.plannerProfile) {
              savePlannerProfile(data.plannerProfile, true);
            } else {
              deletePlannerProfile(true);
            }

            // Sync cloud BYOK keys across devices (laptop <-> phone)
            const cloudByok = data?.byok;
            const localGemini = typeof window !== "undefined"
              ? localStorage.getItem(`prime_ai_gemini_key_${currentUser.uid}`) || localStorage.getItem("prime_ai_gemini_key")
              : null;
            const localGroq = typeof window !== "undefined"
              ? localStorage.getItem(`prime_ai_groq_key_${currentUser.uid}`) || localStorage.getItem("prime_ai_groq_key")
              : null;

            const finalGemini = cloudByok?.geminiKey || localGemini || null;
            const finalGroq = cloudByok?.groqKey || localGroq || null;

            if (typeof window !== "undefined") {
              if (finalGemini) {
                localStorage.setItem(`prime_ai_gemini_key_${currentUser.uid}`, finalGemini);
                localStorage.setItem("prime_ai_gemini_key", finalGemini);
              }
              if (finalGroq) {
                localStorage.setItem(`prime_ai_groq_key_${currentUser.uid}`, finalGroq);
                localStorage.setItem("prime_ai_groq_key", finalGroq);
              }
            }

            // If keys existed locally on laptop but not in cloud, sync up to Firestore
            const needsCloudSync = (!cloudByok?.geminiKey && localGemini) || (!cloudByok?.groqKey && localGroq);
            if (needsCloudSync) {
              await setDoc(
                userDocRef,
                {
                  byok: {
                    ...(finalGemini ? { geminiKey: finalGemini } : {}),
                    ...(finalGroq ? { groqKey: finalGroq } : {}),
                  },
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              );
            }

            // Also keep user profile & photoURL fresh in Firestore
            await setDoc(
              userDocRef,
              {
                displayName: currentUser.displayName,
                email: currentUser.email,
                photoURL: currentUser.photoURL,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );

            // Warm server BYOK memory cache in background
            if (finalGemini || finalGroq) {
              currentUser.getIdToken().then((token) => {
                if (finalGemini) {
                  fetch("/api/ai/config", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ apiKey: finalGemini, provider: "gemini", validate: false }),
                  }).catch(() => {});
                }
                if (finalGroq) {
                  fetch("/api/ai/config", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ apiKey: finalGroq, provider: "groq", validate: false }),
                  }).catch(() => {});
                }
              }).catch(() => {});
            }

            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("leetprime:byok-updated"));
            }
          } else {
            // First time sign-in for this account: start fresh and initialize in Firestore
            resetProgress(true);
            deletePlan(true);
            deletePlannerProfile(true);

            await setDoc(userDocRef, {
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              progress: {},
              studyPlan: null,
              plannerProfile: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("Firestore sync error on login:", err);
        }
      } else {
        // Logged out / guest mode: ensure clean slate so previous user's data doesn't linger
        resetProgress(true);
        deletePlan(true);
        deletePlannerProfile(true);
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
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Sign-out error:", err);
      }
    }
    // Clean local user data so guest mode or the next user doesn't inherit it
    resetProgress(true);
    deletePlan(true);
    deletePlannerProfile(true);

    if (typeof window !== "undefined") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k &&
          (k.startsWith("prime_ai_chat_") ||
            k.startsWith("prime_ai_gemini_key_") ||
            k.startsWith("prime_ai_groq_key_") ||
            k === "prime_ai_gemini_key" ||
            k === "prime_ai_groq_key" ||
            k === "dsaforge_progress" ||
            k === "leetprime_study_plan" ||
            k === "leetprime_smart_plan_profile")
        ) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      window.dispatchEvent(new Event(PLAN_UPDATED_EVENT));
      window.dispatchEvent(new Event("leetprime:plan-updated"));
      window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
      window.dispatchEvent(new Event("leetprime:chat-updated"));
      window.dispatchEvent(new Event("leetprime:byok-updated"));
      window.dispatchEvent(new Event("storage"));
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
