"use client"

import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/context/authProvider"
import { LogOut, User, Home } from "lucide-react"

export default function Header() {
    const { user, logout } = useAuth()
    const location = useLocation()

    const handleLogout = () => {
        logout()
    }

    const isAuthPage = location.pathname === "/signin" || location.pathname === "/signup"

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Home className="h-5 w-5 text-white" />
                            </div>
                        </Link>
                    </div>

                    <nav className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-700">
                                    <User className="h-4 w-4" />
                                    <span>Welcome, {user.name}</span>
                                </div>
                                <Link to="/dashboard">
                                    <Button variant="ghost" size="sm">
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button onClick={handleLogout} variant="outline" size="sm">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                {!isAuthPage && (
                                    <>
                                        <Link to="/signin">
                                            <Button variant="ghost" size="sm">
                                                Sign In
                                            </Button>
                                        </Link>
                                        <Link to="/signup">
                                            <Button size="sm">Sign Up</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}
