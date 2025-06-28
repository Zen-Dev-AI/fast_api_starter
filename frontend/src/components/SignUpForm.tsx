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
import { signUpSchema, type SignUpFormData } from "@/types/validations"
import { registerUser } from "@/api/auth"
import { toast } from "react-toastify"

export default function SignUpForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [termsError, setTermsError] = useState("")
    const [loading, setLoading] = useState(false)
    const { user, setUser } = useAuth()
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    useEffect(() => {
        if (user) {
            navigate("/dashboard")
        }
    }, [user, navigate])

    const onSubmit = async (data: SignUpFormData) => {
        setLoading(true)
        if (!acceptTerms) {
            setTermsError("You must accept the terms and conditions")
            return
        }

        try {
            const res = await registerUser(data)
            const { access_token, user_id } = res
            const { email } = data

            const userObject = {
                email,
                token: access_token,
                id: user_id
            }

            localStorage.setItem("user", JSON.stringify(userObject))

            setUser(userObject)

            navigate("/dashboard")
        } catch (err: any) {
            const message = err.response?.data?.detail || "Login failed"
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const displayError = termsError

    return (
        <div className="flex items-center justify-center py-12 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Create account</CardTitle>
                    <CardDescription className="text-center">Enter your information to create your account</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {displayError && (
                            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{displayError}</span>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <Input
                                id="signup-email"
                                type="email"
                                placeholder="m@example.com"
                                {...register("email")}
                                disabled={loading}
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="signup-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
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
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="terms"
                                className={`h-4 w-4 rounded border-gray-300 ${termsError ? "border-red-500" : ""}`}
                                checked={acceptTerms}
                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                disabled={loading}
                            />
                            <Label htmlFor="terms" className="text-sm my-4">
                                I agree to the Terms of Service and Privacy Policy

                            </Label>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Already have an account?{" "}
                            <Link to="/signin" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
