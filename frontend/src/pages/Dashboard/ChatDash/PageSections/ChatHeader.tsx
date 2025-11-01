
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectContent,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { useConversations } from "@/context/conversationProvider"
import { Trash2, ChevronUp, Settings as SettingsIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { apiClient } from "@/api/client"

interface ModelOption { id: string; name: string }

interface Props {
    threadId: string;
    showSettings: boolean
    toggleSettings: () => void
    selectedModel: string
    setSelectedModel: (val: string) => void
    models: ModelOption[]
    systemPrompt: string
    setSystemPrompt: (val: string) => void
    temperature: number[]
    setTemperature: (val: number[]) => void
}

function ChatHeader({
    threadId,
    showSettings,
    toggleSettings,
    selectedModel,
    setSelectedModel,
    models,
    systemPrompt,
    setSystemPrompt,
    temperature,
    setTemperature,
}: Props) {
    const navigate = useNavigate()
    const { removeConversation } = useConversations()

    const onDelete = async () => {
        try {
            await apiClient.delete(`chat/conversations/${threadId}`)
            removeConversation(threadId)
            navigate("/dashboard", { replace: true })
        } catch (error) {
            console.error("Failed to delete conversation:", error)
        }
    }


    return (
        <div className="border-b pb-4 mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={toggleSettings}>
                        {showSettings ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <SettingsIcon className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>

            {showSettings && (
                <div className="flex flex-wrap items-center gap-6">
                    {/* model selector */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Model</label>
                        <Select
                            value={models.find(m => m.id === selectedModel)?.name}
                            onValueChange={name => {
                                const m = models.find(x => x.name === name)
                                if (m) setSelectedModel(m.id)
                            }}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                                {models.map(m => (
                                    <SelectItem key={m.id} value={m.name}>
                                        {m.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col flex-1 min-w-[100px]">
                        <label className="text-sm font-medium mb-1">System Prompt</label>
                        <Textarea
                            value={systemPrompt}
                            onChange={e => setSystemPrompt(e.target.value)}
                            placeholder="Enter system prompt..."
                            rows={2}
                        />
                    </div>

                    <div className="flex flex-col min-w-[200px]">
                        <label className="text-sm font-medium mb-1">
                            Temp: {temperature[0]}
                        </label>
                        <Slider
                            value={temperature}
                            onValueChange={setTemperature}
                            min={0}
                            max={2}
                            step={0.1}
                        />
                    </div>
                    <div className="flex flex-col min-w-[100px] mt-4">
                        <Button variant="destructive" size="sm" onClick={onDelete}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete Chat
                        </Button>

                    </div>
                </div>
            )}
        </div>
    )
}

export default ChatHeader
