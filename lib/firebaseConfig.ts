import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Uncomment if you want analytics

const firebaseConfig = {
  apiKey: "AIzaSyCxfcI4i5y3x70CSEtzYrxnjmDJg1RYVSk",
  authDomain: "cs75hard.firebaseapp.com",
  projectId: "cs75hard",
  storageBucket: "cs75hard.firebasestorage.app",
  messagingSenderId: "552596498920",
  appId: "1:552596498920:web:9ae5fe4a315cd3dcafdc5d",
  measurementId: "G-0YVGYCLDJD"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
// export const analytics = getAnalytics(app); // Uncomment if you want analytics 