// src/app/profile/page.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import UserProfile from '@/components/UserProfile'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { currentUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login')
    }
  }, [currentUser, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  return currentUser ? <UserProfile /> : null
}