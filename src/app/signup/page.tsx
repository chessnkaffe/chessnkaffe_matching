//src/app/signup/page.tsx
'use client'

import SignupForm from '@/components/SignupForm'
import { useAuth } from '../../contexts/AuthContext';
import { redirect } from 'next/navigation'

export default function SignupPage() {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (currentUser) {
    redirect('/profile')
  }

  return <SignupForm />
}