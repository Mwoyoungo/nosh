/**
 * Firebase Authentication Service
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from './config';
import type { User } from '@/types/user';

/**
 * Sign up new user
 */
export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  userRole: 'NORMAL_USER' | 'VENDOR'
): Promise<User> => {
  try {
    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Generate username from name
    const username = `@${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // Create user document
    const user: User = {
      id: firebaseUser.uid,
      name: fullName,
      username,
      email,
      phoneNumber: '',
      avatarUrl: '',
      bio: '',
      userRole,
      createdAt: Date.now(),
    };

    // Save to Firestore
    await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), user);

    return user;
  } catch (error: any) {
    throw new Error(error.message || 'Sign up failed');
  }
};

/**
 * Login user
 */
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));

    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    return userDoc.data() as User;
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message || 'Password reset failed');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Get current user data from Firestore
 */
export const getCurrentUserData = async (): Promise<User | null> => {
  const firebaseUser = getCurrentUser();
  if (!firebaseUser) return null;

  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
    if (!userDoc.exists()) return null;
    return userDoc.data() as User;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};
