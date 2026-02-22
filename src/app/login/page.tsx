"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Disc } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login, signup } from "./actions"

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().optional(),
}).superRefine(({ confirmPassword, password }, ctx) => {
    // Only run this validation if the user provided confirmPassword (during signup)
    if (confirmPassword !== undefined && confirmPassword !== password && confirmPassword !== "") {
        ctx.addIssue({
            code: "custom",
            message: "The passwords did not match",
            path: ['confirmPassword']
        });
    }
});

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const [isSignupFlow, setIsSignupFlow] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>, isLogin: boolean) {
        if (!isLogin && isSignupFlow && values.password !== values.confirmPassword) {
            form.setError("confirmPassword", { type: "manual", message: "Passwords do not match." })
            return
        }

        if (!isLogin && !isSignupFlow) {
            // First click on sign up just opens the confirm password field
            setIsSignupFlow(true)
            return
        }

        setIsLoading(true)
        setError(null)
        setSuccessMessage(null)

        const formData = new FormData()
        formData.append("email", values.email)
        formData.append("password", values.password)

        const result = isLogin ? await login(formData) : await signup(formData)
        const typedResult = result as { error?: string, message?: string } | undefined

        if (typedResult?.error) {
            setError(typedResult.error)
            setIsLoading(false)
        } else if (typedResult?.message) {
            setSuccessMessage(typedResult.message)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="h-12 w-12 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                        <Disc className="h-6 w-6 text-zinc-50 dark:text-zinc-900" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Daily Imperative</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Sign in to your account or create a new one.
                    </p>
                </div>

                <Card className="border-0 shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Authentication</CardTitle>
                        <CardDescription>
                            Enter your email below to login or create your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="name@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {isSignupFlow && (
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {error && (
                                    <div className="text-sm font-medium text-red-500 dark:text-red-400">
                                        {error}
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 p-3 rounded-md border border-green-200 dark:border-green-900/50">
                                        {successMessage}
                                    </div>
                                )}

                                <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                                    {!isSignupFlow && (
                                        <Button
                                            className="w-full"
                                            type="button"
                                            disabled={isLoading}
                                            onClick={() => form.handleSubmit((values) => onSubmit(values, true))()}
                                        >
                                            {isLoading ? "Loading..." : "Login"}
                                        </Button>
                                    )}
                                    <Button
                                        className="w-full"
                                        type="button"
                                        disabled={isLoading}
                                        onClick={() => form.handleSubmit((values) => onSubmit(values, false))()}
                                    >
                                        {isSignupFlow ? (isLoading ? "Creating Account..." : "Confirm Sign Up") : "Sign Up"}
                                    </Button>
                                    {isSignupFlow && (
                                        <Button
                                            className="w-full"
                                            variant="ghost"
                                            type="button"
                                            onClick={() => {
                                                setIsSignupFlow(false)
                                                form.resetField("confirmPassword")
                                                setError(null)
                                                setSuccessMessage(null)
                                            }}
                                        >
                                            Back to Login
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
