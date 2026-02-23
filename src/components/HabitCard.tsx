"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Circle, Trash2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toggleHabit, deleteCustomHabit } from "@/app/actions/habits"
import { cn } from "@/lib/utils"

import { ExerciseForm, type ExerciseMetadata } from "@/components/forms/ExerciseForm"
import { MeditationForm, type MeditationMetadata } from "@/components/forms/MeditationForm"
import { JournalForm, type JournalMetadata } from "@/components/forms/JournalForm"
import { CustomHabitForm, type CustomHabitMetadata } from "@/components/forms/CustomHabitForm"

interface HabitCardProps {
    id: string
    name: string
    isCompleted: boolean
    userId: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any
    targetDate?: string
}

export function HabitCard({ id, name, isCompleted: initialCompleted, userId, metadata: initialMetadata, targetDate }: HabitCardProps) {
    const [isCompleted, setIsCompleted] = useState(initialCompleted)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [metadata, setMetadata] = useState<any>(initialMetadata)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [isDeleting, setIsDeleting] = useState(false)

    const isCoreHabit = name === "Exercise" || name === "Meditation" || name === "Journal"

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSaveLog = (formData: any) => {
        setIsCompleted(true)
        setMetadata(formData)
        setIsDialogOpen(false)

        startTransition(async () => {
            const result = await toggleHabit(id, userId, true, formData, targetDate)
            if (!result.success) {
                // Revert on failure
                setIsCompleted(initialCompleted)
                setMetadata(initialMetadata)
            }
        })
    }

    const handleRemoveLog = () => {
        setIsCompleted(false)
        setMetadata(undefined)
        setIsDialogOpen(false)

        startTransition(async () => {
            const result = await toggleHabit(id, userId, false, undefined, targetDate)
            if (!result.success) {
                // Revert on failure
                setIsCompleted(true)
                setMetadata(initialMetadata)
            }
        })
    }

    const handleDeleteHabit = () => {
        setIsDeleting(true)
        startTransition(async () => {
            await deleteCustomHabit(userId, id)
            setIsDialogOpen(false)
            setIsDeleting(false)
        })
    }

    const renderForm = () => {
        if (name === "Exercise") {
            return <ExerciseForm initialData={metadata as ExerciseMetadata} onSubmit={handleSaveLog} isLoading={isPending} />
        }
        if (name === "Meditation") {
            return <MeditationForm initialData={metadata as MeditationMetadata} onSubmit={handleSaveLog} isLoading={isPending} />
        }
        if (name === "Journal") {
            return <JournalForm initialData={metadata as JournalMetadata} onSubmit={handleSaveLog} isLoading={isPending} />
        }
        return <CustomHabitForm habitName={name} initialData={metadata as CustomHabitMetadata} onSubmit={handleSaveLog} isLoading={isPending} />
    }

    const renderMetadataSummary = () => {
        if (!isCompleted || !metadata) return "Tap to complete"

        if (name === "Exercise") {
            const data = metadata as ExerciseMetadata
            if (data.genre && data.durationMinutes) {
                return `${data.durationMinutes}m • ${data.genre}${data.isOutdoors ? " • Outdoors" : " • Indoors"}`
            }
        }
        if (name === "Meditation") {
            const data = metadata as MeditationMetadata
            if (data.durationMinutes) {
                return `${data.durationMinutes}m duration`
            }
        }
        if (name === "Journal") {
            const data = metadata as JournalMetadata
            if (data.entryText) {
                return data.entryText.length > 30 ? `${data.entryText.substring(0, 30)}...` : data.entryText
            }
        }

        if (metadata && (metadata as CustomHabitMetadata).note) {
            const text = (metadata as CustomHabitMetadata).note!
            return text.length > 30 ? `${text.substring(0, 30)}...` : text
        }

        return "Completed"
    }

    return (
        <>
            <Card
                className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-[1.02] border-2",
                    isCompleted
                        ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20 dark:border-green-500/30"
                        : "border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                )}
                onClick={() => setIsDialogOpen(true)}
            >
                <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4 w-full">
                        <div className={cn(
                            "rounded-full p-2 transition-colors shrink-0",
                            isCompleted
                                ? "text-green-600 dark:text-green-500"
                                : "text-zinc-400 dark:text-zinc-500"
                        )}>
                            {isCompleted ? (
                                <CheckCircle2 className="h-8 w-8" />
                            ) : (
                                <Circle className="h-8 w-8" />
                            )}
                        </div>
                        <div className="min-w-0 pr-4">
                            <h3 className={cn(
                                "font-semibold text-xl transition-colors truncate",
                                isCompleted ? "text-green-900 dark:text-green-100" : ""
                            )}>
                                {name}
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                                {renderMetadataSummary()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader className="flex flex-row items-start justify-between">
                        <div>
                            <DialogTitle>Log {name}</DialogTitle>
                            <DialogDescription>
                                Add details for your {name.toLowerCase()} session.
                            </DialogDescription>
                        </div>
                        {isCompleted && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 -mt-2 -mr-2"
                                onClick={handleRemoveLog}
                                disabled={isPending || isDeleting}
                                title="Remove Log"
                            >
                                <Circle className="h-5 w-5" />
                                <span className="sr-only">Remove Log</span>
                            </Button>
                        )}
                        {!isCoreHabit && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 -mt-2 -mr-2"
                                onClick={handleDeleteHabit}
                                disabled={isPending || isDeleting}
                                title="Delete Imperative Permanently"
                            >
                                <Trash2 className="h-5 w-5" />
                                <span className="sr-only">Delete Imperative Permanently</span>
                            </Button>
                        )}
                    </DialogHeader>
                    <div className="pt-4">
                        {renderForm()}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
