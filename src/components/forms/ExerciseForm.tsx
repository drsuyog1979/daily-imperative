"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
    genre: z.string().min(1, {
        message: "Please select an exercise type.",
    }),
    durationMinutes: z.string().min(1, { message: "Duration is required." }),
    isOutdoors: z.boolean(),
})

type FormSchemaType = z.infer<typeof formSchema>

export type ExerciseMetadata = {
    genre: string
    durationMinutes: number
    isOutdoors: boolean
}

interface ExerciseFormProps {
    initialData?: Partial<ExerciseMetadata>
    onSubmit: (data: ExerciseMetadata) => void
    isLoading?: boolean
}

export function ExerciseForm({ initialData, onSubmit, isLoading }: ExerciseFormProps) {
    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            genre: initialData?.genre || "",
            durationMinutes: initialData?.durationMinutes?.toString() || "30",
            isOutdoors: initialData?.isOutdoors || false,
        },
    })

    const handleFormSubmit = (values: FormSchemaType) => {
        onSubmit({
            genre: values.genre,
            durationMinutes: parseInt(values.durationMinutes, 10),
            isOutdoors: values.isOutdoors
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Exercise Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="running">Running</SelectItem>
                                    <SelectItem value="walking">Walking</SelectItem>
                                    <SelectItem value="cycling">Cycling</SelectItem>
                                    <SelectItem value="swimming">Swimming</SelectItem>
                                    <SelectItem value="yoga">Yoga</SelectItem>
                                    <SelectItem value="weightlifting">Weightlifting</SelectItem>
                                    <SelectItem value="calisthenics">Calisthenics</SelectItem>
                                    <SelectItem value="sports">Sports</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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

                <FormField
                    control={form.control}
                    name="isOutdoors"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Outdoors
                                </FormLabel>
                                <FormDescription>
                                    Did you exercise outside?
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
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
