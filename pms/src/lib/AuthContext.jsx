import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Listen for real-time changes to the user document
        unsubscribeSnapshot = onSnapshot(doc(db, 'users', user.uid), async (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.isActive === false) {
              await signOut(auth);
              setCurrentUser(null);
            } else {
              setCurrentUser({
                uid: user.uid,
                email: user.email,
                role: userData.role || 'worker',
                name: userData.name || 'Staff'
              });
            }
          } else {
            // Fallback if no document exists
            setCurrentUser({ uid: user.uid, email: user.email, role: 'worker', name: 'Unknown' });
          }
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setLoading(false);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const logout = () => signOut(auth);

  const value = {
    currentUser,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
