// src/app/chess-match/page.tsx
'use client'

import ChessMatchForm from '@/components/ChessMatchForm'
import { useAuth } from '@/contexts/AuthContext'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'


export default function ChessMatchPage() {
  const { currentUser, loading } = useAuth()

  useEffect(() => {
    if (!loading && !currentUser) {
      redirect('/login')
    }
  }, [currentUser, loading])

  if (loading) {
    return <div>Loading...</div>
  }

  return currentUser ? <ChessMatchForm /> : null
}