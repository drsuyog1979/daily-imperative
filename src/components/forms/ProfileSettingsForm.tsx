"use client"

import { useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { updateProfile } from "@/app/actions/profile"
import { toast } from "sonner"

const profileFormSchema = z.object({
    name: z.string().max(50).optional(),
    avatarUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileSettingsFormProps {
    userId: string
    initialData?: {
        name: string | null
        avatarUrl: string | null
    }
    onSuccess?: () => void
}

export function ProfileSettingsForm({ userId, initialData, onSuccess }: ProfileSettingsFormProps) {
    const [isPending, startTransition] = useTransition()

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: initialData?.name || "",
            avatarUrl: initialData?.avatarUrl || "",
        },
    })

    function onSubmit(data: ProfileFormValues) {
        startTransition(async () => {
            const result = await updateProfile(userId, {
                name: data.name,
                avatarUrl: data.avatarUrl,
            })

            if (result.success) {
                toast.success("Profile updated successfully")
                onSuccess?.()
            } else {
                toast.error("Failed to update profile")
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Jane Doe" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the name that will be displayed on your dashboard.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Profile Picture URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/avatar.png" {...field} />
                            </FormControl>
                            <FormDescription>
                                Paste a direct link to an image. Leave blank to use an auto-generated avatar.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Saving..." : "Save changes"}
                </Button>
            </form>
        </Form>
    )
}
