import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
    id: string
    email: string
    token: string
}

interface AuthContextType {
    user: User | null
    setUser: React.Dispatch<React.SetStateAction<User | null>>
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

    useEffect(() => {
        try {
            const savedUser = JSON.parse(localStorage.getItem("user") || "null")
            if (savedUser?.email && savedUser?.token && savedUser?.id) {
                setUser(savedUser)
            }
        } catch (err) {
            console.error("Failed to restore user from localStorage", err)
        }
    }, [])

    const value = {
        user,
        setUser
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
