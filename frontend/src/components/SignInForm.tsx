"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/authProvider"
import { signInSchema, type SignInFormData } from "@/types/validations"

export default function SignInForm() {
    const [showPassword, setShowPassword] = useState(false)
    const { login, loading, error, clearError, user } = useAuth()
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    // Watch form values to clear errors
    const watchedValues = watch()

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate("/dashboard")
        }
    }, [user, navigate])

    // Clear error when form values change
    useEffect(() => {
        clearError()
    }, [watchedValues, clearError])

    const onSubmit = async (data: SignInFormData) => {
        await login(data.email, data.password)
    }

    return (
        <div className="flex items-center justify-center py-12 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                    <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="signin-email">Email</Label>
                            <Input
                                id="signin-email"
                                type="email"
                                placeholder="m@example.com"
                                {...register("email")}
                                disabled={loading}
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="signin-password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="signin-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    {...register("password")}
                                    disabled={loading}
                                    className={errors.password ? "border-red-500" : ""}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300" disabled={loading} />
                                <Label htmlFor="remember" className="text-sm">
                                    Remember me
                                </Label>
                            </div>
                            <Button variant="link" className="px-0 text-sm" type="button">
                                Forgot password?
                            </Button>
                        </div>
                        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
                            <strong>Demo credentials:</strong>
                            <br />
                            Email: demo@example.com
                            <br />
                            Password: password
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            {"Don't have an account? "}
                            <Link to="/signup" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

