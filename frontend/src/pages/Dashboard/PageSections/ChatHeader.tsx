import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronUp, LogOut, Trash2, User } from "lucide-react"
import { useAuth } from "@/context/authProvider"
import { logout } from "@/api/auth"

interface Props {
    onClear: () => void
    showSettings: boolean
    toggleSettings: () => void
}

export function ChatHeader({ onClear, showSettings, toggleSettings }: Props) {
    const { user, setUser } = useAuth()

    const handleLogout = () => {
        logout()
        setUser(null)
    }

    return (
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">AI Chat Playground</h1>
            <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" onClick={onClear}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                </Button>
                <Button variant="outline" size="sm" onClick={toggleSettings}>
                    {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
