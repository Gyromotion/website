import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCx8yV_OCoYmJsS7aPpL3wrPCX4eI2RcvI",
  authDomain: "gyromotion-clinic.firebaseapp.com",
  projectId: "gyromotion-clinic",
  storageBucket: "gyromotion-clinic.firebasestorage.app",
  messagingSenderId: "284602954461",
  appId: "1:284602954461:web:dfb81524cf2da49741a134",
  measurementId: "G-4N7WV1EKTL"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
