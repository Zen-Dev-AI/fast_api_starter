import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppLayout } from "../AppLayout"
import { Plus, MessageCircle } from "lucide-react"

type Thread = { thread_id: string }

export default function ChatsPage() {
    const [threads, setThreads] = useState<Thread[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    // Fetch threads on mount
    // useEffect(() => {
    //     setLoading(true)
    //     fetch("/api/users/me/threads")
    //         .then((res) => res.json())
    //         .then((data) => {
    //             setThreads(data.thread_ids.map((id: string) => ({ thread_id: id })))
    //             setLoading(false)
    //         })
    //         .catch(() => {
    //             setError("Could not load chats.")
    //             setLoading(false)
    //         })
    // }, [])

    // Create a new chat
    const createChat = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/threads", { method: "POST" })
            const data = await res.json()
            // Assuming API returns { thread_id: "newid123" }
            navigate(`/chat/${data.thread_id}`)
        } catch {
            setError("Could not create new chat.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AppLayout>
            <div className="px-8">
                <div className="flex items-center justify-between mb-8 ">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageCircle className="w-6 h-6" /> Your Chats
                    </h1>
                </div>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <div className="grid gap-4">
                    <div>
                        <Button onClick={createChat} size="sm" className="flex items-center w-[8rem] gap-2">
                            <Plus className="w-4 h-4" />
                            New Chat
                        </Button>
                    </div>

                    <div className="mt-6">
                        {threads.length === 0 && !loading ? (
                            <Card className="p-6 text-muted-foreground">No chats yet. Click “New Chat” to start one!</Card>
                        ) : (
                            threads.map((thread) => (
                                <Card
                                    key={thread.thread_id}
                                    className="flex items-center justify-between p-4 hover:shadow-md transition cursor-pointer"
                                    onClick={() => navigate(`/chat/${thread.thread_id}`)}
                                >
                                    <div className="font-medium truncate">Thread: {thread.thread_id}</div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigate(`/chat/${thread.thread_id}`)
                                        }}
                                    >
                                        Open
                                    </Button>
                                </Card>
                            ))
                        )}

                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
