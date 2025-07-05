import { Button } from "@/components/ui/button"

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react"

interface Props {
    onClear: () => void
    showSettings: boolean
    toggleSettings: () => void
}

export function ChatHeader({ onClear, showSettings, toggleSettings }: Props) {

    return (
        <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" onClick={onClear}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                </Button>
                <Button variant="outline" size="sm" onClick={toggleSettings}>
                    {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
            </div>
        </div>
    )
}
