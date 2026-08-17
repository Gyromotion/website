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

async function generateRegNos() {
  await signInWithEmailAndPassword(auth, "admin@gyromotion.in", "admin123");
  const querySnapshot = await getDocs(collection(db, 'patients'));
  
  let updatedCount = 0;
  for (const patientDoc of querySnapshot.docs) {
    let data = patientDoc.data();

    if (!data.regNo) {
      const d = data.startDate ? new Date(data.startDate) : new Date();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const sequence = Math.floor(100 + Math.random() * 900);
      data.regNo = `GPC/${month}${year}${sequence}`;
      
      await setDoc(doc(db, 'patients', patientDoc.id), data);
      updatedCount++;
    }
  }
  
  console.log(`Successfully generated Registration Numbers for ${updatedCount} old patients!`);
  process.exit(0);
}

generateRegNos();
