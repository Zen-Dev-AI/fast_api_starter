import type React from "react"
import Header from "../Header"

interface LayoutProps {
    children: React.ReactNode
}

export default function MainLayout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main>{children}</main>
        </div>
    )
}
