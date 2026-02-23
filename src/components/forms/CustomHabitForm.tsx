"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
    note: z.string().optional(),
})

export type CustomHabitMetadata = z.infer<typeof formSchema>

interface CustomHabitFormProps {
    habitName: string
    initialData?: Partial<CustomHabitMetadata>
    onSubmit: (data: CustomHabitMetadata) => void
    isLoading?: boolean
}

export function CustomHabitForm({ habitName, initialData, onSubmit, isLoading }: CustomHabitFormProps) {
    const form = useForm<CustomHabitMetadata>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            note: initialData?.note || "",
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Optional Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={`Any notes about your ${habitName.toLowerCase()} session?`}
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                You can leave this blank if you just want to mark it as done.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Saving..." : "Save Log"}
                </Button>
            </form>
        </Form>
    )
}
