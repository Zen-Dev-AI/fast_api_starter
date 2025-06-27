import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
    id: string
    email: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    error: string | null
    login: (email: string, password: string) => Promise<void>
    signup: (email: string, password: string) => Promise<void>
    logout: () => void
    clearError: () => void
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
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Check for existing session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem("user")
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
    }, [])

    const login = async (email: string, password: string) => {
        setLoading(true)
        setError(null)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Mock validation
            if (email === "demo@example.com" && password === "password") {
                const userData = {
                    id: "1",
                    email: email,
                }
                setUser(userData)
                localStorage.setItem("user", JSON.stringify(userData))
            } else {
                throw new Error("Invalid email or password")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed")
        } finally {
            setLoading(false)
        }
    }

    const signup = async (email: string, password: string) => {
        setLoading(true)
        setError(null)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Mock validation
            if (email && password) {
                const userData = {
                    id: Date.now().toString(),
                    email: email,
                }
                setUser(userData)
                localStorage.setItem("user", JSON.stringify(userData))
            } else {
                throw new Error("All fields are required")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Signup failed")
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("user")
        setError(null)
    }

    const clearError = () => {
        setError(null)
    }

    const value = {
        user,
        loading,
        error,
        login,
        signup,
        logout,
        clearError,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
