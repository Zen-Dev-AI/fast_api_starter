// src/components/ProtectedRoute.tsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/authProvider'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) return null

    if (!user) return <Navigate to="/signin" replace />

    return <>{children}</>
}