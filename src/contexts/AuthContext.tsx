// src/contexts/AuthContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail 
} from 'firebase/auth'
import { auth } from '@/utils/firebase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  login?: (email: string, password: string) => Promise<User>
  logout?: () => Promise<void>
  resetPassword?: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log('Setting up auth state change listener');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('AUTH STATE CHANGE:', user ? `User logged in: ${user.uid}` : 'No user');
      setCurrentUser(user)
      setLoading(false)
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      console.log('Login successful', {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified
      });

      if (!userCredential.user.emailVerified) {
      // You can either:
      // Option 1: Throw an error to prevent login
      throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
      
      // OR Option 2: Allow login but redirect to a verification page
      // router.push('/verify-email');
      // return userCredential.user;
    }
      
      // Manual navigation after successful login
      router.push('/profile');
      
      return userCredential.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  const logout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  }

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      login, 
      logout,
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}