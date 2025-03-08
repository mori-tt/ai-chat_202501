import { getApp, getApps, cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

if (!getApps().length) {
  initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS || ""),
    storageBucket: "ai-chat-202501.firebasestorage.app",
  });
} else {
  getApp();
}

const db = getFirestore();
const bucket = getStorage().bucket();

export { db, bucket };
