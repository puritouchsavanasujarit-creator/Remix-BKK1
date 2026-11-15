import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser, testConnection } from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isFirestoreOnline: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  isFirestoreOnline: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirestoreOnline, setIsFirestoreOnline] = useState(false);

  useEffect(() => {
    // Check connection on boot
    testConnection().then((online) => {
      setIsFirestoreOnline(online);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Sign in error:', err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Sign out error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        signIn,
        signOut,
        isFirestoreOnline,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
