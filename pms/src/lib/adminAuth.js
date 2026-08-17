import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCx8yV_OCoYmJsS7aPpL3wrPCX4eI2RcvI",
  authDomain: "gyromotion-clinic.firebaseapp.com",
  projectId: "gyromotion-clinic",
  storageBucket: "gyromotion-clinic.firebasestorage.app",
  messagingSenderId: "92616837392",
  appId: "1:92616837392:web:6f45239e943265ebc40e53"
};

// Initialize a secondary app so creating users doesn't log the admin out
const adminApp = initializeApp(firebaseConfig, "AdminApp");
const adminAuth = getAuth(adminApp);

export { adminAuth, createUserWithEmailAndPassword };
