import { useState } from "react"
import { ChatHeader } from "./ChatHeader"
import { ChatSettings } from "./ChatSettings"
import { ChatWindow } from "./ChatWindow"

export default function AIChatPlayground() {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return
        setIsLoading(true)
        setError(null)

        const userMessage = { id: Date.now(), role: "user", content: input.trim() }
        setMessages((prev) => [...prev, userMessage])
        setInput("")

        try {
            const res = await fetch("http://localhost:8000/langchain/chat-stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: userMessage.content,
                    model_name: selectedModel,
                    system_message: systemPrompt,
                    temperature: temperature[0],
                }),
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
        // Implement stop if applicable
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

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <ChatHeader
                    onClear={clearChat}
                    showSettings={showSettings}
                    toggleSettings={() => setShowSettings(!showSettings)}
                />

                <div className={`grid gap-6 ${showSettings ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1"}`}>
                    {showSettings && (
                        <div className="lg:col-span-1">
                            <ChatSettings
                                selectedModel={selectedModel}
                                setSelectedModel={setSelectedModel}
                                models={models}
                                systemPrompt={systemPrompt}
                                setSystemPrompt={setSystemPrompt}
                                temperature={temperature}
                                setTemperature={setTemperature}
                            />
                        </div>
                    )}

                    <div className={showSettings ? "lg:col-span-3" : "col-span-1"}>
                        <ChatWindow
                            messages={messages}
                            input={input}
                            onInputChange={handleInputChange}
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                            error={error}
                            onRetry={reload}
                            selectedModelName={selectedModelName}
                            copyMessage={copyMessage}
                            stop={stop}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
