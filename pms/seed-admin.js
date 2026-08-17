import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCx8yV_OCoYmJsS7aPpL3wrPCX4eI2RcvI",
  authDomain: "gyromotion-clinic.firebaseapp.com",
  projectId: "gyromotion-clinic",
  storageBucket: "gyromotion-clinic.firebasestorage.app",
  messagingSenderId: "92616837392",
  appId: "1:92616837392:web:6f45239e943265ebc40e53"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seed() {
  let uid;
  try {
    const cred = await createUserWithEmailAndPassword(auth, "admin@gyromotion.in", "admin123");
    uid = cred.user.uid;
    console.log("Created auth account.");
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log("Account exists, signing in...");
      const cred = await signInWithEmailAndPassword(auth, "admin@gyromotion.in", "admin123");
      uid = cred.user.uid;
    } else {
      console.error(err);
      process.exit(1);
    }
  }

  try {
    await setDoc(doc(db, "users", uid), {
      name: "Clinic Owner",
      email: "admin@gyromotion.in",
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString()
    });
    console.log("Admin profile seeded successfully in Firestore! Email: admin@gyromotion.in, Pass: admin123");
    process.exit(0);
  } catch (err) {
    console.error("Firestore Error:", err);
    process.exit(1);
  }
}
seed();
