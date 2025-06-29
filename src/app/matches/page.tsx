// src/app/matches/page.tsx
'use client'

import MyMatches from '@/components/MyMatches'
import { useAuth } from '@/contexts/AuthContext'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function MatchesPage() {
  const { currentUser, loading } = useAuth()

  useEffect(() => {
    if (!loading && !currentUser) {
      redirect('/login')
    }
  }, [currentUser, loading])

  if (loading) {
    return <div>Loading...</div>
  }

  return currentUser ? <MyMatches /> : null
}