"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addCustomHabit } from "@/app/actions/habits"

interface AddHabitDialogProps {
    userId: string
}

export function AddHabitDialog({ userId }: AddHabitDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState("")
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError("Habit name is required")
            return
        }

        startTransition(async () => {
            const result = await addCustomHabit(userId, name)
            if (result.success) {
                setIsOpen(false)
                setName("")
            } else {
                setError(result.error || "Failed to add habit")
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-dashed border-2 py-8 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 dark:hover:text-zinc-100 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <Plus className="mr-2 h-4 w-4" />
                    New Imperative
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Imperative</DialogTitle>
                        <DialogDescription>
                            Create a new custom habit to track daily.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Habit Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Read 10 pages, Drink Water..."
                                disabled={isPending}
                                autoFocus
                            />
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Adding..." : "Add Habit"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
