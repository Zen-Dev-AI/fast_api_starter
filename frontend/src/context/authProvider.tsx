// src/context/authProvider.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
    id: string
    email: string
    token: string
}

interface AuthContextType {
    user: User | null
    setUser: React.Dispatch<React.SetStateAction<User | null>>
    loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        try {
            const saved = localStorage.getItem("user")
            if (saved) {
                const parsed = JSON.parse(saved)
                if (parsed?.id && parsed?.email && parsed?.token) {
                    setUser(parsed)
                }
            }
        } catch (err) {
            console.error("Failed to restore user from localStorage", err)
        } finally {
            setLoading(false)
        }
    }, [])

    const value = { user, setUser, loading }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
