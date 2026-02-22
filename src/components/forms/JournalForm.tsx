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
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
    entryText: z.string().min(5, { message: "Entry must be at least 5 characters." }),
})

export type JournalMetadata = z.infer<typeof formSchema>

interface JournalFormProps {
    initialData?: Partial<JournalMetadata>
    onSubmit: (data: JournalMetadata) => void
    isLoading?: boolean
}

export function JournalForm({ initialData, onSubmit, isLoading }: JournalFormProps) {
    const form = useForm<JournalMetadata>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            entryText: initialData?.entryText || "",
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="entryText"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Journal Entry</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="How are you feeling today?"
                                    className="min-h-[150px] resize-none"
                                    {...field}
                                />
                            </FormControl>
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
