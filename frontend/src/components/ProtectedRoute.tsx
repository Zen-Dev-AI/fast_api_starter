
import type React from "react"

import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/authProvider"

interface ProtectedRouteProps {
    children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user } = useAuth()

    return user ? <>{children}</> : <Navigate to="/signin" replace />
}
