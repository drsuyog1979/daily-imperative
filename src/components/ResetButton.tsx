"use client"

import { useState, useTransition } from "react"
import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { resetHistory } from "@/app/actions/habits"

interface ResetButtonProps {
    userId: string
}

export function ResetButton({ userId }: ResetButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)

    const handleReset = () => {
        startTransition(async () => {
            const result = await resetHistory(userId)
            if (result.success) {
                setOpen(false)
                // Go back to today if we were viewing history
                router.push("/")
            } else {
                console.error("Failed to reset history:", result.error)
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" title="Reset History">
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Reset History</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all of your habit logs, journal entries, and streak history.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleReset}
                        disabled={isPending}
                    >
                        {isPending ? "Resetting..." : "Yes, reset everything"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
