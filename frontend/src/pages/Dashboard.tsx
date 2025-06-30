import { logout } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/authProvider"
import { LogOut, User } from "lucide-react"
import { useEffect, useState } from "react"
import AIChat from "./Chat"

export default function DashboardPage() {
    const { user, setUser } = useAuth()

    const [serverMessage, setServerMessage] = useState("")

    const handleLogout = () => {
        logout()
        setUser(null)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <Button onClick={handleLogout} variant="outline">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="mr-2 h-5 w-5" />
                                Profile
                            </CardTitle>
                            <CardDescription>Your account information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p>
                                    <strong>Email:</strong> {user?.email}
                                </p>
                                <p>
                                    <strong>ID:</strong> {user?.id}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome!</CardTitle>
                            <CardDescription>You have successfully signed in</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                This is a protected page that only authenticated users can access.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full bg-transparent" variant="outline">
                                Edit Profile
                            </Button>
                            <Button className="w-full bg-transparent" variant="outline">
                                Settings
                            </Button>
                        </CardContent>
                    </Card>


                    <AIChat />
                </div>
            </div>
        </div>
    )
}
