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
    copyMessage,
}: Props) {
    return (
        <div className="relative flex flex-col h-full">

            <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-6 pb-32 space-y-4">
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
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                        <p className="text-destructive text-sm">Error: {error.message}</p>
                        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 bg-transparent">
                            Retry
                        </Button>
                    </div>
                )}
            </div>

            {/* Sticky/floating input */}
            <form
                onSubmit={onSubmit}
                className="absolute bottom-0 left-0 w-full z-10 bg-background/95 border-t flex gap-2 px-6 py-4"
                style={{ boxShadow: "0 -4px 24px 0 rgba(0,0,0,0.05)" }}
            >
                <Input
                    value={input}
                    onChange={onInputChange}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                />

                {isLoading ? (
                    <Button variant="destructive" size="sm" onClick={stop}>
                        Stop
                    </Button>
                ) : (
                    <Button type="submit" disabled={!input.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                )}
            </form>
        </div>
    );
}
