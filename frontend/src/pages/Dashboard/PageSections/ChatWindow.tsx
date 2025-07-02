import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { ChatMessage } from "./ChatMessage"

interface Props {
    messages: { id: string | number; role: "user" | "assistant"; content: string }[]
    input: string
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onSubmit: (e: React.FormEvent) => void
    isLoading: boolean
    error: Error | null
    onRetry: () => void
    selectedModelName: string
    copyMessage: (text: string) => void
    stop: () => void
}

export function ChatWindow({
    messages,
    input,
    onInputChange,
    onSubmit,
    isLoading,
    error,
    onRetry,
    selectedModelName,
    copyMessage,
    stop,
}: Props) {
    return (
        <div className="card h-[600px] flex flex-col">
            <div className="p-6 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="badge badge-secondary">{selectedModelName}</span>
                        {(
                            <Button variant="outline" size="sm" className="ml-4" onClick={stop}>
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

                    {messages.map((m) => (
                        <ChatMessage
                            key={m.id}
                            role={m.role}
                            content={m.content}
                            onCopy={copyMessage}
                        />
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                                <div className="flex items-center gap-2 animate-pulse">AI is thinking...</div>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                        <p className="text-destructive text-sm">Error: {error.message}</p>
                        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 bg-transparent">
                            Retry
                        </Button>
                    </div>
                )}

                <form onSubmit={onSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={onInputChange}
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
    )
}
