// src/contexts/AuthContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword 
} from 'firebase/auth'
import { auth } from '@/utils/firebase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  login?: (email: string, password: string) => Promise<User>
  logout?: () => Promise<void>
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
        email: userCredential.user.email
      });
      
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

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      login, 
      logout 
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