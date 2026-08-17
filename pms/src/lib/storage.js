import { db } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'patients';

export const getPatients = async () => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getPatientById = async (id) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const savePatient = async (patient) => {
  let id = patient.id;
  if (!id) {
    id = Date.now().toString();
    patient.id = id;
    patient.sessions = patient.sessions || [];
    
    if (!patient.regNo) {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const sequence = Math.floor(100 + Math.random() * 900);
      patient.regNo = `GPC/${month}${year}${sequence}`;
    }
  }
  await setDoc(doc(db, COLLECTION_NAME, id), patient);
  return patient;
};

export const deletePatient = async (id) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

export const getDashboardStats = async (targetMonth = new Date().getMonth(), targetYear = new Date().getFullYear()) => {
  const patients = await getPatients();
  const totalPatients = patients.length;
  
  // Active patients are those who haven't finished their package (excluding daily)
  const activePatients = patients.filter(p => p.packageDays !== 'daily' && p.sessions && p.sessions.length < Number(p.packageDays)).length;
  
  const isCurrentMonth = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
  };

  const totalRevenue = patients.reduce((sum, p) => {
    let patientTotal = 0;
    
    // For packages, check if the package was started this month
    if (p.paymentReceived && p.packageDays !== 'daily') {
      if (isCurrentMonth(p.startDate)) {
        patientTotal += Number(p.paymentAmount || 0);
      }
    }

    // For daily pay, check each session date
    if (p.packageDays === 'daily' && p.sessions) {
      const sessionTotal = p.sessions.reduce((sSum, s) => {
        if (isCurrentMonth(s.date)) {
          return sSum + Number(s.amountPaid || 0);
        }
        return sSum;
      }, 0);
      patientTotal += sessionTotal;
    }
    
    return sum + patientTotal;
  }, 0);

  return { totalPatients, activePatients, totalRevenue, patients };
};

const APPOINTMENTS_COL = 'appointments';

export const getAppointments = async () => {
  const querySnapshot = await getDocs(collection(db, APPOINTMENTS_COL));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const saveAppointment = async (appointment) => {
  let id = appointment.id;
  if (!id) {
    id = Date.now().toString();
    appointment.id = id;
  }
  await setDoc(doc(db, APPOINTMENTS_COL, id), appointment);
  return appointment;
};

export const deleteAppointment = async (id) => {
  await deleteDoc(doc(db, APPOINTMENTS_COL, id));
};
