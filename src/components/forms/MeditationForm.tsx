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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
    durationMinutes: z.string().min(1, { message: "Duration is required." }),
})

type FormSchemaType = z.infer<typeof formSchema>

export type MeditationMetadata = {
    durationMinutes: number
}

interface MeditationFormProps {
    initialData?: Partial<MeditationMetadata>
    onSubmit: (data: MeditationMetadata) => void
    isLoading?: boolean
}

export function MeditationForm({ initialData, onSubmit, isLoading }: MeditationFormProps) {
    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            durationMinutes: initialData?.durationMinutes?.toString() || "10",
        },
    })

    const handleFormSubmit = (values: FormSchemaType) => {
        onSubmit({
            durationMinutes: parseInt(values.durationMinutes, 10),
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                                <Input type="number" min={1} {...field} />
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
