"use client"

import { useState } from "react"
import { LogOut, Settings } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ProfileSettingsForm } from "@/components/forms/ProfileSettingsForm"

interface UserProfileProps {
    userId: string
    email: string
    name: string | null
    avatarUrl: string | null
    onSignOut: () => void
}

export function UserProfile({ userId, email, name, avatarUrl, onSignOut }: UserProfileProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    // Fallback to first letter of email or name
    const fallbackChar = (name?.[0] || email?.[0] || "?").toUpperCase()
    const displayTitle = name || email

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800 transition-transform hover:scale-105">
                            <AvatarImage src={avatarUrl || undefined} alt={displayTitle} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {fallbackChar}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none truncate">{displayTitle}</p>
                            <p className="text-xs leading-none text-muted-foreground truncate">
                                {email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Profile Settings</DialogTitle>
                        <DialogDescription>
                            Update your display name and profile picture.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="pt-4">
                        <ProfileSettingsForm
                            userId={userId}
                            initialData={{ name, avatarUrl }}
                            onSuccess={() => setIsSettingsOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
