/**
 * Authentication Context
 * Manages user authentication state across the app
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/services/firebase/config';
import { getCurrentUserData } from '@/services/firebase/auth';
import type { User } from '@/types/user';
import { initCometChat, loginCometChatUser, logoutCometChatUser } from '@/services/cometchat/config';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize CometChat once on mount
  useEffect(() => {
    const init = async () => {
      await initCometChat();
    };
    init();
  }, []);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userData = await getCurrentUserData();
          setUser(userData);
          setError(null);

          // Login to CometChat with avatar
          if (userData) {
            await loginCometChatUser(
              userData.id,
              userData.name,
              userData.avatarUrl || ''
            );
          }
        } catch (err: any) {
          console.error('Error fetching user data:', err);
          setError(err.message);
          setUser(null);
        }
      } else {
        setUser(null);
        // Logout from CometChat
        await logoutCometChatUser();
      }

      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    firebaseUser,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
