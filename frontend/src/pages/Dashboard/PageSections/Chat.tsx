
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectItem } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import {
    ChevronDown,
    ChevronUp,
    Copy,
    Download,
    LogOut,
    Send,
    Settings,
    Trash2,
    User,
} from "lucide-react"
import { useState } from "react"

import { logout } from "@/api/auth"
import { useAuth } from "@/context/authProvider"
import { SelectContent, SelectTrigger, SelectValue } from "@radix-ui/react-select"

export default function AIChatPlayground() {
    const { user, setUser } = useAuth()

    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showSettings, setShowSettings] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")
    const models = [
        { id: "gpt-3.5-turbo", name: "GPT-3.5" },
        { id: "gpt-4", name: "GPT-4" },
    ]
    const selectedModelName = models.find((m) => m.id === selectedModel)?.name || ""

    const [systemPrompt, setSystemPrompt] = useState("")
    const [temperature, setTemperature] = useState([0.7])
    const [maxTokens, setMaxTokens] = useState([1024])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return
        setIsLoading(true)
        setError(null)

        const userMessage = {
            id: Date.now(),
            role: "user",
            content: input.trim(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")

        try {
            const res = await fetch("http://localhost:8000/langchain/chat-stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: input.trim() }),
            })

            const reader = res.body?.getReader()
            const decoder = new TextDecoder("utf-8")
            let aiResponse = ""

            if (!reader) throw new Error("No response stream")

            while (true) {
                const { value, done } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk
                    .split("\n")
                    .filter((line) => line.startsWith("data: "))
                    .map((line) => line.replace("data: ", ""))

                for (const line of lines) {
                    if (line === "[DONE]") continue
                    if (line.startsWith("[ERROR]")) {
                        setError(new Error(line.replace("[ERROR]", "").trim()))
                        break
                    }
                    aiResponse += line
                    setMessages((prev) => [
                        ...prev.filter((m) => m.id !== "ai"),
                        { id: "ai", role: "assistant", content: aiResponse },
                    ])
                }
            }
        } catch (err: any) {
            setError(err)
        } finally {
            setIsLoading(false)
        }
    }

    const stop = () => {
        // Implement stop functionality if needed
    }

    const reload = () => {
        setError(null)
        handleSubmit(new Event("submit") as any)
    }

    const clearChat = () => {
        setMessages([])
        setInput("")
        setError(null)
    }

    const copyMessage = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    const handleLogout = () => {
        logout()
        setUser(null)
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">AI Chat Playground</h1>
                    <div className="flex gap-2 items-center">
                        <Button variant="outline" size="sm" onClick={clearChat}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
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

                <div className={`grid gap-6 ${showSettings ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1"}`}>
                    {showSettings && (
                        <div className="lg:col-span-1">
                            <div className="card p-6 space-y-6">
                                <div className="flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    <h2 className="text-xl font-semibold">Settings</h2>
                                </div>
                                <div className="space-y-2">

                                    <Select
                                        onValueChange={(name) => {
                                            const model = models.find((m) => m.name === name)
                                            if (model) setSelectedModel(model.id)
                                        }}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={selectedModel || "Select a model"} />
                                        </SelectTrigger>
                                        <SelectContent className="border-4 bg-white">
                                            {models.map((model) => (
                                                <SelectItem key={model.id} value={model.name}>
                                                    {model.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">System Prompt</label>
                                    <Textarea
                                        value={systemPrompt}
                                        onChange={(e) => setSystemPrompt(e.target.value)}
                                        placeholder="Enter system prompt..."
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Temperature: {temperature[0]}</label>
                                    <Slider value={temperature} onValueChange={setTemperature} max={2} min={0} step={0.1} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Max Tokens: {maxTokens[0]}</label>
                                    <Slider value={maxTokens} onValueChange={setMaxTokens} max={4000} min={100} step={100} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={showSettings ? "lg:col-span-3" : "col-span-1"}>
                        <div className="card h-[600px] flex flex-col">
                            <div className="p-6 border-b flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Chat</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="badge badge-secondary">{selectedModelName}</span>
                                        {isLoading && (
                                            <Button variant="outline" size="sm" onClick={stop}>
                                                Stop
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col overflow-hidden p-6">
                                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                                    {messages.length === 0 && (
                                        <div className="text-center text-muted-foreground py-8">
                                            <p>Start a conversation with the AI assistant.</p>
                                            <p className="text-sm mt-2">Try asking a question or giving it a task!</p>
                                        </div>
                                    )}

                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex group ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                                                    <button
                                                        onClick={() => copyMessage(message.content)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-pulse">AI is thinking...</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                                        <p className="text-destructive text-sm">Error: {error.message}</p>
                                        <Button variant="outline" size="sm" onClick={reload} className="mt-2 bg-transparent">
                                            Retry
                                        </Button>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="flex gap-2">
                                    <Input
                                        value={input}
                                        onChange={handleInputChange}
                                        placeholder="Type your message..."
                                        disabled={isLoading}
                                        className="flex-1"
                                    />
                                    <Button type="submit" disabled={isLoading || !input.trim()}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
