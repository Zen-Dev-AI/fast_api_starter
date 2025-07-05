import { Copy } from "lucide-react"

interface Props {
    role: "user" | "assistant"
    content: string
    onCopy: (text: string) => void
}

export function ChatMessage({ role, content, onCopy }: Props) {
    return (
        <div className={`flex group ${role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <div className="flex items-start justify-between gap-2">
                    <div className="whitespace-pre-wrap text-sm">{content}</div>
                    <button
                        onClick={() => onCopy(content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded"
                    >
                        <Copy className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    )
}
