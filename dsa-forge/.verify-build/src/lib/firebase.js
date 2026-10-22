"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleProvider = exports.db = exports.auth = exports.app = exports.isFirebaseConfigured = void 0;
// Firebase Configuration & Initialization
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
// Check if Firebase is properly configured
exports.isFirebaseConfigured = Boolean(firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "your_api_key_here" &&
    firebaseConfig.projectId);
let app = null;
exports.app = app;
let auth = null;
exports.auth = auth;
let db = null;
exports.db = db;
let googleProvider = null;
exports.googleProvider = googleProvider;
if (typeof window !== "undefined" && exports.isFirebaseConfigured) {
    try {
        exports.app = app = (0, app_1.getApps)().length > 0 ? (0, app_1.getApp)() : (0, app_1.initializeApp)(firebaseConfig);
        exports.auth = auth = (0, auth_1.getAuth)(app);
        exports.db = db = (0, firestore_1.getFirestore)(app);
        exports.googleProvider = googleProvider = new auth_1.GoogleAuthProvider();
        googleProvider.setCustomParameters({ prompt: "select_account" });
    }
    catch (err) {
        console.error("Firebase init error:", err);
    }
}
