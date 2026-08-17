import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";

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

async function fixNames() {
  await signInWithEmailAndPassword(auth, "admin@gyromotion.in", "admin123");
  const querySnapshot = await getDocs(collection(db, 'patients'));
  
  let updatedCount = 0;
  for (const patientDoc of querySnapshot.docs) {
    let data = patientDoc.data();
    let changed = false;

    if (data.addedBy === "Clinic Owner") {
      data.addedBy = "Dr. Prajakta Joshi";
      changed = true;
    }
    
    if (data.lastEditedBy === "Clinic Owner") {
      data.lastEditedBy = "Dr. Prajakta Joshi";
      changed = true;
    }
    
    if (data.sessions && Array.isArray(data.sessions)) {
      for (let s of data.sessions) {
        if (s.loggedBy === "Clinic Owner") {
          s.loggedBy = "Dr. Prajakta Joshi";
          changed = true;
        }
      }
    }

    if (changed) {
      await setDoc(doc(db, 'patients', patientDoc.id), data);
      updatedCount++;
    }
  }
  
  console.log(`Successfully updated ${updatedCount} old records!`);
  process.exit(0);
}

fixNames();
